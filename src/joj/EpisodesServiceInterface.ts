interface EpisodesServiceInterface {
    cacheSeriesEpisodes(files: Array<string>): Promise<any>;
}

export default EpisodesServiceInterface;
