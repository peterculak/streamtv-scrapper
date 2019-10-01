import each from 'jest-each';
import container from "../src/app/config/ioc_config";
import Slug from "../src/Slug";
import CONSTANTS from "../src/app/config/constants";
import SlugsConfig from "../src/SlugsConfig";

container
    .rebind<Slug>(CONSTANTS.SLUGS)
    .toConstantValue(new Slug(
        new SlugsConfig(
            ['xxx'],
            [{
                urlContains: 'something-in-url',
                slug: 'nice-slug'
            }]
        )
    ));

describe('JOJ Slug', () => {

    let slug: Slug;

    beforeEach(() => {
        slug = container.get<Slug>(CONSTANTS.SLUGS);
    });

    each([
        ['http://streamtv.sk/show-name', 'show-name'],
        ['http://streamtv.sk/show-name/xxx', 'show-name'],
        ['http://joj.sk/something-in-url/show-name', 'nice-slug'],
    ]).test(
        'extracts slug from url',
        (url, expected) => {
            expect(slug.fromProgramUrl(url)).toEqual(expected);
        }
    );

    each([
        ['/Users/peter/src/streamtv/var/cache/streamtv.sk/show-name', 'show-name'],
        ['/Users/peter/src/streamtv/var/cache/streamtv.sk/show-name/', 'show-name'],
    ]).test(
        'extracts slug from path',
        (url, expected) => {
            expect(slug.fromPath(url)).toEqual(expected);
        }
    );
});