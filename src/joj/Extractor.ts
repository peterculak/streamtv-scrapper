import {injectable} from "inversify";
import "reflect-metadata";
const fs = require('fs');
const cheerio = require('cheerio');
const chalk = require('chalk');
import ExtractorServiceInterface from "./ExtractorServiceInterface";

@injectable()
class Extractor implements ExtractorServiceInterface {
    private readonly cacheDir: string = './var/cache/joj.sk';
    private readonly archiveHtmlFile: string = `${this.cacheDir}/archiv.html`;

    extract(): Promise<any> {
        return new Promise((resolve, reject) => {
            fs.readFile(this.archiveHtmlFile, (err: Error, data: Object) => {
                if (err) {
                    console.log(chalk.red(err));
                    reject(err);
                } else {
                    console.log(`Extracting programmes from ${this.archiveHtmlFile}`);
                    resolve(this.extractArchive(data));
                }
            })
        });
    }

    public extractArchive(data: Object): Array<{}> {
        const $ = cheerio.load(data.toString());
        const archive: Array<{}> = [];

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