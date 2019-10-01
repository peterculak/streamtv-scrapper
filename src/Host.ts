import "reflect-metadata";
import CONSTANTS from "./app/config/constants";
import container from "./app/config/ioc_config";
import ValidatorInterface from "./validator/ValidatorInterface";
const hostValidator = container.get<ValidatorInterface>(CONSTANTS.HOST_VALIDATOR);

class Host {
    constructor(
        public readonly name: string,
        private readonly validator: ValidatorInterface = hostValidator
    ) {
        name.replace('www.', '');
        validator.validate(name);
    }

    static fromString(url: string): Host {
        return new this(url);
    }
}

export default Host;