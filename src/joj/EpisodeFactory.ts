import {inject, injectable} from "inversify";
import "reflect-metadata";
import EpisodeInterface from "./EpisodeInterface";
import FileInterface from "../FileInterface";
import CONSTANTS from "../app/config/constants";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import LoggerInterface from "../LoggerInterface";
import FileSystemInterface from "../FileSystemInterface";
import EpisodeFactoryInterface from "./EpisodeFactoryInterface";

@injectable()
class EpisodeFactory implements EpisodeFactoryInterface {
    constructor(
        @inject(CONSTANTS.FILESYSTEM) private filesystem: FileSystemInterface,
        @inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface,
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
    ) {}

    //todo custom exceptions
    fromCache(fullPath: string): Promise<EpisodeInterface> {
        return this.filesystem.readFile(fullPath)
            .then((file: FileInterface) => {
                if (!file.content) {
                    throw new Error(`Episode file ${file.fullPath} was empty`);
                }

                let meta = {} as EpisodeInterface;
                try {
                    meta = this.extractor.episodeSchemaOrgMeta(file.content);
                } catch (error) {
                    //cached file is not schema org
                }

                if (!Object.keys(meta).length) {
                    meta = this.extractor.episodeOgMeta(file.content);
                    const bits = fullPath.split('/');
                    meta.partOfSeason.name = bits[6];
                    meta.partOfTVSeries = {name: 'Správy', "@type": "News"};
                }

                const dateAdded = this.extractor.extractDateAdded(file.content);
                if (!meta.dateAdded && dateAdded) {
                    meta.dateAdded = dateAdded;
                }

                return meta;
            })
            .then((meta: EpisodeInterface) => {
                const seriesPath = fullPath.substr(0, fullPath.lastIndexOf('/'));
                const bits = fullPath.split('/');
                const episodeFileName = bits[bits.length - 1];

                const iframeFileSource = `${seriesPath}/iframes/${episodeFileName}`;

                this.logger.debug(`Iframe file ${iframeFileSource}`);

                return this.filesystem.readFile(`${seriesPath}/iframes/${episodeFileName}`)
                    .then((iframeFile: FileInterface) => {
                        meta.mp4 = this.extractor.episodeMp4Urls(iframeFile.content);

                        if (!meta.mp4.length) {//possibly other format
                            throw new Error(`Mp4 urls not found in ${iframeFileSource}`);
                        }
                        return meta;
                    });
            })
    }
}

export default EpisodeFactory;
