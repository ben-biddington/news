import { feed, RssFeedItem } from './rss/feed';
import { QueryStringSettings } from './web/query-string-settings';
import { DevNullLog } from '../core/logging/log';
import { NewsItem } from '../core/news-item';

export type Options = {
  count?: number;
  url?: string;
}

// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
export const list = (ports = {}, opts: Options = {}) => {
  //@ts-ignore
  const { get, log = new DevNullLog() } = ports;
  const { url = 'https://hnrss.org', count = 50 } = opts;

  const feedUrl = `${url}/frontpage`;

  return feed(
    { get, log },
    {
      versionTwo: true,
      feedUrl,
      customFields: { item: ['title', 'pubDate', 'guid'] }
    }).
    then(items => items.slice(0, count).map(mapItem));
}

const mapItem = (item: RssFeedItem) => {
  const queryStringSettings = new QueryStringSettings(item['guid']);

  // https://news.ycombinator.com/item?id=23555892
  return new NewsItem(queryStringSettings.get('id'), item['title'], item.link, item['pubDate']);
}