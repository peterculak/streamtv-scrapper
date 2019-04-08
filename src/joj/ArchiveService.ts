import {injectable} from "inversify";
import "reflect-metadata";

const fetch = require('node-fetch');
const fs = require('fs');
import ArchiveServiceInterface from "./ArchiveServiceInterface";

@injectable()
class ArchiveService implements ArchiveServiceInterface {
    private readonly channelUrl: string = 'https://www.joj.sk';
    private readonly archiveUrl: string = `${this.channelUrl}/archiv`;
    private readonly cacheDir: string = './var/cache/joj.sk';
    private readonly cacheHtmlFile: string = `${this.cacheDir}/archiv.html`;

    cacheArchiveList(): Promise<any> {
        console.log(`Fetching ${this.archiveUrl}`);
        return fetch(this.archiveUrl)
            .then((r: any) => r.text())
            .then((body: string) => this.saveArchiveHtmlBody(body));

    }

    private saveArchiveHtmlBody(content: string): Promise<any> {
        if (!fs.existsSync(this.cacheDir)) {
            fs.mkdirSync(this.cacheDir, { recursive: true });
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(this.cacheHtmlFile, content, (err: Error) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(`File written at ${this.cacheHtmlFile}`);
                }
            });
        });
    }
}

export default ArchiveService;
