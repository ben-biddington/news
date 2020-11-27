const { Application, Ports } = require('../../core/application');
const { ConcreteNewsApplication } = require('../../core/dist/app');
const { NewsItem } = require('../../core/news-item');

const { list: lobstersList   }                  = require('../lobsters');
const { list: hackerNewsList }                  = require('../hn');
const { list: rnzNewsList }                     = require('../rnz');
const { del: deleteNews, deletedCount }         = require('../news');
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
    let applicationPorts = new Ports(
        { 
            list   : () => lobstersList  ({ get: internet.get, trace: console.log }, { url: '/lobsters/hottest', count: 20 }),
            delete : id => deleteNews    ({ internet: internet, trace: console.log }, { id }),
        },
        console.log,
        {
            apply: newsItems => {
                return fetch(
                    '/lobsters/deleted/sieve', 
                    { 
                        method: 'post',
                        headers: { 'Content-type': 'application/json', 'Accept': 'application/json' }, 
                        body: JSON.stringify(newsItems.map(it => it.id))
                    }).
                    then(reply => reply.json());
            }
        },
        { 
            list   : () => hackerNewsList  ({ get: internet.get , log: new ConsoleLog() }, { url: '/hn', count: 20 }),
            delete : id => deleteNews      ({ internet: internet, trace: console.log }, { id }),
        },
        { 
            list   : () => rnzNewsList     ({ get: internet.get , log: new ConsoleLog() }, { url: '/rnz', count: 20 }),
            delete : id => deleteNews      ({ internet: internet, trace: console.log }, { id }),
        });

    applicationPorts = applicationPorts.withBookmarks({
        add: bookmark => addBookmark   ({ post: internet.post }, { trace: console.log }, bookmark),
        list: ()      => listBookmarks ({ get: internet.get    , trace: console.log }),
        del: id       => deleteBookmark({ del: internet.delete , trace: console.log }, {}, id)
    });

    applicationPorts = applicationPorts.withDeletedItems({
        count: () => deletedCount({ internet }, { baseUrl: '' }),
    });

    return new Application(applicationPorts, toggles, settings);
}

const { QueryStringToggles }    = require('../web/toggling/query-string-toggles');
const { QueryStringSettings }   = require('../web/query-string-settings');
const { ConsoleLog }            = require('../../core/logging/log');
const { SocketListener }        = require('../web/gui/socket-listener');
const { UIEvents }              = require('../web/gui/ui-events');
const { Title }                 = require('../web/gui/title');

module.exports = { application, Ports, QueryStringToggles, QueryStringSettings, NewsItem, SocketListener, UIEvents, Title, ConcreteNewsApplication }