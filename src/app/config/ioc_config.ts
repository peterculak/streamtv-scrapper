import "reflect-metadata";

import { Container } from "inversify";

import CONSTANTS from "./constants";
import ArchiveServiceInterface from "../../joj/ArchiveServiceInterface";
import ArchiveService from "../../joj/ArchiveService";
import ExtractorServiceInterface from "../../joj/ExtractorServiceInterface";
import Extractor from "../../joj/Extractor";
import SeriesServiceInterface from "../../joj/SeriesServiceInterface";
import SeriesService from "../../joj/SeriesService";
import EpisodesServiceInterface from "../../joj/EpisodesServiceInterface";
import EpisodesService from "../../joj/EpisodesService";

import * as Underscore from "underscore";
import * as Pino from "pino";
import CheerioAPI from "cheerio";
import FileSystemInterface from "../../FileSystemInterface";
import FileSystem from "../../FileSystem";
import LoggerInterface from "../../LoggerInterface";
import Logger from "../../Logger";
import ClientInterface from "../../ClientInterface";
import Client from "../../Client";
const pino = require('pino')();
const cheerio = require('cheerio');
const _ = require('underscore');

let container = new Container();
container.bind<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE).to(ArchiveService);
container.bind<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).to(EpisodesService).inSingletonScope();
container.bind<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES).to(SeriesService);
container.bind<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR).to(Extractor);
container.bind<FileSystemInterface>(CONSTANTS.FILESYSTEM).to(FileSystem);
container.bind<Pino.Logger>(CONSTANTS.PINO_LOGGER).toConstantValue(pino);
container.bind<CheerioAPI>(CONSTANTS.CHEERIO).toConstantValue(cheerio);
container.bind<Underscore.UnderscoreStatic>(CONSTANTS.UNDERSCORE).toConstantValue(_);
container.bind<LoggerInterface>(CONSTANTS.LOGGER).to(Logger);
container.bind<ClientInterface>(CONSTANTS.CLIENT).to(Client);

export { container };
