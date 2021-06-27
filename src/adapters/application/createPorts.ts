// const { Application }                   = require('../../core/dist/application');
// const { Ports }                         = require('../../core/dist/ports');
// const { ConcreteNewsApplication }       = require('../../core/dist/app');
// const { NewsItem }                      = require('../../core/dist/news-item');

// const { list: lobstersList }            = require('../lobsters');
// const { list: hackerNewsList }          = require('../dist/adapters/hn');
// const { list: rnzNewsList }             = require('../rnz');
// const { del: deleteNews, deletedCount } = require('../news');
// const { MetserviceWeatherQuery }        = require('../dist/adapters/metservice-weather-query');
// const { LocalStorageBlockedHosts }      = require('../dist/adapters/web/local-storage-blocked-hosts');
// const { YoutubeNewsSource }             = require('../dist/adapters/youtube');


// export const createPorts = ({ internet }) => {
//   const log = new ConsoleLog();

//   const applicationPorts = new Ports(
//     {
//       list: () => lobstersList({ get: internet.get, trace: log.trace }, { url: `${baseUrl}/lobsters/hottest`, count: 20 }),
//       delete: id => deleteNews({ internet: internet, trace: log.trace }, { baseUrl, id }),
//     },
//     console.log,
//     { // seive
//       apply: newsItems => {
//         return fetch(
//           `${baseUrl}/lobsters/deleted/sieve`,
//           {
//             method: 'post',
//             headers: { 'Content-type': 'application/json', 'Accept': 'application/json' },
//             body: JSON.stringify(newsItems.map(it => it.id))
//           }).
//           then(reply => reply.json());
//       }
//     },
//     {
//       list:   () => hackerNewsList({ get: internet.get, log: log }, { url: `${baseUrl}/hn`, count: 20 }),
//       delete: id => deleteNews({ internet: internet, trace: log.trace }, { baseUrl, id }),
//     },
//     {
//       list:   () => rnzNewsList({ get: internet.get, log }, { url: '/rnz', count: 20 }),
//       delete: id => deleteNews({ internet: internet, trace: console.trace }, { baseUrl, id }),
//     }).
//     withToggles(toggles).
//     withBookmarks({
//       add:  bookmark => addBookmark({ post: internet.post }, { url: baseUrl }, bookmark),
//       list: () => listBookmarks({ get: internet.get, trace: log.trace }, { url: baseUrl }),
//       del:  id => deleteBookmark({ del: internet.delete, trace: log.trace }, { url: baseUrl }, id)
//     }).
//     withDeletedItems({count: () => deletedCount({ internet }, { baseUrl: baseUrl }),}).
//     with(new MetserviceWeatherQuery({ get: internet.get })).
//     withBlockedHosts(new LocalStorageBlockedHosts(window)).
//     withYoutube(new YoutubeNewsSource({ get: internet.get }, { url: '/youtube' }));
// }