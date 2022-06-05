import { NewsItem } from "../news-item";

export interface ReadLaterList {
  add(newsItem: NewsItem): Promise<NewsItem>;
  contains(id: string): Promise<boolean>;
  list(): Promise<NewsItem[]>;
  delete(id: string): Promise<NewsItem>;
}
