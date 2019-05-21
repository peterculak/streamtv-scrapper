import {inject, injectable} from "inversify";
import "reflect-metadata";

const _ = require('underscore');
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";

@injectable()
class ArchiveService implements ArchiveServiceInterface {
    private readonly channelUrl: string = 'https://www.joj.sk';
    private readonly archiveUrl: string = `${this.channelUrl}/archiv`;
    private readonly cacheDir: string = './var/cache/joj.sk';

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) private client: ClientInterface,
    ) {}

    cacheArchiveList(): Promise<any> {
        return this.client.fetch(this.archiveUrl)
            .then((r: any) => r.text())
            .then((body: string) => this.filesystem.writeFile(this.cacheDir, 'archiv.html', body));
    }

    compileArchiveForProgram(url: string): Promise<Array<any>> {
        this.logger.info(`Compiling json for ${url}`);
        const bits = url.split('/');
        let slug = bits.pop();
        if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii') {
            slug = bits.pop();
        }
        if (!slug) {
            throw Error('Can not determine program name from url');
        }

        return this.compileArchiveForSlug(slug);
    }

    compileArchive(): Promise<any> {
        const directories = this.filesystem.sync(`${this.cacheDir}/*/`);
        this.logger.info(`Found ${directories.length} cached program folders`);

        return directories.map((directory: string) => {
            const bits = directory.split('/');
            let slug = bits[bits.length - 2];
            if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii') {
                slug = bits[bits.length - 3];
            }
            if (!slug) {
                throw Error('Can not determine program name from url');
            }
            return slug;
        }).reduce((promiseChain: any, currentTask: any) => {
            return promiseChain.then((chainResults: any) => {
                return this.compileArchiveForProgram(currentTask).then((currentResult: any) => [...chainResults, currentResult]);
            });
        }, Promise.resolve([]));
    }

    private compileArchiveForSlug(slug: string): Promise<any> {
        const seriesDir = `${this.cacheDir}/${slug}/series`;
        const jsonDir = `${this.cacheDir}/${slug}`;
        this.logger.info(`Series dir ${seriesDir}`);
        const files = this.filesystem.sync("**(!iframes)/*.html", {cwd: seriesDir});

        return Promise.all(files.map((file: string) => this.episodeMetaData(`${seriesDir}/${file}`)))
            .then((archive: Array<any>) =>
                this.filesystem.writeFile(
                    jsonDir,
                    `${slug}.json`,
                    JSON.stringify(this.groupEpisodesBySeason(archive))
                )
            );
    }

    private episodeMetaData(file: string): Promise<Array<{}>> {
        this.logger.debug(`Episode meta data file ${file}`);

        return this.filesystem.readFile(file)
            .then((file: { content: string, name: string }) => this.extractor.episodeSchemaOrgMeta(file.content))
            .then((meta: any) => {
                const seriesPath = file.substr(0, file.lastIndexOf('/'));
                const bits = file.split('/');
                const serieFileName = bits[bits.length - 1];
                const iframeFileSource = `${seriesPath}/iframes/${serieFileName}`;

                this.logger.debug(`Iframe file ${iframeFileSource}`);
                return this.filesystem.readFile(`${seriesPath}/iframes/${serieFileName}`)
                    .then((iframeFile: { content: string, name: string }) => {
                        meta.mp4 = this.extractor.episodeMp4Urls(iframeFile.content);

                        if (!meta.mp4.length) {//possibly other format
                            this.logger.error(`Mp4 urls not found in ${iframeFileSource}`);
                        }
                        return meta;
                    });
            })
            .catch((error: Error) => this.logger.fatal(`${error} in ${file}`))
            ;
    }

    private groupEpisodesBySeason(archive: Array<any>): Array<any> {
        return _.groupBy(archive, (item: { partOfSeason: { seasonNumber: number } }) => item.partOfSeason.seasonNumber);
    }
}

export default ArchiveService;
