import {inject, injectable} from "inversify";
import "reflect-metadata";
import CONSTANTS from "../app/config/constants";
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import ArchiveServiceStrategyInterface from "./ArchiveServiceStrategyInterface";

@injectable()
class ArchiveServiceStrategy implements ArchiveServiceStrategyInterface {
    constructor(
        @inject(CONSTANTS.JOJ_NEWS_ARCHIVE) private readonly newsSeriesService: ArchiveServiceInterface,
        @inject(CONSTANTS.JOJ_ARCHIVE) private readonly showsSeriesService: ArchiveServiceInterface
    ) {}

    fetchService(programUrl: string): ArchiveServiceInterface {
        if (programUrl === 'https://www.joj.sk/najnovsie') {
            return this.newsSeriesService;
        }

        return this.showsSeriesService;
    }
}

export default ArchiveServiceStrategy;