import ArchiveServiceInterface from "./ArchiveServiceInterface";

interface ArchiveServiceStrategyInterface {
    fetchService(programUrl: string): ArchiveServiceInterface,
}

export default ArchiveServiceStrategyInterface;
