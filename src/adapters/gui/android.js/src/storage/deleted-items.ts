import { NewsItem } from "../../../../../core/news-item";
import { addDays, isAfter } from 'date-fns';
import { Log } from "../../../../../core/logging/log";

export class DeletedItemsSeive {
  private readonly localStorage: Storage;
  private KEY = "news/deleted-items";

  constructor(window: Window) {
    this.localStorage = window.localStorage;
  }

  apply = (items: NewsItem[]) => {
    const deleted = this.deletedItems;

    const isNotDeleted = (id: string) => {
      return deleted.find((it) => it.id === id) === undefined;
    };

    const result = items.filter((it) => isNotDeleted(it.id)).map((it) => it.id);

    return Promise.resolve(result);
  };

  private get deletedItems(): DeletedItem[] {
    return (
      (JSON.parse(this.localStorage.getItem(this.KEY)) as DeletedItem[]) || []
    );
  }
}

export interface Clock {
  now: () => Date;
}

class SystemClock implements Clock {
  now = () => new Date();
}

export class DeletedItems {
  private readonly log: Log;
  private readonly localStorage: Storage;
  private readonly clock: Clock;
  private KEY = "news/deleted-items";

  constructor(log: Log, localStorage: Storage, clock: Clock = new SystemClock()) {
    this.log = log;
    this.localStorage = localStorage;
    this.clock = clock;
  }

  add = (id: string) => {
    this.prune();

    const currentValue = this.items;

    currentValue.push({
      date: this.clock.now(),
      id,
    });

    this.localStorage.setItem(this.KEY, JSON.stringify(currentValue));

    this.log.info(`[DeletedItems] There are now <${currentValue.length}> deleted items`);

    return Promise.resolve();
  };

  private prune = () => {
    const sevenDaysAgo = addDays(this.clock.now(), -7);
    const filtered = this.items.filter(it => isAfter(new Date(it.date), sevenDaysAgo));

    this.localStorage.setItem(this.KEY, JSON.stringify(filtered));
  }

  count = () => Promise.resolve(this.items.length);

  get items(): DeletedItem[] {
    return (
      (JSON.parse(this.localStorage.getItem(this.KEY)) as DeletedItem[]) || []
    );
  }
}

type DeletedItem = {
  date: Date;
  id: string;
};
