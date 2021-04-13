import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'
import './weather';
import './bin';
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
      uiOptions: {},
      stats: {},
      progress: []
    }
  },
  // [i] https://github.com/WebReflection/uhtml
  // [i] https://getbootstrap.com/docs/5.0/examples/headers/
  render () {
    return html`
      ${this.header()}

      <ficus-menu />

      <div id="application">
        ${renderNews(this.news(),{ onDelete: this.delete, onBookmark: this.bookmark, onBlock: this.block, onUnblock: this.unblock})}
        ${this.marineWeather()}
      </div>
    `
  },
  header() {
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
        <div id="marine-weather" class="row mt-2">
          ${
            [ 'wellington', 'titahi-bay', 'craps', 'riversdale-beach', 'the-cut' ].map(name =>
              html` 
                <div class="col-sm-6">
                  <div class="card">
                    <div class="card-header"><strong>${name}</strong></div>
                    <div class="card-body">
                      <img src=${'/marine-weather/' + name}  alt="Marine weather">
                    </div>
                  </div>
                </div>
              `
            )
          }
        </div>
      `;
    }
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