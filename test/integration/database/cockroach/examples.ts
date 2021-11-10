const temp = require('temp');
import { settings } from '../../support/support';
import { Client } from 'pg';
import { ConsoleLog, Log } from '../../../../src/core/logging/log';
import { Bookmark } from '@test/../src/core/bookmark';

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

class CockroachBookmarksDatabase {
  private readonly client: Client;
  private readonly log: Log;

  constructor({ log }: { log: Log }, connectionString: string) {
    this.log = log;
    this.client = new Client({
      connectionString,
      ssl: true,
    }); 
  }

  async init(): Promise<void> {
    await this.client.connect();
    await this.run('CREATE DATABASE IF NOT EXISTS bookmarks');
    await this.run(`
      CREATE TABLE IF NOT EXISTS bookmarks 
        (
          id text PRIMARY KEY, 
          title text, 
          timestamp date, 
          url text, 
          source text
        )`);
  }

  // https://node-postgres.com/features/queries
  async add(bookmark: Bookmark) {
    await this.run(
    `
      INSERT INTO bookmarks (id, title, timestamp, url, source) 
      VALUES ($1, $2, now(), $3, $4)
    `, 
      bookmark.id.toString(), 
      bookmark.title, 
      bookmark.url, 
      bookmark.source
    );
  }

  async drop(): Promise<void> {
    await this.run('DROP DATABASE bookmarks');
    return this.client?.end();
  }

  dispose(): Promise<void> {
    return this.client?.end();
  }

  private async run(query: string, ...params: any[]): Promise<void> {
    this.log.trace(`[db] ${query} ${JSON.stringify(params, null, 2)}`);
    await this.client.query(query, params);
  }
}

// COCKROACH_CONNECTION_STRING=`cat ~/.cockroachdb` npm run test.integration -- --grep cock
describe('[db] Can use cockroach db', () => {
  onlyWhenConnectionStringAvailable(settings.cockroachDbConnectionString, 
    'can connect to remote database', async (connectionString) => {
    const client = new Client({
      connectionString,
      ssl: true,
    });

    try {
      await client.connect();
    }
    finally {
      await client?.end();
    }
  });

  onlyWhenConnectionStringAvailable(settings.cockroachDbConnectionString, 
    'can create "CockroachBookmarksDatabase"', async (connectionString) => {
    
      const database = new CockroachBookmarksDatabase({ log: new ConsoleLog({ allowTrace: true }) }, connectionString);

      try {
        await database.init();

        await database.add({
          id: 'bookmark-1',
          source: '',
          url: 'http://abc',
          title: 'abc'
        })

        await database.drop();
      }
      finally {
        await database.dispose();
      }
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