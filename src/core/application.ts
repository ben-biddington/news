const events = require('events');
const { NewsItems } = require('./news-items');
const { list: listNews } = require('./internal/use-cases/news/list');
import { EventEmitter } from 'events';
import { Ports } from './ports';
const { Bookmark } = require('./bookmark');
import { WeatherQuery, WeatherForecast } from './weather';

export class Application {
  _ports: Ports;
  _events: CustomEventEmitter;
  _log: any;
  _settings: any;
  _newsItems: any;
  _toggles: any;
  _toggleSource: any;
  _pollingTask: any;

  constructor(ports: Ports, toggles, settings) {
    this._ports = ports;
    this._events = new CustomEventEmitter(ports.log);
    this._log = ports.log;
    this._settings = settings;
    this._newsItems = new NewsItems();

    /* @todo: consolidate the `toggles` arg and `ports.toggles` */
    this._toggles = toggles;
    this._toggleSource = ports.toggles;
  }

  pollEvery(milliseconds) {
    this._log(`[application] polling frequency set to <${milliseconds}ms>`);

    this._pollingTask = setInterval(async () => {
      await Promise.all([
        this.lobsters.list(),
        this.hackerNews.list()
      ]);
    }, milliseconds);
  }

  stopPolling() {
    clearInterval(this._pollingTask);
  }

  get lobsters() {
    return {
      list: async () => {
        const newsItems = await listNews(() => this._ports.lobsters.list(), this._ports.seive, this._toggles);

        this._newsItems.missing(newsItems).forEach(item => item.new = true);

        this._save(newsItems);

        this._events.emit('lobsters-items-loaded', { items: newsItems });

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

        this._events.emit('hacker-news-items-loaded', { items: newsItems });

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

        const all = await this._ports.bookmarks.list() || [];

        const alreadyExists = all.some(it => it.id === bookmarkId);

        if (!alreadyExists) {
          await this._ports.bookmarks.add(bookmark);

          this._events.emit('bookmark-added', bookmark);
        }
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

  get toggles() {
    return {
      save: toggle => {
        this._events.emit('toggle-saved', { toggle: toggle });
        return Promise.resolve();
      }
    }
  }

  get weather(): WeatherUseCases { return new WeatherUseCases(this._ports.weather, this._events); }

  now() { return new Date(); }

  isToggledOn(toggleName) {
    return this._toggles.get(toggleName);
  }

  setting(name) {
    return this._settings.get(name);
  }

  onAny(handler) { this._events.on('*', handler); }
  on(name, handler) {
    const names = Array.isArray(name) ? name : [name];

    names.forEach(n => this._events.on(n, handler));
  }
  notify(id, data) {
    this._events.emit(id, data);
  }

  _save(newsItems) {
    this._newsItems.addAll(newsItems);
  }
}

// https://stackoverflow.com/questions/5178869/listen-to-all-emitted-events-in-node-js
class CustomEventEmitter extends EventEmitter {
  private _log: any;

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

class WeatherUseCases {
  private weatherQuery: WeatherQuery;
  private events: EventEmitter;

  constructor(weatherQuery: WeatherQuery, events: EventEmitter) {
    this.weatherQuery = weatherQuery;
    this.events = events;
  }

  async sevenDays(): Promise<Array<WeatherForecast>> {
    const weather = await this.weatherQuery.sevenDays();

    this.events.emit('weather-loaded', { weather });

    return weather;
  }
}