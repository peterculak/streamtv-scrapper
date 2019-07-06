#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import ArchiveServiceInterface from "./joj/ArchiveServiceInterface";
import SeriesServiceInterface from "./joj/SeriesServiceInterface";
import * as Pino from "pino";
import EpisodesServiceInterface from "./joj/EpisodesServiceInterface";
import {ArchiveIndexInterface} from "./joj/ArchiveIndexInterface";

const chalk = require('chalk');
const figlet = require('figlet');
const program = require('commander');

const logger = container.get<Pino.Logger>(CONSTANTS.PINO_LOGGER);

require('dotenv').config();

console.log(
    chalk.red(
        figlet.textSync('STREAM-TV', {horizontalLayout: 'full'})
    )
);

program
    .version('0.0.1')
    .description("CLI for scrapping TV channels")
    .option('-h, --host [host]', 'Host to fetch data from')
    .option('-f, --fetch', 'When true it will fetch cache, when false it will compile json from cache')
    .option('-c, --compile', 'When true it will compile json from cache')
    .option('-e, --encrypt', 'Encrypt final json files')
    .option('-r, --concurrency <number>', 'How many concurrent requests to send when fetching episode pages')
    .option('-x, --pattern [pattern]', 'Regexp pattern. Will fetch archives for all programmes with matching in title')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .option('-v, --verbosity', 'Verbosity level', increaseVerbosity, 0)
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}

const host = program.host.replace('www.', '');
if (host !== 'joj.sk' && host !== 'plus.joj.sk' && host !== 'wau.joj.sk') {
    program.outputHelp(() => 'Please provide host by passing -h option');
    process.exit();
}

let archiveService = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
let series = container.get<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES);

if (program.programUrl === 'https://www.joj.sk/najnovsie') {
    archiveService = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_NEWS_ARCHIVE);
    // console.log(archiveService);
    series = container.get<SeriesServiceInterface>(CONSTANTS.JOJ_NEWS_SERIES);
}

logger.level = verbosity(program.verbosity);

if (program.concurrency) {
    container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).setConcurrency(parseFloat(program.concurrency));
}

if (program.encrypt) {
    const password = process.env.STREAM_TV_APP_PASSWORD;
    if (!password) {
        program.outputHelp(() => 'Please set STREAM_TV_APP_PASSWORD env variable in ./env');
        process.exit();
    } else {
        archiveService.cacheArchiveList(host).then((archive: ArchiveIndexInterface) => archiveService.encryptArchive(host, password));
    }
} else {
    if (!program.programUrl) {
        if (program.fetch && program.compile) {
            fetchSeries(host).then(() =>
                program.pattern ? archiveService.compileArchiveForProgramRegex(host, program.pattern) : archiveService.compileArchive(host)
            );
        } else if (program.fetch) {//only fetch !compile
            fetchSeries(host);
        } else if (program.compile) {//only compile !fetch
            program.pattern ? archiveService.compileArchiveForProgramRegex(host, program.pattern).catch((e: Error) => console.log(e))
                : archiveService.compileArchive(host).catch((e: Error) => console.log(e));
        } else if (program.encrypt) {

        }
    } else {
        if (program.fetch && program.compile) {
            series.cacheProgramSeriesIndexPagesForProgram(host, program.programUrl)
                .then(() => archiveService.compileArchiveForProgram(host, program.programUrl)).catch((e: Error) => console.log(e));
        } else if (program.fetch) {//only fetch 1 program and not compile
            series.cacheProgramSeriesIndexPagesForProgram(host, program.programUrl).catch((e: Error) => console.log(e));
        } else if (program.compile) {//only compile 1 program and no fetch
            archiveService.compileArchiveForProgram(host, program.programUrl).catch((e: Error) => console.log(e))
        } else if (program.encrypt) {

        }
    }
}

function increaseVerbosity(v: any, total: number) {
    return total + 1;
}

function verbosity(level: number) {
    let v = 'silent';

    if (level === 3) {
        v = 'trace';
    }
    if (level === 2) {
        v = 'debug';
    }
    if (level === 1) {
        v = 'info';
    }

    return v;
}

function fetchSeries(host: string) {
    return archiveService.cacheArchiveList(host)
        .then((archive: Array<{}>) => {
            logger.info(`Archive contains ${archive.length} items`);
            if (program.pattern) {
                logger.debug(`RegExp filter pattern /${program.pattern}/`);
                archive = archive.filter(
                    (element: any) => element.title.match(new RegExp(program.pattern, 'i')) !== null
                );
                logger.info(`Filtered archive contains ${archive.length} item(s)`);
            }
            return archive;
        })
        .then((archive: Array<{}>) => series.cacheProgramSeriesIndexPages(host, archive))
        .catch((err: Error) => logger.error(err));
}