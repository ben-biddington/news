import { expect, Application, PortsBuilder } from "../application-unit-test";
import { ReadLaterList } from "../../../src/core/ports/read-later-list";
import { NewsItem } from "../../../src/core/news-item";
import {
  addReadLater,
  deleteReadLater,
  PayloadAction,
} from "../../../src/core/actions";
import { State } from "../../../src/core/internal/state";
import { delay } from "../../support";

class MockReadLaterList implements ReadLaterList {
  private readonly saved: NewsItem[] = [];
  private listCalls = 0;
  private readonly deleted: string[] = [];

  add(newsItem: NewsItem): Promise<NewsItem> {
    this.saved.push(newsItem);
    return Promise.resolve(newsItem);
  }

  list(): Promise<NewsItem[]> {
    this.listCalls += 1;
    return Promise.resolve([]);
  }

  mustHaveBeenAskedToList() {
    expect(this.listCalls).to.eql(1);
  }

  delete(id: string): Promise<NewsItem> {
    this.deleted.push(id);
    return Promise.resolve(null);
  }

  mustHaveBeenAskedToDelete(expected: string) {
    expect(this.deleted[0]).to.eql(expected);
  }

  mustHaveBeenAskedToSave() {
    expect(this.saved.length).to.eql(1);
  }
}

describe("Loading read-later list", async () => {
  it("reads the list at startup", async () => {
    const mock = new MockReadLaterList();

    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(mock)
    );

    await delay(500);

    mock.mustHaveBeenAskedToList();
  });
});

describe("Removing items from read-later list", async () => {
  it("notifies the read-later port", async () => {
    const mock = new MockReadLaterList();

    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(mock)
    );

    await application.dispatch(addReadLater(new NewsItem("id-one")));
    await application.dispatch(addReadLater(new NewsItem("id-two")));
    await application.dispatch(addReadLater(new NewsItem("id-three")));

    await application.dispatch(deleteReadLater("id-two"));

    mock.mustHaveBeenAskedToDelete("id-two");

    expect(application.state.readLater.map((it) => it.id)).to.deep.eq([
      "id-one",
      "id-three",
    ]);
  });
});

describe("Adding items to read-later list", async () => {
  it("notifies the read-later port", async () => {
    const mock = new MockReadLaterList();

    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(mock)
    );

    await application.dispatch(addReadLater(new NewsItem()));

    mock.mustHaveBeenAskedToSave();
  });

  it("appears on the state", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLaterList())
    );

    await application.dispatch(addReadLater(new NewsItem()));

    expect(application.state.readLater.length).to.eq(1);
  });

  it("notifies with same state", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLaterList())
    );

    let stateUpdate: State = null;

    application.subscribe((s) => {
      stateUpdate = s;
    });

    await application.dispatch(addReadLater(new NewsItem("id-one")));

    expect(application.state.readLater[0].id).to.eq(
      stateUpdate.readLater[0].id
    );
  });

  it("notifies as an event", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLaterList())
    );

    let notification: { type: string; payload: NewsItem };

    application.on(addReadLater.type, (e) => (notification = e));

    // application.onAny((e) => console.log({ e }));

    await application.dispatch(addReadLater(new NewsItem("id-one")));

    expect(notification.payload.id).to.eql("id-one");
  });

  it("unsubscribe works", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLaterList())
    );

    let stateUpdates: number[] = [];

    const unsubscribe = application.subscribe((s: State) => {
      stateUpdates.push(s.readLater.length);
    });

    await application.dispatch(addReadLater(new NewsItem("id-one")));

    unsubscribe();

    await application.dispatch(addReadLater(new NewsItem("id-two")));
    await application.dispatch(addReadLater(new NewsItem("id-three")));

    expect(application.state.readLater.length).to.eq(3);

    // [i] Interesting that we're notfied twice even though we have dispatched once
    expect(stateUpdates.filter((it) => it > 1).length).to.eql(0);
  });

  it("does not add duplicates");
});
