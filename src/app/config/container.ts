import "reflect-metadata";
import { Container, injectable } from "inversify";
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
import SeriesServiceStrategyInterface from "../../joj/SeriesServiceStrategyInterface";
import SeriesServiceStrategy from "../../joj/SeriesServiceStrategy";
import ArchiveServiceStrategyInterface from "../../joj/ArchiveServiceStrategyInterface";
import ArchiveServiceStrategy from "../../joj/ArchiveServiceStrategy";
import TVArchiveCompilerInterface from "../../TVArchiveCompilerInterface";
import TVArchiveCompiler from "../../joj/TVArchiveCompiler";
import ValidatorInterface from "../../validator/ValidatorInterface";
import HostValidator from "../../validator/HostValidator";
const pino = require('pino')();
const cheerio = require('cheerio');
const _ = require('underscore');
const fs = require('fs');
const glob = require("glob");
import yaml from 'js-yaml';
import {HostInterface, SelectorsConfigInterface, SlugsConfigInterface} from "./ConfigInterface";
import Slug from "../../Slug";
import ConfigInterface from "./ConfigInterface";
import Config from "./Config";

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
container.bind<SeriesServiceStrategyInterface>(CONSTANTS.JOJ_SERIES_STRATEGY).to(SeriesServiceStrategy);
container.bind<ArchiveServiceStrategyInterface>(CONSTANTS.JOJ_ARCHIVE_STRATEGY).to(ArchiveServiceStrategy);
container.bind<TVArchiveCompilerInterface>(CONSTANTS.JOJ_ARCHIVE_COMPILER).to(TVArchiveCompiler);
container.bind<Slug>(CONSTANTS.SLUGS).to(Slug);

const getConfig = (configYml: string|undefined) =>
    configYml ? Config.fromYml(yaml.safeLoad(fs.readFileSync(configYml))) : new Config();
const config: ConfigInterface = getConfig(process.env.STREAM_TV_APP_CONFIG);

container.bind<ConfigInterface>(CONSTANTS.CONFIG).toConstantValue(config);
container.bind<ValidatorInterface>(CONSTANTS.HOST_VALIDATOR).toConstantValue(
    new HostValidator((config.hosts).map((conf: HostInterface) => conf.name))
);
container.bind<SlugsConfigInterface>(CONSTANTS.SLUGS_CONFIG).toConstantValue(config.slugs);
container.bind<SelectorsConfigInterface>(CONSTANTS.SELECTORS_CONFIG).toConstantValue(config.selectors);

const filesystem = new FileSystem(fs, glob, container.get<LoggerInterface>(CONSTANTS.LOGGER));
container.bind<FileSystemInterface>(CONSTANTS.FILESYSTEM).toConstantValue(filesystem);

export default container;
