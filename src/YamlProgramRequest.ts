import YamlProgramRequestInterface from "./YamlProgramRequestInterface";

class YamlProgramRequest implements YamlProgramRequestInterface {

    constructor(private readonly yamlDefinition: any) {}

    get items(): Array<any> {
        return this.yamlDefinition.items;
    }
}

export default YamlProgramRequest;