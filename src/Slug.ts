import {inject, injectable} from "inversify";
import "reflect-metadata";
import SlugsConfigInterface, {ExcludedSlugs, MappedSlugs} from "./SlugsConfigInterface";
import CONSTANTS from "./app/config/constants";

@injectable()
class Slug {
    private excludedSlugs: ExcludedSlugs = [];
    private mappedSlugs: MappedSlugs = [];

    constructor(
        @inject(CONSTANTS.SLUGS_CONFIG) private slugsConfig?: SlugsConfigInterface
    ) {
        if (slugsConfig) {
            if (slugsConfig.mapped) {
                this.mappedSlugs = slugsConfig.mapped;
            }
            if (slugsConfig.excluded) {
                this.excludedSlugs = slugsConfig.excluded;
            }
        }
    }

    public fromProgramUrl(url: string): string {
        const mappedSlug = this.mappedSlugs.find((el: {urlContains: string, slug: string}) => url.indexOf(el.urlContains) > -1);

        if (mappedSlug !== undefined) {
            return String(mappedSlug.slug);
        }

        const bits = url.split('/');
        let slug = bits.pop();

        if (this.excludedSlugs.includes(String(slug))) {
            slug = bits.pop();
        }

        return String(slug);
    }

    public fromPath(path: string): string {
        path = path.replace(/\/$/, '');
        const bits = path.split('/');

        return bits[bits.length - 1];
    }
}

export default Slug;
