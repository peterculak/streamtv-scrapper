import EpisodeInterface from "./entity/EpisodeInterface";

interface EpisodeFactoryInterface {
    fromCache(fullPath: string): Promise<EpisodeInterface>;
}

export default EpisodeFactoryInterface;
