import EpisodeInterface from "./EpisodeInterface";

interface EpisodeFactoryInterface {
    fromCache(fullPath: string): Promise<EpisodeInterface>;
}

export default EpisodeFactoryInterface;
