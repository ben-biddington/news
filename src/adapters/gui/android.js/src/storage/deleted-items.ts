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
      console.log({
        id,
        notDeleted: deleted.find((it) => it.id === id) === undefined,
      });
      return deleted.find((it) => it.id === id) === undefined;
    };

    const result = items.filter((it) => isNotDeleted(it.id)).map((it) => it.id);

    console.log({ result });

    return Promise.resolve(result);
  };

  private get deletedItems(): DeletedItem[] {
    return (
      (JSON.parse(this.localStorage.getItem(this.KEY)) as DeletedItem[]) || []
    );
  }
}

export class DeletedItems {
  private readonly localStorage: Storage;
  private KEY = "news/deleted-items";

  constructor(window: Window) {
    this.localStorage = window.localStorage;
  }

  add = (id: string) => {
    const currentValue = this.items;

    currentValue.push({
      date: new Date(),
      id,
    });

    console.log(`[deleted-items] Adding <${id}> to the deleted items list`);

    this.localStorage.setItem(this.KEY, JSON.stringify(currentValue));

    return Promise.resolve();
  };

  count = () => Promise.resolve(this.items.length);

  private get items(): DeletedItem[] {
    return (
      (JSON.parse(this.localStorage.getItem(this.KEY)) as DeletedItem[]) || []
    );
  }
}

type DeletedItem = {
  date: Date;
  id: string;
};
