import { render } from "solid-js/web";
import {
  createEffect,
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
import {
  addReadLater,
  deleteReadLater,
  getPreview,
  hidePreview,
} from "../../../../../core/actions";
import { NewsPanel } from "../../../../web/gui/flavours/solid/components/NewsPanel";
import { show } from "../android/toast";
import { State } from "../../../../../core/internal/state";
import { Header } from "./components/header";
import { LogEntry, LogPanel } from "./components/log-panel";
import { MobileNewsPanel } from "./components/mobile-news-panel";
import { LogNotifier, NotifyingLog } from "./NotifiyingLog";
import { Log } from "../../../../../core/logging/log";
export { NotifyingLog } from "./NotifiyingLog";

export type Props = {
  application: Core;
  onDelete?: (id: string) => void;
  log?: LogNotifier
};

export enum View {
  News,
  Logs,
  ReadLater,
}

// [i] Log is specific to the view because we want to surface the messages in the UI. 
export const createLog = () => new NotifyingLog();

export const Application = ({ application, log }: Props) => {
  const [view, setView] = createSignal<View>(View.News);
  const [logs, setLogs] = createSignal<LogEntry[]>([]);
  const [loading, setLoading] = createSignal<boolean>(false);
  const [lobstersNews, setLobstersNews] = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews] = createSignal<NewsItem[]>([]);
  const [state, setState] = createSignal<State>();
  const now = createMemo(() => application.now());
  const [useMobileView, setUseMobileView] = createSignal<boolean>(true);

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
    log?.on('info', info);
    application.subscribe((s) => setState(s));
    application.on(["news-items-modified"], (e) => {
      setLobstersNews(e.items.filter((item) => item.label === "lobsters"));
      setHackerNews(e.items.filter((item) => item.label === "hn"));
    });

    application.on(["lobsters-items-loaded"], (e) => setLobstersNews(e.items));
    application.on(["hacker-news-items-loaded"], (e) => setHackerNews(e.items));

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

    // application.toggles.get("use-mobile-view").then((toggle) => {
    //   setUseMobileView(toggle);
    // });

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
    const result: NewsItem[] = lobstersNews()
      .concat(hackerNews())
      .filter((it) => it.deleted === false);

    console.log("updating", result.length);

    return result.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  const readLaterItems = createMemo<NewsItem[]>(() => {
    return (state()?.readLater || []).sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  });

  createEffect(() => console.log(loading()));

  return (
    <>
      <Header
        view={view()}
        logsCount={logs().length}
        newsCount={newsItems().length}
        readLaterCount={readLaterItems().length}
        viewChanged={(v) => setView(v)}
        onClearLogs={() => setLogs([])}
        onReload={loadNews}
        loading={loading()}
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
                                    <div
                                      class="btn-group"
                                      role="group"
                                      aria-label="Basic example"
                                    >
                                      <button
                                        type="button"
                                        class="btn btn-primary"
                                        onClick={() => setLogs([])}
                                      >
                                        Clear
                                      </button>
                                    </div>
                                    <LogPanel logs={logs()} />
                                  </>
                                }
                              />
                              <Match
                                when={
                                  view() == View.News ||
                                  view() == View.ReadLater
                                }
                                children={
                                  <>
                                    <Show
                                      when={useMobileView()}
                                      children={
                                        <>
                                          <MobileNewsPanel
                                            now={now()}
                                            items={
                                              view() == View.News
                                                ? newsItems()
                                                : readLaterItems()
                                            }
                                            onDelete={(id: string) => {
                                              view() == View.News
                                                ? application.hackerNews.delete(
                                                    id
                                                  )
                                                : application.dispatch(
                                                    deleteReadLater(id)
                                                  );
                                            }}
                                            onBookmark={
                                              application.bookmarks.add
                                            }
                                            isOnReadLaterList={(
                                              item: NewsItem
                                            ) => {
                                              return (
                                                readLaterItems().find(
                                                  (it) => it.id === item.id
                                                ) !== undefined
                                              );
                                            }}
                                            onReadLater={(item) =>
                                              application.dispatch(
                                                addReadLater(item)
                                              )
                                            }
                                            onPreview={(item) =>
                                              application.dispatch(
                                                getPreview(item)
                                              )
                                            }
                                            onHidePreview={(item) =>
                                              application.dispatch(
                                                hidePreview(item)
                                              )
                                            }
                                          />
                                        </>
                                      }
                                    />

                                    <Show
                                      when={false === useMobileView()}
                                      children={
                                        <>
                                          <NewsPanel
                                            allowReadLater={true}
                                            allowLoading={true}
                                            loading={loading()}
                                            news={newsItems()}
                                            readLater={readLaterItems()}
                                            now={now()}
                                            onDelete={
                                              application.hackerNews.delete
                                            }
                                            onBlock={application.news.block}
                                            onUnblock={application.news.unblock}
                                            onBookmark={
                                              application.bookmarks.add
                                            }
                                            onReload={loadNews}
                                            onReadLater={(item) =>
                                              application.dispatch(
                                                addReadLater(item)
                                              )
                                            }
                                          />
                                        </>
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

export const mount = (el, application, log: LogNotifier) =>
  render(() => <Application application={application} log={log} />, el);
