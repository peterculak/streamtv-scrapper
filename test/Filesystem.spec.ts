import "reflect-metadata";
import {decorate, injectable} from "inversify";
import container from "../src/app/config/container";
import CONSTANTS from "../src/app/config/constants";
import LoggerInterface from "../src/LoggerInterface";
import FileSystemInterface from "../src/FileSystemInterface";

const mockLogger = () => {
};//todo possibly store in __mocks__
mockLogger.fatal = jest.fn();
mockLogger.error = jest.fn();
mockLogger.warn = jest.fn();
mockLogger.info = jest.fn();
mockLogger.debug = jest.fn();
mockLogger.trace = jest.fn();
mockLogger.level = 'silent';

decorate(injectable(), mockLogger);
container
    .rebind<LoggerInterface>(CONSTANTS.LOGGER)
    .toConstantValue(mockLogger);

let filesystem: FileSystemInterface;

import * as fs from "fs";
jest.mock('fs');
import * as glob from "glob";
import FileInterface from "../src/FileInterface";
jest.mock('glob');

describe('Filesystem', () => {
    beforeEach(() => {
        filesystem = container.get<FileSystemInterface>(CONSTANTS.FILESYSTEM);
    });

    it('throws Error when file doesnt exist', () => {
        const mock = jest.spyOn(fs, 'existsSync');
        mock.mockImplementation(() => false);
        expect(() => filesystem.readFile('/foo.txt')).toThrow();
    });

    it('reads file successfully', (done) => {
        const mock = jest.spyOn(fs, 'readFileSync');
        mock.mockImplementation(() => 'file content');
        const mock2 = jest.spyOn(fs, 'existsSync');
        mock2.mockImplementation(() => true);

        filesystem.readFile('/foo.txt').then((r: FileInterface) => {
            expect(r.content).toEqual('file content');
            expect(r.fullPath).toEqual('/foo.txt');
            expect(r.name).toEqual('foo.txt');
            done();
        });
    });

    it('writes file successfully', (done) => {
        const mock = jest.spyOn(fs, 'existsSync');
        mock.mockImplementation(() => true);

        filesystem.writeFile('/tmp', 'foo.txt', 'content')
            .then((r: FileInterface) => {
                expect(r.content).toEqual('content');
                expect(r.name).toEqual('foo.txt');
                expect(r.fullPath).toEqual('/tmp/foo.txt');
                done();
            });
    });

    it('creates folder when writing to a non existing folder', (done) => {
        const mock = jest.spyOn(fs, 'existsSync');
        mock.mockImplementation(() => false);

        filesystem.writeFile('/tmp/foo', 'bar.txt', 'content')
            .then((r: FileInterface) => {
                expect(r.content).toEqual('content');
                expect(r.name).toEqual('bar.txt');
                expect(r.fullPath).toEqual('/tmp/foo/bar.txt');
                done();
            });
        expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/foo', {recursive: true});
    });

    it('proxies sync call to adapter (glob)', () => {
        const mock = jest.spyOn(glob, 'sync');
        mock.mockImplementation(() => ['/path1', '/path2']);
        const folders = filesystem.sync('**(!iframes)/*.html');
        expect(folders).toEqual(['/path1', '/path2']);
    });
});
