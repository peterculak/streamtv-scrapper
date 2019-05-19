import {inject, injectable} from "inversify";
import "reflect-metadata";
import SeriesServiceInterface from "./SeriesServiceInterface";
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import CONSTANTS from "../app/config/constants";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import * as Pino from "pino";
import FileSystemInterface from "../FileSystemInterface";
const fetch = require('node-fetch');

@injectable()
class SeriesService implements SeriesServiceInterface {
    constructor(
        @inject(CONSTANTS.JOJ_EPISODES) private episodeService: EpisodesServiceInterface,
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.PINO_LOGGER) private logger: Pino.Logger,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
    ) {
    }

    cacheProgramSeriesIndexPages(archive: Array<{}>): Promise<any> {
        return archive.reduce((promiseChain: any, currentProgram: any) => {
            return promiseChain.then((chainResults: any) => {
                return this.cacheProgramSeriesIndexPagesForProgram(currentProgram.url).then((currentResult: any) => [...chainResults, currentResult]);
            });
        }, Promise.resolve([]));
    }

    cacheProgramSeriesIndexPagesForProgram(url: string): Promise<any> {
        this.logger.debug(`Fetching ${url}`);
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
            .then((body: string) => this.filesystem.writeFile(programDir, 'index.html', body))
            .then((r: { content: string, file: string }) => {
                let seriesArchiveUrl = this.extractor.seriesArchiveUrl(r.content);
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
                const meta = this.extractor.seriesPagesMetaData(content);
                if (!meta.length) {
                    return [{title: '1. séria', url: seriesArchiveUrl, seriesUrl: seriesUrl}];
                }

                return meta.map((elem: { id: string, title: string }) => {
                    return {
                        title: elem.title,
                        url: elem.id ? `${seriesUrl}?seasonId=${elem.id}` : seriesUrl,
                        seriesUrl: seriesUrl,
                    };
                });
            });
    }

    private cacheSeriesPages(programDir: string, seriesPages: Array<{ seriesUrl: string, url: string, title: string }>): Promise<any[]> {
        return Promise.all(seriesPages.map((series: { seriesUrl: string, url: string, title: string }) => fetch(series.url)
            .then((r: any) => r.text())
            .then((content: string) => this.loadMoreEpisodes(series.seriesUrl, content))
            .then((content: string) => this.filesystem.writeFile(`${programDir}/series`, `${series.title.replace('/', '-')}.html`, content))
            .then((r: any) => this.episodeService.cacheSeriesEpisodes([r.file]))));
    }

    private loadMoreEpisodes(seriesUrl: string, content: string): Promise<string> {
        const loadMoreEpisodesUrl = this.loadMoreEpisodesUrl(seriesUrl, content);
        if (!loadMoreEpisodesUrl) {
            return new Promise((resolve) => resolve(content));
        }

        this.logger.debug(`Loading more from ${loadMoreEpisodesUrl}`);
        return fetch(loadMoreEpisodesUrl)
            .then((r: any) => r.text())
            .then((nextContent: string) => this.loadMoreEpisodes(seriesUrl, this.appendMoreEpisodes(content, nextContent)));
    }

    private appendMoreEpisodes(originalContent: string, moreContent: string): string {
        //todo extractor break down into multiple classes or rename it to something like DOM
        return this.extractor.appendEpisodes(
            originalContent,
            this.extractor.moreEpisodes(moreContent)
        );
    }

    private loadMoreEpisodesUrl(seriesUrl: string, content: string): string {
        //is relative url coming from content
        const loadMoreEpisodesLink = this.extractor.loadMoreEpisodesLink(content);

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
