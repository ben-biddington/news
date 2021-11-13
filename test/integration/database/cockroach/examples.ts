const expect = require('chai').expect;
import { settings } from '../../support/support';
import { Client, QueryResult } from 'pg';
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

type Options = {
  connectionString: string;
  databaseName: string;
}

// COCKROACH_CONNECTION_STRING=`cat ~/.cockroachdb` npm run test.integration -- --grep cock
class CockroachBookmarksDatabase {
  private readonly client: Client;
  private readonly log: Log;
  private readonly databaseName;
  private readonly tableName;

  constructor({ log }: { log: Log }, { connectionString, databaseName = 'news' }: Options) {
    this.databaseName = databaseName;
    this.tableName = `${this.databaseName}.bookmarks`;
    this.log = log;
    this.client = new Client({
      connectionString,
      ssl: true,
    }); 
  }

  async init(): Promise<void> {
    await this.client.connect();
    await this.run(`CREATE DATABASE IF NOT EXISTS ${this.databaseName}`);
    await this.run(`
      CREATE TABLE IF NOT EXISTS ${this.tableName} 
        (
          id text PRIMARY KEY, 
          title text, 
          timestamp date, 
          url text, 
          source text
        )`);
  }

  // https://node-postgres.com/features/queries
  async add(...bookmarks: Bookmark[]) {
    await Promise.all(
      bookmarks.map(bookmark => {
        this.run(
          `
            INSERT INTO ${this.tableName} (id, title, timestamp, url, source) 
            VALUES ($1, $2, now(), $3, $4)
          `, 
            bookmark.id.toString(), 
            bookmark.title, 
            bookmark.url, 
            bookmark.source
          );
      })
    );
  }

  async get(id: string) : Promise<Bookmark> {
    const rows = (await this.run(
    `
      SELECT 
        id, title, timestamp, url, source 
      FROM
        ${this.tableName}
      WHERE
        id=$1
    `, 
      id, 
    )).rows;

    return this.map(rows[0])
  }

  async list() : Promise<Bookmark[]> {
    const result = await this.run(
      `
        SELECT 
          id, title, timestamp, url, source 
        FROM
          ${this.tableName}
      `
    );

    return result.rows.map(this.map);
  }

  private map(row: any) {
    return {
      id: row['id'],
      title: row['title'],
      url: row['url'],
      source: row['source'],
    };
  }

  async drop(): Promise<void> {
    await this.run(`DROP DATABASE ${this.databaseName}`);
    return this.dispose();
  }

  dispose(): Promise<void> {
    return this.client?.end();
  }

  private async run(query: string, ...params: any[]): Promise<QueryResult> {
    this.log.trace(`[db] ${query} ${JSON.stringify(params, null, 2)}`);
    
    try {
      return await this.client.query(query, params);
    } catch (e) {
      throw new Error(`Query failed\n${query}\n${JSON.stringify(params, null, 2)}\n\n${e}`);
    }
  }
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