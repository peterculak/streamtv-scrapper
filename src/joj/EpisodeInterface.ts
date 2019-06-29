interface EpisodeInterface {
    episodeNumber: number,
    partOfTVSeries: {},
    partOfSeason: { seasonNumber: number },
    mp4: Array<string>,
}

export default EpisodeInterface;
