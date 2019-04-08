import {injectable} from "inversify";
import "reflect-metadata";
const fetch = require('node-fetch');

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

    private cacheEpisodePages(seriesDir: string, episodePages: Array<{ url: string, title: string }>): Promise<Array<string>> {
        return Promise.all(
            episodePages.map((episode: { url: string, title: string }) => {
                    console.log(`Fetching ${episode.url}`);
                    return fetch(episode.url)
                        .then((r: any) => r.text())
                        .then((content: string) => FileSystem.writeFile(seriesDir, `${episode.title}.html`, content))
                }
            )
        ).then((r: Array<{ content: string, file: string }>) => r.map((item: { content: string, file: string }) => item.file));
    }
}

export default EpisodesService;
