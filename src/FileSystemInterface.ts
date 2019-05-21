interface FileSystemInterface {
    readFile(fileName: string): Promise<{content: string, name: string}>
    writeFile(dir: string, fileName: string, content: string): Promise<{ content: string, file: string }>

    /**
     * Perform a synchronous glob search.
     * @param pattern
     * @param options
     */
    sync(pattern: string, options?: {}): Array<string>;
}

export default FileSystemInterface;
