#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import ArchiveServiceInterface from "./joj/ArchiveServiceInterface";
import ExtractorServiceInterface from "./joj/ExtractorServiceInterface";
import EpizodesServiceInterface from "./joj/EpizodesServiceInterface";

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

        archive.cacheArchiveList().then((r: string) => console.log(chalk.green(r)));
    } else {//fetch episodes for program
        const epizodes = container.get<EpizodesServiceInterface>(CONSTANTS.JOJ_EPIZODES);
        epizodes.cacheProgramIndex(program.programUrl)
            .then((r: string) => {
                console.log('All files saved');
            }).catch((err: Error) => console.log(chalk.red(err)));
    }
}