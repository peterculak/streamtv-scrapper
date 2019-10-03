import ProgramRequestInterface from "../ProgramRequestInterface";
import ActionInterface from "../ActionInterface";
import Host from "../Host";

class Request implements ProgramRequestInterface {

    protected readonly UNLIMITED_CONCURRENCY = 0;
    protected readonly UNLIMITED_LOAD_MORE_PAGES = 0;

    constructor(
        protected readonly _action: ActionInterface,
        protected readonly _url?: string,
        protected readonly _host?: Host,
        protected readonly _regexp?: string,
        protected readonly _maxLoadMorePages?: number,
        protected readonly _concurrency?: number
    ) {
        if (!_host && !_url) {
            throw new Error('No host and no url');
        }

        const hostnameFromUrl = (url: string) => {
            const r = url.match(/http[s]?:\/\/(.*?)\//);
            return r ? r[1] : '';
        };

        if (!this._host && this._url) {
            this._host = new Host(hostnameFromUrl(this._url));
        }
    }

    get host(): Host {
        return this._host!;
    }

    get fetch(): boolean {
        return this._action.fetch;
    }

    get compile(): boolean {
        return this._action.compile;
    }

    get encrypt(): boolean {
        return this._action.encrypt;
    }

    get url(): string {
        return this._url !== undefined ? this._url : '';
    }

    get regexp(): string {
        return this._regexp !== undefined ? this._regexp : '';
    }

    get maxLoadMorePages(): number {
        return this._maxLoadMorePages !== undefined ? this._maxLoadMorePages : this.UNLIMITED_LOAD_MORE_PAGES;
    }

    get concurrency(): number {
        return this._concurrency !== undefined ? this._concurrency : this.UNLIMITED_CONCURRENCY;
    }
}

export default Request;