import { Client, QueryResult } from 'pg';
import { DevNullLog, Log } from '../../../core/logging/log';
import { Bookmark } from '../../../core/bookmark';

export type Options = {
  connectionString: string;
  databaseName: string;
}

// COCKROACH_CONNECTION_STRING=`cat ~/.cockroachdb` npm run test.integration -- --grep cock
//
// [i] https://cockroachlabs.cloud/cluster/4d91eff2-d0d4-484c-a34d-65c9ff331401/overview?cluster-type=serverless
//     log in with github
//
export class CockroachBookmarksDatabase {
  private readonly client: Client;
  private readonly log: Log;
  private readonly databaseName;
  private readonly tableName;

  constructor({ log }: { log?: Log }, { connectionString, databaseName = 'news' }: Options) {
    this.databaseName = databaseName;
    this.tableName = `${this.databaseName}.bookmarks`;
    this.log = log || new DevNullLog();
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

  async delete(id: string) : Promise<void> {
    await this.run(
    `
      DELETE FROM
        ${this.tableName}
      WHERE
        id=$1
    `, 
      id, 
    );
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