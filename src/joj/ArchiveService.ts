import {injectable} from "inversify";
import "reflect-metadata";

const fetch = require('node-fetch');
import ArchiveServiceInterface from "./ArchiveServiceInterface";
import FileSystem from "../FileSystem";

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
}

export default ArchiveService;
