import ProgramRequestInterface from "./ProgramRequestInterface";
import ActionInterface from "./ActionInterface";
import Host from "./Host";

class ProgramRequest implements ProgramRequestInterface {

    private UNLIMITED_CONCURRENCY = 0;
    private UNLIMITED_LOAD_MORE_PAGES = 0;

    constructor(
        private readonly _host: Host,
        private readonly _action: ActionInterface,
        private readonly _url?: string,
        private readonly _regexp?: string,
        private readonly _maxLoadMorePages?: number,
        private readonly _concurrency?: number
    ) {}

    get host(): Host {
        return this._host;
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

export default ProgramRequest;