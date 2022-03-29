import { NewsItemPreview } from "../news-item-preview";

export interface NewsItemPreviewSource {
  get(url: string): Promise<NewsItemPreview>;
}
