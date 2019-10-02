import {inject, injectable} from "inversify";
import "reflect-metadata";

import * as Underscore from "underscore";
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";
import Slug from "../Slug";
import {ArchiveIndexInterface, ArchiveIndexItem} from "./ArchiveIndexInterface";
import EpisodeInterface from "./EpisodeInterface";
import FileInterface from "../FileInterface";
import EpisodeFactoryInterface from "./EpisodeFactoryInterface";
import * as crypto from "crypto-js";
import Host from "../Host";
const uuidv4 = require('uuid/v4');

@injectable()
class ArchiveService implements ArchiveServiceInterface {
    private readonly _cacheDirBase: string = './var/cache';

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.JOJ_EPISODE_FACTORY) private episodeFactory: EpisodeFactoryInterface,
        @inject(CONSTANTS.SLUGS) private slug: Slug,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) private client: ClientInterface,
        @inject(CONSTANTS.UNDERSCORE) protected _: Underscore.UnderscoreStatic,
    ) {}

    //todo fix this
    cacheArchiveList(host: Host): Promise<ArchiveIndexInterface> {
        return this.client.fetch(host.archiveUrl)
            .then((r: Response) => r.text())
            .then((body: string) => this.filesystem.writeFile(this.cacheDir(host.name), 'archiv.html', body))
            .then((file: FileInterface) => this.extractor.extractArchive(file.content))
            .then((archive: ArchiveIndexInterface) => {
                if (host.name === 'www.joj.sk') {
                    archive.unshift({
                        title: 'Správy',
                        img: 'https://img.joj.sk/rx/logojoj.png',
                        url: 'https://www.joj.sk/najnovsie',
                        slug: 'najnovsie',
                    });
                }

                return archive;
            })
            .then((archive: ArchiveIndexInterface) => this.filesystem.writeFile(this.cacheDir(host.name), 'archive.json', JSON.stringify(archive)))
            .then((file: FileInterface) => JSON.parse(file.content))
            ;
    }

    compileArchive(host: Host): Promise<Array<EpisodeInterface[]>> {
        const directories = this.filesystem.sync(`${this.cacheDir(host.name)}/*/`);
        this.logger.info(`Found ${directories.length} cached program folders`);

        return this.compileArchiveForDirectories(host, directories);
    }

    compileArchiveForProgramRegex(host: Host, pattern: string): Promise<Array<EpisodeInterface[]>> {
        const directories = this.filesystem.sync(`${this.cacheDir(host.name)}/*/`)
            .filter((element: any) => this.slug.fromPath(element).match(new RegExp(pattern, 'i')) !== null);

        this.logger.info(`Matching ${directories.length} folder(s) for regex ${pattern}`);

        return this.compileArchiveForDirectories(host, directories);
    }

    compileArchiveForProgram(host: Host, url: string): Promise<EpisodeInterface[]> {
        this.logger.info(`Compiling json for ${url}`);

        const slug = this.slug.fromProgramUrl(url);
        if (!slug) {
            throw Error(`Can not determine slug from url ${url}`);
        }

        return this.compileArchiveForSlug(host, String(slug));
    }

    encryptArchive(host: Host, password: string) {
        return this.filesystem.readFile(`${this.cacheDir(host.name)}/archive.json`).then((ar: FileInterface) => {
            const archive = JSON.parse(ar.content) as Array<any>;

            this.logger.info(`Archive json length ${archive.length}`);

            const filtered = archive.filter((item: ArchiveIndexItem) => {
                const slug = item.slug;
                const programJsonArchive = `${this.cacheDir(host.name)}/${slug}/${slug}.json`;
                const exists = this.filesystem.existsSync(programJsonArchive);
                if (!exists) {
                    this.logger.warn(`Skipping ${slug}`);
                }
                return exists;
            });

            this.logger.info(`Encrypting ${filtered.length} items`);

            filtered.map((item: any) => {
                const slug = item.slug;
                const programJsonArchive = `${this.cacheDir(host.name)}/${slug}/${slug}.json`;

                this.logger.debug(`Encrypting ${programJsonArchive}`);
                const encryptedSlug = uuidv4();

                this.filesystem.readFile(programJsonArchive).then((file: FileInterface) => {
                    const encrypted = this.encrypt(file.content, password);
                    const jsonDir = `${this.cacheDir(host.name)}/${slug}`;

                    this.filesystem.writeFile(
                        jsonDir,
                        encryptedSlug,
                        encrypted
                    );
                });

                item.slug = encryptedSlug;
                return item;
            });

            const encryptedArchiveFilename = uuidv4();
            this.logger.info(`Encrypted archive ${this.cacheDir(host.name)}/${encryptedArchiveFilename}`);

            return this.filesystem.writeFile(this.cacheDir(host.name), encryptedArchiveFilename, this.encrypt(JSON.stringify(filtered), password))
                .then((file: FileInterface) => {
                    return {host: host, filename: encryptedArchiveFilename}
                });
        }).then((r: { host: Host, filename: string }) => this.updateChannelsIndex(r.host, r.filename, password));
    }

    protected groupEpisodes(archive: Array<EpisodeInterface>): Array<EpisodeInterface> {
        let tvseriesMeta: any = archive[0].partOfTVSeries;
        const seasonMeta: any = {};
        const seasons: Array<number> = [];

        //populate seasons details
        this._.each(archive, (item: any) => {
            const currentSeason = Object.assign({}, item.partOfSeason);

            let seasonNumber = 1;
            if (item.partOfSeason.seasonNumber) {
                seasonNumber = parseInt(item.partOfSeason.seasonNumber);
            }

            if (!this._.contains(seasons, seasonNumber)) {
                seasonMeta[seasonNumber] = currentSeason;
                seasons.push(seasonNumber);
            }
        });

        const episodesBySeason = this._.groupBy(archive, (item: { partOfSeason: { seasonNumber: number } }) => item.partOfSeason.seasonNumber ? item.partOfSeason.seasonNumber : 1);

        //this is to remove repeated data and sort by episode number
        seasons.forEach((seasonNumber: number) => {
            this._.each(episodesBySeason[seasonNumber], (item: any) => {
                delete item.partOfTVSeries;
                delete item.partOfSeason;
                return item;
            });
            const unique = this._.uniq(episodesBySeason[seasonNumber], (episode: EpisodeInterface) => episode.episodeNumber);
            seasonMeta[seasonNumber].episodes = this._.sortBy(unique, (episode: EpisodeInterface) => -episode.episodeNumber);
        });

        tvseriesMeta.seasons = this._.toArray(seasonMeta);

        return tvseriesMeta;
    }

    private updateChannelsIndex(host: Host, filename: string, password: string) {
        const channels = `${this._cacheDirBase}/channels`;
        if (this.filesystem.existsSync(channels)) {
            return this.filesystem.readFile(channels).then((file: FileInterface) => {
                let channels = {} as any;
                try {
                    channels = JSON.parse(this.decrypt(file.content, password));
                } catch (e) {
                    channels = JSON.parse(file.content);
                }

                channels[host.name] = {};
                channels[host.name].datafile = filename;
                channels[host.name].image = host.image;
                return this.filesystem.writeFile(this._cacheDirBase, 'channels', this.encrypt(JSON.stringify(channels), password));
            })
        } else {
            let channels = {} as any;
            channels[host.name] = {};
            channels[host.name].datafile = filename;
            channels[host.name].image = host.image;
            return this.filesystem.writeFile(this._cacheDirBase, 'channels', this.encrypt(JSON.stringify(channels), password));
        }
    }

    private compileArchiveForDirectories(host: Host, directories: Array<string>) {
        return directories.map((directory: string) => {
            const slug = this.slug.fromPath(directory);
            if (!slug) {
                throw Error(`Can not determine slug from directory ${directory}`);
            }
            return slug;
        }).reduce((promiseChain: any, currentTask: any) => {
            return promiseChain.then((chainResults: any) => {
                return this.compileArchiveForSlug(host, currentTask).then((currentResult: any) => [...chainResults, currentResult]);
            });
        }, Promise.resolve([]));
    }

    private compileArchiveForSlug(host: Host, slug: string): Promise<EpisodeInterface[]> {
        const seriesDir = `${this.cacheDir(host.name)}/${slug}/series`;
        const jsonDir = `${this.cacheDir(host.name)}/${slug}`;
        this.logger.info(`Series dir ${seriesDir}`);
        const files = this.filesystem.sync("**(!iframes)/*.html", {cwd: seriesDir});

        if (files === null || files === undefined || files.length === 0) {
            return new Promise((resolve) => resolve([]));
        }
        return Promise.all(files.map((file: string) => this.episodeMetaData(`${seriesDir}/${file}`)))
            .then((archive: Array<EpisodeInterface>) => this.ensureUniqueEpisodeNumbers(archive))
            .then((archive: Array<EpisodeInterface>) => archive.filter((item: EpisodeInterface) => item !== undefined && item.mp4.length > 0))
            .then((filteredArchive: Array<EpisodeInterface>) => {
                this.filesystem.writeFile(
                    jsonDir,
                    `${slug}.json`,
                    JSON.stringify(this.groupEpisodes(filteredArchive))
                );

                return filteredArchive;
            });
    }

    private encrypt(message: string, password: string): string {
        const ciphertext = crypto.AES.encrypt(message, password);
        return ciphertext.toString();
    }

    private decrypt(message: string, password: string): string {
        const bytes = crypto.AES.decrypt(message, password);
        return bytes.toString(crypto.enc.Utf8);
    }

    private cacheDir(hostname: string): string {
        if (!hostname) {
            throw new Error('Can not determine hostname from url')
        }

        return `${this._cacheDirBase}/${hostname}`;
    }

    private episodeMetaData(file: string): Promise<EpisodeInterface> {
        this.logger.debug(`Episode meta data file ${file}`);

        return this.episodeFactory.fromCache(file).catch((e: Error) => {
            this.logger.warn(e.toString());

            return {
                name: '',
                episodeNumber: 0,
                partOfTVSeries: {},
                partOfSeason: {seasonNumber: 0, name: ''},
                mp4: [],
            };
        });
    }

    /**
     * Adds unique episode numbers in case they were not provided by source
     * @param archive
     */
    private ensureUniqueEpisodeNumbers(archive: Array<EpisodeInterface>): Array<EpisodeInterface> {
        let needsAdjusting = false;
        if (archive.length > 1) {
            if (archive[0].episodeNumber === archive[1].episodeNumber) {
                needsAdjusting = true;
            }
        }
        if (needsAdjusting) {
            return archive.map((item: any, index: number) => {
                item.episodeNumber = index + 1;
                return item;
            });
        }

        return archive;
    }
}

export default ArchiveService;
