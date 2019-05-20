import {inject, injectable} from "inversify";
import "reflect-metadata";
import CONSTANTS from "./app/config/constants";
import * as Pino from "pino";
import LoggerInterface from "./LoggerInterface";

@injectable()
class Logger implements LoggerInterface {
    constructor(
        @inject(CONSTANTS.PINO_LOGGER) private pino: Pino.Logger,
    ) {
    }

    debug(message: any) {
        this.pino.debug(message);
    }

    error(message: any) {
        this.pino.error(message)
    }

    fatal(message: any) {
        this.pino.fatal(message);
    }

    info(message: any) {
        this.pino.info(message);
    }

    trace(message: any) {
        this.pino.trace(message);
    }

    warn(message: any) {
        this.pino.warn(message);
    }
}

export default Logger;
