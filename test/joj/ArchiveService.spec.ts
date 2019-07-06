import "reflect-metadata";
import {decorate, injectable} from "inversify";
import {container} from "../../src/app/config/ioc_config";
import ClientInterface from "../../src/ClientInterface";
import CONSTANTS from "../../src/app/config/constants";
import ArchiveServiceInterface from "../../src/joj/ArchiveServiceInterface";
import FileSystemInterface from "../../src/FileSystemInterface";
import FileInterface from "../../src/FileInterface";
import ExtractorServiceInterface from "../../src/joj/ExtractorServiceInterface";
import {ArchiveIndexInterface} from "../../src/joj/ArchiveIndexInterface";
import LoggerInterface from "../../src/LoggerInterface";
import EpisodeFactoryInterface from "../../src/joj/EpisodeFactoryInterface";
import EpisodeInterface from "../../src/joj/EpisodeInterface";

const mockLogger = () => {
};
mockLogger.fatal = jest.fn();
mockLogger.error = jest.fn();
mockLogger.warn = jest.fn();
mockLogger.info = jest.fn();
mockLogger.debug = jest.fn();
mockLogger.trace = jest.fn();

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
mockFilesystem.sync = jest.fn();
mockFilesystem.existsSync = jest.fn();
decorate(injectable(), mockFilesystem);
container
    .rebind<FileSystemInterface>(CONSTANTS.FILESYSTEM)
    .toConstantValue(mockFilesystem);

