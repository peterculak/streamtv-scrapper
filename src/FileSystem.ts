import {injectable} from "inversify";
import "reflect-metadata";
import FileSystemInterface from "./FileSystemInterface";

const fs = require('fs');
const chalk = require('chalk');

@injectable()
class FileSystem implements FileSystemInterface {
    static readFile(fileName: string): Promise<{content: string, name: string}> {
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

    static writeFile(dir: string, fileName: string, content: string): Promise<{ content: string, file: string }> {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {recursive: true});
        }

        const cacheFile = `${dir}/${fileName}`;
        return new Promise((resolve, reject) => {
            fs.writeFile(cacheFile, content, (err: Error) => {
                if (err) {
                    console.log(chalk.red('Could not write file'));
                    reject();
                } else {
                    console.log(chalk.green(
                        `File saved at ${cacheFile}`
                    ));
                    resolve({ content: content, file: cacheFile });
                }
            });
        });
    }

}

export default FileSystem;
