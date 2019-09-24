import {inject, injectable} from "inversify";
import "reflect-metadata";
import CONSTANTS from "../app/config/constants";

import {container} from "../app/config/ioc_config";
import ArchiveServiceInterface from "../joj/ArchiveServiceInterface";
import SeriesServiceInterface from "../joj/SeriesServiceInterface";
import LoggerInterface from "../LoggerInterface";
import EpisodesServiceInterface from "../joj/EpisodesServiceInterface";
import {ArchiveIndexInterface} from "../joj/ArchiveIndexInterface";
import ProgramRequestInterface from "../ProgramRequestInterface";
import YamlProgramRequestInterface from "../YamlProgramRequestInterface";
import ProgramRequest from "../ProgramRequest";
import SeriesServiceStrategyInterface from "../joj/SeriesServiceStrategyInterface";
import ArchiveServiceStrategyInterface from "../joj/ArchiveServiceStrategyInterface";
import TVArchiveCompilerInterface from "../TVArchiveCompilerInterface";
import Action from "../Action";
const Bluebird = require("bluebird");

@injectable()
class TVArchiveCompiler implements TVArchiveCompilerInterface {
    constructor(
        @inject(CONSTANTS.JOJ_ARCHIVE_STRATEGY) private readonly archiveServiceStrategy: ArchiveServiceStrategyInterface,
        @inject(CONSTANTS.JOJ_SERIES_STRATEGY) private readonly seriesServiceStrategy: SeriesServiceStrategyInterface,
        @inject(CONSTANTS.LOGGER) private readonly logger: LoggerInterface
    ) {}

    async process(request: ProgramRequestInterface) {
        const seriesService = this.seriesServiceStrategy.fetchService(request.programUrl);
        const archiveService = this.archiveServiceStrategy.fetchService(request.programUrl);
        if (request.maxLoadMorePages) {
            seriesService.setMaxLoadMorePages(request.maxLoadMorePages);
        }

        this.logger.debug(JSON.stringify(request));

        if (request.concurrency) {
            container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).setConcurrency(request.concurrency);
        }

        if (request.fetch) {
            await this.fetchSeries(request, seriesService, archiveService);
        }

        if (request.compile) {
            await this.compileArchive(request, archiveService);
        }

        if (request.encrypt) {
            await this.encrypt(request, archiveService);
        }

        return new Promise((resolve) => resolve('done'));
    }

    //todo
    processYaml(request: YamlProgramRequestInterface): void {
        Bluebird.map(
            request.items,
            (config: any) => this.process(new ProgramRequest(
                config.host,
                new Action(
                    Boolean(config.fetch),
                    Boolean(config.compile),
                    Boolean(config.encrypt)
                ),
                config.url,
                config.pattern,
                config.maxLoadMorePages,
                config.concurrency
            )),
            { concurrency: 1 }
        );
    }

    private fetchSeries(
        request: ProgramRequestInterface,
        seriesService: SeriesServiceInterface,
        archiveService: ArchiveServiceInterface
    ) {
        if (request.programUrl) {
            return seriesService.cacheProgramSeriesIndexPagesForProgram(request.host, request.programUrl);
        }
        return archiveService.cacheArchiveList(request.host)
            .then((archive: Array<{}>) => {
                this.logger.info(`Archive contains ${archive.length} items`);
                if (request.regexpPattern) {
                    this.logger.debug(`RegExp filter pattern /${request.regexpPattern}/`);
                    archive = archive.filter(
                        (element: any) => element.title.match(new RegExp(request.regexpPattern, 'i')) !== null
                    );
                    this.logger.info(`Filtered archive contains ${archive.length} item(s)`);
                }
                return archive;
            })
            .then((archive: Array<{}>) => seriesService.cacheProgramSeriesIndexPages(request.host, archive))
            .catch((err: Error) => this.logger.error(err));
    }

    private compileArchive(request: ProgramRequestInterface, archiveService: ArchiveServiceInterface) {
        if (request.programUrl) {
            return archiveService.compileArchiveForProgram(request.host, request.programUrl);
        } else if (request.regexpPattern) {
            return archiveService.compileArchiveForProgramRegex(request.host, request.regexpPattern);
        } else {
            return archiveService.compileArchive(request.host);
        }
    }

    private encrypt(request: ProgramRequestInterface, archiveService: ArchiveServiceInterface) {
        if (!request.programUrl && !request.regexpPattern) {
            const password = process.env.STREAM_TV_APP_PASSWORD;
            if (!password) {
                throw new Error('Please set STREAM_TV_APP_PASSWORD env variable in ./env');
            } else {
                return archiveService.cacheArchiveList(request.host).then(
                    (archive: ArchiveIndexInterface) => archiveService.encryptArchive(request.host, password)
                );
            }
        }
    }
}

export default TVArchiveCompiler;
