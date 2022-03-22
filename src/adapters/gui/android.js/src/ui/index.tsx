import { render } from "solid-js/web";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { NewsItem } from "../../../../../core/news-item";
import { Application as Core } from "../../../../../core/application";
import { NewsItemElement } from "./components/news-item-element";
import { NewsPanel } from "../../../../web/gui/flavours/solid/components/NewsPanel";
export type Props = {
  application: Core;
  onDelete?: (id: string) => void;
  log: (m: string) => void;
};

export const Application = ({ application }: Props) => {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [lobstersNews, setLobstersNews] = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews] = createSignal<NewsItem[]>([]);
  const now = createMemo(() => application.now());

  const onReload = () => {
    return loadNews();
  };

  onMount(() => {
    application.on(["lobsters-items-loaded"], (e) => setLobstersNews(e.items));
    application.on(["hacker-news-items-loaded"], (e) => setHackerNews(e.items));
    application.on(["lobsters-item-deleted"], (e) =>
      setLobstersNews(lobstersNews().filter((it) => it.id != e.id))
    );
    application.on(["hacker-news-item-deleted"], (e) =>
      setHackerNews(hackerNews().filter((it) => it.id != e.id))
    );

    return loadNews();
  });

  const loadNews = async (): Promise<any> => {
    setLoading(true);

    await Promise.all([
      application.lobsters.list(),
      application.hackerNews.list(),
    ]);

    setLoading(false);
  };

  const newsItems = createMemo<NewsItem[]>(() => {
    const result: NewsItem[] = lobstersNews().concat(hackerNews());

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  return (
    <>
      <div class="container-fluid">
        <div class="row">
          <div className="col-sm-12">
            <div class="row justify-content-center">
              <div
                id="info"
                class={`${
                  !loading() ? "loaded" : ""
                } alert w-25 alert-primary justify-content-center`}
                role="alert"
              >
                loading
              </div>
            </div>

            <div class="row">
              <div class="col-12">
                <div class="row">
                  <div class="col-12">
                    <div class="row">
                      <div class="col-12">
                      </div>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <NewsPanel
                          news={newsItems()}
                          now={now()}
                          onDelete={application.hackerNews.delete}
                          onBlock={application.news.block}
                          onUnblock={application.news.unblock}
                          onBookmark={application.bookmarks.add}
                          onReload={loadNews}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export const mount = (el, application, log = () => {}) =>
  render(() => <Application application={application} log={log} />, el);
