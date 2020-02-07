import {inject, injectable} from "inversify";
import "reflect-metadata";
import EpisodeInterface from "./entity/EpisodeInterface";
import FileInterface from "../FileInterface";
import CONSTANTS from "../app/config/constants";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import LoggerInterface from "../LoggerInterface";
import FileSystemInterface from "../FileSystemInterface";
import EpisodeFactoryInterface from "./EpisodeFactoryInterface";
import {Episode} from "./entity/Episode";

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

                let meta = {} as any;
                try {
                    meta = this.extractor.episodeSchemaOrgMeta(file.content);
                } catch (error) {
                    //cached file is not schema org
                }

                if (!meta.dateAdded) {
                    meta.dateAdded = meta.datePublished;
                }

                if (!meta.dateAdded && meta.video) {
                    meta.dateAdded = meta.video.uploadDate;
                }

                if (!meta.dateAdded) {
                    meta.dateAdded = this.extractor.extractDateAdded(file.content);
                }

                if (!meta.partOfSeason) {
                    const bits = fullPath.split('/');
                    meta.partOfSeason = {
                        name: bits[6]
                    };
                    meta.partOfTVSeries = {name: 'Správy', type: 'News'};
                }

                if (!meta.description && meta.video) {
                    meta.description = meta.video.description;
                }

                if (!meta.description && meta.partOfTVSeries) {
                    meta.description = meta.partOfTVSeries.description;
                }

                if (meta.image && meta.image[0]) {
                    meta.image = meta.image[0].url;
                }

                if (!meta.image && meta.video) {
                    meta.image = meta.video.thumbnailUrl;
                }

                if (!meta.image) {
                    meta.image = meta.thumbnailUrl;
                }

                return new Episode(
                    meta['@type'],
                    meta.dateAdded,
                    meta.description,
                    meta.episodeNumber,
                    meta.image,
                    [], //at this point it's not available, it's decorated in next step
                    meta.name ? meta.name : meta.headline,
                    meta.partOfSeason,
                    meta.partOfTVSeries,
                    meta.video && meta.video.duration ? meta.video.duration : meta.timeRequired,
                    meta.url
                );
            })
            .then((meta: EpisodeInterface) => {
                const seriesPath = fullPath.substr(0, fullPath.lastIndexOf('/'));
                const bits = fullPath.split('/');
                const episodeFileName = bits[bits.length - 1];

                const iframeFileSource = `${seriesPath}/iframes/${episodeFileName}`;

                this.logger.debug(`Iframe file ${iframeFileSource}`);

                return this.filesystem.readFile(`${seriesPath}/iframes/${episodeFileName}`)
                    .then((iframeFile: FileInterface) => {

                        const mp4 = this.extractor.episodeMp4Urls(iframeFile.content);

                        if (!mp4.length) {//possibly other format
                            throw new Error(`Mp4 urls not found in ${iframeFileSource}`);
                        }

                        return new Episode(
                            meta.type,
                            meta.dateAdded,
                            meta.description,
                            meta.episodeNumber,
                            meta.image,
                            mp4,
                            meta.name,
                            meta.partOfSeason,
                            meta.partOfTVSeries,
                            meta.timeRequired,
                            meta.url
                        );
                    });
            })
            .catch((error) => {
                throw (`${error} in ${fullPath}`);
            })
    }
}

export default EpisodeFactory;
