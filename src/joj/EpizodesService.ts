import {injectable} from "inversify";
import "reflect-metadata";

const cheerio = require('cheerio');
const fetch = require('node-fetch');
const fs = require('fs');
const chalk = require('chalk');
import EpizodesServiceInterface from "./EpizodesServiceInterface";

@injectable()
class EpizodesService implements EpizodesServiceInterface {
    cacheProgramIndex(url: string): Promise<any> {
        console.log(`Fetching ${url}`);
        const slug = url.split('/').pop();
        if (!slug) {
            throw Error('Can not determine program name from url');
        }

        const programDir = `./var/cache/joj.sk/${slug}`;

        return fetch(url)
            .then((r: any) => r.text())
            .then((body: string) => this.saveFile(programDir, 'index.html', body))
            .then((content: string) => {
                const $ = cheerio.load(content);
                const row = $('.e-subnav-wrap').html();
                const seriesArchiveUrl = $('a[title*="Arch"]', row).attr('href');

                return this.cacheSeriesArchive(slug, seriesArchiveUrl);
            })
            .then((seriesPageUrls: Array<{ url: string, title: string }>) => {
                    return Promise.all(
                        seriesPageUrls.map((series: { url: string, title: string }) => {
                                console.log(`Fetching ${series.url}`);
                                return fetch(series.url)
                                    .then((r: any) => r.text())
                                    .then((content: string) => this.saveFile(`${programDir}/series`, `${series.title}.html`, content))
                            }
                        )
                    );
                }
            );
    }

    cacheSeriesArchive(slug: string, url: string): Promise<Array<{}>> {
        let redirectedUrl: string;
        return fetch(url)
            .then((r: any) => {
                redirectedUrl = r.url;
                return r.text();
            })
            .then((content: string) => {
                const $ = cheerio.load(content);
                const row = $('.e-subnav-wrap').html();
                const seriesPageUrls: Array<{ url: string, title: string }> = [];
                $('div.e-select > select > option', row).each(function (i: number, elem: any) {
                    let id = $(elem).val();
                    seriesPageUrls.push({
                        title: $(elem).text().trim(),
                        url: id ? `${redirectedUrl}?seasonId=${id}` : redirectedUrl,
                    });
                });

                return seriesPageUrls;
            });
    }

    private saveFile(dir: string, fileName: string, content: string): Promise<any> {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        const cacheFile = `${dir}/${fileName}`;
        return new Promise((resolve, reject) => {
            fs.writeFile(cacheFile, content, (err: Error) => {
                if (err) {
                    console.log(chalk.red('Could not write file'));
                    console.log(String(err));
                    reject();
                } else {
                    console.log(chalk.green(
                        `File saved at ${cacheFile}`
                    ));
                    resolve(content);
                }
            });
        });
    }
}

export default EpizodesService;
