interface ArchiveServiceInterface {
    cacheArchiveList(): Promise<any>;
    compileArchiveForProgram(url?: string): Promise<any>;
    compileArchive(): Promise<Array<any>>;
}

export default ArchiveServiceInterface;
