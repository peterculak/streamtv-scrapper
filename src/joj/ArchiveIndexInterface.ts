interface ArchiveIndexItem {
    title: string,
    img: string,
    url: string,
    slug: string,
}

interface ArchiveIndexInterface extends Array<ArchiveIndexItem> {
    [index: number]: ArchiveIndexItem
}

export {ArchiveIndexInterface, ArchiveIndexItem};
