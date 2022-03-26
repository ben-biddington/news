import { NewsItem } from "../../../../src/core/news-item";
import { Log } from "../../../../src/core/logging/log";
import * as PouchDB from 'pouchdb';

// [i] https://pouchdb.com/adapters.html#pouchdb_in_the_browser
//
//  PouchDB is not a self-contained database; it is a CouchDB-style abstraction layer over other databases.
//  By default, PouchDB ships with the IndexedDB adapter for the browser,
//  and a LevelDB adapter in Node.js.
//
export class ReadLaterDatabase {
  private readonly db: PouchDB.Database<NewsItem>;
  constructor(log: Log, fileName: string) {
    this.db = new PouchDB(fileName);
  }

  async add(newsItem: NewsItem): Promise<NewsItem> {
    // [i] https://pouchdb.com/api.html
    const result = await this.db.post(newsItem, {});

    newsItem.id = result.id;

    return newsItem;
  }

  async delete(id: string): Promise<NewsItem> {
    const toDelete = await this.find(id);

    if (!toDelete) return;

    toDelete.id = toDelete._id;

    await this.db.remove(toDelete);

    return toDelete;
  }

  async list(): Promise<NewsItem[]> {
    return (await this.db.allDocs({ include_docs: true })).rows.map(
      (it) => it.doc
    );
  }

  async drop() {
    return this.db.destroy();
  }

  private async find(id: string) {
    try {
      return await this.db.get(id);
    } catch {
      return undefined;
    }
  }
}