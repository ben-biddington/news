const { Application }                   = require('../../core/dist/application');
const { Ports }                         = require('../../core/dist/ports');
const { ConcreteNewsApplication }       = require('../../core/dist/app');
const { NewsItem }                      = require('../../core/dist/news-item');

const { list: lobstersList }            = require('../lobsters');
const { list: hackerNewsList }          = require('../hn');
const { list: rnzNewsList }             = require('../rnz');
const { del: deleteNews, deletedCount } = require('../news');
const { MetserviceWeatherQuery }        = require('../dist/adapters/metservice-weather-query');

const { add: addBookmark, list: listBookmarks, del: deleteBookmark } = require('../bookmarks');

class FetchBasedInternet {
  async delete(url, headers) {
    return fetch(url, { headers, method: 'delete' }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));;
  }

  async post(url, headers, body) {
    return fetch(url, { headers, method: 'post', body: JSON.stringify(body) }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));
  }

  async get(url, headers) {
    return fetch(url, { headers }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));;
  }
}

const internet = new FetchBasedInternet();

//
// [i] This is where the real application is bootstrapped from
//
const application = (toggles, settings) => {
  const baseUrl = settings.get('baseUrl') || '';

  let applicationPorts = new Ports(
    {
      list: () => lobstersList({ get: internet.get, trace: console.log }, { url: `${baseUrl}/lobsters/hottest`, count: 20 }),
      delete: id => deleteNews({ internet: internet, trace: console.log }, { baseUrl, id }),
    },
    console.log,
    { // seive
      apply: newsItems => {
        return fetch(
          `${baseUrl}/lobsters/deleted/sieve`,
          {
            method: 'post',
            headers: { 'Content-type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify(newsItems.map(it => it.id))
          }).
          then(reply => reply.json());
      }
    },
    {
      list:   () => hackerNewsList({ get: internet.get, log: new ConsoleLog() }, { url: `${baseUrl}/hn`, count: 20 }),
      delete: id => deleteNews({ internet: internet, trace: console.log }, { baseUrl, id }),
    },
    {
      list:   () => rnzNewsList({ get: internet.get, log: new ConsoleLog() }, { url: '/rnz', count: 20 }),
      delete: id => deleteNews({ internet: internet, trace: console.log }, { baseUrl, id }),
    }).
    withToggles(toggles).
    withBookmarks({
      add:  bookmark => addBookmark({ post: internet.post }, { url: baseUrl }, bookmark),
      list: () => listBookmarks({ get: internet.get, trace: console.log }, { url: baseUrl }),
      del:  id => deleteBookmark({ del: internet.delete, trace: console.log }, { url: baseUrl }, id)
    }).
    withDeletedItems({count: () => deletedCount({ internet }, { baseUrl: baseUrl }),}).
    with(new MetserviceWeatherQuery({ get: internet.get }));

  return new Application(applicationPorts, settings);
}

const { QueryStringToggles } = require('../web/toggling/query-string-toggles');
const { QueryStringSettings } = require('../web/query-string-settings');
const { ConsoleLog } = require('../../core/dist/logging/log');
const { SocketSync } = require('../web/gui/socket-sync');
const { UIEvents } = require('../web/gui/ui-events');
const { Title } = require('../web/gui/title');

module.exports = { application, Ports, QueryStringToggles, QueryStringSettings, NewsItem, SocketSync, UIEvents, Title, ConcreteNewsApplication }