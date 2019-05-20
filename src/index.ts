#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import ArchiveServiceInterface from "./joj/ArchiveServiceInterface";
import ExtractorServiceInterface from "./joj/ExtractorServiceInterface";
import SeriesServiceInterface from "./joj/SeriesServiceInterface";
import * as Pino from "pino";
import FileSystemInterface from "./FileSystemInterface";
import EpisodesServiceInterface from "./joj/EpisodesServiceInterface";

const chalk = require('chalk');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');
const fs = require('fs');

console.log(
    chalk.red(
        figlet.textSync('STREAM-TV', {horizontalLayout: 'full'})
    )
);

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

program
    .version('0.0.1')
    .description("CLI for scrapping TV channels")

    .option('-f, --fetch', 'When true it will fetch cache, when false it will compile json from cache')
    .option('-s, --sequenceMode', 'Fetches episode pages in sequence not to hammer api')
    .option('-c, --compile', 'When true it will compile json from cache')
    .option('-x, --pattern [pattern]', 'Regexp pattern. Will fetch archives for all programmes with matching in title')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .option('-v, --verbosity', 'Verbosity level', increaseVerbosity, 0)
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
const archiveCompiler = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
const series = container.get<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES);
const filesystem = container.get<FileSystemInterface>(CONSTANTS.FILESYSTEM);
const logger = container.get<Pino.Logger>(CONSTANTS.PINO_LOGGER);
logger.level = verbosity(program.verbosity);

if (program.sequenceMode) {
    container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).setFetchSequenceMode();
}

if (!program.programUrl) {
    const archive = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
    const extractor = container.get<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR);

    if (program.fetch && program.compile) {
        archive.cacheArchiveList()
            .then(() => extractor.extract())
            .then((archive: Array<{}>) => filesystem.writeFile('./var/cache/joj.sk', 'archive.json', JSON.stringify(archive)))
            .then((file: any) => {
                let jsonArchive = JSON.parse(file.content);
                logger.info(`Archive contains ${jsonArchive.length} item(s)`);
                if (program.pattern) {
                    logger.debug(`RegExp filter pattern /${program.pattern}/`);
                    jsonArchive = jsonArchive.filter(
                        (element: any) => element.title.match(new RegExp(program.pattern, 'i')) !== null
                    );
                    logger.info(`Filtered archive contains ${jsonArchive.length} item(s)`);
                }
                series.cacheProgramSeriesIndexPages(jsonArchive);
            })
            .catch((err: Error) => logger.error(err));
        //this needs .then to compile json
    } else if (program.fetch) {//only fetch !compile
        archive.cacheArchiveList()
            .then(() => extractor.extract())
            .then((archive: Array<{}>) => logger.info(`Archive contains ${archive.length} items`))
            .catch((err: Error) => logger.error(err));
    } else if (program.compile) {//only compile !fetch
        archiveCompiler.compileArchive();
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