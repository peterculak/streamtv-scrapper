import EpisodeInterface from "./EpisodeInterface";

interface ArchiveServiceInterface {
    cacheArchiveList(): Promise<any>;
    compileArchiveForProgram(url?: string): Promise<EpisodeInterface[]>;
    compileArchive(): Promise<Array<EpisodeInterface[]>>;
    compileArchiveForProgramRegex(pattern: string): Promise<Array<EpisodeInterface[]>>;
}

export default ArchiveServiceInterface;
