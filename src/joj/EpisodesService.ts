import {inject, injectable} from "inversify";
import "reflect-metadata";
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";
import FileInterface from "../FileInterface";
const Bluebird = require("bluebird");

@injectable()
class EpisodesService implements EpisodesServiceInterface {

    private concurrency: number = 0;

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) private client: ClientInterface,
    ) {
    }

    cacheSeriesEpisodes(files: Array<string>): Promise<any> {
        return Promise.all(files.map((file: string) => this.filesystem.readFile(file).then((file: FileInterface) => {
            const season = file.fullPath.split('/').pop();
            if (!season) {
                throw new Error('Can not determine season from filename');
            }
            season.replace('.html', '');
            const episodes = this.extractor.episodePagesList(file.content);
            const seasonSubDir = season.replace('.html', '');
            const dir = `${file.fullPath.replace(season, '')}${seasonSubDir}`;

            return this.cacheEpisodePages(dir, episodes);
        })));
    }

    setConcurrency(concurrency: number): void {
        this.concurrency = concurrency;
    }

    private cacheEpisodePages(seriesDir: string, episodePages: Array<{ url: string, title: string, episode: number, date: string }>): Promise<any> {
        return Bluebird.map(
            episodePages,
            (episode: any) => this.cacheEpisodePage(seriesDir, episode),
            { concurrency: this.concurrency }
        );
    }

    private cacheEpisodePage(seriesDir: string, episode: any) {
        return this.client.fetch(episode.url)
            .then((r: Response) => r.text())
            .then((content: string) => {//this caches page which contains url to video iframe
                this.filesystem.writeFile(seriesDir, `${episode.episode}.html`, content);
                return content;
            })
            .then((content: string) => {//this caches final iframes which contain video urls
                const iframeUrl = this.extractor.episodeIframeUrl(content);
                if (!iframeUrl) {
                    throw new Error(`No iframe url found ${episode.url}`);
                }

                return this.client.fetch(iframeUrl)
                    .then((r: any) => r.text())
                    .then((content: string) => this.filesystem.writeFile(`${seriesDir}/iframes`, `${episode.episode}.html`, content))
                    ;
            })
            .catch((error: Error) => this.logger.error(error.toString()));
    }
}

export default EpisodesService;
