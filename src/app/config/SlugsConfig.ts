import {inject, injectable} from "inversify";
import "reflect-metadata";
import {ExcludedSlugs, MappedSlugs, SlugsConfigInterface} from "./ConfigInterface";

@injectable()
class SlugsConfig implements SlugsConfigInterface {
    constructor(
        private readonly _excluded?: ExcludedSlugs,
        private readonly _mapped?: MappedSlugs,
    ) {}

    static fromYml(yml: SlugsConfigInterface): SlugsConfig {
        return new this(
            yml.excluded,
            yml.mapped,
        );
    }

    get excluded(): ExcludedSlugs {
        return this._excluded || [];
    }

    get mapped(): MappedSlugs {
        return this._mapped || [];
    }
}

export default SlugsConfig;
