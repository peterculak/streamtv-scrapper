import "reflect-metadata";
import CONSTANTS from "./app/config/constants";
import {container} from "./app/config/ioc_config";
import ValidatorInterface from "./validator/ValidatorInterface";
const validator = container.get<ValidatorInterface>(CONSTANTS.HOST_VALIDATOR);

class Host {
    constructor(
        public readonly name: string,
        private readonly _validator: ValidatorInterface = validator
    ) {
        _validator.validate(name);
    }

    static fromString(url: string): Host {
        return new this(
            url.replace('www.', '')
        );
    }
}

export default Host;