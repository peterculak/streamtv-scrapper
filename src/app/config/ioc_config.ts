import "reflect-metadata";

import { Container } from "inversify";

import CONSTANTS from "./constants";
import ArchiveServiceInterface from "../../joj/ArchiveServiceInterface";
import ArchiveService from "../../joj/ArchiveService";
import NewsArchiveService from "../../joj/news/ArchiveService";
import ExtractorServiceInterface from "../../joj/ExtractorServiceInterface";
import Extractor from "../../joj/Extractor";
import SeriesServiceInterface from "../../joj/SeriesServiceInterface";
import SeriesService from "../../joj/SeriesService";
import NewsSeriesService from "../../joj/news/SeriesService";
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
import EpisodeFactoryInterface from "../../joj/EpisodeFactoryInterface";
import EpisodeFactory from "../../joj/EpisodeFactory";
const pino = require('pino')();
const cheerio = require('cheerio');
const _ = require('underscore');
const fs = require('fs');
const glob = require("glob");

let container = new Container();
container.bind<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE).to(ArchiveService);
container.bind<ArchiveServiceInterface>(CONSTANTS.JOJ_NEWS_ARCHIVE).to(NewsArchiveService);
container.bind<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).to(EpisodesService).inSingletonScope();
container.bind<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES).to(SeriesService);
container.bind<SeriesServiceInterface>(CONSTANTS.JOJ_NEWS_SERIES).to(NewsSeriesService);
container.bind<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR).to(Extractor);
container.bind<Pino.Logger>(CONSTANTS.PINO_LOGGER).toConstantValue(pino);
container.bind<CheerioAPI>(CONSTANTS.CHEERIO).toConstantValue(cheerio);
container.bind<Underscore.UnderscoreStatic>(CONSTANTS.UNDERSCORE).toConstantValue(_);
container.bind<LoggerInterface>(CONSTANTS.LOGGER).to(Logger);
container.bind<ClientInterface>(CONSTANTS.CLIENT).to(Client);
container.bind<EpisodeFactoryInterface>(CONSTANTS.JOJ_EPISODE_FACTORY).to(EpisodeFactory);

const filesystem = new FileSystem(fs, glob, container.get<LoggerInterface>(CONSTANTS.LOGGER));
container.bind<FileSystemInterface>(CONSTANTS.FILESYSTEM).toConstantValue(filesystem);

export { container };
