import {inject, injectable} from "inversify";
import "reflect-metadata";
import {SelectorsConfigInterface} from "./ConfigInterface";

@injectable()
class SelectorsConfig implements SelectorsConfigInterface {
    constructor(
        private readonly _archiveItem?: string,
        private readonly _archiveItemImage?: string,
        private readonly _archiveItemTitle?: string,
        private readonly _archiveItemUrl?: string,
        private readonly _seriesArchiveUrl?: string,
        private readonly _seriesPagesMetaWrapper?: string,
        private readonly _seriesPagesMetaItem?: string,
        private readonly _newsSeriesPagesMetaWrapper?: string,
        private readonly _newsSeriesPagesMetaItem?: string,
        private readonly _episodesSection?: string,
        private readonly _episodesSectionAlt?: string,
        private readonly _episodesSectionAlt2?: string,
        private readonly _playIcon?: string,
        private readonly _episodeSubtitleSection?: string,
        private readonly _episodeDate?: string,
        private readonly _episodeString?: string,
        private readonly _loadMoreEpisodesLink?: string,
        private readonly _loadMoreEpisodesLinkAlt?: string,
        private readonly _moreEpisodesWrapper?: string,
        private readonly _moreEpisodesWrapperAlt?: string,
        private readonly _episodeIframe?: string,
        private readonly _episodeIframeAlt?: string,
        private readonly _episodeIframeAlt2?: string,
        private readonly _episodeIframeUrl?: string,
        private readonly _episodeOrgMetaWrapper?: string,
        private readonly _episodeOgMetaDateAdded?: string,
        private readonly _metaPublishDate?: string,
        private readonly _episodeOgMetaType?: string,
        private readonly _episodeOgMetaTitle?: string,
        private readonly _episodeOgMetaDescription?: string,
        private readonly _episodeOgMetaUrl?: string,
        private readonly _episodeOgMetaImage?: string,
        private readonly _episodeMp4Regex?: RegExp,
    ) {}

    static fromYml(yml: SelectorsConfigInterface): SelectorsConfig {
        return new this(
            yml.archiveItem,
            yml.archiveItemImage,
            yml.archiveItemTitle,
            yml.archiveItemUrl,
            yml.seriesArchiveUrl,
            yml.seriesPagesMetaWrapper,
            yml.seriesPagesMetaItem,
            yml.newsSeriesPagesMetaWrapper,
            yml.newsSeriesPagesMetaItem,
            yml.episodesSection,
            yml.episodesSectionAlt,
            yml.episodesSectionAlt2,
            yml.playIcon,
            yml.episodeSubtitleSection,
            yml.episodeDate,
            yml.episodeString,
            yml.loadMoreEpisodesLink,
            yml.loadMoreEpisodesLinkAlt,
            yml.moreEpisodesWrapper,
            yml.moreEpisodesWrapperAlt,
            yml.episodeIframe,
            yml.episodeIframeAlt,
            yml.episodeIframeAlt2,
            yml.episodeIframeUrl,
            yml.episodeOrgMetaWrapper,
            yml.episodeOgMetaDateAdded,
            yml.metaPublishDate,
            yml.episodeOgMetaType,
            yml.episodeOgMetaTitle,
            yml.episodeOgMetaDescription,
            yml.episodeOgMetaUrl,
            yml.episodeOgMetaImage,
            yml.episodeMp4Regex,
        );
    }

    get archiveItem(): string {
        return this._archiveItem || '';
    }

    get archiveItemImage(): string {
        return this._archiveItemImage || '';
    }

    get archiveItemTitle(): string {
        return this._archiveItemTitle || '';
    }

    get archiveItemUrl(): string {
        return this._archiveItemUrl || '';
    }

    get seriesArchiveUrl(): string {
        return this._seriesArchiveUrl || '';
    }

    get seriesPagesMetaWrapper(): string {
        return this._seriesPagesMetaWrapper || '';
    }

    get seriesPagesMetaItem(): string {
        return this._seriesPagesMetaItem || '';
    }

    get newsSeriesPagesMetaWrapper(): string {
        return this._newsSeriesPagesMetaWrapper || '';
    }

    get newsSeriesPagesMetaItem(): string {
        return this._newsSeriesPagesMetaItem || '';
    }

    get episodesSection(): string {
        return this._episodesSection || '';
    }

    get episodesSectionAlt(): string {
        return this._episodesSectionAlt || '';
    }

    get episodesSectionAlt2(): string {
        return this._episodesSectionAlt2 || '';
    }

    get playIcon(): string {
        return this._playIcon || '';
    }

    get episodeSubtitleSection(): string {
        return this._episodeSubtitleSection || '';
    }

    get episodeDate(): string {
        return this._episodeDate || '';
    }

    get episodeString(): string {
        return this._episodeString || '';
    }

    get loadMoreEpisodesLink(): string {
        return this._loadMoreEpisodesLink || '';
    }

    get loadMoreEpisodesLinkAlt(): string {
        return this._loadMoreEpisodesLinkAlt || '';
    }

    get moreEpisodesWrapper(): string {
        return this._moreEpisodesWrapper || '';
    }

    get moreEpisodesWrapperAlt(): string {
        return this._moreEpisodesWrapperAlt || '';
    }

    get episodeIframe(): string {
        return this._episodeIframe || '';
    }

    get episodeIframeAlt(): string {
        return this._episodeIframeAlt || '';
    }

    get episodeIframeAlt2(): string {
        return this._episodeIframeAlt2 || '';
    }

    get episodeIframeUrl(): string {
        return this._episodeIframeUrl || '';
    }

    get episodeOrgMetaWrapper(): string {
        return this._episodeOrgMetaWrapper || '';
    }

    get episodeOgMetaDateAdded(): string {
        return this._episodeOgMetaDateAdded || '';
    }

    get metaPublishDate(): string {
        return this._metaPublishDate || '';
    }

    get episodeOgMetaType(): string {
        return this._episodeOgMetaType || '';
    }

    get episodeOgMetaTitle(): string {
        return this._episodeOgMetaTitle || '';
    }

    get episodeOgMetaDescription(): string {
        return this._episodeOgMetaDescription || '';
    }

    get episodeOgMetaUrl(): string {
        return this._episodeOgMetaUrl || '';
    }

    get episodeOgMetaImage(): string {
        return this._episodeOgMetaImage || '';
    }

    get episodeMp4Regex(): RegExp|undefined {
        return this._episodeMp4Regex;
    }
}

export default SelectorsConfig;
