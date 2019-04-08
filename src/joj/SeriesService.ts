import {injectable} from "inversify";
import "reflect-metadata";

const cheerio = require('cheerio');
const fetch = require('node-fetch');
import SeriesServiceInterface from "./SeriesServiceInterface";
import FileSystem from "../FileSystem";

@injectable()
class SeriesService implements SeriesServiceInterface {
    cacheProgramSeriesIndexPages(url: string): Promise<Array<string>> {
        console.log(`Fetching ${url}`);
        const slug = url.split('/').pop();
        if (!slug) {
            throw Error('Can not determine program name from url');
        }

        const programDir = `./var/cache/joj.sk/${slug}`;

        return fetch(url)
            .then((r: any) => r.text())
            .then((body: string) => FileSystem.writeFile(programDir, 'index.html', body))
            .then((r: {content: string, file: string}) => this.getSeriesPagesMeta(r.content))
            .then((seriesPagesMeta: Array<{ url: string, title: string }>) => this.cacheSeriesPages(programDir, seriesPagesMeta));
    }

    private getSeriesPagesMeta(indexPageContent: string): Promise<Array<{ url: string, title: string }>> {
        const $ = cheerio.load(indexPageContent);
        const row = $('.e-subnav-wrap').html();
        const seriesArchiveUrl = $('a[title*="Arch"]', row).attr('href');

        let redirectedUrl: string;
        return fetch(seriesArchiveUrl)
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

    private cacheSeriesPages(programDir: string, seriesPages: Array<{ url: string, title: string }>): Promise<Array<string>> {
        return Promise.all(
            seriesPages.map((series: { url: string, title: string }) => {
                    console.log(`Fetching ${series.url}`);
                    return fetch(series.url)
                        .then((r: any) => r.text())
                        .then((content: string) => FileSystem.writeFile(`${programDir}/series`, `${series.title}.html`, content))
                }
            )
        ).then((r: Array<{content: string, file: string}>) => r.map((item: {content: string, file: string}) => item.file));
    }
}

export default SeriesService;
