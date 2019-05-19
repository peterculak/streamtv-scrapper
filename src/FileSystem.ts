import {inject, injectable} from "inversify";
import "reflect-metadata";
import FileSystemInterface from "./FileSystemInterface";
import CONSTANTS from "./app/config/constants";
import * as Pino from "pino";

const fs = require('fs');

@injectable()
class FileSystem implements FileSystemInterface {
    constructor(
        @inject(CONSTANTS.PINO_LOGGER) private logger: Pino.Logger,
    ) {
    }

    readFile(fileName: string): Promise<{content: string, name: string}> {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, (err: Error, data: Object) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({content: data.toString(), name: fileName});
                }
            })
        });
    }

    writeFile(dir: string, fileName: string, content: string): Promise<{ content: string, file: string }> {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        const cacheFile = `${dir}/${fileName}`;
        return new Promise((resolve, reject) => {
            fs.writeFile(cacheFile, content, (error: Error) => {
                if (error) {
                    this.logger.error(error);
                    reject();
                } else {
                    this.logger.debug(`File saved at ${cacheFile}`);
                    resolve({ content: content, file: cacheFile });
                }
            });
        });
    }

}

export default FileSystem;
