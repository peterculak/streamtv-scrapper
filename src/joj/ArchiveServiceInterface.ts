import EpisodeInterface from "./EpisodeInterface";

interface ArchiveServiceInterface {
    cacheArchiveList(): Promise<any>;
    compileArchiveForProgram(url?: string): Promise<EpisodeInterface[]>;
    compileArchive(): Promise<any>;
}

export default ArchiveServiceInterface;
