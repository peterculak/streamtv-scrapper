import {inject, injectable} from "inversify";
import "reflect-metadata";
import FileSystemInterface from "./FileSystemInterface";
import CONSTANTS from "./app/config/constants";
import LoggerInterface from "./LoggerInterface";

@injectable()
class FileSystem implements FileSystemInterface {
    constructor(
        private fs: any,//todo interface
        private glob: any,//todo interface
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
    ) {
    }

    readFile(filename: string): Promise<{content: string, name: string}> {
        if (!this.fs.existsSync(filename)) {
            throw new Error(`File ${filename} does not exist`);
        }

        const buffer = this.fs.readFileSync(filename, "utf8");
        return new Promise((resolve) => resolve({content: buffer, name: filename}));
    }

    writeFile(dir: string, filename: string, content: string): Promise<{ content: string, file: string }> {
        if (!this.fs.existsSync(dir)) {
            this.fs.mkdirSync(dir, {recursive: true});
        }

        const cacheFile = `${dir}/${filename}`;
        this.fs.writeFileSync(cacheFile, content);//todo error handling

        return new Promise((resolve) => {
            this.logger.debug(`File saved at ${cacheFile}`);
            resolve({ content: content, file: cacheFile });
        });
    }

    sync(pattern: string, options?: {}): string[] {
        return this.glob.sync(pattern, options);
    }
}

export default FileSystem;
