import "reflect-metadata";
import CONSTANTS from "./app/config/constants";
import container from "./app/config/container";
import ValidatorInterface from "./validator/ValidatorInterface";
import {HostInterface} from "./app/config/ConfigInterface";
const hostValidator = container.get<ValidatorInterface>(CONSTANTS.HOST_VALIDATOR);

class Host implements HostInterface {
    constructor(
        private readonly _name: string,
        private readonly _image?: string,
        private readonly validator: ValidatorInterface = hostValidator
    ) {
        validator.validate(_name);
    }

    static fromConfig(config: HostInterface): Host {
        return new this(config.name, config.image || '');
    }

    get name(): string {
        return this._name;
    }

    get image(): string {
        return this._image || '';
    }

    get archiveUrl(): string {
        return `https://${this._name}/archiv`;
    }
}

export default Host;
