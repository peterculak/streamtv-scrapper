interface SeriesServiceInterface {
    cacheProgramSeriesIndexPages(host: string, archive: Array<{}>): Promise<any>;
    cacheProgramSeriesIndexPagesForProgram(host: string, programUrl: string): Promise<any>;
    setMaxLoadMorePages(n: number): void;
}

export default SeriesServiceInterface;
