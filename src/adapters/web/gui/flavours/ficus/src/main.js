import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'
import './weather';
import './bin';
import './menu';
import { render } from './news-panel';

/* [i] withStyles fails with:

Uncaught TypeError: this._processStyle(...).then is not a function
    _injectStyles webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    created webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    _init webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    _checkInit webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    connectedCallback webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    createComponent webpack://[name]/./node_modules/ficusjs/dist/index.js?:13
    <anonymous> webpack://[name]/./src/adapters/web/gui/flavours/ficus/src/main.js?:9
    js http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:131
    __webpack_require__ http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:30
    <anonymous> http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:94
    <anonymous> http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:97
    webpackUniversalModuleDefinition http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:9
    <anonymous> http://localhost:8080/assets/dist/adapters.web.ficus.bundle.js:10

*/

createComponent('ficus-application', {
  renderer,
  props: {
    baseUrl : '' 
  },
  state () {
    return { 
      lobstersNews: [],
      hackerNews: [],
      weather: [],
      deletedItems: {
        count: 0
      },
      uiOptions: {},
      stats: {},
      progress: []
    }
  },
  styles () {
    console.log('Applying style');
    return `
      .mdc-data-table {
        background-color: #fff;
        background-color: var(--mdc-theme-surface, #fff);
        border-radius: 4px;
        border-width: 1px;
        border-style: solid;
        border-color: rgba(0, 0, 0, 0.12);
        display: inline-flex;
        flex-direction: column;
        box-sizing: border-box;
        overflow-x: auto;
      }

      .mdc-data-table__header-cell {
        color: rgba(0, 0, 0, 0.87);
      }

      .mdc-data-table__table {
        white-space: nowrap;
        border-collapse: collapse;
      }
      .mdc-data-table__cell {
        font-family: Roboto, sans-serif;
        font-size: 0.875rem;
        line-height: 1.25rem;
        font-weight: 400;
        letter-spacing: 0.0178571429em;
        text-transform: inherit;
      }
      `
  },
  // [i] https://github.com/WebReflection/uhtml
  // [i] https://getbootstrap.com/docs/5.0/examples/headers/
  render () {
    const weatherProps = JSON.stringify(this.state.weather, null, 2); /* https://github.com/ficusjs/ficusjs/blob/master/src/component.js#L182 */

    return html`
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a class="navbar-brand" href="#">News</a>
        <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item dropdown">
              <div id="progress" style="padding:5px 5px 5px 0px;">${this.progress()}</div>
            </li>
          </ul>
          <ficus-weather weather=${weatherProps}/>
          <ficus-bin count=${this.state.deletedItems.count} />
        </div>
      </nav>

      <ficus-menu />

      <div id="application">
        ${render(this.news(),{ onDelete: this.delete, onBookmark: this.bookmark, onBlock: this.block, onUnblock: this.unblock})}
      </div>
      ${this.marineWeather()}
    `
  },
  block(host) { 
    console.log(`Blocking host <${host}>`);
    return window.application.news.block(host);
  },
  unblock(host) { 
    console.log(`Unblocking host <${host}>`);
    return window.application.news.unblock(host);
  },
  marineWeather() {
    if (false === this.state.uiOptions.showMarineWeather)
      return null;
    
      return [ 'wellington', 'titahi-bay', 'craps', 'riversdale-beach', 'the-cut' ].map(name =>
        html`
          <div class="marine-weather" style="float:left;">
            <table class="table table-hover">
              <thead>
                <tr>
                  <th role="columnheader" scope="col">${name}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><img src=${'/marine-weather/' + name}  alt="Marine weather"></td>
                </tr>
              </tbody>
            </table>
          </div>
        `
      );
  },
  progress() {
    if (this.state.progress.length === 0)
      return ' ';

    return new Array(this.state.progress.length).join('.');
  },
  news() {
    const result = this.state.lobstersNews.concat(this.state.hackerNews);

    result.sort((a,b) => new Date(a.date) < new Date(b.date));

    return result;
  },
  connectedCallback() {},
  async created () {
    window.application.on([ "stats-xxx" ], e => {
      console.log('stats', JSON.stringify(e, null, 2));
      this.setState(state => {
        return {...state, stats: e };
      });
    });

    window.application.onAny(e => {
      if (window.toggles.get('log-notifications')) {
        console.log('[notification]', JSON.stringify(e, null, 2));
      }

      this.setState(state => {
        if (state.progress.length > 50)
          return { ...state, progress: [ e ]}

        return { ...state, progress: [ ...state.progress, e ]}
      });
    });

    window.application.on([ "news-items-modified" ], e => {
      this.setState(state => {
        return {
          ...state, 
          lobstersNews: e.items.filter(item => item.label === 'lobsters'),
          hackerNews:   e.items.filter(item => item.label === 'hn'), };
      });
    });

    window.application.on([ "lobsters-items-loaded" ], e => {
      this.setState(state => {
        return {...state, lobstersNews: e.items };
      });
    });
    
    window.application.on([ "hacker-news-items-loaded" ], e => {
      this.setState(state => {
        return {...state, hackerNews: e.items };
      });
    });

    window.application.on(
      [ "lobsters-item-deleted", "lobsters-item-snoozed" ], 
      e => {
        this.setState(state => {
          return {...state, lobstersNews: state.lobstersNews.filter(it => it.id != e.id) };
        });
      }
    );

    window.application.on(
      [ "hacker-news-item-deleted", "hacker-news-item-snoozed" ], 
      e => {
        this.setState(state => ({...state, hackerNews: state.hackerNews.filter(it => it.id != e.id) }));
      }
    );

    window.application.on(
      [ "weather-loaded" ], 
      e => {
        this.setState(state => ({...state, weather: e.weather }));
      }
    );

    window.application.on(
      [ "hacker-news-item-deleted", "lobsters-item-deleted" ], 
      async _ => {
        const deletedCount = await window.application.deletedItems.count();
        this.setState(state => ({...state, deletedItems: { count: deletedCount } } ));
      }
    );

    window.application.on(
      [ "toggle-saved" ], 
      async e => {
        await this.loadToggles();
        console.log('Reloaded toggles', JSON.stringify(e, null, 2));
        console.log(JSON.stringify(this.state.uiOptions, null, 2));
      }
    );

    this.props.baseUrl = window.settings.get('baseUrl') || '';

    return Promise.all([
      this.loadToggles(),
      window.application.weather.sevenDays(),
      window.application.lobsters.list().
        then(result => {
          this.setState(state => {
            return {...state, lobstersNews: result.map(it => it.clone(item => item.label = 'lobsters')) };
          });
        }),
      window.application.hackerNews.list().
        then(result => {
          this.setState(state => {
            return {...state, hackerNews: result.map(it => it.clone(item => item.label = 'hn')) };
          });
        }),
      window.application.deletedItems.count().then(count => {
        this.setState(state => {
          return {...state, deletedItems: { count } };
        });
      })
    ]);
  },
  async loadToggles() {
    const toggles = await window.application.toggles.list();
    
    this.setState(state => {
        return {
        ...state, 
        uiOptions: {
          showDeleted       : toggles.showDeleted.isOn,
          showMarineWeather : toggles.showMarineWeather.isOn
        } 
      };
    });
  },
  pop() {
    this.setState(state => ({...state, clicks: state.clicks + 1 }));
  },
  delete(id) {
    console.log(`Deleting <${id}>`);
    window.application.lobsters.delete(id);
    window.application.hackerNews.delete(id);
  },
  bookmark(id) {
    console.log(`Bookmarking <${id}>`);
    window.application.bookmarks.add(id);
  }
})