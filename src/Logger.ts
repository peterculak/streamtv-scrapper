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

    fatal(message: any) {
        this.pino.fatal(message);
    }

    error(message: any) {
        this.pino.error(message)
    }

    warn(message: any) {
        this.pino.warn(message);
    }

    info(message: any) {
        this.pino.info(message);
    }

    debug(message: any) {
        this.pino.debug(message);
    }

    trace(message: any) {
        this.pino.trace(message);
    }

    set level(level: "fatal" | "error" | "warn" | "info" | "debug" | "trace" | "silent" | string) {
        this.pino.level = level;
    }
}

export default Logger;
