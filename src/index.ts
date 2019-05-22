#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import ArchiveServiceInterface from "./joj/ArchiveServiceInterface";
import SeriesServiceInterface from "./joj/SeriesServiceInterface";
import * as Pino from "pino";
import EpisodesServiceInterface from "./joj/EpisodesServiceInterface";

const chalk = require('chalk');
const figlet = require('figlet');
const program = require('commander');

const archiveService = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
const archiveCompiler = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
const series = container.get<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES);
const logger = container.get<Pino.Logger>(CONSTANTS.PINO_LOGGER);

console.log(
    chalk.red(
        figlet.textSync('STREAM-TV', {horizontalLayout: 'full'})
    )
);

program
    .version('0.0.1')
    .description("CLI for scrapping TV channels")
    .option('-f, --fetch', 'When true it will fetch cache, when false it will compile json from cache')
    .option('-c, --compile', 'When true it will compile json from cache')
    .option('-r, --concurrency <number>', 'How many concurrent requests to send when fetching episode pages')
    .option('-x, --pattern [pattern]', 'Regexp pattern. Will fetch archives for all programmes with matching in title')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .option('-v, --verbosity', 'Verbosity level', increaseVerbosity, 0)
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}

logger.level = verbosity(program.verbosity);

if (program.concurrency) {
    container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).setConcurrency(parseFloat(program.concurrency));
}

if (!program.programUrl) {
    if (program.fetch && program.compile) {
        fetchSeries().then(() => archiveCompiler.compileArchive());//should probably respect -x
    } else if (program.fetch) {//only fetch !compile
        fetchSeries();
    } else if (program.compile) {//only compile !fetch
        archiveCompiler.compileArchive();//should probably respect -x
    }
} else {
    if (program.fetch && program.compile) {
        series.cacheProgramSeriesIndexPagesForProgram(program.programUrl)
            .then(() => archiveCompiler.compileArchiveForProgram(program.programUrl));
    } else if (program.fetch) {//only fetch 1 program and not compile
        series.cacheProgramSeriesIndexPagesForProgram(program.programUrl);
    } else if (program.compile) {//only compile 1 program and no fetch
        archiveCompiler.compileArchiveForProgram(program.programUrl)
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

function fetchSeries() {
    return archiveService.cacheArchiveList()
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
        .then((archive: Array<{}>) => series.cacheProgramSeriesIndexPages(archive))
        .catch((err: Error) => logger.error(err));
}