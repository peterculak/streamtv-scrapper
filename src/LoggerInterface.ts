interface LogFn {
    (msg: string, ...args: any[]): void;
    (obj: object, msg?: string, ...args: any[]): void;
}

interface LoggerInterface {
    fatal: LogFn;

    error: LogFn;

    warn: LogFn;

    info: LogFn;

    debug: LogFn;

    trace: LogFn;
}

export default LoggerInterface;
