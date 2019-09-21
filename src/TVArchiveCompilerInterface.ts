import ProgramRequestInterface from "./ProgramRequestInterface";
import YamlProgramRequestInterface from "./YamlProgramRequestInterface";

interface TVArchiveCompilerInterface {
    process(request: ProgramRequestInterface): void;
    processYaml(request: YamlProgramRequestInterface): void;
}

export default TVArchiveCompilerInterface;
