import {inject, injectable} from "inversify";
import "reflect-metadata";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";
import {ArchiveIndexInterface} from "./ArchiveIndexInterface";
import Slug from "./Slug";
import EpisodeInterface from "./EpisodeInterface";

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
        const a = $('.e-subnav-wrap a[title*="Arch"]');
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

    public episodePagesList(content: string): Array<{title: string, url: string, img: string, date: string, episode: number}> {
        const $ = this.dom.load(content);
        const episodes: Array<{title: string, url: string, img: string, date: string, episode: number}> = [];
        $('.e-mobile-article-p article').each((i: number, elem: any) => {
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

            episodes.push({
                title: a.attr('title'),
                url: a.attr('href'),
                img: $('img', a).attr('data-original'),
                date: date,
                episode: episode,
            });
        });

        return episodes;
    }

    public loadMoreEpisodesLink(content: string): string {
        const $ = this.dom.load(content);
        const a = $('a[title="Načítaj viac"]');
        return a.length ? a.attr('href') : '';
    }

    public moreEpisodes(content: string): string {
        const $ = this.dom.load(content);
        const html = $('.row.scroll-item').html();
        if (html === null || html === undefined) {
            return '';
        }

        return html;
    }

    public appendEpisodes(content: string, moreContent: string): string {
        const $ = this.dom.load(content);
        $('a[title="Načítaj viac"]').parent().replaceWith(moreContent);

        return $.html();
    }

    public episodeIframeUrl(content: string): string {
        const $ = this.dom.load(content);
        const iframes = $('section.s-video-detail iframe');
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