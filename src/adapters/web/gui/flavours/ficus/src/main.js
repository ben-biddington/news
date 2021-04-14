import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'
import './weather';
import './toolbar';
import './menu';
import { render as renderNews } from './news-panel';

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
      bookmarks: [],
      uiOptions: {},
      stats: {},
      progress: []
    }
  },
  // [i] https://github.com/WebReflection/uhtml
  // [i] https://getbootstrap.com/docs/5.0/examples/headers/
  render () {
    const leftColumnClass   = this.state.uiOptions.showMarineWeather ? 'col-sm-7' : 'col-12';
    const rightColumnClass  = this.state.uiOptions.showMarineWeather ? 'col-sm-5' : 'col-0';

    return html`
      ${this.header()}

      <ficus-menu />

      <div id="application">
        <div class="row">
          <div class=${leftColumnClass}>
            <div class="row">
              <div class="col-12" style="text-align:right">
                <ficus-toolbar deleted-count=${this.state.deletedItems.count} bookmark-count=${this.state.bookmarks.length} />
              </div>
            </div>

            <div class="row">
              <div class="col-12" style="text-align:right">
              ${renderNews(this.news(),{ onDelete: this.delete, onBookmark: this.bookmark, onBlock: this.block, onUnblock: this.unblock})}
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
    console.log(`Blocking host <${host}>`);
    return window.application.news.block(host);
  },
  unblock(host) { 
    console.log(`Unblocking host <${host}>`);
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
                      <img width="670" src=${'/marine-weather/' + name} alt="Marine weather"/>
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
        [ 'wellington', 'titahi-bay', 'paekakariki' ].map(name =>
          html`
            <div class="row">
            </div>
          `
        )
      }
    `;
  },
  windfinder() {
    if (false === this.state.uiOptions.showMarineWeather)
      return html`<div class="row"></div>`;

    const sites = [
      {
        name: 'wellington',
      },
      {
        name: 'paekakariki_kapiti_coast',
        title: 'paekākāriki'
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
        console.log(JSON.stringify(this.state.uiOptions, null, 2));
      }
    );

    this.props.baseUrl = window.settings.get('baseUrl') || '';

    return Promise.all([
      this.loadToggles(),
      window.application.bookmarks.list().then(result => {
        this.setState(state => {
          return {...state, bookmarks: result };
        });
      }),
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
          showMarineWeather : toggles.showMarineWeather.isOn,
          showBlocked       : toggles.showBlocked.isOn
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