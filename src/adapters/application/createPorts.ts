import { Application }                   from '../../core/application';
import { Ports }                         from '../../core/ports';
import { ConcreteNewsApplication }       from '../../core/app';
import { NewsItem }                      from '../../core/news-item';

const { list: lobstersList }            = require('../lobsters');
import { list as hackerNewsList }        from '../hn';
const { list: rnzNewsList }             = require('../rnz');
const { del: deleteNews, deletedCount } = require('../news');
import { MetserviceWeatherQuery }         from '../metservice-weather-query';
import { LocalStorageBlockedHosts }      from '../web/local-storage-blocked-hosts';
import { YoutubeNewsSource }             from '../youtube';
import { ConsoleLog }                   from '../../core/logging/log';

const { add: addBookmark, list: listBookmarks, del: deleteBookmark } = require('../bookmarks');

export const createPorts = ({ baseUrl, internet, toggles, window }) => {
  const log = new ConsoleLog();

  const applicationPorts = new Ports(
    {
      list: () => lobstersList({ get: internet.get, trace: log.trace }, { url: `${baseUrl}/lobsters/hottest`, count: 20 }),
      delete: id => deleteNews({ internet: internet, trace: log.trace }, { baseUrl, id }),
    },
    console.log,
    { 
      // seive
      apply: newsItems => {
        return internet.post(
          `${baseUrl}/lobsters/deleted/sieve`,
          { 'Content-type': 'application/json', 'Accept': 'application/json' },
          newsItems.map(it => it.id)).
          then(reply => JSON.stringify(reply.body));
      }
    },
    {
      list:   () => hackerNewsList({ get: internet.get, log: log }, { url: `${baseUrl}/hn`, count: 20 }),
      delete: id => deleteNews({ internet: internet, trace: log.trace }, { baseUrl, id }),
    },
    {
      list:   () => rnzNewsList({ get: internet.get, log }, { url: '/rnz', count: 20 }),
      delete: id => deleteNews({ internet: internet, trace: console.trace }, { baseUrl, id }),
    }).
    withToggles(toggles).
    withBookmarks({
      add:  bookmark => addBookmark({ post: internet.post }, { url: baseUrl }, bookmark),
      list: () => listBookmarks({ get: internet.get, trace: log.trace }, { url: baseUrl }),
      del:  id => deleteBookmark({ del: internet.delete, trace: log.trace }, { url: baseUrl }, id)
    }).
    withDeletedItems({count: () => deletedCount({ internet }, { baseUrl: baseUrl }),}).
    with(new MetserviceWeatherQuery({ get: internet.get })).
    withBlockedHosts(new LocalStorageBlockedHosts(window)).
    withYoutube(new YoutubeNewsSource({ get: internet.get }, { url: '/youtube' }));
}