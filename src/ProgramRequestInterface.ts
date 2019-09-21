type Host = 'joj.sk' | 'plus.joj.sk' | 'wau.joj.sk';

interface ProgramRequestInterface {
    host: Host;
    fetch: boolean;
    compile: boolean;
    encrypt: boolean;
    concurrency: number;
    maxLoadMorePages: number;
    regexpPattern: string;
    programUrl: string;
    verbosity: number;
}

export default ProgramRequestInterface;
export {Host};