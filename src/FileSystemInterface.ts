import FileInterface from "./FileInterface";

interface FileSystemInterface {
    readFile(fileName: string): Promise<FileInterface>
    writeFile(dir: string, fileName: string, content: string): Promise<FileInterface>

    /**
     * Perform a synchronous glob search.
     * @param pattern
     * @param options
     */
    sync(pattern: string, options?: {}): Array<string>;
}

export default FileSystemInterface;
