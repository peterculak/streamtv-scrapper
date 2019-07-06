import {ArchiveIndexInterface} from "./ArchiveIndexInterface";
import EpisodeInterface from "./EpisodeInterface";

interface ExtractorServiceInterface {
    extractArchive(content: string): ArchiveIndexInterface;
    episodePagesList(content: string): Array<{title: string, url: string, img: string, date: string, episode: number}>;
    episodeIframeUrl(content: string): string;
    seriesArchiveUrl(content: string): string;
    seriesPagesMetaData(content: string): Array<{ id: string, title: string }>;
    appendEpisodes(originalContent: string, moreContent: string): string;
    moreEpisodes(content: string): string;
    loadMoreEpisodesLink(content: string): string;
    episodeSchemaOrgMeta(content: string): EpisodeInterface;
    episodeOgMeta(content: string): EpisodeInterface;
    extractDateAdded(content: string): string;
    episodeMp4Urls(content: string): Array<string>;
}

export default ExtractorServiceInterface;
