import { makeAutoObservable, runInAction, reaction, autorun, toJS } from "mobx";
import { EventEmitter } from "events";
import { NewsItem } from "../news-item";
import { State } from "./state";
import { Clock, Ports } from "../ports";
import { Action, addReadLater } from "../actions";
import { produce } from "immer";

export class Store {
  private readonly ports: Ports;
  private events: EventEmitter;
  private clock: Clock;
  private state: State = {
    lastUpdatedDate: new Date(),
    lobsters: [],
    hackerNews: [],
    youtube: [],
    readLater: [],
  };

  constructor(ports: Ports, events: EventEmitter, clock: Clock) {
    this.ports = ports;

    makeAutoObservable(this);

    this.events = events;
    this.clock = clock;

    reaction(
      () => this.state.hackerNews,
      (newValue: NewsItem[], oldValue: NewsItem[]) => {
        this.state.lastUpdatedDate = this.clock.now();
        this.events.emit("hacker-news-items-loaded", { items: newValue });
      }
    );

    reaction(
      () => this.state.lobsters,
      (newValue: NewsItem[], oldValue: NewsItem[]) => {
        this.state.lastUpdatedDate = this.clock.now();
        this.events.emit("lobsters-items-loaded", { items: newValue });
      }
    );

    reaction(
      () => this.state.youtube,
      (newValue: NewsItem[], oldValue: NewsItem[]) => {
        this.state.lastUpdatedDate = this.clock.now();
        this.events.emit("youtube-items-loaded", { items: newValue });
      }
    );
  }

  list(): NewsItem[] {
    return [...this.hackerNews, ...this.lobsters, ...this.youtube];
  }

  find(id: string): NewsItem {
    const results = [
      ...this.state.hackerNews,
      ...this.state.lobsters,
      ...this.state.youtube,
    ].filter((it) => it.id == id);

    return results.length > 0 ? results[0] : null;
  }

  remove(id: string) {
    runInAction(() => {
      this.hackerNews.forEach((it) => {
        if (it.id === id) {
          it.deleted = true;
        }
      });

      this.lobsters.forEach((it) => {
        if (it.id === id) {
          it.deleted = true;
        }
      });

      this.youtube.forEach((it) => {
        if (it.id === id) {
          it.deleted = true;
        }
      });
    });
  }

  subscribe = (listener: (state: State) => void) =>
    autorun(() => {
      listener(this.state);
    });

  async dispatch(action: Action): Promise<any> {
    if (addReadLater.match(action)) {
      await this.ports.readlaterList.add(action.payload);

      runInAction(() => {
        // (1) Error: [MobX] Observable arrays cannot be frozen.
        // If you're passing observables to 3rd party component/function that calls Object.freeze,
        // pass copy instead: toJS(observable)

        this.state = produce(toJS(/*(1)*/ this.state), (draft) => {
          draft.readLater.push(action.payload);
        });
      });
    }

    return Promise.resolve();
  }

  getState() {
    return this.state;
  }

  get lobsters(): NewsItem[] {
    return [...this.state.lobsters];
  }

  set lobsters(items: NewsItem[]) {
    runInAction(() => {
      items = items.map((item) => item.labelled("lobsters"));

      items.forEach(
        (item) => (item.new = this.isMissingFrom(this.state.lobsters, item))
      );

      this.state = { ...this.state, lobsters: items };
    });
  }

  get hackerNews(): NewsItem[] {
    return [...this.state.hackerNews];
  }

  set hackerNews(items: NewsItem[]) {
    runInAction(() => {
      items = items.map((item) => item.labelled("hn"));

      items.forEach(
        (item) => (item.new = this.isMissingFrom(this.state.hackerNews, item))
      );

      this.state = { ...this.state, hackerNews: items };
    });
  }

  get youtube(): NewsItem[] {
    return [...this.state.youtube];
  }

  set youtube(items: NewsItem[]) {
    runInAction(() => {
      items = items.map((item) => item.labelled("youtube"));

      items.forEach(
        (item) => (item.new = this.isMissingFrom(this.state.youtube, item))
      );

      this.state = { ...this.state, youtube: items };
    });
  }

  private isMissingFrom(from: NewsItem[], item: NewsItem): boolean {
    return false === from.map((it) => it.id).includes(item.id);
  }
}
