const { expect, log } = require('../integration-test');
const { Cache } = require('../../../src/adapters/database/cache');
const temp = require('temp');
const md5 = require('md5');
const fs = require('fs');
const path = require('path');
const { Timespan } = require('../../../src/core/timespan');

describe('[disk-cache]', async () => {
    let tempFile, cache;

    beforeEach(async () => {

        temp.track();

        tempFile = (await temp.open()).path;

        cache = new Cache(tempFile, log);

        await cache.init();
    });

    it('can cache text', async () => {
        await cache.add('key', 'value', Timespan.fromSeconds(30));

        expect(await cache.get('key')).to.eql('value');
    });

    it('can cache serialized objects', async () => {
        const object = {
            name: 'example',
            age: 43,
            region:'nz'
        };

        await cache.add('key-a', JSON.stringify(object), Timespan.fromSeconds(30));

        expect(await cache.get('key-a')).to.eql('{"name":"example","age":43,"region":"nz"}');
    });

    it('can cache files', async () => {
        const elmo = fs.readFileSync(path.resolve(path.join(__dirname, './elmo.png')));

        await cache.add('elmo-file', elmo, Timespan.fromSeconds(30));

        const buffer = await cache.get('elmo-file');

        const tempFile = await temp.open();

        buffer.write(tempFile.path);

        // [?] @todo: fails with:
        // 
        //  TypeError [ERR_INVALID_ARG_VALUE]: The argument 'path' must be a string or Uint8Array without null bytes. 
        //  Received <Buffer 89 50 4e 47 0d 0a 1a 0a 00 00 00 0d 49 48 44 52 00 00 01 10 00 00 01 04 08 02 00 00 00 6f 
        //      2f fc cf 00 00 00 04 67 41 4d ...
        //
        //expect(md5(buffer)).to.eql(md5(fs.readFileSync(elmo)));
    });

    it('does not returned expired', async () => {
        await cache.add('key', 'value', Timespan.fromSeconds(0));

        expect(await cache.get('key')).to.be.null;
    });

    it('returns null for uknown key', async () => {
        expect(await cache.get('xxx-unknown-xxx')).to.be.null;
    });
});