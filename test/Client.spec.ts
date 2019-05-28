import ClientInterface from "../src/ClientInterface";

const fetch = require('jest-fetch-mock');
import "reflect-metadata";
import { decorate, injectable } from "inversify";
import {container} from "../src/app/config/ioc_config";
import CONSTANTS from "../src/app/config/constants";
import LoggerInterface from "../src/LoggerInterface";
const mockLogger = () => {};//todo possibly store in __mocks__
mockLogger.fatal = jest.fn();
mockLogger.error = jest.fn();
mockLogger.warn = jest.fn();
mockLogger.info = jest.fn();
mockLogger.debug = jest.fn();
mockLogger.trace = jest.fn();

decorate(injectable(), mockLogger);
container
    .rebind<LoggerInterface>(CONSTANTS.LOGGER)
    .toConstantValue(mockLogger);

let client: ClientInterface;
beforeEach(() => {
    client = container.get<ClientInterface>(CONSTANTS.CLIENT);
    fetch.resetMocks();
});

describe('Client with retry', () => {
    test('fetch returns success response on 1st try', (done) => {
        fetch.once('<html><body>ok</body></html>');

        client.fetch('/test').then((r: any) => r.text()).then((body: string) => {
            expect(fetch.mock.calls.length).toEqual(1);
            expect(body).toEqual('<html><body>ok</body></html>');
            done();
        });
    });

    test('fetch gets success response on 2nd try', (done) => {
        fetch
            .mockRejectOnce('something went wrong')
            .once('<html><body>ok</body></html>')
        ;

        client.fetch('/test').then((r: any) => r.text()).then((body: string) => {
            expect(fetch.mock.calls.length).toEqual(2);
            expect(body).toEqual('<html><body>ok</body></html>');
            done();
        });
    });

    test('fetch retries max number of times and then fails', (done) => {
        fetch.mockRejectOnce('something went wrong');

        client.fetch('/test').catch((error: Error) => {
            expect(fetch.mock.calls.length).toEqual(3);
            expect(error).toBeInstanceOf(Error);
            done();
        });
    });

    test('fetch fails max number of tries and throws error', (done) => {
        fetch
            .once('<html><body>Server Error</body></html>')
            .once('<html><body>502 Bad Gateway</body></html>')
            .once('<html><body>video už nie je možné prehrať</body></html>')
        ;

        client.fetch('/test').catch((error: Error) => {
            expect(fetch.mock.calls.length).toEqual(3);
            expect(error).toBeInstanceOf(Error);
            done();
        });
    });
});
