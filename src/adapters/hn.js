const { feed } = require('./dist/adapters/rss/feed');
const { QueryStringSettings } = require('./dist/adapters/web/query-string-settings');
const { DevNullLog } = require('../core/dist/logging/log');

// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
const list = (ports = {}, opts = {}) => {
  const { get, log = new DevNullLog() } = ports;
  const { url = 'https://hnrss.org', count = 50 } = opts;

  const feedUrl = `${url}/frontpage`;

  return feed(
    { get, log },
    {
      feedUrl,
      customFields: { item: ['title', 'pubDate', 'guid'] }
    }).
    then(items => items.slice(0, count).map(mapItem));
}

const mapItem = item => {
  const { NewsItem } = require('../core/dist/news-item');

  const queryStringSettings = new QueryStringSettings(item.guid);

  // https://news.ycombinator.com/item?id=23555892
  return new NewsItem(queryStringSettings.get('id'), item.title, item.link, item.pubDate);
}

module.exports.list = list;