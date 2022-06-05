import { NewsItem } from "../../../../src/core/news-item";
import { Log } from "../../../../src/core/logging/log";
import PouchDB from "pouchdb";
import { ReadLaterList } from "../../../core/ports/read-later-list";
// [i] https://pouchdb.com/adapters.html#pouchdb_in_the_browser
//
//  PouchDB is not a self-contained database; it is a CouchDB-style abstraction layer over other databases.
//  By default, PouchDB ships with the IndexedDB adapter for the browser,
//  and a LevelDB adapter in Node.js.
//
export class ReadLaterDatabase implements ReadLaterList {
  private readonly db: PouchDB.Database<PouchDBNewsItem>;
  private readonly log: Log;

  constructor(log: Log, fileName: string) {
    this.log = log;
    this.db = new PouchDB(fileName);
  }

  async add(newsItem: PouchDBNewsItem): Promise<NewsItem> {
    // [i] https://pouchdb.com/api.html
    newsItem._id = newsItem.id;
    return this.db.post(newsItem, {}).then(() => newsItem);
  }

  async contains(id: string): Promise<boolean> {
    return (await this.db.get(id).catch(() => undefined))?.id === id;
  }

  async delete(id: string): Promise<NewsItem> {
    const toDelete = await this.db
      .get<PouchDBNewsItem>(id, {})
      .catch(() => undefined);

    toDelete && (await this.db.remove(toDelete));

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
}

type PouchDBNewsItem = NewsItem & { _id?: string, _rev?: string };
