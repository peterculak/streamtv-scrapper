import {inject, injectable} from "inversify";
import "reflect-metadata";
import JojSeriesService from "../SeriesService";

type SeriesPagesMeta = Array<{ seriesUrl: string, url: string, title: string }>;

@injectable()
class SeriesService extends JojSeriesService {

    protected maxLoadMorePages: number|null = 1;

    protected getSeriesPagesMeta(seriesArchiveUrl: string): Promise<Array<{ seriesUrl: string; url: string; title: string }>> {

        return new Promise((resolve) => resolve(
            [
                {
                    title: 'Najnovšie',
                    url: 'https://www.joj.sk/najnovsie',
                    seriesUrl: 'https://www.joj.sk/najnovsie'
                },
                {
                    title: 'Slovensko',
                    url: 'https://www.joj.sk/slovensko',
                    seriesUrl: 'https://www.joj.sk/slovensko'
                },
                {
                    title: 'Zahraničie',
                    url: 'https://www.joj.sk/zahranicie',
                    seriesUrl: 'https://www.joj.sk/zahranicie'
                },
                {
                    title: 'Krimi',
                    url: 'https://www.joj.sk/krimi',
                    seriesUrl: 'https://www.joj.sk/krimi'
                },
                {
                    title: 'Politika',
                    url: 'https://www.joj.sk/politika',
                    seriesUrl: 'https://www.joj.sk/politika'
                },
                {
                    title: 'Ekonomika',
                    url: 'https://www.joj.sk/ekonomika',
                    seriesUrl: 'https://www.joj.sk/ekonomika'
                },
                {
                    title: 'Komentáre',
                    url: 'https://www.joj.sk/komentare',
                    seriesUrl: 'https://www.joj.sk/komentare'
                },
                {
                    title: 'Zaujímavosti',
                    url: 'https://www.joj.sk/zaujimavosti',
                    seriesUrl: 'https://www.joj.sk/zaujimavosti'
                },
                {
                    title: 'Šport',
                    url: 'https://www.joj.sk/sport',
                    seriesUrl: 'https://www.joj.sk/sport'
                },
            ]
        ));
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
