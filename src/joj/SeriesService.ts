import {inject, injectable} from "inversify";
import "reflect-metadata";
import SeriesServiceInterface from "./SeriesServiceInterface";
import EpisodesServiceInterface from "./EpisodesServiceInterface";
import CONSTANTS from "../app/config/constants";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import FileSystemInterface from "../FileSystemInterface";
import LoggerInterface from "../LoggerInterface";
import ClientInterface from "../ClientInterface";
import Slug from "../Slug";
import FileInterface from "../FileInterface";
import Host from "../Host";
import ConfigInterface from "../app/config/ConfigInterface";

type SeriesPagesMeta = Array<{ seriesUrl: string, url: string, title: string }>;

@injectable()
class SeriesService implements SeriesServiceInterface {

    protected maxLoadMorePages: number|null = null;

    constructor(
        @inject(CONSTANTS.CONFIG) private readonly config: ConfigInterface,
        @inject(CONSTANTS.JOJ_EPISODES) protected episodeService: EpisodesServiceInterface,
        @inject(CONSTANTS.JOJ_EXTRACTOR) protected dom: ExtractorServiceInterface,
        @inject(CONSTANTS.SLUGS) protected slug: Slug,
        @inject(CONSTANTS.LOGGER) protected logger: LoggerInterface,
        @inject(CONSTANTS.FILESYSTEM) protected filesystem: FileSystemInterface,
        @inject(CONSTANTS.CLIENT) protected client: ClientInterface,
    ) {}

    cacheProgramSeriesIndexPages(host: Host, archive: Array<{}>): Promise<any> {
        return archive.reduce((promiseChain: any, currentProgram: any) => {
            return promiseChain.then((chainResults: any) => {
                return this.cacheProgramSeriesIndexPagesForProgram(host, currentProgram.url).then((currentResult: any) => [...chainResults, currentResult]);
            });
        }, Promise.resolve([]));
    }

    cacheProgramSeriesIndexPagesForProgram(host: Host, url: string): Promise<any> {
        const slug = this.slug.fromProgramUrl(url);
        if (!slug) {
            throw Error(`Can not determine slug from url ${url}`);
        }

        const programDir = `${this.config.cacheDir}/${host.name}/${slug}`;

        return this.client.fetch(url)
            .then((r: any) => r.text())
            .then((body: string) => this.filesystem.writeFile(programDir, 'index.html', body))
            .then((r: FileInterface) => {
                let seriesArchiveUrl = this.dom.seriesArchiveUrl(r.content);
                if (!seriesArchiveUrl) {
                    seriesArchiveUrl = url;
                }
                this.logger.info(`Series archiveUrl ${seriesArchiveUrl}`);
                seriesArchiveUrl = seriesArchiveUrl.replace('archív', 'archiv');
                return this.getSeriesPagesMeta(seriesArchiveUrl);
            })
            .then((seriesPagesMeta: SeriesPagesMeta) => this.getSeriesToCache(programDir, seriesPagesMeta))
            .then((seriesPagesMeta: SeriesPagesMeta) => this.cacheSeriesPages(programDir, seriesPagesMeta))
            ;
    }

    setMaxLoadMorePages(n: number): void {
        this.maxLoadMorePages = n;
    }

    protected getSeriesToCache(programDir: string, seriesPagesMeta: SeriesPagesMeta): SeriesPagesMeta {
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
    }

    protected getSeriesPagesMeta(seriesArchiveUrl: string): Promise<SeriesPagesMeta> {
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

    private loadedMorePages = 0;
    private loadMoreEpisodes(seriesUrl: string, content: string): Promise<string> {
        const loadMoreEpisodesUrl = this.loadMoreEpisodesUrl(seriesUrl, content);
        if (!loadMoreEpisodesUrl) {
            return new Promise((resolve) => resolve(content));
        }

        this.logger.debug(`Loading more from ${loadMoreEpisodesUrl}`);

        return this.client.fetch(loadMoreEpisodesUrl)
            .then((r: any) => r.text())
            .then((nextContent: string) => {
                const merged = this.appendMoreEpisodes(content, nextContent);
                this.loadedMorePages++;
                if (!this.maxLoadMorePages) {
                    return this.loadMoreEpisodes(seriesUrl, merged);
                }

                if (this.loadedMorePages >= this.maxLoadMorePages) {
                    this.loadedMorePages = 0;
                    return merged;
                }

                return this.loadMoreEpisodes(seriesUrl, merged);
            });
    }

    private appendMoreEpisodes(originalContent: string, moreContent: string): string {
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
export {SeriesService, SeriesPagesMeta};
