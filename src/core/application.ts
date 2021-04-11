import { State }          from './internal/state';
import { EventEmitter }   from 'events';
import { Ports }          from './ports';
import { Bookmark }       from './bookmark';
import { Toggle }         from './toggle';
import { Toggles }        from './toggles';
import { ToggleSource }   from './toggle-source';
import { WeatherUseCases} from './internal/use-cases/weather-use-cases';
import { NewsUseCases }   from './internal/use-cases/news/news';

export class Application {
  private _ports: Ports;
  private _events: CustomEventEmitter;
  private _log: any;
  private _settings: any;
  private _state: State;
  private _toggles: Toggles;
  private _togglesLoaded: boolean = false;
  private _toggleSource: ToggleSource;
  private _pollingTask: any;

  constructor(ports: Ports, settings) {
    this._ports = ports;
    this._events = new CustomEventEmitter(ports.log);
    this._log = ports.log;
    this._settings = settings;
    this._state = new State();

    this._toggles = {  
      showDeleted:        { name: 'show-deleted'        , isOn: false },
      showBookmarks:      { name: 'show-bookmarks'      , isOn: false },
      showMarineWeather:  { name: 'show-marine-weather' , isOn: false }
    };

    this._toggleSource = ports.toggles; // This fetches toggles from somewhere external
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

  get news(): NewsUseCases { return new NewsUseCases(this._state, this._ports.blockedHosts, this._events); }

  get lobsters() {
    return {
      list: async () => {
        let newsItems = await this.news.list(
          () => this._ports.lobsters.list(), 
          this._ports.seive, 
          this._ports.blockedHosts, 
          await this.togglesList());

        newsItems = newsItems.map(it => it.labelled('lobsters'));

        this._state.lobstersNewsItems.missing(newsItems).forEach(item => item.new = true);

        this._state.lobstersNewsItems.merge(newsItems);

        this._events.emit('lobsters-items-loaded', { items: newsItems });

        return newsItems;
      },
      delete: async id => {

        await this._ports.lobsters.delete(id);

        //@todo: consider removing from state, too? What are the implications for `show-deleted`, though.

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
        let newsItems = await this.news.list(() => this._ports.hackerNews.list(), this._ports.seive, this._ports.blockedHosts, await this.togglesList());

        newsItems = newsItems.map(it => it.labelled('hn'));

        this._state.hackerNewsItems.merge(newsItems);

        this._events.emit('hacker-news-items-loaded', { items: newsItems });

        return newsItems;
      },

      delete: async id => {

        await this._ports.hackerNews.delete(id);

        //@todo: consider removing from state, too? What are the implications for `show-deleted`, though.

        this._events.emit('hacker-news-item-deleted', { id });
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