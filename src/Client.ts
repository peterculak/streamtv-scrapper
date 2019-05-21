import {inject, injectable} from "inversify";
import "reflect-metadata";
import ClientInterface from "./ClientInterface";
import CONSTANTS from "./app/config/constants";
import LoggerInterface from "./LoggerInterface";
import * as fetch from "node-fetch";

@injectable()
class Client implements ClientInterface {

    private maxTries: number = 3;

    constructor(@inject(CONSTANTS.LOGGER) private logger: LoggerInterface) {
    }

    async fetch(url: string, options?: any): Promise<any> {
        this.logger.info(`Fetching ${url}`);

        let currentTry = 0;
        let response: fetch.Response = new fetch.Response();
        let body: string = '';

        while (currentTry < this.maxTries) {
            currentTry++;
            try {
                response = await this.sendRequest(url, options);
                body = await response.text();
                if (this.isContentError(body)) {
                    this.logger.warn(`Server error for ${url}`);
                    if (currentTry >= this.maxTries) {
                        throw new Error(`Retry limit of ${this.maxTries} reached for url ${url}`);
                    }
                    this.logger.info(`Retry ${currentTry} ${url}`);
                } else {
                    break;
                }
            } catch(e) {
                if (currentTry >= this.maxTries) {
                    throw new Error(`Retry limit of ${this.maxTries} reached for url ${url}`);
                }
            }
        }

        return new fetch.Response(body, {
            url: response.url,
            status: response.status,
            statusText: response.statusText,
            headers: response.headers,
        });
    }

    private isContentError(body: string): boolean {
        return body !== ''
            && Boolean(body.match(/(Server Error|502 Bad Gateway|video už nie je možné prehrať)/gs));
    }

    private sendRequest(url: string, options?: any): Promise<fetch.Response> {
        return fetch.default(url, options);
    }
}

export default Client;
