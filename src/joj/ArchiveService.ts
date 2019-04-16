import {inject, injectable} from "inversify";
import "reflect-metadata";

const glob = require("glob");
const fetch = require('node-fetch');
const _ = require('underscore');
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import FileSystem from "../FileSystem";
import Extractor from "./Extractor";
import chalk from "chalk";
import ExtractorServiceInterface from "./ExtractorServiceInterface";
import CONSTANTS from "../app/config/constants";

@injectable()
class ArchiveService implements ArchiveServiceInterface {
    private readonly channelUrl: string = 'https://www.joj.sk';
    private readonly archiveUrl: string = `${this.channelUrl}/archiv`;
    private readonly cacheDir: string = './var/cache/joj.sk';

    constructor(@inject(CONSTANTS.JOJ_EXTRACTOR) private extractor: ExtractorServiceInterface) {
    }

    cacheArchiveList(): Promise<any> {
        console.log(`Fetching ${this.archiveUrl}`);
        return fetch(this.archiveUrl)
            .then((r: any) => r.text())
            .then((body: string) => FileSystem.writeFile(this.cacheDir, 'archiv.html', body));
    }

    compileArchiveForProgram(url: string): Promise<Array<any>> {
        console.log(`Compiling json for ${url}`);
        const bits = url.split('/');
        let slug = bits.pop();
        if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii') {
            slug = bits.pop();
        }
        if (!slug) {
            throw Error('Can not determine program name from url');
        }

        return this.compileArchiveForSlug(slug);
    }

    compileArchive(): Promise<any> {
        const directories = glob.sync(`${this.cacheDir}/*/`);
        console.log(`Found ${directories.length} cached program folders`);

        return directories.map((directory: string) => {
            const bits = directory.split('/');
            let slug = bits[bits.length - 2];
            if (slug === 'archiv' || slug === 'o-sutazi' || slug === 'o-relacii') {
                slug = bits[bits.length - 3];
            }
            if (!slug) {
                throw Error('Can not determine program name from url');
            }
            return slug;
        }).reduce((promiseChain: any, currentTask: any) => {
            return promiseChain.then((chainResults: any) => {
                return this.compileArchiveForProgram(currentTask).then((currentResult: any) => [...chainResults, currentResult]);
            });
        }, Promise.resolve([]));
    }

    private compileArchiveForSlug(slug: string): Promise<any> {
        const seriesDir = `${this.cacheDir}/${slug}/series`;
        const jsonDir = `${this.cacheDir}/${slug}`;
        console.log(chalk.gray(`Series dir ${seriesDir}`));
        const files = glob.sync("**(!iframes)/*.html", {cwd: seriesDir});

        return Promise.all(files.map((file: string) => this.episodeMetaData(`${seriesDir}/${file}`)))
            .then((archive: Array<any>) =>
                FileSystem.writeFile(
                    jsonDir,
                    `${slug}.json`,
                    JSON.stringify(this.groupEpisodesBySeason(archive))
                )
            );
    }

    private episodeMetaData(file: string): Promise<Array<{}>> {
        // console.log(chalk.gray(`Episode meta data file ${file}`));

        return FileSystem.readFile(file)
            .then((file: { content: string, name: string }) => this.extractor.episodeSchemaOrgMeta(file.content))
            .then((meta: any) => {
                const seriesPath = file.substr(0, file.lastIndexOf('/'));
                const bits = file.split('/');
                const serieFileName = bits[bits.length - 1];
                const iframeFileSource = `${seriesPath}/iframes/${serieFileName}`;

                // console.log(chalk.grey(`Iframe file ${iframeFile}`));
                return FileSystem.readFile(`${seriesPath}/iframes/${serieFileName}`)
                    .then((iframeFile: { content: string, name: string }) => {
                        meta.mp4 = this.extractor.episodeMp4Urls(iframeFile.content);

                        if (!meta.mp4.length) {//possibly other format
                            console.log(chalk.red(`Mp4 urls not found in ${iframeFileSource}`));
                        }
                        return meta;
                    });
            })
            ;
    }

    private groupEpisodesBySeason(archive: Array<any>): Array<any> {
        return _.groupBy(archive, (item: { partOfSeason: { seasonNumber: number } }) => item.partOfSeason.seasonNumber);
    }
}

export default ArchiveService;
