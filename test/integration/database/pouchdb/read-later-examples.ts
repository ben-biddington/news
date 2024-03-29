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

  it("can add entries and it does not set id", async () => {
    const n: NewsItem = new NewsItem(undefined, "title", "url", new Date());
    const newEntry = await database.add(n);

    expect(newEntry.id).to.be.undefined;
    expect(newEntry.title).to.eql(n.title);
  });

  it("returns true when entry exists", async () => {
    await database.add(new NewsItem("id-1"));

    expect(await database.contains("id-1")).to.be.true;
  });

  it("returns false when entry does not exist", async () => {
    expect(await database.contains("xxx")).to.be.false;
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
      new NewsItem("id-a", "title", "url", new Date())
    );

    const deleted = await database.delete(newEntry.id);

    expect((await database.list()).length).to.eql(0);
  });

  it("deleting unknow entry does nothing", async () => {
    const deleted = await database.delete("xxx");

    expect(deleted).to.be.undefined;
  });
});
