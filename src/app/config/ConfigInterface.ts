interface HostInterface {
    name: string;
    image?: string;
}

interface Show {
    name: string;
    host: string;
    url: string;
    concurrency?: number;
}

interface NewsItem {
    name: string;
    host: string;
    url: string;
    concurrency?: number;
    maxLoadMorePages?: number;
    image?: string;
}

interface MappedSlug {
    urlContains: string;
    slug: string;
}

type ExcludedSlugs = Array<string>;
type MappedSlugs = Array<MappedSlug>;

interface SlugsConfigInterface {
    mapped?: MappedSlugs;
    excluded?: ExcludedSlugs;
}

interface ConfigInterface {
    cacheDir: string;
    hosts: Array<HostInterface>;
    shows: Array<Show>;
    news: Array<NewsItem>;
    slugs: SlugsConfigInterface;
    selectors: SelectorsConfigInterface;
}

interface SelectorsConfigInterface {
    archiveItem?: string;
    archiveItemUrl?: string;
    archiveItemTitle?: string;
    archiveItemImage?: string;
    seriesArchiveUrl?: string;
    seriesPagesMetaWrapper?: string;
    seriesPagesMetaItem?: string;
    newsSeriesPagesMetaWrapper?: string;
    newsSeriesPagesMetaItem?: string;
    episodesSection?: string;
    episodesSectionAlt?: string;
    episodesSectionAlt2?: string;
    playIcon?: string;
    episodeSubtitleSection?: string;
    episodeDate?: string;
    episodeString?: string;
    loadMoreEpisodesLink?: string;
    loadMoreEpisodesLinkAlt?: string;
    moreEpisodesWrapper?: string;
    moreEpisodesWrapperAlt?: string;
    episodeIframe?: string;
    episodeIframeAlt?: string;
    episodeIframeAlt2?: string;
    episodeIframeUrl?: string;
    episodeOrgMetaWrapper?: string;
    episodeOgMetaDateAdded?: string;
    metaPublishDate?: string;
    episodeOgMetaType?: string;
    episodeOgMetaTitle?: string;
    episodeOgMetaDescription?: string;
    episodeOgMetaUrl?: string;
    episodeOgMetaImage?: string;
    episodeMp4Regex?: RegExp | undefined;
}

export default ConfigInterface;
export {
    HostInterface,
    Show,
    NewsItem,
    MappedSlug,
    SlugsConfigInterface,
    ExcludedSlugs,
    MappedSlugs,
    SelectorsConfigInterface,
    ConfigInterface
};
