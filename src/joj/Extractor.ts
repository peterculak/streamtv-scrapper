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
            .then((content: string) => this.extractArchive(content));
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
}

export default Extractor;