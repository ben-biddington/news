const expect = require("chai").expect;

import * as PouchDB from "pouchdb";

import { NewsItem } from "../../../../src/core/news-item";
import { ConsoleLog, Log } from "../../../../src/core/logging/log";

describe("[pouchdb] Can store news items", () => {
  let database: ReadLaterDatabase = null;

  beforeEach(async () => {
    database = new ReadLaterDatabase(
      new ConsoleLog({ allowTrace: false }),
      "db-name"
    );
  });

  afterEach(async () => {
    database = new ReadLaterDatabase(
      new ConsoleLog({ allowTrace: false }),
      "db-name"
    );

    return database.drop();
  });

  it("can add entries and it sets id", async () => {
    const n: NewsItem = new NewsItem(undefined, "title", "url", new Date());
    const newEntry = await database.add(n);

    expect(newEntry.id).to.not.be.undefined;
    expect(newEntry.title).to.eql(n.title);
  });

  it("can list all entries", async () => {
    await database.add(new NewsItem(undefined, "A", "url", new Date()));
    await database.add(new NewsItem(undefined, "B", "url", new Date()));
    await database.add(new NewsItem(undefined, "C", "url", new Date()));

    expect((await database.list()).length).to.eql(3);
    expect((await database.list()).map((it) => it.title)).to.have.all.members([
      "A",
      "B",
      "C",
    ]);
  });

  it("can delete entries", async () => {
    const newEntry = await database.add(
      new NewsItem(undefined, "title", "url", new Date())
    );

    const deleted = await database.delete(newEntry.id);

    expect(deleted.id).to.eql(newEntry.id);
  });

  it("deleting unknow entry does nothing", async () => {
    const deleted = await database.delete("xxx");

    expect(deleted).to.be.undefined;
  });
});

// [i] https://pouchdb.com/adapters.html#pouchdb_in_the_browser
//
//  PouchDB is not a self-contained database; it is a CouchDB-style abstraction layer over other databases.
//  By default, PouchDB ships with the IndexedDB adapter for the browser,
//  and a LevelDB adapter in Node.js.
//
class ReadLaterDatabase {
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
