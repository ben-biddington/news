import { NewsItem } from "../news-item";

export interface State {
  lastUpdatedDate?: Date;
  hackerNews?: NewsItem[];
  lobsters?: NewsItem[];
  youtube?: NewsItem[];
  readLater?: NewsItem[];
}