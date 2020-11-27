// [i] https://github.com/lobsters/lobsters/blob/master/config/routes.rb
const list = (ports = {}, opts = {}) => {
    const { get, trace = _ => {} } = ports;
    const { url = 'https://lobste.rs/hottest', count = 50 } = opts;
  
    return get(`${url}?count=${count}`).
        then(reply => { trace(reply); return reply; }).
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
                id:     item.short_id,
                link:     item.url, 
                pubDate:  item.created_at });
        }));
}

const mapItem = item => {
    const { NewsItem } = require('../core/dist/news-item');

    return new NewsItem(item.id, item.title, item.link, new Date(new Date(item.pubDate).toUTCString()))
  }

module.exports.list = list;