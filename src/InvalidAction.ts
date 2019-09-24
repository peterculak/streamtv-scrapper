class InvalidAction extends Error {
    static empty(): InvalidAction {
        return new this(`No action selected`);
    };
}

export default InvalidAction;
