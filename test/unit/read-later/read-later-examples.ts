import { expect, Application, PortsBuilder } from "../application-unit-test";
import { ReadLaterList } from "../../../src/core/ports/read-later-list";
import { NewsItem } from "../../../src/core/news-item";
import { addReadLater } from "../../../src/core/actions";
import { State } from "../../../src/core/internal/state";

class MockReadLasterList implements ReadLaterList {
  private readonly saved: NewsItem[] = [];

  add(newsItem: NewsItem): Promise<NewsItem> {
    this.saved.push(newsItem);
    return Promise.resolve(newsItem);
  }

  list(): Promise<NewsItem[]> {
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<NewsItem> {
    throw new Error("Method not implemented.");
  }

  mustHaveBeenAskedToSave() {
    expect(this.saved.length).to.eql(1);
  }
}

describe("[wip] Adding items to read-later list", async () => {
  it("notifies the read-later port", async () => {
    const mock = new MockReadLasterList();

    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(mock)
    );

    await application.dispatch(addReadLater(new NewsItem()));

    mock.mustHaveBeenAskedToSave();
  });

  it("appears on the state", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLasterList())
    );

    await application.dispatch(addReadLater(new NewsItem()));

    expect(application.state.readLater.length).to.eq(1);
  });

  it("notifies with same state", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLasterList())
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

  it("unsubscribe works", async () => {
    const application: Application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLasterList())
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
    expect(stateUpdates).to.eql([+0, 1]);
  });

  it("does not add duplicates");
});
