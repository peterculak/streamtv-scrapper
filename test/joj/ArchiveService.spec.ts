import jest from "jest";
import each from 'jest-each';
import Slug from "../../src/joj/Slug";

describe('JOJ Slug', () => {
    each([
        ['http://joj.sk/profesionali', 'profesionali'],
        ['http://joj.sk/profesionali/archiv', 'profesionali'],
        ['http://joj.sk/profesionali/o-sutazi', 'profesionali'],
        ['http://joj.sk/profesionali/o-relacii', 'profesionali'],
        ['http://joj.sk/profesionali/o-seriali', 'profesionali'],
    ]).test(
        'extracts slug from url',
        (url, expected) => {
            expect(Slug.fromProgramUrl(url)).toEqual(expected);
        }
    );

    each([
        ['/Users/peter/src/streamtv/var/cache/joj.sk/profesionali', 'profesionali'],
        ['/Users/peter/src/streamtv/var/cache/joj.sk/profesionali/', 'profesionali'],
    ]).test(
        'extracts slug from path',
        (url, expected) => {
            expect(Slug.fromPath(url)).toEqual(expected);
        }
    );
});