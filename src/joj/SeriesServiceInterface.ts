interface SeriesServiceInterface {
    cacheProgramSeriesIndexPages(archive: Array<{}>): Promise<any>;
    cacheProgramSeriesIndexPagesForProgram(programUrl: string): Promise<any>;
}

export default SeriesServiceInterface;
