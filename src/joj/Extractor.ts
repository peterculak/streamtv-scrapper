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

    public extractArchive(data: string): Array<{title: string, img: string, url: string}> {
        const $ = cheerio.load(data);
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
}

export default Extractor;