import jest from "jest";
import container from "../../src/app/config/container";
import CONSTANTS from "../../src/app/config/constants";
import ExtractorServiceInterface from "../../src/joj/ExtractorServiceInterface";
import fs from 'fs';

const readFixtureFile = (filePath: string) =>
    fs.readFileSync(`${filePath}`, 'utf8');

let extractor: ExtractorServiceInterface;
beforeEach(() => {
    extractor = container.get<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR);
});

describe('JOJ DOM Extractor', () => {
    test('can extract archive index from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/archive.html');
        expect(extractor.extractArchive(html)).toEqual([{
            "title": "15 min. KUCHÁR",
            "img": "https://img.joj.sk/r100x100/85b07385fca6c07342a66bd6cf59bf18",
            "url": "https://www.joj.sk/15-min-kuchar",
            "slug": "15-min-kuchar"
        }, {
            "title": "15 rokov TV JOJ",
            "img": "https://img.joj.sk/r100x100/4b9a604ecc06e9af92d2cf1ce9e0fd2e",
            "url": "https://www.joj.sk/15-rokov-tv-joj/o-sutazi",
            "slug": "o-sutazi"
        }, {
            "title": "15 rokov TV JOJ - koncerty",
            "img": "https://img.joj.sk/r100x100/0a4873eaf33a74ee4463d4fd6990c2ab",
            "url": "https://www.joj.sk/15-rokov-tv-joj-koncerty",
            "slug": "15-rokov-tv-joj-koncerty"
        }, {
            "title": "1890",
            "img": "https://img.joj.sk/r100x100/6f3b9927770ca8ced0b86336393ddd17",
            "url": "https://www.joj.sk/1890",
            "slug": "1890"
        }]);
    });

    test('can extract seriesArchiveUrl from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/15-min-kuchar/index.html');
        expect(extractor.seriesArchiveUrl(html)).toEqual('https://www.joj.sk/15-min-kuchar/archiv');
    });

    test('can extract seriesPagesMetaData from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/15-min-kuchar/series/3. seria.html');
        expect(extractor.seriesPagesMetaData(html)).toEqual([{id: '', title: '3. séria'},
            {id: '748', title: '2. séria'},
            {id: '577', title: '1. séria'}]);
    });

    test('can extract episode pages list from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/15-min-kuchar/series/3. seria.html');
        expect(extractor.episodePagesList(html)).toEqual([
            {
                title: '15 MINÚT. KUCHÁR',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/47855-15-minut-kuchar',
                img:
                    'https://img.joj.sk/r460x260n/0c3a9557b6e460a44dc6bb49a356c397.jpg',
                date: '22.9.2017',
                episode: 12
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/41272-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/fed20409a8a30bf207a36e73034cdcdc.jpg',
                date: '26.2.2017',
                episode: 8
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/41036-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/ca04dc01fb0c65d13055ed0eeb316908.jpg',
                date: '19.2.2017',
                episode: 7
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/40768-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/3338fcc5ce7557b992fbe4f7c68fe5b5.jpg',
                date: '12.2.2017',
                episode: 6
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/40492-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/53425c54c9678545cda2cfdfb6a48af5.jpg',
                date: '5.2.2017',
                episode: 5
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/40188-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/ace8657d12c86acaa92de3d2936bf6b4.jpg',
                date: '29.1.2017',
                episode: 4
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/39892-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/2b015171dc8266282e220675c4a275b5.jpg',
                date: '22.1.2017',
                episode: 3
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/39551-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/ec36aa03a3d384ba7ce9b206f9bd3d05.jpg',
                date: '15.1.2017',
                episode: 2
            },
            {
                title: '15 MINÚT. KUCHÁR A HOSTIA',
                url:
                    'https://videoportal.joj.sk/15-min-kuchar/epizoda/39277-15-minut-kuchar-a-hostia',
                img:
                    'https://img.joj.sk/r460x260n/a474a8b9bf5a14c050be371cfe798359.jpg',
                date: '8.1.2017',
                episode: 1
            }]);
    });

    test('can extract "Load More Episodes" link', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/profesionali/index.html');
        expect(extractor.loadMoreEpisodesLink(html)).toEqual('/profesionali?content5265-page=2&content5265-seasonId=498&do=content5265-listing');
    });

    test('can extract more episodes from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/profesionali/index.html');
        expect(extractor.moreEpisodes(html).length).toEqual(21993);
    });

    test('can extract episode iframe url from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/profesionali/1. seria/1.html');
        expect(extractor.episodeIframeUrl(html)).toEqual('https://media.joj.sk/embed/7EANlhz4h2b?autoplay=1');
    });

    test('can extract episode schema.org meta data from html', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/profesionali/1. seria/1.html');
        expect(extractor.episodeSchemaOrgMeta(html)).toEqual({
            '@context': 'http://schema.org',
            '@type': 'TVEpisode',
            name: 'Silvester',
            description:
                'Náčelník Maroš Nagy so svojimi mužmi hrdo bojuje so zločinom. Komediálny seriál z policajnej stanice (2008). Hrajú P. Batthyány, J. Kroner, Ľ. Kostelný, H. Krajčiová, L. Latinák, C. Kassai a ďalší. Réžia M. Libovič',
            url:
                'https://videoportal.joj.sk/profesionali/epizoda/2732-silvester',
            thumbnailUrl:
                'https://img.joj.sk/r100x75n/1f9796b089008b4dc10903f072207683.jpg',
            image:
                'https://img.joj.sk/r400x300n/1f9796b089008b4dc10903f072207683.jpg',
            episodeNumber: 18,
            timeRequired: 'PT3333S',
            partOfSeason: {'@type': 'TVSeason', name: '1. séria', seasonNumber: 1},
            partOfTVSeries:
                {
                    '@type': 'TVSeries',
                    name: 'Profesionáli',
                    url: 'https://videoportal.joj.sk/profesionali',
                    thumbnailUrl:
                        'https://img.joj.sk/r100x75n/858b5d1aea06d4507e5550688bf4aa6f.jpg',
                    image:
                        'https://img.joj.sk/r400x300n/858b5d1aea06d4507e5550688bf4aa6f.jpg',
                    description:
                        'Policajná stanica v malom meste je miesto, kde sa môže stať naozaj čokoľvek. Všetky hlavné postavy sú policajti (súčasní aj bývalí). Pod vedením kapitána Maroša Nagya (Peter Batthyany), riešia jeho podriadení: aktívny frajer Fero Boborovský, ktorého sem degradovali z hlavného mesta (Luboš Kostelný), protekčný lenivec Karol Hůrka (Lukáš Latinák) a v myslení pomalší, ale o to ochotnejší jedináčik z rodiny univerzitných profesorov Alexander Vyšný-Riefenstahl (Csongor Kassai), prípady, v ktorých sa zaoberajú všetkým: od klobás až po mafiánsku svadbu, protiteroristický záťah, či zaistenie falošných policajtov, z ktorých sa vykľujú filmári.'
                }
        });
    });

    test('can extract episode stream mp4 urls', () => {
        const html = readFixtureFile(__dirname + '/../fixtures/profesionali/1. seria/iframes/1.html');
        expect(extractor.episodeMp4Urls(html)).toEqual([
            'https://nn.geo.joj.sk/storage/media-new/vod/2008/12/31/f652aa52-8075-4e5b-b6aa-4848853fcc90/2-083390-0018-h264-pal.mp4',
            'https://nn.geo.joj.sk/storage/media-new/vod/2008/12/31/f652aa52-8075-4e5b-b6aa-4848853fcc90/2-083390-0018-h264-hq.mp4',
            'https://nn.geo.joj.sk/storage/media-new/vod/2008/12/31/f652aa52-8075-4e5b-b6aa-4848853fcc90/2-083390-0018-h264-pal.mp4'
        ]);
    });
});