import {HostInterface, NewsItem, Show, SlugsConfigInterface, ConfigInterface} from "./ConfigInterface";

class Config implements ConfigInterface {
    private constructor(
        private readonly _cacheDir: string,
        private readonly _hosts: Array<HostInterface>,
        private readonly _news?: Array<NewsItem>,
        private readonly _shows?: Array<Show>,
        private readonly _slugs?: SlugsConfigInterface
    ) {}

    //todo validate?
    static fromYml(ymlDefinition: ConfigInterface): Config {
        return new this(
            ymlDefinition.cacheDir,
            ymlDefinition.hosts,
            ymlDefinition.news,
            ymlDefinition.shows,
            ymlDefinition.slugs,
        );
    }

    get cacheDir(): string {
        return this._cacheDir || './var/cache';
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
        return this._slugs || {mapped: [], excluded: []};
    }
}

export default Config;
