import { NewsItemPreview } from "../news-item-preview";

export interface NewsItemPreviewSource {
  get(id: string): Promise<NewsItemPreview>;
}
