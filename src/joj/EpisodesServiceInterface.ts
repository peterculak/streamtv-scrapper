interface EpisodesServiceInterface {
    cacheSeriesEpisodes(files: Array<string>): Promise<any>;
    setFetchSequenceMode(): void;
}

export default EpisodesServiceInterface;
