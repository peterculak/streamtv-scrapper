interface SeriesServiceInterface {
    cacheProgramSeriesIndexPages(programUrl: string): Promise<Array<string>>;
}

export default SeriesServiceInterface;
