import { BlockedHosts } from "../../../blocked-hosts";
import { NewsItem } from "../../../news-item";

export const apply = async (list: NewsItem[], blockedHosts: BlockedHosts): Promise<NewsItem[]> => {
  return Promise.all(list.map(
    async (item: NewsItem) => {
      const isBlocked = await blockedHosts.has(item.host);
      return item.withBlockedHost(isBlocked);
    }));
}