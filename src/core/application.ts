import { State }          from './internal/state';
import { EventEmitter }   from 'events';
import { Ports }          from './ports';
import { Bookmark }       from './bookmark';
import { Toggle }         from './toggle';
import { Toggles }        from './toggles';
import { ToggleSource }   from './toggle-source';
import { WeatherUseCases} from './internal/use-cases/weather-use-cases';
import { NewsUseCases }   from './internal/use-cases/news-use-cases';

export interface Statistics {
  lastUpdateAt?: Date
}

export interface Options {
  allowStats: boolean
}

export class Application {
  private _ports: Ports;
  private _events: CustomEventEmitter;
  private _log: any;
  private _settings: any;
  private _state: State;
  private _toggles: Toggles;
  private _togglesLoaded: boolean = false;
  private _toggleSource: ToggleSource;
  private _pollingTask: NodeJS.Timeout;
  private _statsTask: NodeJS.Timeout
  private _stats: Statistics;

  constructor(ports: Ports, settings: any = null, opts: Options = { allowStats: false }) {
    this._ports = ports;
    this._events = new CustomEventEmitter(ports.log);
    this._log = ports.log;
    this._settings = settings;
    this._state = new State(this._events);
    this._stats = {};

    this._toggles = {  
      showDeleted:        { name: 'show-deleted'        , isOn: false },
      showBlocked:        { name: 'show-blocked'        , isOn: true  },
      showBookmarks:      { name: 'show-bookmarks'      , isOn: false },
      showMarineWeather:  { name: 'show-marine-weather' , isOn: false }
    };

    this._toggleSource = ports.toggles;

    if (opts.allowStats === true) {
      //[i] https://stackoverflow.com/questions/50372866/mocha-not-exiting-after-test
      this._statsTask = setInterval(async () => {
        this._events.emit('stats', this._stats);
      }, 5*1000);
    }
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
        let newsItems = await this.news.list(
          () => this._ports.lobsters.list(), 
          this._ports.seive, 
          this._ports.blockedHosts, 
          await this.togglesList());

        this._state.lobsters = newsItems;

        this._stats.lastUpdateAt = new Date();

        return this._state.lobsters;
      },
      delete: async id => {
        await this.news.delete(id);
        this._events.emit('lobsters-item-deleted', { id });
      },
      remove: async id => {
        await this.news.remove(id);
      },
      snooze: id => {
        this._events.emit('lobsters-item-snoozed', { id });
        return Promise.resolve();
      }
    }
  }

  get news(): NewsUseCases { return new NewsUseCases(this._ports, this._state, this._ports.blockedHosts, this._events); }

  get hackerNews() {
    return {
      list: async () => {
        let newsItems = await this.news.list(() => this._ports.hackerNews.list(), this._ports.seive, this._ports.blockedHosts, await this.togglesList());

        newsItems = newsItems.map(it => it.labelled('hn'));

        this._state.hackerNewsItems.set(newsItems);

        this._events.emit('hacker-news-items-loaded', { items: newsItems });

        this._stats.lastUpdateAt = new Date();

        return newsItems;
      },
      delete: async id => {
        await this.news.delete(id);
        this._events.emit('hacker-news-item-deleted', { id });
      },
      remove: async id => {
        await this.news.remove(id);
      }
    }
  }

  get youtube() {
    return {
      list: async () => {
        let newsItems = await this.news.list(
          () => this._ports.youtube.list({ channelId: 'UCJquYOG5EL82sKTfH9aMA9Q' }), 
          this._ports.seive, 
          this._ports.blockedHosts, 
          await this.togglesList());

        newsItems = newsItems.map(it => it.labelled('youtube'));

        this._state.youtubeNewsItems.set(newsItems);

        this._events.emit('youtube-news-items-loaded', { items: newsItems });

        this._stats.lastUpdateAt = new Date();

        return newsItems;
      },
      delete: async id => {
        await this.news.delete(id);
        this._events.emit('youtube-news-item-deleted', { id });
      },
      remove: async id => {
        await this.news.remove(id);
      }
    }
  }

  get bookmarks() {
    return {
      add: async bookmarkId => {
        const newsItem = this._state.hackerNewsItems.get(bookmarkId) || this._state.lobstersNewsItems.get(bookmarkId);

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
      save: async (toggle: Toggle) => {
        await this.ensureTogglesLoaded();

        const key = Object.keys(this._toggles).find(k => this._toggles[k].name === toggle.name) || toggle.name;
        
        this._toggles[key] = toggle;

        this._events.emit('toggle-saved', { toggle: toggle });
      },
      list: async () : Promise<Toggles> => {
        await this.ensureTogglesLoaded();

        return Promise.resolve(this._toggles);
      },
      get: async (name: string) : Promise<boolean> => {
        await this.ensureTogglesLoaded();
        return this.toggle(name).isOn;
      }
    }
  }

  get weather(): WeatherUseCases { return new WeatherUseCases(this._ports.weather, this._events); }

  now() { return new Date(); }

  isToggledOn(toggleName) {
    return this.toggle(toggleName).isOn;
  }

  private toggle(name: string) : Toggle {
    return { name: name, isOn: this._toggleSource.get(name) };
  }

  private async togglesList() : Promise<Toggles> {
    await this.ensureTogglesLoaded();

    return this._toggles; 
  }

  private async ensureTogglesLoaded() {
    if (!this._togglesLoaded) {
      const list = await this._toggleSource.list();
      
      if (list) {
        this._toggles = list;
      }

      this._togglesLoaded = true;
    }
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