import {inject, injectable} from "inversify";
import "reflect-metadata";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import {ArchiveIndexInterface} from "./ArchiveIndexInterface";
import Slug from "../Slug";
import EpisodePageInterface from "./EpisodePageInterface";
import {SelectorsConfigInterface} from "../app/config/ConfigInterface";
import CheerioAPI from "cheerio";

@injectable()
class Extractor implements ExtractorServiceInterface {
    private readonly archiveItemSelector: string = this.selectors.archiveItem || 'div.b-i-archive-list > div.row';
    private readonly archiveItemUrlSelector: string = this.selectors.archiveItemUrl || '.w-title > a';
    private readonly archiveItemTitleSelector: string = this.selectors.archiveItemTitle || '.w-title';
    private readonly archiveItemImageSelector: string = this.selectors.archiveItemImage || '.w-title img';
    private readonly seriesArchiveUrlSelector: string = this.selectors.seriesArchiveUrl || '.e-subnav-wrap a[title*="Archív"]';
    private readonly seriesPagesMetaWrapperSelector: string = this.selectors.seriesPagesMetaWrapper || '.e-subnav-wrap';
    private readonly seriesPagesMetaItemSelector: string = this.selectors.seriesPagesMetaItem || 'div.e-select > select > option';
    private readonly newsSeriesPagesMetaWrapperSelector: string = this.selectors.newsSeriesPagesMetaWrapper || 'nav.e-tab-nav';
    private readonly newsSeriesPagesMetaItemSelector: string = this.selectors.newsSeriesPagesMetaItem || 'ul.nav > li > a';
    private readonly episodesSectionSelector: string = this.selectors.episodesSection || '.e-mobile-article-p article';
    private readonly episodesSectionAltSelector: string = this.selectors.episodesSectionAlt || '.b-articles-mobile-listing article';
    private readonly episodesSectionAlt2Selector: string = this.selectors.episodesSectionAlt2 || 'article';
    private readonly playIconSelector: string = this.selectors.playIcon || '.icons-play';
    private readonly episodeSubtitleSectionSelector: string = this.selectors.episodeSubtitleSection || 'h4.subtitle';
    private readonly episodeDateSelector: string = this.selectors.episodeDate || 'span.date';
    private readonly episodeStringSelector: string = this.selectors.episodeString || 'span';
    private readonly loadMoreEpisodesLinkSelector: string = this.selectors.loadMoreEpisodesLink || 'a[title="Načítaj viac"]';
    private readonly loadMoreEpisodesLinkAltSelector: string = this.selectors.loadMoreEpisodesLinkAlt || '.e-load-more a';
    private readonly moreEpisodesWrapperSelector: string = this.selectors.moreEpisodesWrapper || '.row.scroll-item';
    private readonly moreEpisodesWrapperAltSelector: string = this.selectors.moreEpisodesWrapperAlt || '.row.js-load-item';
    private readonly episodeIframeSelector: string = this.selectors.episodeIframe || 'section.s-video-detail iframe';
    private readonly episodeIframeAltSelector: string = this.selectors.episodeIframeAlt || '.b-iframe-video iframe';
    private readonly episodeIframeAlt2Selector: string = this.selectors.episodeIframeAlt2 || 'iframe';
    private readonly episodeIframeUrlSelector: string = this.selectors.episodeIframeUrl || 'media.joj.sk';
    private readonly episodeOrgMetaWrapperSelector: string = this.selectors.episodeOrgMetaWrapper || 'script[type="application/ld+json"]';
    private readonly episodeOgMetaDateAddedSelector: string = this.selectors.episodeOgMetaDateAdded || '.article-head span.info';
    private readonly metaPublishDateSelector: string = this.selectors.metaPublishDate || "meta[property='publish-date']";
    private readonly episodeOgMetaTypeSelector: string = this.selectors.episodeOgMetaType || "meta[property='og:type']";
    private readonly episodeOgMetaTitleSelector: string = this.selectors.episodeOgMetaTitle || "meta[property='og:title']";
    private readonly episodeOgMetaDescriptionSelector: string = this.selectors.episodeOgMetaDescription || "meta[property='og:description']";
    private readonly episodeOgMetaUrlSelector: string = this.selectors.episodeOgMetaUrl || "meta[property='og:url']";
    private readonly episodeOgMetaImageSelector: string = this.selectors.episodeOgMetaImage || "meta[property='og:image']";
    private readonly episodeMp4Regex: RegExp = this.selectors.episodeMp4Regex || /var src\s=\s{.*?(mp4).*?}/gs;

