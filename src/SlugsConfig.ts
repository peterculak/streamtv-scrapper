import {inject, injectable} from "inversify";
import "reflect-metadata";
import SlugsConfigInterface, {ExcludedSlugs, MappedSlugs} from "./SlugsConfigInterface";

@injectable()
class SlugsConfig implements SlugsConfigInterface {
    constructor(
        private readonly _excluded?: ExcludedSlugs,
        private readonly _mapped?: MappedSlugs
    ) {}


    get excluded(): ExcludedSlugs {
        return this._excluded || [];
    }

    get mapped(): MappedSlugs {
        return this._mapped || [];
    }
}

export default SlugsConfig;
