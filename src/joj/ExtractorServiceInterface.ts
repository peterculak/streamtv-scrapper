interface ExtractorServiceInterface {
    extract(): Promise<any>;
    episodesList(content: string): Array<{title: string, url: string, img: string, date: string, episode: number}>;
    episodeIframeUrl(content: string): string;
    seriesArchiveUrl(content: string): string;
    seriesPagesMetaData(content: string): Array<{ id: string, title: string }>;
    appendEpisodes(originalContent: string, moreContent: string): string;
    moreEpisodes(content: string): string;
    loadMoreEpisodesLink(content: string): string;
    episodeSchemaOrgMeta(content: string): Array<string>;
    episodeMp4Urls(content: string): Array<string>;
}

export default ExtractorServiceInterface;
