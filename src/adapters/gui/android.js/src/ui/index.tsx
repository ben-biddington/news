import { render } from "solid-js/web";
import { createMemo, createSignal, For, onMount, Show } from "solid-js";
import { NewsItem } from "../../../../../core/news-item";
import { Application as Core } from "../../../../../core/application";
import { NewsItemElement } from "./components/news-item-element";
import { children } from "svelte/internal";

export type Props = {
  application: Core;
  onDelete?: (id: string) => void;
  log: (m: string) => void;
};

export const Application = ({ application }: Props) => {
  const [loading, setLoading] = createSignal<boolean>(false);
  const [lobstersNews, setLobstersNews] = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews] = createSignal<NewsItem[]>([]);

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
      <div id="news" class="shadow">
        <table class="table">
          <thead>
            <tr>
              <td colspan="3">
                <strong>News</strong> ({newsItems().length})
                <span class="ml-2">
                  <a href="javascript:void(0)" onClick={onReload} class="icon">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-bootstrap-reboot"
                      viewBox="0 0 16 16"
                    >
                      <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z" />
                      <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z" />
                    </svg>
                  </a>
                </span>

                <span style="margin-left: 10px">
                  <Show when={loading()} children={<>loading</>} />
                </span>
              </td>
            </tr>
          </thead>
          <tbody>
            <For
              each={newsItems()}
              fallback={loading}
              children={(item, index) => (
                <NewsItemElement newsItem={item} i={index()} />
              )}
            />
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">&nbsp;</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};

const loading = (
  <>
    <tr>
      <td>...</td>
    </tr>
  </>
);

export const mount = (el, application, log = () => {}) =>
  render(() => <Application application={application} log={log} />, el);
