import ProgramRequestInterface from "./ProgramRequestInterface";

interface TVArchiveCompilerInterface {
    process(request: ProgramRequestInterface): void;
}

export default TVArchiveCompilerInterface;
