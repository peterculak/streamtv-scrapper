interface ArchiveServiceInterface {
    cacheArchiveList(): Promise<any>;
    compileArchiveForProgram(url?: string): Promise<Array<any>>;
    compileArchive(): void;
}

export default ArchiveServiceInterface;
