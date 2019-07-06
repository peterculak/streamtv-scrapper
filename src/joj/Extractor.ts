import {inject, injectable} from "inversify";
import "reflect-metadata";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import {ArchiveIndexInterface} from "./ArchiveIndexInterface";
import Slug from "./Slug";
import EpisodeInterface from "./EpisodeInterface";
import EpisodePageInterface from "./EpisodePageInterface";

@injectable()
class Extractor implements ExtractorServiceInterface {
    constructor(
        @inject(CONSTANTS.CHEERIO) private dom: CheerioAPI
    ) {}

    public extractArchive(content: string): ArchiveIndexInterface {
        const $ = this.dom.load(content);
        const archive: ArchiveIndexInterface = [];

        $('div.b-i-archive-list > div.row').each(function (i: number, elem: any) {
            const url = $('.w-title > a', elem).attr('href');
            archive.push({
                title: $('.w-title', elem).text().trim(),
                img: $('.w-title img', elem).attr('data-original'),
                url: url,
                slug: Slug.fromProgramUrl(url),
            });
        });

        return archive;
    }

    public seriesArchiveUrl(content: string): string {
        const $ = this.dom.load(content);
        const a = $('.e-subnav-wrap a[title*="Archív"]');
        return a.length ? a.attr('href'): '';
    }

    public seriesPagesMetaData(content: string): Array<{ id: string, title: string }> {
        const $ = this.dom.load(content);
        let row = $('.e-subnav-wrap').html();
        if (row === null || row === undefined) {
            row = '';
        }
        const meta: Array<{ id: string, title: string }> = [];
        $('div.e-select > select > option', row).each((i: number, elem: any) => {
            meta.push({id: $(elem).val(), title: $(elem).text().trim()});
        });

        return meta;
    }

    public episodePagesList(content: string): Array<EpisodePageInterface> {
        const $ = this.dom.load(content);
        const episodes: Array<EpisodePageInterface> = [];

        let episodesSection = $('.e-mobile-article-p article');

        if (!episodesSection.length) {
            episodesSection = $('.b-articles-mobile-listing article');
        }
        if (!episodesSection.length) {
            episodesSection = $('article');
            //this can only be running when fetching news not for tv series
            episodesSection = episodesSection.filter((index: number, element: any) => {
                return $('.icons-play', element).length > 0;
            });
        }

        episodesSection.each((i: number, elem: any) => {
            const a = $('a', elem);
            const subtitle = $('h4.subtitle', elem);

            let date = $('span.date', subtitle).first().html();
            if (date === undefined || date === null) {
                date = '';
            }
            let episodeString = $('span.date', subtitle).last().html();
            let episode = 0;
            if (episodeString) {
                episode = parseInt(episodeString.split(':')[1]);
            }

            if (!episode) {
                episodeString = $('span', subtitle).first().html();
                if (episodeString) {
                    episode = parseInt(episodeString.split(':')[1]);
                }
            }

            if (!episode) {
                episodeString = $('span', subtitle).last().html();
                if (episodeString) {
                    episode = parseInt(episodeString.split(':')[1]);
                }
            }

            const title = a.attr('title');
            const url = a.attr('href');
            const image = $('img', a).attr('data-original');

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
        let a = $('a[title="Načítaj viac"]').last();

        if (!a.length) {
            a = $('.e-load-more a');
        }
        if (a.length) {
            if (a.attr('href') !== '#') {
                return a.attr('href');
            } else {
                return a.attr('data-href');
            }
        }

        return '';
    }

    public moreEpisodes(content: string): string {
        const $ = this.dom.load(content);
        let html = $('.row.scroll-item').html();
        if (!html) {
            html = $('.row.js-load-item').html();
        }
        if (html === null || html === undefined) {
            return '';
        }

        return html;
    }

    public appendEpisodes(content: string, moreContent: string): string {
        const $ = this.dom.load(content);
        //todo last is a hack to find correct Load More link
        let a = $('a[title="Načítaj viac"]').last();
        if (!a.length) {
            a = $('.e-load-more a');
        }
        a.parent().replaceWith(moreContent);

        return $.html();
    }

    public episodeIframeUrl(content: string): string {
        const $ = this.dom.load(content);
        let iframes = $('section.s-video-detail iframe');
        if (!iframes.length) {
            iframes = $('.b-iframe-video iframe');
        }
        if (!iframes.length) {
            iframes = $('iframe');
        }
        let url = '';
        if (iframes) {
            iframes.each((i: number, item: any) => {
                const el = $(item);
                if (el.attr('src').indexOf('media.joj.sk') !== -1) {
                    url = el.attr('src');
                }
            })
        }

        return url;
    }

    public episodeSchemaOrgMeta(content: string): EpisodeInterface {
        const $ = this.dom.load(content, {xmlMode: false});
        let string = $('script[type="application/ld+json"]').html();
        if (string === null || string === undefined) {
            string = '';
        }
        return JSON.parse(string);
    }

    episodeOgMeta(content: string): EpisodeInterface {
        const $ = this.dom.load(content);

        const episode = {
            '@type': $("meta[property='og:type']").attr("content"),
            name: $("meta[property='og:title']").attr("content"),
            description: $("meta[property='og:description']").attr("content"),
            url: $("meta[property='og:url']").attr("content"),
            dateAdded: $("meta[property='publish-date']").attr("content"),
            image: $("meta[property='og:image']").attr("content"),
            episodeNumber: 1,
            partOfSeason: { seasonNumber: 1, name: '' },
            partOfTVSeries: {},
            mp4: [],
        };
        return episode;
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
                const m  = html && html.match(/var src\s=\s{.*?(mp4).*?}/gs);
                const ret = m && m.length > 0;
                return Boolean(ret).valueOf();
            }

            return false;
        });

        const html = $(filtered[0]).html();
        const m  = html && html.match(/var src\s=\s{.*?(mp4).*?}/gs);
        if (!m) {
            return [];
        }

        const x = m[0].replace(/var src\s=\s/gs, '').replace(/'/g, '"');
        return JSON.parse(x).mp4;
    }
}

export default Extractor;