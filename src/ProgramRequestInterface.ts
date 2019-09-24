interface ProgramRequestInterface {
    host: string;
    fetch: boolean;
    compile: boolean;
    encrypt: boolean;
    concurrency: number;
    maxLoadMorePages: number;
    regexpPattern: string;
    programUrl: string;
}

export default ProgramRequestInterface;
