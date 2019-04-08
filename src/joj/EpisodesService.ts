import {injectable} from "inversify";
import "reflect-metadata";

import EpisodesServiceInterface from "./EpisodesServiceInterface";

@injectable()
class EpisodesService implements EpisodesServiceInterface {
    cacheSeriesEpisodes(files: Array<string>): Promise<any> {
        console.log('Fetching episodes for');
        console.log(files);
        return new Promise((resolve, reject) => resolve('Cached episodes todo: finish this!!!'));
    }
}

export default EpisodesService;
