import { NewsItem } from "../../../../../core/news-item";

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
  private readonly localStorage: Storage;
  private readonly clock: Clock;
  private KEY = "news/deleted-items";

  constructor(localStorage: Storage, clock: Clock = new SystemClock()) {
    this.localStorage = localStorage;
    this.clock = clock;
  }

  add = (id: string) => {
    const currentValue = this.items;

    currentValue.push({
      date: this.clock.now(),
      id,
    });

    this.localStorage.setItem(this.KEY, JSON.stringify(currentValue));

    return Promise.resolve();
  };

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
