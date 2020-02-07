import EpisodeInterface from "./EpisodeInterface";
import EpisodeException from "./EpisodeException";

export class Episode implements EpisodeInterface {
    constructor(
        private _type: string,
        private _dateAdded: string | Date,
        private _description: string,
        private _episodeNumber: number,
        private _image: string,
        private _mp4: Array<string>,
        private _name: string,
        private _partOfSeason: { seasonNumber?: number; name: string },
        private _partOfTVSeries: {name: string},//todo interface
        private _timeRequired: string,
        private _url: string
    ) {

        if (!this._type) {
            throw EpisodeException.noType();
        }

        if (!this._dateAdded) {//todo convert to date object validate and only return object
            throw EpisodeException.emptyDateAdded();
        }

        if (!this._description) {
            throw EpisodeException.emptyDescription();
        }

        if (!this._image) {
            throw EpisodeException.emptyImage();
        }

        if (!this._name) {
            throw EpisodeException.emptyName();
        }

        if (!this._partOfSeason || !this._partOfSeason.name) {
            throw EpisodeException.emptySeasonName();
        }

        if (!this._partOfTVSeries) {
            throw EpisodeException.emptyTvSeries();
        }

        if (!this._timeRequired) {
            throw EpisodeException.emptyTimeRequired();
        }

        if (!this._url) {
            throw EpisodeException.emptyUrl();
        }
    }

    get type(): string {
        return this._type;
    }

    get dateAdded(): string | Date {
        return this._dateAdded;
    }

    get description(): string {
        return this._description;
    }

    get episodeNumber(): number {
        return this._episodeNumber;
    }

    get image(): string {
        return this._image;
    }

    get mp4(): Array<string> {
        return this._mp4;
    }

    get name(): string {
        return this._name;
    }

    get partOfSeason(): { seasonNumber?: number; name: string } {
        return this._partOfSeason;
    }

    get seasonName(): string {
        return this._partOfSeason.name;
    }

    get seasonNumber(): number {
        return this._partOfSeason.seasonNumber ? this._partOfSeason.seasonNumber : 1;
    }

    get seriesName(): string {
        return this._partOfTVSeries.name;
    }

    get partOfTVSeries(): {name: string} {
        return this._partOfTVSeries;
    }

    get timeRequired(): string {
        return this._timeRequired;
    }

    get url(): string {
        return this._url;
    }

    set episodeNumber(number: number) {
        this._episodeNumber = number;
    }

    public toJSON(): string {
        return Object.entries(this).reduce((accumulator: any, currentValue: any) => {
            const source = {} as any;
            source[currentValue[0].replace('_', '')] = currentValue[1];
            return Object.assign(accumulator, source);
        }, {});
    }
}