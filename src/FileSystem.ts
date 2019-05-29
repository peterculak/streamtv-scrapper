import {inject, injectable} from "inversify";
import "reflect-metadata";
import FileSystemInterface from "./FileSystemInterface";
import CONSTANTS from "./app/config/constants";
import LoggerInterface from "./LoggerInterface";
import FileInterface from "./FileInterface";

@injectable()
class FileSystem implements FileSystemInterface {
    constructor(
        private fs: any,//todo interface
        private glob: any,//todo interface
        @inject(CONSTANTS.LOGGER) private logger: LoggerInterface,
    ) {
    }

    readFile(fullPath: string): Promise<FileInterface> {
        if (!this.fs.existsSync(fullPath)) {
            throw new Error(`File ${fullPath} does not exist`);
        }

        const buffer = this.fs.readFileSync(fullPath, "utf8");

        const bits = fullPath.split('/');
        const filename = String(bits.pop());

        return new Promise((resolve) => resolve({content: buffer, name: filename, fullPath: fullPath}));
    }

    writeFile(dir: string, filename: string, content: string): Promise<FileInterface> {
        if (!this.fs.existsSync(dir)) {
            this.fs.mkdirSync(dir, {recursive: true});
        }

        const cacheFile = `${dir}/${filename}`;
        this.fs.writeFileSync(cacheFile, content);//todo error handling

        return new Promise((resolve) => {
            this.logger.debug(`File saved at ${cacheFile}`);
            resolve({ content: content, name: filename, fullPath: cacheFile });
        });
    }

    sync(pattern: string, options?: {}): string[] {
        return this.glob.sync(pattern, options);
    }
}

export default FileSystem;
