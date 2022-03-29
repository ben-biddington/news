import { Application, PortsBuilder, expect } from "../application-unit-test";
import { NewsItemPreviewSource } from "../../../src/core/ports/news-item-preview-source";
import { NewsItemPreview } from "../../../src/core/news-item-preview";
import { getPreview } from "../../../src/core/actions";
import { NewsItem } from "../../../src/core/news-item";
import { Options } from "../../../src/core/application";

class MockPreviewSource implements NewsItemPreviewSource {
  private id: string;
  private previewToReturn: NewsItemPreview;

  constructor(previewToReturn?: NewsItemPreview) {
    this.previewToReturn = previewToReturn;
  }

  get(id: string): Promise<NewsItemPreview> {
    this.id = id;
    return Promise.resolve(this.previewToReturn);
  }

  mustHaveBeenAskedToPreview(expected: string) {
    expect(this.id).to.eql(expected);
  }
}

describe("Previewing a news item", async () => {
  it("queries the lookup port", async () => {
    const mock = new MockPreviewSource();

    const application: Application = new Application(
      PortsBuilder.new().withPreviewSource(mock)
    );

    await application.dispatch(getPreview(new NewsItem("id-abc", "", "http://abc")));

    mock.mustHaveBeenAskedToPreview("http://abc");
  });

  it("initial state", async () => {
    const opts: Options = {
      initialState: { lobsters: [new NewsItem("id-a"), new NewsItem("id-b")] },
    };

    const application: Application = new Application(
      PortsBuilder.new(),
      null,
      opts
    );

    expect(application.state.lobsters.length).to.eql(2);
  });

  it("assigns a preview to just the desired item", async () => {
    const mock = new MockPreviewSource({ summary: "A B C" });

    const application: Application = new Application(
      PortsBuilder.new().withPreviewSource(mock),
      null,
      {
        initialState: {
          lobsters: [new NewsItem("id-a"), new NewsItem("id-b")],
        },
      }
    );

    await application.dispatch(getPreview(new NewsItem("id-a")));

    expect(
      application.state.lobsters.find((it) => it.id === "id-a").preview.summary
    ).to.eql("A B C");

    expect(application.state.lobsters.find((it) => it.id === "id-b").preview).to
      .be.undefined;
  });
});
