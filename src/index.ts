#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import ArchiveServiceInterface from "./joj/ArchiveServiceInterface";
import ExtractorServiceInterface from "./joj/ExtractorServiceInterface";
import SeriesServiceInterface from "./joj/SeriesServiceInterface";
import EpisodesServiceInterface from "./joj/EpisodesServiceInterface";

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
    .option('-s, --site <site>', 'Site url to scrap')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .parse(process.argv);

if (!process.argv.slice(2).length) {
    program.outputHelp();
    process.exit();
}

if (program.site === 'joj') {
    if (!program.programUrl) {//fetch list of programmes
        const archive = container.get<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE);
        const extractor = container.get<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR);

        archive.cacheArchiveList()
            .then(() => extractor.extract())
            .then((archive: Array<{}>) => console.log(archive))
            .catch((err: Error) => console.log(chalk.red(err)))
        ;

    } else {//fetch episodes for program
        const series = container.get<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES);

        const episodes = container.get<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES);
        series.cacheProgramSeriesIndexPages(program.programUrl)
            .then((seriesIndexPages: Array<string>) => episodes.cacheSeriesEpisodes(seriesIndexPages))
            .then((r: string) => console.log(r))
            .catch((err: Error) => console.log(chalk.red(err)));
    }
}