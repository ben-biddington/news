import { NewsItems } from "../news-items";

export class State {
  lobstersNewsItems: NewsItems = new NewsItems();
  hackerNewsItems: NewsItems = new NewsItems();
  newsItems(): NewsItems {
    const result = new NewsItems(this.lobstersNewsItems.list());
    result.addAll(this.hackerNewsItems.list());
    return result;
  }
}