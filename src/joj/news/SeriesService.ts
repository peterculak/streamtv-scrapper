import {inject, injectable} from "inversify";
import "reflect-metadata";
import JojSeriesService, {SeriesPagesMeta} from "../SeriesService";

@injectable()
class SeriesService extends JojSeriesService {

    protected maxLoadMorePages: number|null = 1;

    protected getSeriesPagesMeta(seriesArchiveUrl: string): Promise<SeriesPagesMeta> {
        let seriesUrl: string;

        return this.client.fetch(seriesArchiveUrl)
            .then((r: any) => {
                seriesUrl = r.url;
                return r.text();
            })
            .then((content: string) => {
                const meta = this.dom.newsSeriesPagesMetaData(content);

                return meta.map((elem: { url: string, title: string }) => {
                    return {
                        title: elem.title,
                        url: elem.url,
                        seriesUrl: seriesUrl,
                    };
                });
            });
    }

    /**
     * every series page is a news category and i want to fetch episodes for all of them
     * so not filtering out anything
     * @param programDir
     * @param seriesPagesMeta
     */
    protected getSeriesToCache(programDir: string, seriesPagesMeta: SeriesPagesMeta): SeriesPagesMeta {
        return seriesPagesMeta;
    }
}

export default SeriesService;
