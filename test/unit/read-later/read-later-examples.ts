import { Application, PortsBuilder } from "../application-unit-test";
import { ReadLaterList } from "../../../src/core/ports/read-later-list";
import { NewsItem } from "@test/../src/core/news-item";

class MockReadLasterList implements ReadLaterList {
  add(newsItem: NewsItem): Promise<NewsItem> {
    throw new Error("Method not implemented.");
  }

  list(): Promise<NewsItem[]> {
    throw new Error("Method not implemented.");
  }

  delete(id: string): Promise<NewsItem> {
    throw new Error("Method not implemented.");
  }
}

describe.skip("[wip] Adding items to read-later list", async () => {
  it("notifies the read-later port", async () => {
    const application = new Application(
      PortsBuilder.new().withReadLaterList(new MockReadLasterList())
    );

    // @todo: implement a store
    // application.dispatch(addReadLater(new NewsItem()))
  });

  it("show that it seived the results, too!");
});
