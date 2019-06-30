import {inject, injectable} from "inversify";
import "reflect-metadata";
import SeriesServiceInterface from "./SeriesServiceInterface";
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import CONSTANTS from "../app/config/constants";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";
import Slug from "./Slug";
import FileInterface from "../FileInterface";

@injectable()
class SeriesService implements SeriesServiceInterface {
    constructor(
        @inject(CONSTANTS.JOJ_EPISODES) private episodeService: EpisodesServiceInterface,
        @inject(CONSTANTS.JOJ_EXTRACTOR) private dom: ExtractorServiceInterface,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) private client: ClientInterface,
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
        const slug = Slug.fromProgramUrl(url);
        if (!slug) {
            throw Error(`Can not determine slug from url ${url}`);
        }

        const programDir = `./var/cache/joj.sk/${slug}`;

        return this.client.fetch(url)
            .then((r: any) => r.text())
            .then((body: string) => this.filesystem.writeFile(programDir, 'index.html', body))
            .then((r: FileInterface) => {
                let seriesArchiveUrl = this.dom.seriesArchiveUrl(r.content);
                this.logger.info(`Series archiveUrl ${seriesArchiveUrl}`);
                if (!seriesArchiveUrl) {
                    seriesArchiveUrl = url;
                }
                this.logger.info(`Series archiveUrl ${seriesArchiveUrl}`);
                seriesArchiveUrl = seriesArchiveUrl.replace('archív', 'archiv');
                return this.getSeriesPagesMeta(seriesArchiveUrl);
            })
            .then((seriesPagesMeta: Array<{ seriesUrl: string, url: string, title: string }>) => {
                //idea is to only fetch new series files and if there are no new then run last series
                //todo will need fixing
                const filtered = seriesPagesMeta.filter((item: any) => {
                    const seriesCachedFile = `${programDir}/series/${item.title.replace('/', '-')}.html`;
                    return !this.filesystem.existsSync(seriesCachedFile);
                });
                if (!filtered.length) {
                    filtered.push(seriesPagesMeta[0]);
                }
                return filtered;
            })
            .then((seriesPagesMeta: Array<{ seriesUrl: string, url: string, title: string }>) => this.cacheSeriesPages(programDir, seriesPagesMeta))
            ;
    }

    private getSeriesPagesMeta(seriesArchiveUrl: string): Promise<Array<{ seriesUrl: string, url: string, title: string }>> {
        let seriesUrl: string;
        return this.client.fetch(seriesArchiveUrl)
            .then((r: any) => {
                seriesUrl = r.url;
                return r.text();
            })
            .then((content: string) => {
                const meta = this.dom.seriesPagesMetaData(content);
                if (!meta.length) {
                    return [{title: '1. séria', url: seriesArchiveUrl, seriesUrl: seriesUrl}];
                }

                return meta.map((elem: { id: string, title: string }) => {
                    return {//todo could be object
                        title: elem.title,
                        url: elem.id ? `${seriesUrl}?seasonId=${elem.id}` : seriesUrl,
                        seriesUrl: seriesUrl,
                    };
                });
            });
    }

    private cacheSeriesPages(programDir: string, seriesPages: Array<{ seriesUrl: string, url: string, title: string }>): Promise<any[]> {
        return Promise.all(
            seriesPages.map((series: { seriesUrl: string, url: string, title: string }) =>
                this.client.fetch(series.url)
                    .then((r: any) => r.text())
                    .then((content: string) => this.loadMoreEpisodes(series.seriesUrl, content))
                    .then((content: string) => this.filesystem.writeFile(`${programDir}/series`, `${series.title.replace('/', '-')}.html`, content))
                    .then((r: FileInterface) => this.episodeService.cacheSeriesEpisodes([r.fullPath]))
            ));
    }

    private loadMoreEpisodes(seriesUrl: string, content: string): Promise<string> {
        const loadMoreEpisodesUrl = this.loadMoreEpisodesUrl(seriesUrl, content);

        if (!loadMoreEpisodesUrl) {
            return new Promise((resolve) => resolve(content));
        }

        this.logger.debug(`Loading more from ${loadMoreEpisodesUrl}`);
        return this.client.fetch(loadMoreEpisodesUrl)
            .then((r: any) => r.text())
            .then((nextContent: string) => this.loadMoreEpisodes(seriesUrl, this.appendMoreEpisodes(content, nextContent)));
    }

    private appendMoreEpisodes(originalContent: string, moreContent: string): string {
        //todo extractor break down into multiple classes or rename it to something like DOM
        return this.dom.appendEpisodes(
            originalContent,
            this.dom.moreEpisodes(moreContent)
        );
    }

    private loadMoreEpisodesUrl(seriesUrl: string, content: string): string {
        //is relative url coming from content
        const loadMoreEpisodesLink = this.dom.loadMoreEpisodesLink(content);

        if (!loadMoreEpisodesLink) {
            return '';
        }

        if (seriesUrl.match(/^http[s]?:\/\/videoportal.joj.sk/)) {
            return `https://videoportal.joj.sk${loadMoreEpisodesLink}`;
        }

        //this gets hostname
        const u = seriesUrl.split('/');
        u.pop();

        return u.join('/') + loadMoreEpisodesLink;
    }
}

export default SeriesService;
