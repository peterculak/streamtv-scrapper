class RetryLimitReached extends Error {
    static withTriesAndUrl(tries: number, url: string): RetryLimitReached {
        return new this(`Retry limit of ${tries} reached for url ${url}`);
    };
}

export default RetryLimitReached;
