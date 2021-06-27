import { Ports }                            from '../../core/ports';

import { list as lobstersList }             from '../lobsters';
import { list as hackerNewsList }           from '../hn';
import { del as deleteNews, deletedCount }  from  '../news';
import { MetserviceWeatherQuery }           from '../metservice-weather-query';
import { LocalStorageBlockedHosts }         from '../web/local-storage-blocked-hosts';
import { YoutubeNewsSource }                from '../youtube';
import { ConsoleLog }                       from '../../core/logging/log';

const { add: addBookmark, list: listBookmarks, del: deleteBookmark } = require('../bookmarks');

export const createPorts = ({ baseUrl, internet, toggles, window }) => {
  const log = new ConsoleLog();

  return new Ports(
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
      // rnz no longer used
      list:   () => [],
      delete: id => {},
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