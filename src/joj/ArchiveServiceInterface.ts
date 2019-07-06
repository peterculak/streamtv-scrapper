import EpisodeInterface from "./EpisodeInterface";
import {ArchiveIndexInterface} from "./ArchiveIndexInterface";

enum Host {
    Joj = 'joj.sk',
    Plus = 'plus.joj.sk',
}

interface ArchiveServiceInterface {
    cacheArchiveList(host: string): Promise<ArchiveIndexInterface>;
    compileArchiveForProgram(host: string, url?: string): Promise<EpisodeInterface[]>;
    compileArchive(host: string): Promise<Array<EpisodeInterface[]>>;
    compileArchiveForProgramRegex(host: string, pattern: string): Promise<Array<EpisodeInterface[]>>;
    encryptArchive(host: Host, password: string): void;
}

export default ArchiveServiceInterface;
