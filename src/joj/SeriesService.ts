import {injectable} from "inversify";
import "reflect-metadata";

const fetch = require('node-fetch');
import SeriesServiceInterface from "./SeriesServiceInterface";
import FileSystem from "../FileSystem";
import Extractor from "./Extractor";
import chalk from "chalk";
import {container} from "../app/config/ioc_config";
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import CONSTANTS from "../app/config/constants";

@injectable()
class SeriesService implements SeriesServiceInterface {
    cacheProgramSeriesIndexPages(url: string): void {
        console.log(chalk.grey(`Fetching ${url}`));
        const bits = url.split('/');
        let slug = bits.pop();
        if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii') {
            slug = bits.pop();
        }
        if (!slug) {
            throw Error('Can not determine program name from url');
        }

        const programDir = `./var/cache/joj.sk/${slug}`;

        return fetch(url)
            .then((r: any) => r.text())
            .then((body: string) => FileSystem.writeFile(programDir, 'index.html', body))
            .then((r: { content: string, file: string }) => {
                let seriesArchiveUrl = Extractor.seriesArchiveUrl(r.content);
                if (!seriesArchiveUrl) {
                    seriesArchiveUrl = url;

                }
                return this.getSeriesPagesMeta(seriesArchiveUrl);
            })
            .then((seriesPagesMeta: Array<{ seriesUrl: string, url: string, title: string }>) => this.cacheSeriesPages(programDir, seriesPagesMeta))
            ;
    }

    private getSeriesPagesMeta(seriesArchiveUrl: string): Promise<Array<{ url: string, title: string }>> {
        let seriesUrl: string;

        return fetch(seriesArchiveUrl)
            .then((r: any) => {
                seriesUrl = r.url;
                return r.text();
            })
            .then((content: string) => {
                const meta = Extractor.seriesPagesMetaData(content);
                if (!meta.length) {
                    return [{title: '1. séria', url: seriesArchiveUrl, seriesUrl: seriesUrl}];
                }

                return meta.map((elem: {id: string, title: string}) => {
                    return {
                        title: elem.title,
                        url: elem.id ? `${seriesUrl}?seasonId=${elem.id}` : seriesUrl,
                        seriesUrl: seriesUrl,
                    };
                });
            });
    }

    private cacheSeriesPages(programDir: string, seriesPages: Array<{ seriesUrl: string, url: string, title: string }>): void {
        //todo
        const episodes = container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES);

        seriesPages.forEach((series: { seriesUrl: string, url: string, title: string }) => {
            console.log(chalk.grey(`Fetching serie ${series.url}`));
            fetch(series.url)
                .then((r: any) => r.text())
                .then((content: string) => this.loadMoreEpisodes(series.seriesUrl, content))
                .then((content: string) => FileSystem.writeFile(`${programDir}/series`, `${series.title.replace('/','-')}.html`, content))
                .then((r: any) => episodes.cacheSeriesEpisodes([r.file]));
        });
    }

    private loadMoreEpisodes(seriesUrl: string, content: string): Promise<string> {
        const loadMoreEpisodesUrl = this.loadMoreEpisodesUrl(seriesUrl, content);
        if (!loadMoreEpisodesUrl) {
            return new Promise((resolve) => resolve(content));
        }

        console.log(chalk.gray(`Loading more from ${loadMoreEpisodesUrl}`));
        return fetch(loadMoreEpisodesUrl)
            .then((r: any) => r.text())
            .then((nextContent: string) => this.loadMoreEpisodes(seriesUrl, this.appendMoreEpisodes(content, nextContent)));
    }

    private appendMoreEpisodes(originalContent: string, moreContent: string): string {
        //todo extractor break down into multiple classes or rename it to something like DOM
        return Extractor.appendEpisodes(
            originalContent,
            Extractor.moreEpisodes(moreContent)
        );
    }

    private loadMoreEpisodesUrl(seriesUrl: string, content: string): string {
        //is relative url coming from content
        const loadMoreEpisodesLink = Extractor.loadMoreEpisodesLink(content);

        if (!loadMoreEpisodesLink) {
            return '';
        }

        //this gets hostname
        const u = seriesUrl.split('/');
        u.pop();

        return u.join('/') + loadMoreEpisodesLink;
    }
}

export default SeriesService;
