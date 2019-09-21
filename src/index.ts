#!/usr/bin/env node
import {container} from "./app/config/ioc_config";
import CONSTANTS from "./app/config/constants";
import FileSystemInterface from "./FileSystemInterface";
import ProgramRequest from "./ProgramRequest";
import YamlProgramRequest from "./YamlProgramRequest";
import yaml from 'js-yaml'
import FileInterface from "./FileInterface";
import TVArchiveCompilerInterface from "./TVArchiveCompilerInterface";
const chalk = require('chalk');
const figlet = require('figlet');
const commander = require('commander');
const filesystem = container.get<FileSystemInterface>(CONSTANTS.FILESYSTEM);

require('dotenv').config();

console.log(
    chalk.red(
        figlet.textSync('STREAM-TV', {horizontalLayout: 'full'})
    )
);

commander
    .version('0.0.1')
    .description("CLI for scrapping TV channels")
    .option('-h, --host [host]', 'Host to fetch data from')
    .option('-f, --fetch', 'When true it will fetch cache, when false it will compile json from cache')
    .option('-c, --compile', 'When true it will compile json from cache')
    .option('-e, --encrypt', 'Encrypt final json files')
    .option('-r, --concurrency <number>', 'How many concurrent requests to send when fetching episode pages', parseFloat)
    .option('-m, --maxLoadMorePages <number>', 'How many max more pages should try to load when there is a load more link on page', parseFloat)
    .option('-x, --pattern [pattern]', 'Regexp pattern. Will fetch archives for all programmes with matching in title')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .option('-v, --verbosity', 'Verbosity level', increaseVerbosity, 0)
    .option('-y, --yaml [yaml]', 'Yaml config with programmes')
    .parse(process.argv);


const compiler = container.get<TVArchiveCompilerInterface>(CONSTANTS.JOJ_ARCHIVE_COMPILER);

if (commander.yaml) {
    filesystem.readFile(commander.yaml)
        .then((file: FileInterface) => yaml.safeLoad(file.content))
        .then((yamlDefinition: any) => {
            compiler.processYaml(new YamlProgramRequest(yamlDefinition));
        });
} else {
    if (!process.argv.slice(2).length) {
        commander.outputHelp();
        process.exit();
    }
    try {
        compiler.process(new ProgramRequest(
            commander.host,
            commander.fetch,
            commander.encrypt,
            commander.compile,
            commander.maxLoadMorePages,
            commander.programUrl,
            commander.regexpPattern,
            commander.verbosity,
            commander.concurrency
        ));
    } catch (error) {
        throw error;
        // commander.outputHelp(() => error.toString());
        // process.exit();
    }
}

function increaseVerbosity(v: any, total: number) {
    return total + 1;
}