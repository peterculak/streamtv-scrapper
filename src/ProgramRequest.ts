import ProgramRequestInterface, {Host} from "./ProgramRequestInterface";

class ProgramRequest implements ProgramRequestInterface {
    constructor(
        public readonly host: Host,
        public readonly fetch: boolean,
        public readonly encrypt: boolean,
        public readonly compile: boolean,
        public readonly maxLoadMorePages: number,
        public readonly programUrl: string,
        public readonly regexpPattern: string,
        public readonly verbosity: number,
        public readonly concurrency: number
    ) {
        this.host = host.replace('www.', '') as Host;
        if (this.host !== 'joj.sk' && this.host !== 'plus.joj.sk' && this.host !== 'wau.joj.sk') {
            throw new Error('Invalid host');
        }
    }
}

export default ProgramRequest;