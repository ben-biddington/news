const events  = require('events');

// https://stackoverflow.com/questions/5178869/listen-to-all-emitted-events-in-node-js
class CustomEventEmitter extends events.EventEmitter {
    constructor(log) {
        super();

        this._log = log;
    }

    emit(type, ...args) {
        const n = { type: type, ...args[0] };

        try {
            super.emit('*', n);

            return super.emit(type, ...args) || super.emit('', ...args);    
        } catch (error) {
            this._log(error);            
        }
    }
}

const { list: listNews } = require('./internal/use-cases/news/list');
const { Ports }  = require('./ports');
const { Bookmark } = require('./bookmark');

// Internal list of currently showing news items.
class NewsItems {
    constructor() {
        this._newsItems = [];
    }

    addAll(newsItems) {
        newsItems.forEach(item => this._newsItems.push(item));
    }

    get(newsItemId) {
        return this._newsItems.find(it => it.id == newsItemId);
    }
}

class Application {
    constructor(ports, toggles) {
        this._ports     = ports;
        this._events    = new CustomEventEmitter(ports.log);
        this._log       = ports.log;
        this._toggles   = toggles
        this._newsItems = new NewsItems();
    }

    pollEvery(milliseconds) {
        this._log(`[application] polling frequency set to <${milliseconds}ms>`);

        this._pollingTask = setInterval(async () => {
            if (this._toggles.get('allow-lobsters-auto-refresh')) {
                const lobstersNews = await this.lobsters.list();
                this._events.emit('lobsters-items-loaded', { items: lobstersNews });
            }

            if (this._toggles.get('allow-auto-refresh')) {
                const hackerNews = await this.hackerNews.list();
                this._events.emit('hacker-news-items-loaded', { items: hackerNews });
            }
        }, milliseconds);
    }

    stopPolling() {
        clearInterval(this._pollingTask);
    }

    get lobsters() {
        return {
            list: async () => {
                const newsItems = await listNews(() => this._ports.lobsters.list(), this._ports.seive, this._toggles);
                
                this._save(newsItems);

                return newsItems;
            },
            delete: async id => {

                await this._ports.lobsters.delete(id);
                
                this._events.emit('lobsters-item-deleted', { id });
            },
            snooze: id => {
                this._events.emit('lobsters-item-snoozed', { id });
                return Promise.resolve();
            }
        }
    }

    get hackerNews() {
        return {
            list: async () => {
                const newsItems = await listNews(() => this._ports.hackerNews.list(), this._ports.seive, this._toggles);

                this._save(newsItems);

                return newsItems;
            },

            delete: async id => {

                await this._ports.hackerNews.delete(id);

                this._events.emit('hacker-news-item-deleted', { id });
            }
        }
    }

    get rnzNews() {
        return {
            list: () => {
                return listNews(() => this._ports.rnzNews.list(), this._ports.seive, this._toggles).
                    then(results => results.sort((a, b) => b.date - a.date));
            },

            delete: async id => {
                await this._ports.rnzNews.delete(id);

                this._events.emit('rnz-news-item-deleted', { id });
            }
        }
    }

    get bookmarks() {
        return {
            add: async bookmarkId => { 
                const newsItem = this._newsItems.get(bookmarkId);
                
                const bookmark = new Bookmark(newsItem.id, newsItem.title, newsItem.url, '');

                await this._ports.bookmarks.add(bookmark);

                this._events.emit('bookmark-added', bookmark);
            },
            list: () => {
                return this._ports.bookmarks.list();
            },
            del: async id => {
                await this._ports.bookmarks.del(id);
                this._events.emit('bookmark-deleted', { id });
            }
        }
    }

    get deletedItems() {
        return {
            count: () => { 
                return this._ports.deletedItems.count().
                    then(result => {
                        this._events.emit('deleted-item-count-changed', { count: result });
                    
                        return result;
                    });
            },
        }
    }

    now() { return new Date(); }

    isToggledOn(toggleName) {
        return this._toggles.get(toggleName);
    }

    onAny(handler) { this._events.on('*', handler); }
    on(name, handler) { 
        const names = Array.isArray(name) ? name : [ name ];

        names.forEach(n => this._events.on(n, handler)); 
    }
    notify(id, data) {
        this._events.emit(id, data);
    }
    
    _save(newsItems) {
        this._newsItems.addAll(newsItems);
    }
}

module.exports.Application = Application
module.exports.Ports = Ports