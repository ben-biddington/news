import { NewsItem } from "./news-item";

export class NewsItems {
  private _newsItems: NewsItem[] = [];

  constructor(items: NewsItem[] = []) {
    this._newsItems = items;
   }

  addAll(newsItems: NewsItem[]) {
    newsItems.forEach(item => this._newsItems.push(item));
  }

  merge(newsItems: NewsItem[]) {
    this.addAll(this.missing(newsItems));
  }

  set(newsItems: NewsItem[]) {
    this._newsItems = newsItems;
  }

  get(newsItemId) {
    return this._newsItems.find(it => it.id == newsItemId);
  }

  list(): NewsItem[] { return this._newsItems; }

  missing(newsItems = []) {
    const ids = this._newsItems.map(it => it.id);
    return newsItems.filter(it => false == ids.includes(it.id));
  }
}