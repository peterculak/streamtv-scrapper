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

    public static seriesArchiveUrl(content: string): string {
        const $ = cheerio.load(content);
        const row = $('.e-subnav-wrap').html();
        const a = $('a[title*="Arch"]', row);
        return a.length ? a.attr('href'): '';
    }

    public static seriesPagesMetaData(content: string): Array<{ id: string, title: string }> {
        const $ = cheerio.load(content);
        const row = $('.e-subnav-wrap').html();
        const meta: Array<{ id: string, title: string }> = [];
        $('div.e-select > select > option', row).each((i: number, elem: any) => {
            meta.push({id: $(elem).val(), title: $(elem).text().trim()});
        });

        return meta;
    }

    public static episodesList(content: string): Array<{title: string, url: string, img: string, date: string, episode: number}> {
        const $ = cheerio.load(content);
        const row = $('.e-mobile-article-p').html();

        const episodes: Array<{title: string, url: string, img: string, date: string, episode: number}> = [];
        $('article', row).each((i: number, elem: any) => {
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

    public static loadMoreEpisodesLink(content: string): any {
        const $ = cheerio.load(content);
        return $('a[title="Načítaj viac"]');
    }

    public static episodeIframeUrl(content: string): string {
        const $ = cheerio.load(content);
        return $('section.s-video-detail iframe').first().attr('src');
    }
}

export default Extractor;