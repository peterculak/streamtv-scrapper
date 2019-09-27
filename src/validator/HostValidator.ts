import {inject, injectable} from "inversify";
import "reflect-metadata";
import ValidatorInterface from "./ValidatorInterface";
import HostValidationException from "./HostValidationException";

@injectable()
class HostValidator implements ValidatorInterface {

    constructor(private readonly hostnames: Array<string>) {}

    validate(hostname: any, context?: any): void {
        if (!this.hostnames.includes(hostname)) {
            throw HostValidationException.invalidHost(hostname);
        }
    }
}

export default HostValidator;
