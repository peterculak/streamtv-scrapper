import ActionInterface from "./ActionInterface";
import InvalidAction from "./InvalidAction";

class Action implements ActionInterface {
    constructor(
        private readonly _fetch: boolean,
        private readonly _compile: boolean,
        private readonly _encrypt: boolean = false
    ) {
        if (!_fetch && !_compile && !_encrypt) {
            throw InvalidAction.empty();
        }
    }

    get fetch(): boolean {
        return this._fetch;
    }

    get compile(): boolean {
        return this._compile;
    }

    get encrypt(): boolean {
        return this._encrypt;
    }
}

export default Action;