import {inject, injectable} from "inversify";
import "reflect-metadata";
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";
import FileInterface from "../FileInterface";
import EpisodePageInterface from "./EpisodePageInterface";
const Bluebird = require("bluebird");

@injectable()
class EpisodesService implements EpisodesServiceInterface {

    protected concurrency: number = 0;

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) protected extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.LOGGER) protected logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) protected filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) protected client: ClientInterface,
    ) {
    }

    cacheSeriesEpisodes(files: Array<string>): Promise<any> {
        return Promise.all(
            files.map((file: string) => this.filesystem.readFile(file).then((file: FileInterface) => {
                const season = file.fullPath.split('/').pop();
                if (!season) {
                    throw new Error('Can not determine season from filename');
                }
                season.replace('.html', '');
                const episodes = this.extractor.episodePagesList(file.content);

                const seasonSubDir = season.replace('.html', '');
                const dir = `${file.fullPath.replace(season, '')}${seasonSubDir}`;

                const notCached = episodes.filter((episode: any) => !this.filesystem.existsSync(`${dir}/${this.episodeFileName(episode)}`) || !this.filesystem.existsSync(`${dir}/iframes/${this.episodeFileName(episode)}`));
                this.logger.info(`Fetching ${notCached.length} new episode(s) for ${seasonSubDir}`);
                return this.cacheEpisodePages(dir, notCached);
            }))
        );
    }

    setConcurrency(concurrency: number): void {
        this.concurrency = concurrency;
    }

    protected cacheEpisodePages(seriesDir: string, episodePages: Array<EpisodePageInterface>): Promise<FileInterface[]> {
        return Bluebird.map(
            episodePages,
            (episode: any) => this.cacheEpisodePage(seriesDir, episode),
            { concurrency: this.concurrency }
        );
    }

    protected cacheEpisodePage(seriesDir: string, episode: EpisodePageInterface): Promise<FileInterface> {
        if (episode.url === undefined) {
            throw new Error('episode.url undefined');
        }
        return this.client.fetch(episode.url)
            .then((r: Response) => r.text())
            .then((content: string) => {//this caches page which contains url to video iframe
                this.filesystem.writeFile(seriesDir, `${this.episodeFileName(episode)}`, content);
                return content;
            })
            .then((content: string) => {//this caches final iframes which contain video urls
                const iframeUrl = this.extractor.episodeIframeUrl(content);
                if (!iframeUrl) {
                    throw new Error(`No iframe url found ${episode.url}`);
                }

                return this.client.fetch(iframeUrl)
                    .then((r: any) => r.text())
                    .then((content: string) => this.filesystem.writeFile(`${seriesDir}/iframes`, this.episodeFileName(episode), content))
                    ;
            })
            // .catch((error: Error) => this.logger.error(error.toString()))
            ;
    }

    protected episodeFileName(episode: EpisodePageInterface): string {
        if (episode.episode) {
            return `${episode.episode}.html`;
        }

        return `${episode.title}.html`;
    }
}

export default EpisodesService;
