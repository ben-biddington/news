import { feed }                               from './rss/feed';
import { DevNullLog }                         from '../core/logging/log';
import { NewsItem }                           from '../core/news-item';
import { NewsSource, NewsSourceListOptions }  from '../core/news-source';

// https://www.youtube.com/feeds/videos.xml?channel_id=UCJquYOG5EL82sKTfH9aMA9Q
export class YoutubeNewsSource implements NewsSource {
  private get: any;
  private log: any;
  private url: any;

  constructor(ports: any, opts:any = {}) {
    const { get, log = new DevNullLog() } = ports;
    const { url = 'https://www.youtube.com' } = opts;

    this.get = get;
    this.log = log;
    this.url = url;
  }

  list(opts: NewsSourceListOptions): Promise<NewsItem[]> {
    const { channelId, count = 50 } = opts;

    const feedUrl = `${this.url}/feeds/videos.xml?channel_id=${channelId}`;

    return feed(
      { get: this.get, log: this.log },
      {
        feedUrl,
        customFields: { item: ['title', 'pubDate', 'guid'] }
      }).
      then(items  => items.slice(0, count).
      map(item    => new NewsItem(item.id, item.title, item.link, item.pubDate)));
  }

  delete(id: string): Promise<void> {
    throw new Error('Method <YoutubeNewsSource#delete> not yet implemented.');
  }
}