interface EpisodeInterface {
    name: string;
    episodeNumber: number,
    partOfTVSeries: {name: string},
    partOfSeason: { seasonNumber?: number, name: string },
    seasonNumber: number,
    seasonName: string,
    mp4: Array<string>,
    dateAdded: string|Date;
    timeRequired: string;
    type: string;
    description: string;
    url: string;
    image: string;
    seriesName: string;
}

export default EpisodeInterface;
