#!/usr/bin/env node
import container from "./app/config/container";
import CONSTANTS from "./app/config/constants";
import FileSystemInterface from "./FileSystemInterface";
import ProgramRequest from "./ProgramRequest";
import TVArchiveCompilerInterface from "./TVArchiveCompilerInterface";
import LoggerInterface from "./LoggerInterface";
import Action from "./Action";
import Host from "./Host";
import ConfigInterface, {HostInterface, NewsItem, Show} from "./app/config/ConfigInterface";
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

const configYml = process.env.STREAM_TV_APP_CONFIG as string;
if (!filesystem.existsSync(configYml)) {
    throw new Error(`${configYml} does not exist`);
}

commander
    .version('0.0.1')
    .description("CLI for scrapping TV channels")
    .option('-h, --host [host]', 'Host to fetch data from')
    .option('-f, --fetch', 'When true it will fetch cache, when false it will compile json from cache')
    .option('-c, --compile', 'When true it will compile json from cache')
    .option('-e, --encrypt', 'Encrypt final json files')
    .option('-r, --concurrency <number>', 'How many concurrent requests to send when fetching episode pages', parseFloat)
    .option('-m, --maxLoadMorePages <number>', 'How many max more pages should try to load when there is a load more link on page', parseFloat)
    .option('-x, --regexp [pattern]', 'Regexp pattern. Will fetch archives for all programmes with matching in title')
    .option('-p, --programUrl [program]', 'Fetch all episodes for program url')
    .option('-v, --verbosity', 'Verbosity level', increaseVerbosity, 0)
    .option('-a, --action [yaml]', 'Yaml config with programmes')
    .parse(process.argv);


const compiler = container.get<TVArchiveCompilerInterface>(CONSTANTS.JOJ_ARCHIVE_COMPILER);
container.get<LoggerInterface>(CONSTANTS.LOGGER).level = verbosityToLoggerLevel(commander.verbosity);

const config = container.get<ConfigInterface>(CONSTANTS.CONFIG);

if (commander.action) {
    if (commander.action === 'news') {
        const conf = config.news;
        if (conf) {
            conf.map((c: NewsItem) => compiler.process(new ProgramRequest(
                Host.fromConfig({name: c.host}),
                new Action(
                    true,
                    true,
                ),
                c.url,
                '',
                c.maxLoadMorePages,
                c.concurrency
            )));
        }
    } else if (commander.action === 'shows') {
        const conf = config.shows;
        if (conf) {
            conf.map((c: Show) => compiler.process(new ProgramRequest(
                Host.fromConfig({name: c.host}),
                new Action(
                    true,
                    true,
                ),
                c.url,
                '',
                undefined,
                c.concurrency
            )));
        }
    } else if (commander.action === 'encrypt') {
        const conf = config.hosts;
        if (conf) {
            conf.map((hostConf: HostInterface) => compiler.process(new ProgramRequest(
                Host.fromConfig(hostConf),
                new Action(
                    false,
                    false,
                    true,
                ),
            )));
        }
    }
} else {
    if (!process.argv.slice(2).length) {
        commander.outputHelp();
        process.exit();
    }
    try {
        compiler.process(new ProgramRequest(
            Host.fromConfig({name: commander.host}),
            new Action(
                Boolean(commander.fetch),
                Boolean(commander.compile),
                Boolean(commander.encrypt)
            ),
            commander.programUrl,
            commander.regexp,
            commander.maxLoadMorePages,
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

function verbosityToLoggerLevel(level: number): string {
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