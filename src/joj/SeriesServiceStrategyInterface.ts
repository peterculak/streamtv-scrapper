import SeriesServiceInterface from "./SeriesServiceInterface";

interface SeriesServiceStrategyInterface {
    fetchService(programUrl: string): SeriesServiceInterface,
}

export default SeriesServiceStrategyInterface;
