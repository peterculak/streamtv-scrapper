import {injectable} from "inversify";
import "reflect-metadata";
import JojArchiveService from "../ArchiveService";
import EpisodeInterface from "../EpisodeInterface";

/**
 * @todo: fix this
 */
@injectable()
class ArchiveService extends JojArchiveService {

    protected groupEpisodes(archive: Array<EpisodeInterface>): Array<EpisodeInterface> {
        let tvseriesMeta: any = {};
        const seasonMeta: any = {};
        const seasons: Array<string> = [];

        //populate seasons details
        this._.each(archive, (item: any) => {
            const currentSeason = Object.assign({});

            let seasonTitle = 'Unknown';
            // if (item.partOfSeason.name) {
            //     seasonTitle = item.partOfSeason.name;
            // }

            if (!this._.contains(seasons, seasonTitle)) {
                seasonMeta[seasonTitle] = currentSeason;
                seasons.push(seasonTitle);
            }
        });

        const episodesBySeason = this._.groupBy(archive, (item: any) => 'Unknown');

        //this is to remove repeated data and sort by episode number
        seasons.forEach((seasonTitle: string) => {
            this._.each(episodesBySeason[seasonTitle], (item: any) => {
                // delete item.partOfTVSeries;
                // delete item.partOfSeason;
                return item;
            });
            const unique = this._.uniq(episodesBySeason[seasonTitle], (episode: EpisodeInterface) => episode.episodeNumber);
            seasonMeta[seasonTitle].episodes = this._.sortBy(unique, (episode: EpisodeInterface) => -Date.parse(episode.dateAdded as string));
        });

        tvseriesMeta.seasons = this._.toArray(seasonMeta);

        return tvseriesMeta;
    }
}

export default ArchiveService;
