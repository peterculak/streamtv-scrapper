import {injectable} from "inversify";
import "reflect-metadata";

const glob = require("glob");
const fetch = require('node-fetch');
const _ = require('underscore');
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import FileSystem from "../FileSystem";
import Extractor from "./Extractor";

@injectable()
class ArchiveService implements ArchiveServiceInterface {
    private readonly channelUrl: string = 'https://www.joj.sk';
    private readonly archiveUrl: string = `${this.channelUrl}/archiv`;
    private readonly cacheDir: string = './var/cache/joj.sk';

    cacheArchiveList(): Promise<any> {
        console.log(`Fetching ${this.archiveUrl}`);
        return fetch(this.archiveUrl)
            .then((r: any) => r.text())
            .then((body: string) => FileSystem.writeFile(this.cacheDir, 'archiv.html', body));
    }

    compileArchiveForProgram(url?: string): Promise<Object> {
        if (url) {
            console.log(`Compiling json for ${url}`);
            const bits = url.split('/');
            let slug = bits.pop();
            if (slug === 'archiv') {
                slug = bits.pop();
            }
            if (!slug) {
                throw Error('Can not determine program name from url');
            }

            const seriesDir = `./var/cache/joj.sk/${slug}/series`;
            const jsonDir = `./var/cache/joj.sk/${slug}`;
            console.log(`Series dir ${seriesDir}`);
            const files = glob.sync("**(!iframes)/*.html", {cwd: seriesDir});

            return Promise.all(files.map((file: string) => this.episodeMetaData(`${seriesDir}/${file}`)))
                .then((archive: Array<any>) => this.groupEpisodesBySeason(archive))
                .then((archive: Array<any>) => {
                    FileSystem.writeFile(jsonDir, `${slug}.json`, JSON.stringify(archive)).then(() => console.log(`Archive compiled in ${jsonDir}/${slug}.json`));
                    return new Promise(resolve => resolve(archive));
                });
        }

        return new Promise(resolve => resolve({}));
    }

    private episodeMetaData(file: string): Promise<Array<{}>> {
        // console.log(chalk.gray(`Episode meta data file ${file}`));

        return FileSystem.readFile(file)
            .then((file: {content: string, name: string}) => Extractor.episodeSchemaOrgMeta(file.content))
            .then((meta: any) => {
                const seriesPath = file.substr(0, file.lastIndexOf('/'));
                const bits = file.split('/');
                const serieFileName = bits[bits.length -1];
                const iframeFile = `${seriesPath}/iframes/${serieFileName}`;

                // console.log(chalk.grey(`Iframe file ${iframeFile}`));
                return FileSystem.readFile(`${seriesPath}/iframes/${serieFileName}`).then((iframeFile: {content: string, name: string}) => {
                    meta.mp4 = Extractor.episodeMp4Urls(iframeFile.content);

                    if (!meta.mp4) {
                        throw new Error(`Mp4 urls not found in ${iframeFile}`);
                    }
                    return meta;
                });
            })
            ;
    }

    private groupEpisodesBySeason(archive: Array<any>): Array<any> {
        return _.groupBy(archive, (item: any) => item.partOfSeason.seasonNumber);
    }
}

export default ArchiveService;
