import {injectable} from "inversify";
import "reflect-metadata";
const cheerio = require('cheerio');
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import FileSystem from "../FileSystem";

@injectable()
class Extractor implements ExtractorServiceInterface {
    private readonly cacheDir: string = './var/cache/joj.sk';

    extract(): Promise<Array<{title: string, img: string, url: string}>> {
        return FileSystem.readFile(`${this.cacheDir}/archiv.html`)
            .then((file: {content: string, name: string}) => this.extractArchive(file.content));
    }

    public extractArchive(content: string): Array<{title: string, img: string, url: string}> {
        const $ = cheerio.load(content);
        const archive: Array<{title: string, img: string, url: string}> = [];

        $('div.b-i-archive-list > div.row').each(function (i: number, elem: any) {
            archive.push({
                title: $('.w-title', elem).text().trim(),
                img: $('.w-title img', elem).attr('data-original'),
                url: $('.w-title > a', elem).attr('href'),
            });
        });

        return archive;
    }

    public seriesArchiveUrl(content: string): string {
        const $ = cheerio.load(content);
        const a = $('.e-subnav-wrap a[title*="Arch"]');
        return a.length ? a.attr('href'): '';
    }

    public seriesPagesMetaData(content: string): Array<{ id: string, title: string }> {
        const $ = cheerio.load(content);
        const row = $('.e-subnav-wrap').html();
        const meta: Array<{ id: string, title: string }> = [];
        $('div.e-select > select > option', row).each((i: number, elem: any) => {
            meta.push({id: $(elem).val(), title: $(elem).text().trim()});
        });

        return meta;
    }

    public episodesList(content: string): Array<{title: string, url: string, img: string, date: string, episode: number}> {
        const $ = cheerio.load(content);
        const episodes: Array<{title: string, url: string, img: string, date: string, episode: number}> = [];
        $('.e-mobile-article-p article').each((i: number, elem: any) => {
            const a = $('a', elem);
            const subtitle = $('h4.subtitle', elem);

            episodes.push({
                title: a.attr('title'),
                url: a.attr('href'),
                img: $('img', a).attr('data-original'),
                date: $('span.date', subtitle).first().html(),
                episode: parseInt($('span.date', subtitle).last().html().split(':')[1]),
            });
        });

        return episodes;
    }

    public loadMoreEpisodesLink(content: string): string {
        const $ = cheerio.load(content);
        const a = $('a[title="Načítaj viac"]');
        return a.length ? a.attr('href') : '';
    }

    public moreEpisodes(content: string): string {
        const $ = cheerio.load(content);
        return $('.row.scroll-item').html();
    }

    public appendEpisodes(content: string, moreContent: string): string {
        const $ = cheerio.load(content);
        $('a[title="Načítaj viac"]').parent().replaceWith(moreContent);

        return $.html();
    }

    //todo this is flaky for some reason
    public episodeIframeUrl(content: string): string {
        const $ = cheerio.load(content);
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

    public episodeSchemaOrgMeta(content: string): Array<string> {
        const $ = cheerio.load(content, {xmlMode: false});
        return JSON.parse($('script[type="application/ld+json"]').html());
    }

    public episodeMp4Urls(content: string): Array<string> {
        const $ = cheerio.load(content);
        const scripts = $('script');

        const filtered = scripts.filter((i: number, e: any) => {
            const html = $(e).html();
            if (html && html.length) {
                const m  = html && html.match(/var src\s=\s{.*?(mp4).*?}/gs);
                return m && m.length > 0;
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