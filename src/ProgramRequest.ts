import ProgramRequestInterface from "./ProgramRequestInterface";
import ActionInterface from "./ActionInterface";

class ProgramRequest implements ProgramRequestInterface {

    private UNLIMITED_CONCURRENCY = 0;
    private UNLIMITED_LOAD_MORE_PAGES = 0;

    constructor(
        private readonly _host: string,
        private readonly _action: ActionInterface,
        private readonly _programUrl?: string,
        private readonly _regexpPattern?: string,
        private readonly _maxLoadMorePages?: number,
        private readonly _concurrency?: number
    ) {
        this._host = _host.replace('www.', '');
        if (this._host !== 'joj.sk' && this._host !== 'plus.joj.sk' && this._host !== 'wau.joj.sk') {
            throw new Error('Invalid host');
        }
    }

    get host(): string {
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

    get programUrl(): string {
        return this._programUrl !== undefined ? this._programUrl : '';
    }

    get regexpPattern(): string {
        return this._regexpPattern !== undefined ? this._regexpPattern : '';
    }

    get maxLoadMorePages(): number {
        return this._maxLoadMorePages !== undefined ? this._maxLoadMorePages : this.UNLIMITED_LOAD_MORE_PAGES;
    }

    get concurrency(): number {
        return this._concurrency !== undefined ? this._concurrency : this.UNLIMITED_CONCURRENCY;
    }
}

export default ProgramRequest;