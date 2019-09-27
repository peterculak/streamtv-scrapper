import ValidationException from "./ValidationException";

class HostValidationException extends ValidationException {
    static invalidHost(hostname: string): HostValidationException {
        return new this(
            `Invalid hostname ${hostname}`
        );
    }
}

export default HostValidationException;
