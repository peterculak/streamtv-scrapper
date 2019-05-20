import {inject, injectable} from "inversify";
import "reflect-metadata";
import ClientInterface from "./ClientInterface";
import CONSTANTS from "./app/config/constants";
import LoggerInterface from "./LoggerInterface";
const fetch = require('node-fetch');

@injectable()
class Client implements ClientInterface {

    private retry: number = 3;

    constructor(@inject(CONSTANTS.LOGGER) private logger: LoggerInterface) {
    }

    async fetch(url: string, options?: any): Promise<any> {
        this.logger.info(`Fetching ${url}`);

        let retry = options && options.retry || this.retry;
        let response: Response = new fetch.Response();
        let body: string = '';

        while (retry > 0) {
            try {
                body = await this.getData(url, options);
                if (body.match(/Server Error/gs) || body.match(/502 Bad Gateway/gs)) {
                    this.logger.warn(`Server error for ${url}`);
                    retry = retry - 1;
                    if (retry === 0) {
                        this.logger.error(`Retry limit of ${retry} reached for url ${url}`);
                        throw new Error(`Retry limit of ${retry} reached for url ${url}`);
                    }
                    this.logger.info(`Retry ${url}`);
                    body = await this.getData(url, options);
                } else {
                    break;
                }
            } catch(e) {
                retry = retry - 1;
                if (retry === 0) {
                    this.logger.error(`Retry limit of ${retry} reached for url ${url}`);
                    throw e
                }
            }
        }

        if (body.match(/Server Error/gs) || body.match(/502 Bad Gateway/gs)) {
            throw new Error(`Retry limit of ${retry} reached for url ${url}`);
        }

        const responseOptions = {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        };

        return new fetch.Response(body, responseOptions);
    }

    private getData(url: string, options?: any): Promise<string> {
        return fetch(url, options).then((r: Response) => r.text());
    }
}

export default Client;
