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

const inversify = require("inversify");
// const fetch = require('node-fetch');

let container = new Container();
container.bind<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE).to(ArchiveService);
container.bind<EpisodesServiceInterface>(CONSTANTS.JOJ_EPISODES).to(EpisodesService);
container.bind<SeriesServiceInterface>(CONSTANTS.JOJ_SERIES).to(SeriesService);
container.bind<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR).to(Extractor);
// inversify.decorate(inversify.injectable(), fetch);
// container.bind(CONSTANTS.FETCH).to(fetch);


export { container };
