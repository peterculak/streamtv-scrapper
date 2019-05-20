import {inject, injectable} from "inversify";
import "reflect-metadata";
const fetch = require('node-fetch');
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";

@injectable()
class EpisodesService implements EpisodesServiceInterface {

    private fetchSequenceMode: boolean = false;

    constructor(
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
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

    setFetchSequenceMode() {
        this.fetchSequenceMode = true;
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
        this.logger.debug(`Fetch mode: ${this.fetchMode()}`);

        if (this.fetchSequenceMode) {
            return episodePages.reduce((promiseChain: any, currentTask: any) => {
                return promiseChain.then((chainResults: any) => {
                    return this.cacheEpisodePage(seriesDir, currentTask).then((currentResult: any) => [...chainResults, currentResult]);
                });
            }, Promise.resolve([]));
        }

        return Promise.all(episodePages.map((episode: any) => this.cacheEpisodePage(seriesDir, episode)));
    }

    private cacheEpisodePage(seriesDir: string, episode: any) {
        return this.getData(episode.url)
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
            .catch((error: Error) => this.logger.error(error.toString()));
    }

    private fetchMode() {
        return this.fetchSequenceMode ? 'sequence' : 'parallel';
    }
}


export default EpisodesService;
