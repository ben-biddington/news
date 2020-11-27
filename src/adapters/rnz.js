const { feed } = require('./rss/feed');
const { DevNullLog } = require('../core/logging/log');

// [i] https://www.rnz.co.nz/rss/national.xml
const list = (ports = {}, opts = {}) => {
    const { get         , log = new DevNullLog()    } = ports;
    const { url = '/rnz', count = 50                } = opts;

    const feedUrl = `${url}/rss/top.xml`

    return feed(
        { get, log }, 
        { 
            feedUrl, 
            customFields: { item: [ 'title', 'pubDate', 'guid' ]} 
        }).
        then(items => items.slice(0, count).map(mapItem));
}

const mapItem = item => {
    const { NewsItem } = require('../core/dist/news-item');

    return new NewsItem(item.guid, item.title, item.link, new Date(new Date(item.isoDate).toUTCString()));
}

module.exports.list = list;