interface ProgramRequestInterface {
    hostname: string;
    url: string;
    fetch: boolean;
    compile: boolean;
    encrypt: boolean;
    concurrency: number;
    maxLoadMorePages: number;
    regexp: string;
}

export default ProgramRequestInterface;
