class EpisodeException extends Error {
    static noType(): EpisodeException {
        return new this('No episode type');
    };

    static emptyDateAdded(): EpisodeException {
        return new this('Date added was empty');
    }

    static emptyDescription(): EpisodeException {
        return new this('Description was empty');
    }

    static emptyImage(): EpisodeException {
        return new this('Image was empty');
    }

    static emptyName(): EpisodeException {
        return new this('Empty episode name');
    }

    static emptySeasonName(): EpisodeException {
        return new this('Empty season name');
    }

    static emptyTvSeries(): EpisodeException {
        return new this('Empty tv series');
    }

    static emptyTimeRequired(): EpisodeException {
        return new this('Empty time requried');
    }

    static emptyUrl(): EpisodeException {
        return new this('Empty url');
    }
}

export default EpisodeException;