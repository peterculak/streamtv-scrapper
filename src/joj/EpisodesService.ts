import {injectable} from "inversify";
import "reflect-metadata";
const fetch = require('node-fetch');
const chalk = require('chalk');
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import FileSystem from "../FileSystem";
import Extractor from "./Extractor";

@injectable()
class EpisodesService implements EpisodesServiceInterface {
    cacheSeriesEpisodes(files: Array<string>): void {
        files.forEach((file: string, index: number) => {
            FileSystem.readFile(file).then((file: {content: string, name: string}) => {
                const season = file.name.split('/').pop();
                if (!season) {
                    throw new Error('Can not determine season from filename');
                }
                season.replace('.html', '');
                const episodes = Extractor.episodesList(file.content);
                const seasonSubDir = season.replace('.html', '');
                const dir = `${file.name.replace(season, '')}${seasonSubDir}`;

                this.cacheEpisodePages(dir, episodes);
            });
        });
    }

    private cacheEpisodePages(seriesDir: string, episodePages: Array<{ url: string, title: string, episode: number, date: string }>): Promise<Array<string>> {
        return Promise.all(
            episodePages.map((episode: { url: string, title: string, date: string, episode: number }) => {
                    console.log(chalk.grey(`Fetching ${episode.url}`));

                    return fetch(episode.url)
                        .then((r: any) => r.text())
                        .then((content: string) => {//this caches page which contains url to video iframe
                            FileSystem.writeFile(seriesDir, `${episode.episode}.html`, content);
                            return content;
                        })
                        .then((content: string) => {//this caches final iframes which contain video urls
                            const iframeUrl = Extractor.episodeIframeUrl(content);
                            if (!iframeUrl) {
                                //todo this needs to return promise with something
                                console.log(chalk.red(`No iframe url found ${episode.url}`));
                            } else {
                                console.log(chalk.yellow(`Fetching ${iframeUrl}`));
                                return fetch(iframeUrl)
                                    .then((r: any) => r.text())
                                    .then((content: string) => FileSystem.writeFile(`${seriesDir}/iframes`, `${episode.episode}.html`, content))
                                    ;
                            }
                        })
                }
            )
        ).then((r: Array<{ content: string, file: string }>) => r.map((item: { content: string, file: string }) => item.file));
    }
}

export default EpisodesService;
