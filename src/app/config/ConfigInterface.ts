interface HostInterface {
    name: string;
    image?: string;
}
interface Show {
    name: string;
    host: string;
    url: string;
    concurrency?: number;
}
interface NewsItem {
    name: string;
    host: string;
    url: string;
    concurrency?: number;
    maxLoadMorePages?: number;
    image?: string;
}
interface MappedSlug {
    urlContains: string;
    slug: string;
}
interface SlugsConfigInterface {
    mapped?: Array<MappedSlug>;
    excluded?: Array<string>;
}
interface ConfigInterface {
    cacheDir: string;
    hosts: Array<HostInterface>;
    shows?: Array<Show>;
    news?: Array<NewsItem>;
    slugs?: SlugsConfigInterface;
}

export default ConfigInterface;
export {HostInterface, Show, NewsItem, MappedSlug, SlugsConfigInterface, ConfigInterface};
