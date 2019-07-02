import {inject, injectable} from "inversify";
import "reflect-metadata";

import * as Underscore from "underscore";
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";
import Slug from "./Slug";
import {ArchiveIndexInterface} from "./ArchiveIndexInterface";
import EpisodeInterface from "./EpisodeInterface";
import FileInterface from "../FileInterface";
import EpisodeFactoryInterface from "./EpisodeFactoryInterface";
import * as crypto from "crypto-js";
const uuidv4 = require('uuid/v4');

enum Host {
    Joj = 'joj.sk',
    Plus = 'plus.joj.sk',
}

@injectable()
class ArchiveService implements ArchiveServiceInterface {
    private host: string = '';
    private readonly _cacheDirBase: string = './var/cache';

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.JOJ_EPISODE_FACTORY) private episodeFactory: EpisodeFactoryInterface,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) private client: ClientInterface,
        @inject(CONSTANTS.UNDERSCORE) private _: Underscore.UnderscoreStatic,
    ) {
    }

    cacheArchiveList(host: Host): Promise<ArchiveIndexInterface> {
        this.host = host;

        return this.client.fetch(`https://${host}/archiv`)
            .then((r: Response) => r.text())
            .then((body: string) => this.filesystem.writeFile(this.cacheDir(), 'archiv.html', body))
            .then((file: FileInterface) => this.extractor.extractArchive(file.content))
            .then((archive: ArchiveIndexInterface) => this.filesystem.writeFile(this.cacheDir(), 'archive.json', JSON.stringify(archive)))
            .then((file: FileInterface) => JSON.parse(file.content))
            ;
    }

    compileArchive(host: Host): Promise<Array<EpisodeInterface[]>> {
        this.host = host;

        const directories = this.filesystem.sync(`${this.cacheDir()}/*/`);
        this.logger.info(`Found ${directories.length} cached program folders`);

        return this.compileArchiveForDirectories(directories);
    }

    encryptArchive(host: Host, password: string): void {
        this.host = host;

        this.filesystem.readFile(`${this.cacheDir()}/archive.json`).then((ar: FileInterface) => {
            const archive = JSON.parse(ar.content) as Array<any>;
            archive.map((item: any) => {
                const slug = item.slug;
                const programJsonArchive = `${this.cacheDir()}/${slug}/${slug}.json`;

                this.logger.info(`Encrypting ${programJsonArchive}`);
                const encryptedSlug = uuidv4();

                this.filesystem.readFile(programJsonArchive).then((file: FileInterface) => {
                    const encrypted = this.encrypt(file.content, password);
                    const jsonDir = `${this.cacheDir()}/${slug}`;

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
            this.logger.info(`Host ${host}`);
            this.logger.info(`Encrypted archive ${this.cacheDir()}/${encryptedArchiveFilename}`);

            return this.filesystem.writeFile(this.cacheDir(), encryptedArchiveFilename, this.encrypt(JSON.stringify(archive), password))
                .then((file: FileInterface) => {
                    return {host: host, filename: encryptedArchiveFilename}
                });
        }).then((r: {host: string, filename: string}) => {
            return this.filesystem.readFile('./var/cache/channels.json').then((file: FileInterface) => {
                let channels = {} as any;
                try {
                    channels = JSON.parse(this.decrypt(file.content, password));
                } catch (e) {
                    channels = JSON.parse(file.content);
                }

                channels[r.host].datafile = r.filename;
                return this.filesystem.writeFile('./var/cache', 'channels.json', this.encrypt(JSON.stringify(channels), password));
            })
        });
    }

    compileArchiveForProgramRegex(host: string, pattern: string): Promise<Array<EpisodeInterface[]>> {
        this.host = host;

        const directories = this.filesystem.sync(`${this.cacheDir()}/*/`)
            .filter((element: any) => Slug.fromPath(element).match(new RegExp(pattern, 'i')) !== null);

        this.logger.info(`Matching ${directories.length} folder(s) for regex ${pattern}`);

        return this.compileArchiveForDirectories(directories);
    }

    compileArchiveForProgram(host: string, url: string): Promise<EpisodeInterface[]> {
        this.host = host;

        this.logger.info(`Compiling json for ${url}`);

        const slug = Slug.fromProgramUrl(url);
        if (!slug) {
            throw Error(`Can not determine slug from url ${url}`);
        }

        return this.compileArchiveForSlug(slug);
    }

    private encrypt (message: string, password: string): string {
        const ciphertext = crypto.AES.encrypt(message, password);
        return ciphertext.toString();
    }

    private decrypt(message: string, password: string): string {
        const bytes = crypto.AES.decrypt(message, password);
        return bytes.toString(crypto.enc.Utf8);
    }

    private cacheDir(): string {
        if (!this.host) {
            throw new Error('Can not determine hostname from url')
        }

        return `${this._cacheDirBase}/${this.host}`;
    }

    private setHostnameFromUrl(url: string): string {
        const pattern = new RegExp(/https:\/\/www\.(.*\.sk)/, 'i');
        const m = url.match(pattern);
        if (m && m[1]) {
            this.host = m[1];
            return m[1];
        }

        throw new Error(`Can not determine hostname from ${url}`);
    }

    private compileArchiveForDirectories(directories: Array<string>) {
        return directories.map((directory: string) => {
            const slug = Slug.fromPath(directory);
            if (!slug) {
                throw Error(`Can not determine slug from directory ${directory}`);
            }
            return slug;
        }).reduce((promiseChain: any, currentTask: any) => {
            return promiseChain.then((chainResults: any) => {
                return this.compileArchiveForSlug(currentTask).then((currentResult: any) => [...chainResults, currentResult]);
            });
        }, Promise.resolve([]));
    }

    private compileArchiveForSlug(slug: string): Promise<EpisodeInterface[]> {
        const seriesDir = `${this.cacheDir()}/${slug}/series`;
        const jsonDir = `${this.cacheDir()}/${slug}`;
        this.logger.info(`Series dir ${seriesDir}`);
        const files = this.filesystem.sync("**(!iframes)/*.html", {cwd: seriesDir});

        if (files === null || files === undefined || files.length === 0) {
            return new Promise((resolve) => resolve([]));
        }
        return Promise.all(files.map((file: string) => this.episodeMetaData(`${seriesDir}/${file}`)))
            .then((archive: Array<EpisodeInterface>) => archive.filter((item: EpisodeInterface) => item !== undefined && item.mp4.length > 0))
            .then((filteredArchive: Array<EpisodeInterface>) => {
                this.filesystem.writeFile(
                    jsonDir,
                    `${slug}.json`,
                    JSON.stringify(this.groupEpisodesBySeason(filteredArchive))
                );

                return filteredArchive;
            });
    }

    private episodeMetaData(file: string): Promise<EpisodeInterface> {
        this.logger.debug(`Episode meta data file ${file}`);

        return this.episodeFactory.fromCache(file).catch((e: Error) => {
            this.logger.warn(e.toString());

            return {
                episodeNumber: 0,
                partOfTVSeries: {},
                partOfSeason: {seasonNumber: 0},
                mp4: [],
            };
        });
    }

    private groupEpisodesBySeason(archive: Array<EpisodeInterface>): Array<EpisodeInterface> {
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
}

export default ArchiveService;
