type ExcludedSlugs = Array<string>;
type MappedSlug = {
    urlContains: string,
    slug: string,
};
type MappedSlugs = Array<MappedSlug>;
interface SlugsConfigInterface {
    excluded?: ExcludedSlugs;
    mapped?: MappedSlugs;
}

export default SlugsConfigInterface;
export {ExcludedSlugs, MappedSlug, MappedSlugs};
