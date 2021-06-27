import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'
import './weather';
import './toolbar';
import './menu';
import './bookmarks';
import './image';
import * as Plot from "@observablehq/plot";

import { render as renderNews } from './news-panel';
import { athletes } from './athletes';

createComponent('ficus-application', {
  renderer,
  props: {
    baseUrl : '' 
  },
  state () {
    return { 
      lobstersNews: [],
      hackerNews: [],
      youtube: [],
      weather: [],
      deletedItems: {
        count: 0
      },
      bookmarks: [],
      uiOptions: {
        showDeleted       : false,
        showMarineWeather : false,
        showWindFinder    : false,
        showBlocked       : false,
        showBookmarks     : false
      },
      stats: { lastUpdateAt: new Date() },
      progress: []
    }
  },
  // [i] https://github.com/WebReflection/uhtml
  // [i] https://getbootstrap.com/docs/5.0/examples/headers/
  render () {
    const leftColumnClass   = this.state.uiOptions.showMarineWeather ? 'col-sm-7' : 'col-12';
    const rightColumnClass  = this.state.uiOptions.showMarineWeather ? 'col-sm-5' : 'col-0';

    const newsItems = this.news();

    document.title = newsItems.length > 0 ? `News (${newsItems.length})`: 'News';

    return html`
      ${this.header()}

      <ficus-menu />

      <div id="application">
        <div class="row">
          <div class=${leftColumnClass}>
            <div class="row">
              <div class="col-12" style="text-align:right">
                <ficus-toolbar 
                  deleted-count=${this.state.deletedItems.count} 
                  bookmark-count=${this.state.bookmarks.length} 
                  last-updated=${this.state.stats.lastUpdateAt} />
              </div>
            </div>

            <div class="row">
              <div class="col-12" style="text-align:right">
                ${this.renderBookmarks()}
              </div>
            </div>

            <div class="row">
              <div class="col-12" style="text-align:right">
              ${renderNews(newsItems, { onDelete: this.delete, onBookmark: this.bookmark, onBlock: this.block, onUnblock: this.unblock})}
              </div>
            </div>
          </div>
          <div class=${rightColumnClass}>
            ${this.windfinder()}
            ${this.marineWeather()}
          </div>
        </div>
      </div>
    `
  },
  renderBookmarks() {
    if (this.state.uiOptions.showBookmarks) {
      return html`<ficus-bookmarks bookmarks=${JSON.stringify(this.state.bookmarks)} />`
    }
  },
  plot() {
    // https://github.com/observablehq/plot
    // https://observablehq.com/@observablehq/plot
    const svg = Plot.dot(athletes(), { width: 300, height: 300, x: "weight", y: "height", stroke: "sex"}).plot();

    svg.setAttribute('width', 300);
    svg.setAttribute('height', 300);
    svg.setAttribute('viewbox', '0 0 300 300');
    
    return svg;
  },
  news() {
    const result = this.state.lobstersNews.
      concat(this.state.hackerNews).
      concat(this.state.youtube);

    result.sort((a,b) => new Date(a.date) < new Date(b.date));

    return result;
  },
  header() {
    const weatherProps = JSON.stringify(this.state.weather, null, 2); /* Object props must be serialised: https://github.com/ficusjs/ficusjs/blob/master/src/component.js#L182 */

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
        </div>
      </nav>
    `;
  },
  block(host) { 
    return window.application.news.block(host);
  },
  unblock(host) { 
    return window.application.news.unblock(host);
  },
  marineWeather() {
    if (this.state.uiOptions.showMarineWeather) {
      return html`
        ${
          [ 'wellington', 'titahi-bay', 'paekakariki' ].map(name =>
            html`
              <div class="row" style="margin-bottom:2px">
                <div class="col">
                  <div class="card">
                    <div class="card-header"><strong><a target="_blank" href=${'https://www.marineweather.co.nz/forecasts/' + name}>${name}</a></strong></div>
                    <div class="card-body" style="text-align:center">
                      <ficus-img width="670" height="537" src=${'/marine-weather/' + name} alt="Marine weather" disabled="false" />
                    </div>
                  </div>
                </div>
              </div>
            `
          )
        }
      `;
    }
    return html`
      ${
        [ 'wellington', 'titahi-bay', 'paekakariki' ].map(_ =>
          html`
            <div class="row">
            </div>
          `
        )
      }
    `;
  },
  windfinder() {
    if (false === this.state.uiOptions.showWindFinder)
      return html`<div class="row"></div>`;

    const sites = [
      {
        name: 'wellington',
        title: 'Wellington'
      },
      {
        name: 'paekakariki_kapiti_coast',
        title: 'Paekākāriki'
      },
      {
        name: 'Bellambi'
      },
      {
        name:'jan-juc',
        title: 'Jan Juc'
      }
    ];
    return html`
      ${
        sites.map(site => 
          {
            const { name, title = name} = site;

            return html`
              <div class="row" style="margin-bottom:2px">
                <div class="col">
                  <div class="card">
                    <div class="card-header">
                      <strong><a target="_blank" href=${'https://www.windfinder.com/forecast/' + name}>${title}</a></strong>
                    </div>
                    <div class="card-body" style="text-align:center">
                      ${[1, 2].map(i => {
                        const url = `/windfinder/${name}?day=${i}`;
                          
                        return html`<img src=${url} alt="Windfinder" />`;
                      })}
                    </div>
                  </div>
                </div>
              </div>
              `
          }
      ).flat()}
    `
  },
  progress() {
    if (this.state.progress.length === 0)
      return ' ';

    return new Array(this.state.progress.length).join('.');
  },
  mounted() {
    // [i] Doing this only once because `ficus-toolbar` is always mounted exactly once.
    // This is balls: https://coryrylan.com/blog/using-event-decorators-with-lit-element-and-web-components
    const toolbarPanel = document.querySelector('ficus-toolbar');

    toolbarPanel.addEventListener('toggleBookmarks', e => {
      return this.toggleBookmarks();
    });
  },
  updated() {
    // [i] Doing this every time because rather than toggle display in `ficus-bookmarks`, we either add it or not
    // from `main.js` here. This simplifies `ficus-bookmarks` but means we have to reattach handlers like this.
    // This is balls: https://coryrylan.com/blog/using-event-decorators-with-lit-element-and-web-components
    const bookmarksPanel = document.querySelector('ficus-bookmarks');

    if (bookmarksPanel) {
      bookmarksPanel.addEventListener('onDelete', e => {
        return this.deleteBookmark(e.detail.id);
      });
    }
  },
  async created () {
    window.application.on([ "stats" ], e => {
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
          hackerNews:   e.items.filter(item => item.label === 'hn'), 
          youtube:      e.items.filter(item => item.label === 'youtube')
        };
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

    window.application.on([ "youtube-news-items-loaded" ], e => {
      this.setState(state => {
        return {...state, youtube: e.items };
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
      [ "youtube-news-item-deleted", "youtube-news-item-snoozed" ], 
      e => {
        this.setState(state => ({...state, youtube: state.youtube.filter(it => it.id != e.id) }));
      }
    );

    window.application.on(
      [ "weather-loaded" ], 
      e => {
        this.setState(state => ({...state, weather: e.weather }));
      }
    );

    window.application.on(
      [ "hacker-news-item-deleted", "lobsters-item-deleted", "youtube-news-item-deleted" ], 
      async _ => {
        const deletedCount = await window.application.deletedItems.count();
        this.setState(state => ({...state, deletedItems: { count: deletedCount } } ));
      }
    );

    window.application.on(
      [ "toggle-saved" ], 
      async e => {
        await this.loadToggles();
        console.log(JSON.stringify(this.state.uiOptions, null, 2));
      }
    );

    window.application.on([ "bookmark-deleted" ], deleted => {
      this.setState(state => {
        return {...state, bookmarks: [...state.bookmarks.filter(it => it.id !== deleted.id)] };
      });
    });

    window.application.on([ "bookmark-added" ], bookmark => {
      this.setState(state => {
        return {...state, bookmarks: [...state.bookmarks, bookmark] };
      });
    });

    this.props.baseUrl = window.settings.get('baseUrl') || '';

    return Promise.all([
      this.loadToggles(),
      window.application.bookmarks.list().then(result => {
        this.setState(state => {
          return {...state, bookmarks: result };
        });
      }),
      window.application.weather.sevenDays(),
      window.application.lobsters.list(),
      window.application.hackerNews.list(),
      window.application.youtube.list(),
      window.application.deletedItems.count().then(count => {
        this.setState(state => {
          return {...state, deletedItems: { count } };
        });
      })
    ]);
  },
  async loadToggles() {
    const toggles       = await window.application.toggles.list();
    const showBookmarks = await window.application.toggles.get('show-bookmarks');

    this.setState(async state => {
        return {
        ...state, 
        uiOptions: {
          showDeleted       : toggles.showDeleted.isOn,
          showMarineWeather : toggles.showMarineWeather.isOn,
          showWindFinder    : toggles.showwindFinder.isOn,
          showBlocked       : toggles.showBlocked.isOn,
          showBookmarks     : showBookmarks,
        } 
      };
    });
  },
  pop() {
    this.setState(state => ({...state, clicks: state.clicks + 1 }));
  },
  async delete(id) {
    await window.application.lobsters.delete(id);
    await window.application.hackerNews.delete(id);
  },
  bookmark(id) {
    return window.application.bookmarks.add(id);
  },
  deleteBookmark(id) {
    return window.application.bookmarks.del(id);
  },
  toggleBookmarks() {
    this.setState(state => {
      return {
        ...state, 
        uiOptions: 
        {
          ...state.uiOptions,
          showBookmarks: false === state.uiOptions.showBookmarks
        } 
      };
    });
  }
})