import "reflect-metadata";
import {decorate, injectable} from "inversify";
import container from "../../src/app/config/container";
import ClientInterface from "../../src/ClientInterface";
import CONSTANTS from "../../src/app/config/constants";
import FileSystemInterface from "../../src/FileSystemInterface";
import ExtractorServiceInterface from "../../src/joj/ExtractorServiceInterface";
import LoggerInterface from "../../src/LoggerInterface";
import EpisodeFactoryInterface from "../../src/joj/EpisodeFactoryInterface";
import EpisodesServiceInterface from "../../src/joj/EpisodesServiceInterface";
import EpisodePageInterface from "../../src/joj/EpisodePageInterface";

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
mockExtractor.episodePagesList = jest.fn();
mockExtractor.episodeIframeUrl = jest.fn();
decorate(injectable(), mockExtractor);
container
    .rebind<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR)
    .toConstantValue(mockExtractor as any);
const mockEpisodeFactory = () => {
};
mockEpisodeFactory.fromCache = jest.fn();
decorate(injectable(), mockEpisodeFactory);
container
    .rebind<EpisodeFactoryInterface>(CONSTANTS.JOJ_EPISODE_FACTORY)
    .toConstantValue(mockEpisodeFactory);

describe('Episodes Service', () => {
    let service: EpisodesServiceInterface;
    beforeEach(() => {
        service = container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES);
        jest.resetAllMocks();
    });

    it('caches episode html pages for series in archive list', (done) => {
        const files = [ './var/cache/joj.sk/wau-leto/series/1. séria.html' ];

        mockFilesystem.readFile.mockImplementationOnce(() => {
            return new Promise((resolve) => resolve({
                name: '1. séria.html',
                fullPath: './var/cache/joj.sk/wau-leto/series/1. séria.html',
                content: 'content'
            }));
        });
        const episodePage: EpisodePageInterface = {
            title: 'WAU LETO S JOJ',
            url: 'https://videoportal.joj.sk/wau-leto/epizoda/33389-wau-leto-s-joj',
            img: 'https://img.joj.sk/r460x260n/0d0bacafcc7aaa38b575a6dcdde6b0c0',
            date: '30.7.2016',
            episode: 1
        };

        mockExtractor.episodePagesList.mockImplementationOnce(() => [ episodePage ]);

        mockClient.fetch.mockImplementation(() => {
            const responseContent = '';
            return new Promise((resolve) => resolve(new Response(responseContent)));
        });
        const iframeUrl = 'http://foo.bar.com/episode-video-iframe.html' ;
        mockExtractor.episodeIframeUrl.mockImplementationOnce(() => iframeUrl);
        service.cacheSeriesEpisodes(files).then(() => {
            done();
            expect(mockClient.fetch.mock.calls[0][0]).toBe(episodePage.url);
            expect(mockClient.fetch.mock.calls[1][0]).toBe(iframeUrl);
        });
    });
});