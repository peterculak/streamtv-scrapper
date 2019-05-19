interface FileSystemInterface {
    readFile(fileName: string): Promise<{content: string, name: string}>
    writeFile(dir: string, fileName: string, content: string): Promise<{ content: string, file: string }>
}

export default FileSystemInterface;
