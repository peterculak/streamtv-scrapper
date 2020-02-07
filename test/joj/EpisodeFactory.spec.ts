import {decorate, injectable} from "inversify";
import container from "../../src/app/config/container";
import LoggerInterface from "../../src/LoggerInterface";
import CONSTANTS from "../../src/app/config/constants";
import ClientInterface from "../../src/ClientInterface";
import FileSystemInterface from "../../src/FileSystemInterface";
import ExtractorServiceInterface from "../../src/joj/ExtractorServiceInterface";
import EpisodeFactoryInterface from "../../src/joj/EpisodeFactoryInterface";
import EpisodeInterface from "../../src/joj/entity/EpisodeInterface";
import {Episode} from "../../src/joj/entity/Episode";

const mockLogger = () => {
};
mockLogger.fatal = jest.fn();
mockLogger.error = jest.fn();
mockLogger.warn = jest.fn();
mockLogger.info = jest.fn();
mockLogger.debug = jest.fn();
mockLogger.trace = jest.fn();
mockLogger.level = 'silent';

decorate(injectable(), mockLogger);
container
    .rebind<LoggerInterface>(CONSTANTS.LOGGER)
    .toConstantValue(mockLogger);
const mockClient = () => {
};
mockClient.fetch = jest.fn();
decorate(injectable(), mockClient);
container
    .rebind<ClientInterface>(CONSTANTS.CLIENT)
    .toConstantValue(mockClient);

const mockFilesystem = () => {
};
mockFilesystem.writeFile = jest.fn();
mockFilesystem.readFile = jest.fn();
mockFilesystem.readFileSync = jest.fn();
mockFilesystem.sync = jest.fn();
mockFilesystem.existsSync = jest.fn();
decorate(injectable(), mockFilesystem);
container
    .rebind<FileSystemInterface>(CONSTANTS.FILESYSTEM)
    .toConstantValue(mockFilesystem);

const mockExtractor = () => {
};
mockExtractor.episodeSchemaOrgMeta = jest.fn();
mockExtractor.episodeMp4Urls = jest.fn();
mockExtractor.extractDateAdded = jest.fn();
decorate(injectable(), mockExtractor);
container
    .rebind<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR)
    .toConstantValue(mockExtractor as any);

let episodeFactory: EpisodeFactoryInterface;
describe('JOJ Episode Factory', () => {

    beforeEach(() => {
        episodeFactory = container.get<EpisodeFactoryInterface>(CONSTANTS.JOJ_EPISODE_FACTORY);
        jest.resetAllMocks();
    });

    it('throws error when trying to create from an empty cached file', async () => {
        const mockCachedHtmlFile = {
            name: '1.html',
            fullPath: '/profesionali/series/1. seria/1.html',
            content: ''
        };
        mockFilesystem.readFile.mockImplementationOnce(() => {
            return new Promise((resolve) => resolve(mockCachedHtmlFile));
        });

        expect.assertions(1);
        try {
            await episodeFactory.fromCache('/profesionali/series/1. seria/1.html');
        } catch (e) {
            expect(e.toString()).toMatch('Error: Episode file /profesionali/series/1. seria/1.html was empty');
        }
    });

    it('creates episode from cached html file', (done) => {
        const mockCachedHtmlFile = {
            name: '1.html',
            fullPath: '/profesionali/series/1. seria/1.html',
            content: 'dummy content'
        };
        const mockCachedMetaFile = {
            name: '1.html',
            fullPath: '/profesionali/series/1. seria/iframes/1.html',
            content: 'dummy content with mp4s'
        };
        mockFilesystem.readFile.mockImplementationOnce(() => {
            return new Promise((resolve) => resolve(mockCachedHtmlFile));
        }).mockImplementationOnce(() => {
            return new Promise((resolve) => resolve(mockCachedMetaFile));
        });
        mockExtractor.episodeMp4Urls.mockImplementationOnce(() => ['http://www.foo.sk/bar.mp4']);
        const meta = {
            '@type': 'TVEpisode',
            name: 'Silvester',
            dateAdded: new Date(),
            description: 'description',
            thumbnailUrl: 'https://img.joj.sk/r400x300n/1f9796b089008b4dc10903f072207683.jpg',
            partOfSeason: { seasonNumber: 1, name: '1. séria' },
            partOfTVSeries: { name: 'Profesionali' },
            timeRequired: 'PT3333S',
            episodeNumber: 1,
            url: 'https://videoportal.joj.sk/profesionali/epizoda/2732-silvester',
            mp4: ['http://www.foo.sk/bar.mp4'],
        };
        const expected = new Episode(
            meta["@type"],
            meta.dateAdded,
            meta.description,
            meta.episodeNumber,
            meta.thumbnailUrl,
            meta.mp4,
            meta.name,
            meta.partOfSeason,
            meta.partOfTVSeries,
            meta.timeRequired,
            meta.url
        );
        mockExtractor.episodeSchemaOrgMeta.mockImplementationOnce(() => meta);

        episodeFactory.fromCache('/profesionali/series/1. seria/1.html').then((actual: EpisodeInterface) => {
            expect(actual).toEqual(expected);
            expect(mockFilesystem.readFile.mock.calls[0][0]).toBe('/profesionali/series/1. seria/1.html');
            expect(mockFilesystem.readFile.mock.calls[1][0]).toBe('/profesionali/series/1. seria/iframes/1.html');
            expect(mockExtractor.episodeSchemaOrgMeta).toHaveBeenCalledWith(mockCachedHtmlFile.content);
            done();
        }).catch((e: any) => done.fail(e));
    });
});