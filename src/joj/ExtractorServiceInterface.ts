import {ArchiveIndexInterface} from "./ArchiveIndexInterface";

interface ExtractorServiceInterface {
    extractArchive(content: string): ArchiveIndexInterface;
    episodePagesList(content: string): Array<{title: string, url: string, img: string, date: string, episode: number}>;
    episodeIframeUrl(content: string): string;
    seriesArchiveUrl(content: string): string;
    seriesPagesMetaData(content: string): Array<{ id: string, title: string }>;
    newsSeriesPagesMetaData(content: string): Array<{ url: string, title: string }>;
    appendEpisodes(originalContent: string, moreContent: string): string;
    moreEpisodes(content: string): string;
    loadMoreEpisodesLink(content: string): string;
    episodeSchemaOrgMeta(content: string): {};
    episodeOgMeta(content: string): {};
    extractDateAdded(content: string): string;
    episodeMp4Urls(content: string): Array<string>;
}

export default ExtractorServiceInterface;
