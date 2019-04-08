import "reflect-metadata";

import { Container } from "inversify";

import CONSTANTS from "./constants";
import ArchiveServiceInterface from "../../joj/ArchiveServiceInterface";
import ArchiveService from "../../joj/ArchiveService";
import ExtractorServiceInterface from "../../joj/ExtractorServiceInterface";
import Extractor from "../../joj/Extractor";
import EpizodesServiceInterface from "../../joj/EpizodesServiceInterface";
import EpizodesService from "../../joj/EpizodesService";

const inversify = require("inversify");
// const fetch = require('node-fetch');

let container = new Container();
container.bind<ArchiveServiceInterface>(CONSTANTS.JOJ_ARCHIVE).to(ArchiveService);
container.bind<EpizodesServiceInterface>(CONSTANTS.JOJ_EPIZODES).to(EpizodesService);
container.bind<ExtractorServiceInterface>(CONSTANTS.JOJ_EXTRACTOR).to(Extractor);
// inversify.decorate(inversify.injectable(), fetch);
// container.bind(CONSTANTS.FETCH).to(fetch);


export { container };