    constructor(
        @inject(CONSTANTS.SLUGS) private slug: Slug,
        @inject(CONSTANTS.CHEERIO) private dom: typeof CheerioAPI,
        @inject(CONSTANTS.SELECTORS_CONFIG) private selectors: SelectorsConfigInterface,
    ) {}

    public extractArchive(content: string): ArchiveIndexInterface {
        const $ = this.dom.load(content);
        const archive: ArchiveIndexInterface = [];

        $(this.archiveItemSelector).each((i: number, elem: any) => {
            const url = String($(this.archiveItemUrlSelector, elem).attr('href'));
            archive.push({
                title: $(this.archiveItemTitleSelector, elem).text().trim(),
                img: String($(this.archiveItemImageSelector, elem).attr('data-original')),
                url: url,
                slug: this.slug.fromProgramUrl(url),
            });
        });

        return archive;
    }

    public seriesArchiveUrl(content: string): string {
        const $ = this.dom.load(content);
        const a = $(this.seriesArchiveUrlSelector);
        return a.length ? String(a.attr('href')): '';
    }

    public seriesPagesMetaData(content: string): Array<{ id: string, title: string }> {
        const $ = this.dom.load(content);
        let row = $(this.seriesPagesMetaWrapperSelector).html();
        if (row === null || row === undefined) {
            row = '';
        }
        const meta: Array<{ id: string, title: string }> = [];
        $(this.seriesPagesMetaItemSelector, row).each((i: number, elem: any) => {
            meta.push({id: String($(elem).val()), title: $(elem).text().trim()});
        });

        return meta;
    }

    public newsSeriesPagesMetaData(content: string): Array<{ url: string, title: string }> {
        const $ = this.dom.load(content);
        let row = $(this.newsSeriesPagesMetaWrapperSelector).html();
        if (row === null || row === undefined) {
            row = '';
        }
        const meta: Array<{ url: string, title: string }> = [];
        $(this.newsSeriesPagesMetaItemSelector, row).each((i: number, elem: any) => {
            meta.push({url: String($(elem).attr('href')), title: $(elem).text().trim()});
        });

        return meta;
    }

    public episodePagesList(content: string): Array<EpisodePageInterface> {
        const $ = this.dom.load(content);
        const episodes: Array<EpisodePageInterface> = [];

        let episodesSection = $(this.episodesSectionSelector);

        if (!episodesSection.length) {
            episodesSection = $(this.episodesSectionAltSelector);
        }
        if (!episodesSection.length) {
            episodesSection = $(this.episodesSectionAlt2Selector);
            //this can only be running when fetching news not for tv series
            episodesSection = episodesSection.filter((index: number, element: any) => {
                return $(this.playIconSelector, element).length > 0;
            });
        }

        episodesSection.each((i: number, elem: any) => {
            const a = $('a', elem);
            const subtitle = $(this.episodeSubtitleSectionSelector, elem);

            let date = $(this.episodeDateSelector, subtitle).first().html();
            if (date === undefined || date === null) {
                date = '';
            }
            let episodeString = $(this.episodeDateSelector, subtitle).last().html();
            let episode = 0;
            if (episodeString) {
                episode = parseInt(episodeString.split(':')[1]);
            }

            if (!episode) {
                episodeString = $(this.episodeStringSelector, subtitle).first().html();
                if (episodeString) {
                    episode = parseInt(episodeString.split(':')[1]);
                }
            }

            if (!episode) {
                episodeString = $(this.episodeStringSelector, subtitle).last().html();
                if (episodeString) {
                    episode = parseInt(episodeString.split(':')[1]);
                }
            }

            const title = a.attr('title');
            const url = a.attr('href');
            const image = String($('img', a).attr('data-original'));

            if (title && url) {
                episodes.push({
                    title: title,
                    url: url,
                    img: image,
                    date: date,
                    episode: episode,
                });
            }
        });

        return episodes;
    }

