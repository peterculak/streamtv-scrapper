import {inject, injectable} from "inversify";
import "reflect-metadata";
import CONSTANTS from "../app/config/constants";

import container from "../app/config/container";
import ArchiveServiceInterface from "../joj/ArchiveServiceInterface";
import SeriesServiceInterface from "../joj/SeriesServiceInterface";
import LoggerInterface from "../LoggerInterface";
import EpisodesServiceInterface from "../joj/EpisodesServiceInterface";
import {ArchiveIndexInterface} from "../joj/ArchiveIndexInterface";
import ProgramRequestInterface from "../ProgramRequestInterface";
import SeriesServiceStrategyInterface from "../joj/SeriesServiceStrategyInterface";
import TVArchiveCompilerInterface from "../TVArchiveCompilerInterface";

@injectable()
class TVArchiveCompiler implements TVArchiveCompilerInterface {
    constructor(
        @inject(CONSTANTS.JOJ_ARCHIVE) private readonly archiveService: ArchiveServiceInterface,
        @inject(CONSTANTS.JOJ_SERIES_STRATEGY) private readonly seriesServiceStrategy: SeriesServiceStrategyInterface,
        @inject(CONSTANTS.LOGGER) private readonly logger: LoggerInterface
    ) {}

    async process(request: ProgramRequestInterface) {
        const seriesService = this.seriesServiceStrategy.fetchService(request.url);
        if (request.maxLoadMorePages) {
            seriesService.setMaxLoadMorePages(request.maxLoadMorePages);
        }

        this.logger.debug(JSON.stringify(request));

        if (request.concurrency) {
            container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).setConcurrency(request.concurrency);
        }

        if (request.fetch) {
            await this.fetchSeries(request, seriesService);
        }

        if (request.compile) {
            await this.compileArchive(request);
        }

        if (request.encrypt) {
            await this.encrypt(request);
        }

        return new Promise((resolve) => resolve('done'));
    }

    private fetchSeries(
        request: ProgramRequestInterface,
        seriesService: SeriesServiceInterface
    ) {
        if (request.url) {
            return seriesService.cacheProgramSeriesIndexPagesForProgram(request.host, request.url);
        }
        return this.archiveService.cacheArchiveList(request.host)
            .then((archive: Array<{}>) => {
                this.logger.info(`Archive contains ${archive.length} items`);
                if (request.regexp) {
                    this.logger.debug(`RegExp filter pattern /${request.regexp}/`);
                    archive = archive.filter(
                        (element: any) => element.title.match(new RegExp(request.regexp, 'i')) !== null
                    );
                    this.logger.info(`Filtered archive contains ${archive.length} item(s)`);
                }
                return archive;
            })
            .then((archive: Array<{}>) => seriesService.cacheProgramSeriesIndexPages(request.host, archive))
            .catch((err: Error) => this.logger.error(err));
    }

    private compileArchive(request: ProgramRequestInterface) {
        if (request.url) {
            return this.archiveService.compileArchiveForProgram(request.host, request.url);
        } else if (request.regexp) {
            return this.archiveService.compileArchiveForProgramRegex(request.host, request.regexp);
        } else {
            return this.archiveService.compileArchive(request.host);
        }
    }

    private encrypt(request: ProgramRequestInterface) {
        if (!request.url && !request.regexp) {
            const password = process.env.STREAM_TV_APP_PASSWORD;
            if (!password) {
                throw new Error('Please set STREAM_TV_APP_PASSWORD env variable in ./env');
            } else {
                return this.archiveService.cacheArchiveList(request.host).then(
                    (archive: ArchiveIndexInterface) => this.archiveService.encryptArchive(request.host, password)
                );
            }
        } else {
            throw new Error('Not implemented');
        }
    }
}

export default TVArchiveCompiler;
