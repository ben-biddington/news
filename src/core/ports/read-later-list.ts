import { NewsItem } from "../news-item";

export interface ReadLaterList {
  add(newsItem: NewsItem): Promise<NewsItem>;
  list(): Promise<NewsItem[]>;
  delete(id: string): Promise<NewsItem>;
}
