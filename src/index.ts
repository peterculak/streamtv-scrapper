#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import ArchiveServiceInterface from "./joj/ArchiveServiceInterface";
import ExtractorServiceInterface from "./joj/ExtractorServiceInterface";
import SeriesServiceInterface from "./joj/SeriesServiceInterface";
import FileSystem from "./FileSystem";

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const path = require('path');
const program = require('commander');
const fs = require('fs');

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
    .option('-x, --pattern [pattern]', 'Regexp pattern. Will fetch archives for all programmes with matching in title')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}
const archiveCompiler = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
const series = container.get<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES);

if (!program.programUrl) {
    const archive = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
    const extractor = container.get<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR);

    if (program.fetch && program.compile) {
        archive.cacheArchiveList()
            .then(() => extractor.extract())
            .then((archive: Array<{}>) => FileSystem.writeFile('./var/cache/joj.sk', 'archive.json', JSON.stringify(archive)))
            .then((file: any) => {
                let jsonArchive = JSON.parse(file.content);
                console.log(`Archive contains ${jsonArchive.length} item(s)`);
                if (program.pattern) {
                    console.log(`RegExp filter pattern /${program.pattern}/`);
                    jsonArchive = jsonArchive.filter(
                        (element: any) => element.title.match(new RegExp(program.pattern, 'i')) !== null
                    );
                    console.log(`Filtered archive contains ${jsonArchive.length} item(s)`);
                }
                series.cacheProgramSeriesIndexPages(jsonArchive);
            })
            .catch((err: Error) => console.log(chalk.red(err)));

        //this needs .then
    } else if (program.fetch) {//only fetch !compile
        archive.cacheArchiveList()
            .then(() => extractor.extract())
            .then((archive: Array<{}>) => console.log(chalk.green(`Archive contains ${archive.length} items`)))
            .catch((err: Error) => console.log(chalk.red(err)));
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