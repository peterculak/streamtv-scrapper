import {inject, injectable} from "inversify";
import "reflect-metadata";
const fetch = require('node-fetch');
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import * as Pino from "pino";
import FileSystemInterface from "../FileSystemInterface";

@injectable()
class EpisodesService implements EpisodesServiceInterface {

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.PINO_LOGGER) private logger: Pino.Logger,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
    ) {
    }

    cacheSeriesEpisodes(files: Array<string>): Promise<any> {
        return Promise.all(files.map((file: string) => this.filesystem.readFile(file).then((file: {content: string, name: string}) => {
            const season = file.name.split('/').pop();
            if (!season) {
                throw new Error('Can not determine season from filename');
            }
            season.replace('.html', '');
            const episodes = this.extractor.episodesList(file.content);
            const seasonSubDir = season.replace('.html', '');
            const dir = `${file.name.replace(season, '')}${seasonSubDir}`;

            return this.cacheEpisodePages(dir, episodes);
        })));
    }

    private getData(url: string): Promise<any> {
        this.logger.info(`Fetching ${url}`);
        return fetch(url)
            .then((r: any) => r.text())
            .then((content: string) => {
                if (content.match(/Server Error/gs)) {
                    this.logger.error(`Server Error for ${url}`);
                    return this.getData(url);
                }

                return content;
            })
    }

    private cacheEpisodePages(seriesDir: string, episodePages: Array<{ url: string, title: string, episode: number, date: string }>): Promise<any> {
        return Promise.all(episodePages.map((episode: any) => this.getData(episode.url)
            .then((content: string) => {//this caches page which contains url to video iframe
                this.filesystem.writeFile(seriesDir, `${episode.episode}.html`, content);
                return content;
            })
            .then((content: string) => {//this caches final iframes which contain video urls
                const iframeUrl = this.extractor.episodeIframeUrl(content);
                if (!iframeUrl) {
                    //todo this needs to return promise with something
                    this.logger.error(`No iframe url found ${episode.url}`);
                } else {
                    this.logger.info(`Fetching ${iframeUrl}`);
                    return fetch(iframeUrl)
                        .then((r: any) => r.text())
                        .then((content: string) => this.filesystem.writeFile(`${seriesDir}/iframes`, `${episode.episode}.html`, content))
                        ;
                }
            })
            .catch((error: Error) => this.logger.error(error.toString()))
        ));
    }
}

export default EpisodesService;
