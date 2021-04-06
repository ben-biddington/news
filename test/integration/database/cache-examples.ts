const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { Timespan } from '../../../src/core/timespan';

import { Cache } from '../../../src/adapters/database/cache';

describe('[cache] Can store things other than files', () => {
  let cache = null;

  beforeEach(async () => {
      const tempFile = await temp.open();

      cache = new Cache(tempFile.path);
      
      await cache.init();
  });

  it('refuses to cache objects', async () => {
    const key = "example/key";

    await cache.add(key, { name: 'example'}, Timespan.fromMinutes(1)).catch(e => { throw e; });

    expect(await cache.get(key)).to.be.null;
  });

  it('can be used to store text', async () => {
    const key = "example/key";

    await cache.add(key, JSON.stringify({ name: 'example'}), Timespan.fromMinutes(1)).catch(e => { throw e; });

    expect(await cache.get(key)).to.not.be.null;
  });
});