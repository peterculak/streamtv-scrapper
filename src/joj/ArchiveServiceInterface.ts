interface ArchiveServiceInterface {
    cacheArchiveList(): Promise<any>;
    compileArchiveForProgram(url?: string): Promise<any>;
}

export default ArchiveServiceInterface;
