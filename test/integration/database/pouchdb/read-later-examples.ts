const expect = require("chai").expect;

import { NewsItem } from "../../../../src/core/news-item";
import { ConsoleLog, Log } from "../../../../src/core/logging/log";
import { ReadLaterDatabase } from "../../../../src/adapters/database/pouchdb/read-later-database";

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
