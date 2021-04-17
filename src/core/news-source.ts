import { NewsItem } from "./news-item";

export interface NewsSourceListOptions {
  count?: number;
  id?: string;
  channelId: string
}

export abstract class NewsSource {
  abstract list(opts: NewsSourceListOptions): Promise<NewsItem[]>;
  abstract delete(id: string): Promise<void>;
}