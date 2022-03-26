import { render } from "solid-js/web";
import {
  createMemo,
  createSignal,
  For,
  Match,
  onMount,
  Show,
  Switch,
} from "solid-js";
import { NewsItem } from "../../../../../core/news-item";
import { Application as Core } from "../../../../../core/application";
import { addReadLater, deleteReadLater } from "../../../../../core/actions";
import { NewsPanel } from "../../../../web/gui/flavours/solid/components/NewsPanel";
import { show } from "../android/toast";
import { State } from "../../../../../core/internal/state";
import { Header } from "./components/header";
import { LogEntry, LogPanel } from "./components/log-panel";

export type Props = {
  application: Core;
  onDelete?: (id: string) => void;
  log: (m: string) => void;
};

export enum View {
  News,
  Logs,
}

export const Application = ({ application }: Props) => {
  const [view, setView] = createSignal<View>(View.News);
  const [logs, setLogs] = createSignal<LogEntry[]>([]);
  const [loading, setLoading] = createSignal<boolean>(false);
  const [lobstersNews, setLobstersNews] = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews] = createSignal<NewsItem[]>([]);
  const [state, setState] = createSignal<State>();
  const now = createMemo(() => application.now());

  const info = (m: string) =>
    setLogs((v) => {
      const next = [...v];

      next.unshift({
        type: "text",
        text: m,
      });

      return next.slice(0, 50);
    });

  onMount(() => {
    application.subscribe((s) => setState(s));
    application.on(["news-items-modified"], (e) => {
      setLobstersNews(e.items.filter((item) => item.label === "lobsters"));
      setHackerNews(e.items.filter((item) => item.label === "hn"));
    });

    application.on(["lobsters-items-loaded"], (e) => setLobstersNews(e.items));
    application.on(["hacker-news-items-loaded"], (e) => setHackerNews(e.items));
    application.on(["lobsters-item-deleted"], (e) =>
      setLobstersNews(lobstersNews().filter((it) => it.id != e.id))
    );
    application.on(["hacker-news-item-deleted"], (e) =>
      setHackerNews(hackerNews().filter((it) => it.id != e.id))
    );
    application.on(addReadLater.type, () => {
      info("Added item to read later");
      show("Added to read later");
    });

    application.onAny((args) => {
      setLogs((v) => {
        const next = [...v];

        next.unshift({
          type: "json",
          text: args,
        });

        return next.slice(0, 50);
      });
    });

    return loadNews().then(() => {
      info("Loaded");
      show("Loaded");
    });
  });

  const loadNews = async (): Promise<any> => {
    await withLoading(() =>
      Promise.all([application.lobsters.list(), application.hackerNews.list()])
    );
  };

  const withLoading = async (fn: () => Promise<any>) => {
    setLoading(true);

    try {
      await fn();
    } finally {
      setLoading(false);
    }
  };

  const newsItems = createMemo<NewsItem[]>(() => {
    const result: NewsItem[] = lobstersNews().concat(hackerNews());

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const readLaterItems = createMemo<NewsItem[]>(() => {
    return (state()?.readLater || []).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  return (
    <>
      <Header
        view={view()}
        logsCount={logs().length}
        viewChanged={(v) => setView(v)}
        onClearLogs={() => setLogs([])}
      />

      <div class="container-fluid">
        <div class="row">
          <div className="col-sm-12">
            <div class="row">
              <div class="col-12">
                <div class="row">
                  <div class="col-12">
                    <div class="row">
                      <div class="col-12"></div>
                    </div>

                    <div class="row">
                      <div class="col-12">
                        <Switch
                          fallback={<div>Not Found</div>}
                          children={
                            <>
                              <Match
                                when={view() == View.Logs}
                                children={
                                  <>
                                    <LogPanel logs={logs()} />
                                  </>
                                }
                              />
                              <Match
                                when={view() == View.News}
                                children={
                                  <>
                                    <NewsPanel
                                      allowReadLater={true}
                                      allowLoading={true}
                                      loading={loading()}
                                      news={newsItems()}
                                      readLater={readLaterItems()}
                                      now={now()}
                                      onDelete={application.hackerNews.delete}
                                      onBlock={application.news.block}
                                      onUnblock={application.news.unblock}
                                      onBookmark={application.bookmarks.add}
                                      onReload={loadNews}
                                      onReadLater={(item) =>
                                        application.dispatch(addReadLater(item))
                                      }
                                      onDeleteReadLater={(id) =>
                                        application.dispatch(
                                          deleteReadLater(id)
                                        )
                                      }
                                    />
                                  </>
                                }
                              />
                            </>
                          }
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
