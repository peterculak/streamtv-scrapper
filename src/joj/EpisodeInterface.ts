interface EpisodeInterface {
    name: string;
    episodeNumber: number,
    partOfTVSeries: {},
    partOfSeason: { seasonNumber: number, name: string },
    mp4: Array<string>,
    dateAdded?: string|Date;
    timeRequired?: string;
}

export default EpisodeInterface;