const mockExtractor = () => {
};
mockExtractor.extractArchive = jest.fn();
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
describe('Archive Service', () => {
    let service: ArchiveServiceInterface;
    beforeEach(() => {
        service = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
        jest.resetAllMocks();
    });

    it('fetches archive list and stores as html and json', (done) => {
        const expectedArchive: ArchiveIndexInterface = [];
        const responseContent = 'response content';

        mockClient.fetch.mockImplementation(() => {
            return new Promise((resolve) => resolve(new Response(responseContent)));
        });
        mockFilesystem.writeFile.mockImplementationOnce(() => {
            const file: FileInterface = {
                name: 'foo.txt',
                fullPath: '/tmp/foo.txt',
                content: responseContent,
            };
            return new Promise((resolve) => resolve(file));
        }).mockImplementationOnce(() => {
            const file: FileInterface = {
                name: 'archive.json',
                fullPath: '/tmp/archive.json',
                content: JSON.stringify(expectedArchive),
            };
            return new Promise((resolve) => resolve(file));
        });
        mockExtractor.extractArchive.mockImplementation(() => {
            return new Promise((resolve) => resolve(expectedArchive));
        });
        service.cacheArchiveList('joj.sk').then((actualArchive: ArchiveIndexInterface) => {
            done();
            expect(mockFilesystem.writeFile).toHaveBeenCalledWith(expect.any(String), expect.any(String), responseContent);
            expect(mockExtractor.extractArchive).toHaveBeenCalledWith(responseContent);
            expect(mockFilesystem.writeFile).toHaveBeenCalledWith(
                expect.any(String),
                expect.any(String),
                JSON.stringify(expectedArchive)
            );
            expect(actualArchive).toEqual(expectedArchive);
        }).catch((e: any) => {
            done.fail(e);
        });
    });

    describe('compiles archive json file from cache for given program url', () => {
        it('throws error when can not determine slug from url', () => {
            expect(() => service.compileArchiveForProgram('')).toThrow();
        });

        it('creates and stores program archive json file', (done) => {
            mockFilesystem.sync.mockImplementation(() => ['1. seria/1.html']);

            mockEpisodeFactory.fromCache.mockImplementation(() => {
                const episode: EpisodeInterface = {
                    name: 'name',
                    episodeNumber: 1,
                    partOfTVSeries: {},
                    mp4: ['http://foo.bar/video.mp4'],
                    partOfSeason: {seasonNumber: 1, name: 'season name'}
                };
                return new Promise((resolve => resolve(episode)));
            });
            const expectedArchive = JSON.stringify([{1: {seasonNumber: 1, episodes: [{episodeNumber: 1, mp4: ['http://foo.bar/video.mp4']}]}}]);
            service.compileArchiveForProgram('http://joj.sk/profesionali').then((r: EpisodeInterface[]) => {
                expect(mockFilesystem.sync).toHaveBeenCalledWith("**(!iframes)/*.html", {cwd: './var/cache/joj.sk/profesionali/series'});
                expect(mockEpisodeFactory.fromCache).toHaveBeenCalledWith('./var/cache/joj.sk/profesionali/series/1. seria/1.html');
                expect(mockFilesystem.writeFile).toHaveBeenCalledWith('./var/cache/joj.sk/profesionali', 'profesionali.json', expectedArchive);
                done();
            }).catch((e: any) => {
                done.fail(e);
            });
        });
    });

    describe('compiles archive json file from cache for all programmes', () => {
        it('creates and stores archive json file', (done) => {
            const directories = [
                './var/cache/joj.sk/profesionali/',
            ];
            const files = ['1. seria/1.html'];
            mockFilesystem.sync
                .mockImplementationOnce(() => directories)
                .mockImplementationOnce(() => files)
            ;

            mockEpisodeFactory.fromCache.mockImplementation(() => {
                const episode: EpisodeInterface = {
                    name: 'name',
                    episodeNumber: 1,
                    partOfTVSeries: {},
                    mp4: ['http://foo.bar/video.mp4'],
                    partOfSeason: {seasonNumber: 1, name: 'season name'}
                };
                return new Promise((resolve => resolve(episode)));
            });

            const expectedArchive = JSON.stringify([{1: {seasonNumber: 1, episodes: [{episodeNumber: 1, mp4: ['http://foo.bar/video.mp4']}]}}]);
            service.compileArchive('joj.sk').then((r: Array<EpisodeInterface[]>) => {
                expect(mockFilesystem.writeFile.mock.calls.length).toBe(1);
                expect(mockFilesystem.sync.mock.calls[0][0]).toBe('./var/cache/joj.sk/*/');
                expect(mockFilesystem.sync.mock.calls[1][0]).toBe('**(!iframes)/*.html');
                expect(mockFilesystem.sync.mock.calls[1][1]).toEqual({cwd: './var/cache/joj.sk/profesionali/series'});
                expect(mockEpisodeFactory.fromCache).toHaveBeenCalledWith('./var/cache/joj.sk/profesionali/series/1. seria/1.html');
                expect(mockFilesystem.writeFile).toHaveBeenCalledWith('./var/cache/joj.sk/profesionali', 'profesionali.json', expectedArchive);
                done();
            }).catch((e: any) => {
                done.fail(e);
            });
        });
    });

    describe('compiles archive for given regex', () => {
        it('creates and stores archive json file', (done) => {
            const regex = '^p.*';
            const directories = [
                './var/cache/joj.sk/15-min-kuchar/',
                './var/cache/joj.sk/profesionali/',
            ];
            const files = ['1. seria/1.html'];
            mockFilesystem.sync
                .mockImplementationOnce(() => directories)
                .mockImplementation(() => files)
            ;

            mockEpisodeFactory.fromCache.mockImplementation(() => {
                const episode: EpisodeInterface = {
                    name: 'name',
                    episodeNumber: 1,
                    partOfTVSeries: {},
                    mp4: ['http://foo.bar/video.mp4'],
                    partOfSeason: {seasonNumber: 2, name: 'season name'}
                };
                return new Promise((resolve => resolve(episode)));
            });

            const expectedArchive = JSON.stringify([{2: {seasonNumber: 2, episodes: [{episodeNumber: 1, mp4: ['http://foo.bar/video.mp4']}]}}]);
            service.compileArchiveForProgramRegex('joj.sk', regex).then((r: Array<EpisodeInterface[]>) => {
                expect(mockFilesystem.writeFile.mock.calls.length).toBe(1);
                expect(mockFilesystem.sync.mock.calls[0][0]).toBe('./var/cache/joj.sk/*/');
                expect(mockFilesystem.sync.mock.calls[1][0]).toBe('**(!iframes)/*.html');
                expect(mockFilesystem.sync.mock.calls[1][1]).toEqual({cwd: './var/cache/joj.sk/profesionali/series'});
                expect(mockEpisodeFactory.fromCache).toHaveBeenCalledWith('./var/cache/joj.sk/profesionali/series/1. seria/1.html');
                expect(mockFilesystem.writeFile).toHaveBeenCalledWith('./var/cache/joj.sk/profesionali', 'profesionali.json', expectedArchive);

                done();
            }).catch((e: any) => {
                done.fail(e);
            });
        });
    });
});