    public loadMoreEpisodesLink(content: string): string {
        const $ = this.dom.load(content);
        let a = $(this.loadMoreEpisodesLinkSelector).last();

        if (!a.length) {
            a = $(this.loadMoreEpisodesLinkAltSelector);
        }
        if (a.length) {
            if (a.attr('href') !== '#') {
                return String(a.attr('href'));
            } else {
                return String(a.attr('data-href'));
            }
        }

        return '';
    }

    public moreEpisodes(content: string): string {
        const $ = this.dom.load(content);
        let html = $(this.moreEpisodesWrapperSelector).html();
        if (!html) {
            html = $(this.moreEpisodesWrapperAltSelector).html();
        }
        if (html === null || html === undefined) {
            return '';
        }

        return html;
    }

    public appendEpisodes(content: string, moreContent: string): string {
        const $ = this.dom.load(content);
        //todo last is a hack to find correct Load More link
        let a = $(this.loadMoreEpisodesLinkSelector).last();
        if (!a.length) {
            a = $(this.loadMoreEpisodesLinkAltSelector);
        }
        a.parent().replaceWith(moreContent);

        return $.html();
    }

    public episodeIframeUrl(content: string): string {
        const $ = this.dom.load(content);
        let iframes = $(this.episodeIframeSelector);
        if (!iframes.length) {
            iframes = $(this.episodeIframeAltSelector);
        }
        if (!iframes.length) {
            iframes = $(this.episodeIframeAlt2Selector);
        }
        let url = '';
        if (iframes) {
            iframes.each((i: number, item: any) => {
                const el = $(item);
                const src = String(el.attr('src'));
                if (src.indexOf(this.episodeIframeUrlSelector) !== -1) {
                    url = src;
                }
            })
        }

        return url;
    }

    public episodeSchemaOrgMeta(content: string): {} {
        const $ = this.dom.load(content, {xmlMode: false});
        let string = $(this.episodeOrgMetaWrapperSelector).html();
        if (string === null || string === undefined) {
            string = '';
        }
        return JSON.parse(string);
    }

    episodeOgMeta(content: string): {} {
        const $ = this.dom.load(content);

        const dateAdded = $(this.episodeOgMetaDateAddedSelector).data('date') ?
            $(this.episodeOgMetaDateAddedSelector).data('date') : $(this.metaPublishDateSelector).attr("content");

        return {
            type: $(this.episodeOgMetaTypeSelector).attr("content"),
            name: String($(this.episodeOgMetaTitleSelector).attr("content")),
            description: $(this.episodeOgMetaDescriptionSelector).attr("content"),
            url: $(this.episodeOgMetaUrlSelector).attr("content"),
            dateAdded: dateAdded,
            image: $(this.episodeOgMetaImageSelector).attr("content"),
            episodeNumber: 1,//todo why is this 1
            partOfSeason: { seasonNumber: 1, name: '' },//todo why is this 1
            partOfTVSeries: {},
            mp4: [],
        };
    }

    public extractDateAdded(content: string): string {
        const $ = this.dom.load(content);
        const dirty = $('div.date').text() as string;

        const clean = dirty.replace('Pridané:', '');
        return clean.trim();
    }

    public episodeMp4Urls(content: string): Array<string> {
        const $ = this.dom.load(content);
        const scripts = $('script');

        const filtered = scripts.filter((i: number, e: any) => {
            const html = $(e).html();
            if (html && html.length) {
                const m  = html && html.match(this.episodeMp4Regex);
                const ret = m && m.length > 0;
                return Boolean(ret).valueOf();
            }

            return false;
        });

        const html = $(filtered[0]).html();
        const m  = html && html.match(this.episodeMp4Regex);
        if (!m) {
            return [];
        }

        const x = m[0].replace(/var src\s=\s/gs, '').replace(/'/g, '"');
        return JSON.parse(x).mp4;
    }
}

export default Extractor;