import Host from "../Host";

interface SeriesServiceInterface {
    cacheProgramSeriesIndexPages(host: Host, archive: Array<{}>): Promise<any>;
    cacheProgramSeriesIndexPagesForProgram(host: Host, programUrl: string): Promise<any>;
    setMaxLoadMorePages(n: number): void;
}

export default SeriesServiceInterface;
