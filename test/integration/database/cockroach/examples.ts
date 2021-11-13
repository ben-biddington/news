const expect = require('chai').expect;
import { settings } from '../../support/support';
import { ConsoleLog, Log } from '../../../../src/core/logging/log';
import { Bookmark } from '@test/../src/core/bookmark';
import { CockroachBookmarksDatabase } from '../../../../src/adapters/database/cockroachdb/bookmarks';

//
// [i] https://cockroachlabs.cloud/cluster/4d91eff2-d0d4-484c-a34d-65c9ff331401/overview?cluster-type=serverless
//     log in with github
//

const onlyWhenConnectionStringAvailable = (
  what: string | undefined,
  name: string, block: (argument: string | undefined) => void | Promise<void>) => {
  const test = what ? it : it.skip; 
  name = what ? name : `[skipped because connection string was not provided] ${name}`
  return test(name, () => block(what));
}

// COCKROACH_CONNECTION_STRING=`cat ~/.cockroachdb` npm run test.integration -- --grep cock
describe('[db] Can use cockroach db', () => {
  let log: Log;
  let database: CockroachBookmarksDatabase;

  beforeEach(() => {
    log       = new ConsoleLog({ allowTrace: false });
    database  = new CockroachBookmarksDatabase(
      { log }, 
      { connectionString: settings.cockroachDbConnectionString, databaseName: 'newsTest' } 
    );
  });

  afterEach(async () => {
    try {
      await database.drop();
    } finally {
      await database.dispose();
    }
  });

  onlyWhenConnectionStringAvailable(settings.cockroachDbConnectionString, 
    'can list bookmarks', async () => {
      await database.init();

      await database.add(
        {
          id: 'bookmark-1',
          source: 'lobsters',
          url: 'http://abc',
          title: `abc-${new Date().getTime()}`
        },
        {
          id: 'bookmark-2',
          source: 'lobsters',
          url: 'http://abc',
          title: `abc-${new Date().getTime()}`
        },
        {
          id: 'bookmark-3',
          source: 'lobsters',
          url: 'http://abc',
          title: `abc-${new Date().getTime()}`
        }
      );

      const all = await database.list();

      expect(all.map(it => it.id)).to.eql([ 'bookmark-1', 'bookmark-2', 'bookmark-3' ]);
  });

  onlyWhenConnectionStringAvailable(settings.cockroachDbConnectionString, 
    'can delete bookmarks', async () => {
      await database.init();

      await database.add(
        {
          id: 'bookmark-1',
          source: 'lobsters',
          url: 'http://abc',
          title: `abc-${new Date().getTime()}`
        },
        {
          id: 'bookmark-2',
          source: 'lobsters',
          url: 'http://abc',
          title: `abc-${new Date().getTime()}`
        },
        {
          id: 'bookmark-3',
          source: 'lobsters',
          url: 'http://abc',
          title: `abc-${new Date().getTime()}`
        }
      );

      await database.delete('bookmark-2');

      expect((await database.list()).map(it => it.id)).to.eql([ 'bookmark-1', 'bookmark-3' ]);
  });

  onlyWhenConnectionStringAvailable(settings.cockroachDbConnectionString, 
    'can add bookmarks', async () => {
      await database.init();

      const newBookmark: Bookmark = {
        id: 'bookmark-1',
        source: 'lobsters',
        url: 'http://abc',
        title: `abc-${new Date().getTime()}`
      };

      await database.add(newBookmark);

      const theStoredBookmark = await database.get('bookmark-1');

      expect(theStoredBookmark).to.eql(newBookmark);
  });

  // Connection error
  // 
  // Error: ENOENT: no such file or directory, open '$HOME/.postgresql/root.crt'
  //     at Object.openSync (node:fs:585:3)
  //     at Object.readFileSync (node:fs:453:35)
  //     at parse (node_modules/pg-connection-string/index.js:81:24)
  //     at new ConnectionParameters (node_modules/pg/lib/connection-parameters.js:56:42)
  //     at new Client (node_modules/pg/lib/client.js:19:33)
  //     at /home/ben/sauce/news/test/integration/database/cockroach/examples.ts:13:20
  //     at Generator.next (<anonymous>)
  //     at /home/ben/sauce/news/node_modules/tslib/tslib.js:117:75
  //     at new Promise (<anonymous>)
  //     at Object.__awaiter (node_modules/tslib/tslib.js:113:16)
  //     at Context.<anonymous> (test/integration/database/cockroach/examples.ts:10:32)
  //
  // Solution: From the gui they give you this:
  //
  // curl --create-dirs -o $HOME/.postgresql/root.crt -O https://cockroachlabs.cloud/clusters/4d91eff2-d0d4-484c-a34d-65c9ff331401/cert

  // Connection error
  // Error: ENOENT: no such file or directory, open '~/.postgresql/root.crt'
  //     at Object.openSync (node:fs:585:3)
  //     at Object.readFileSync (node:fs:453:35)
  //     at parse (node_modules/pg-connection-string/index.js:81:24)
  //     at new ConnectionParameters (node_modules/pg/lib/connection-parameters.js:56:42)
  //     at new Client (node_modules/pg/lib/client.js:19:33)
  //     at /home/ben/sauce/news/test/integration/database/cockroach/examples.ts:16:20
  //     at Generator.next (<anonymous>)
  //     at /home/ben/sauce/news/node_modules/tslib/tslib.js:117:75
  //     at new Promise (<anonymous>)
  //     at Object.__awaiter (node_modules/tslib/tslib.js:113:16)
  //     at Context.<anonymous> (test/integration/database/cockroach/examples.ts:13:32)
  //
  // Solution: change cert path to absolute.
});