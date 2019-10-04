import {
    HostInterface,
    NewsItem,
    Show,
    SlugsConfigInterface,
    ConfigInterface,
    SelectorsConfigInterface
} from "./ConfigInterface";
import SelectorsConfig from "./SelectorsConfig";
import SlugsConfig from "./SlugsConfig";

class Config implements ConfigInterface {
    constructor(
        private readonly _cacheDir: string = './var/cache',
        private readonly _hosts: Array<HostInterface> = [],
        private readonly _news?: Array<NewsItem>,
        private readonly _shows?: Array<Show>,
        private readonly _slugs?: SlugsConfigInterface,
        private readonly _selectors?: SelectorsConfigInterface,
    ) {}

    //todo validate?
    static fromYml(yml: ConfigInterface): Config {
        return new this(
            yml.cacheDir,
            yml.hosts,
            yml.news,
            yml.shows,
            yml.slugs ? SlugsConfig.fromYml(yml.slugs) : new SlugsConfig(),
            yml.selectors ? SelectorsConfig.fromYml(yml.selectors) : new SelectorsConfig(),
        );
    }

    get cacheDir(): string {
        return this._cacheDir;
    }

    get hosts(): Array<HostInterface> {
        return this._hosts;
    }

    get news(): Array<NewsItem> {
        return this._news || [];
    }

    get shows(): Array<Show> {
        return this._shows || [];
    }

    get slugs(): SlugsConfigInterface {
        return this._slugs || new SlugsConfig();
    }

    get selectors(): SelectorsConfigInterface {
        return this._selectors || new SelectorsConfig();
    }
}

export default Config;
