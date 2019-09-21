import EpisodeInterface from "./EpisodeInterface";
import {ArchiveIndexInterface} from "./ArchiveIndexInterface";
import {Host} from "../ProgramRequestInterface";

interface ArchiveServiceInterface {
    cacheArchiveList(host: Host): Promise<ArchiveIndexInterface>;
    compileArchiveForProgram(host: Host, url?: string): Promise<EpisodeInterface[]>;
    compileArchive(host: Host): Promise<Array<EpisodeInterface[]>>;
    compileArchiveForProgramRegex(host: string, pattern: string): Promise<Array<EpisodeInterface[]>>;
    encryptArchive(host: Host, password: string): void;
}

export default ArchiveServiceInterface;
