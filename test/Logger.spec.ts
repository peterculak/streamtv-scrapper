import "reflect-metadata";
import { decorate, injectable } from "inversify";
import {container} from "../src/app/config/ioc_config";
import CONSTANTS from "../src/app/config/constants";
import LoggerInterface from "../src/LoggerInterface";
import * as Pino from "pino";

const mockPino = () => {};//todo possibly store in __mocks__
mockPino.fatal = jest.fn();
mockPino.error = jest.fn();
mockPino.warn = jest.fn();
mockPino.info = jest.fn();
mockPino.debug = jest.fn();
mockPino.trace = jest.fn();

decorate(injectable(), mockPino);
container
    .rebind<Pino.Logger>(CONSTANTS.PINO_LOGGER)
    .toConstantValue(mockPino as any);

let logger: LoggerInterface;
beforeEach(() => {
    logger = container.get<LoggerInterface>(CONSTANTS.LOGGER);
});

describe('Logger proxies calls to pino logger', () => {
    test('calls fatal', () => {
        logger.fatal('fatal message');
        expect(mockPino.fatal).toHaveBeenCalledTimes(1);
        expect(mockPino.fatal.mock.calls[0][0]).toEqual('fatal message');
    });

    test('calls error', () => {
        logger.error('error message');
        expect(mockPino.error).toHaveBeenCalledTimes(1);
        expect(mockPino.error.mock.calls[0][0]).toEqual('error message');
    });

    test('calls warn', () => {
        logger.warn('warning message');
        expect(mockPino.warn).toHaveBeenCalledTimes(1);
        expect(mockPino.warn.mock.calls[0][0]).toEqual('warning message');
    });

    test('calls info', () => {
        logger.info('info message');
        expect(mockPino.info).toHaveBeenCalledTimes(1);
        expect(mockPino.info.mock.calls[0][0]).toEqual('info message');
    });

    test('calls debug', () => {
        logger.debug('debug message');
        expect(mockPino.debug).toHaveBeenCalledTimes(1);
        expect(mockPino.debug.mock.calls[0][0]).toEqual('debug message');
    });

    test('calls trace', () => {
        logger.trace('trace message');
        expect(mockPino.trace).toHaveBeenCalledTimes(1);
        expect(mockPino.trace.mock.calls[0][0]).toEqual('trace message');
    });
});
