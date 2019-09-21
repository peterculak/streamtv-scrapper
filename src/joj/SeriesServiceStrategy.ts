import {inject, injectable} from "inversify";
import "reflect-metadata";
import CONSTANTS from "../app/config/constants";
import SeriesServiceStrategyInterface from "./SeriesServiceStrategyInterface";
import SeriesServiceInterface from "./SeriesServiceInterface";

@injectable()
class SeriesServiceStrategy implements SeriesServiceStrategyInterface {
    constructor(
        @inject(CONSTANTS.JOJ_NEWS_SERIES) private readonly newsSeriesService: SeriesServiceInterface,
        @inject(CONSTANTS.JOJ_SERIES) private readonly showsSeriesService: SeriesServiceInterface
    ) {}

    fetchService(programUrl: string): SeriesServiceInterface {
        if (programUrl === 'https://www.joj.sk/najnovsie') {
            return this.newsSeriesService;
        }

        return this.showsSeriesService;
    }
}

export default SeriesServiceStrategy;