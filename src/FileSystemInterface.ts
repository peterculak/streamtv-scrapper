import FileInterface from "./FileInterface";

interface FileSystemInterface {
    /**
     * Check whether file or directory exists
     * @param fullPath
     */
    existsSync(fullPath: string): boolean;
    readFile(fileName: string): Promise<FileInterface>
    readFileSync(fileName: string): FileInterface;
    writeFile(dir: string, fileName: string, content: string): Promise<FileInterface>

    /**
     * Perform a synchronous glob search.
     * @param pattern
     * @param options
     */
    sync(pattern: string, options?: {}): Array<string>;
}

export default FileSystemInterface;
