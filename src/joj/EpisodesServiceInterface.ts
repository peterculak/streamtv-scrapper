interface EpisodesServiceInterface {
    cacheSeriesEpisodes(files: Array<string>): Promise<any>;
    setConcurrency(concurrency: number): void;
}

export default EpisodesServiceInterface;
