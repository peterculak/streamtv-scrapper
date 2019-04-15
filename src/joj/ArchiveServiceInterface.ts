interface ArchiveServiceInterface {
    cacheArchiveList(): Promise<any>;
    compileArchiveForProgram(url?: string): Promise<Array<any>>;
    compileArchive(): Promise<any>;
}

export default ArchiveServiceInterface;
