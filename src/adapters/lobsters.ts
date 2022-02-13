import { NewsItem } from '../core/news-item';

// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
export const list = (ports: any = {}, opts: any = {}) => {
  const { get, trace = _ => { } } = ports;
  const { url = 'https://lobste.rs/hottest', count = 50 } = opts;

  const fullUrl = `${url}?count=${count}`;

  // 31-Dec-2021: Lobsters rejects missing User-Agent

  return get(fullUrl, 
    { 
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:77.0) Gecko/20190101 Firefox/77.0',
      'Accept': 'application/json'
    }).
    then(reply => { trace({ url: fullUrl }); trace(reply); return reply; }).
    then(reply => {
      try {
        return JSON.parse(reply.body);
      } catch (e) {
        throw new Error(`Failed to parse the following as json:\n${reply.body}`);
      }
    }).
    then(items => items.filter(it => it.url != '').slice(0, count).map(item => {
      return mapItem({
        ...item,
        id: item.short_id,
        link: item.url,
        pubDate: item.created_at
      });
    }));
}

const mapItem = item => {
  return new NewsItem(item.id, item.title, item.link, new Date(new Date(item.pubDate).toUTCString()))
}