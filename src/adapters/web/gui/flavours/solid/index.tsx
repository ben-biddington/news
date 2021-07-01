import { batch, createEffect,  createMemo, createSignal, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { Bookmark } from "../../../../../core/bookmark";
import { NewsItem } from "../../../../../core/news-item";
import { WeatherForecast } from "../../../../../core/weather";
import { Statistics, Application as Core } from '../../../../../core/application';
import { NewsPanel } from './components/NewsPanel';
import { MarineWeatherPanel } from './components/MarineWeatherPanel';
import { Weather } from './components/Weather';
import { Toolbar } from './components/Toolbar';
import { BookmarksPanel } from './components/BookmarksPanel';

type UIOptions = { 
  showMarineWeather: boolean,
  showBookmarks: boolean
}

const Application = () => {
  //@ts-ignore
  const application: Core = window.application;

  const [uiOptions, setUiOptions]               = createSignal<UIOptions>({ showMarineWeather: false, showBookmarks: false });
  const [bookmarks, setBookmarks]               = createSignal<Bookmark[]>([]);
  const [lobstersNews, setLobstersNews]         = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews]             = createSignal<NewsItem[]>([]);
  const [deletedItemCount, setDeletedItemCount] = createSignal(0);
  const [stats, setStats]                       = createSignal<Statistics>({ lastUpdateAt: new Date() });
  const [weather, setWeather]                   = createSignal<WeatherForecast[]>([]);
  const leftColumnClass   = createMemo(() => uiOptions().showMarineWeather ? 'col-sm-7' : 'col-12');
  const rightColumnClass  = createMemo(() => uiOptions().showMarineWeather ? 'col-sm-5' : 'col-0');

  const news = () => {
    const result: NewsItem[] = lobstersNews().concat(hackerNews());

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  onMount(() => {
    application.on([ 'news-items-modified' ], e => {
      setLobstersNews (e.items.filter(item => item.label === 'lobsters'));
      setHackerNews   (e.items.filter(item => item.label === 'hn'));
    });

    application.on([ "lobsters-items-loaded" ]    , e => setLobstersNews(e.items));
    application.on([ "hacker-news-items-loaded" ] , e => setHackerNews(e.items));
    application.on([ "lobsters-item-deleted" ]    , e => setLobstersNews(lobstersNews().filter(it => it.id != e.id)));
    application.on([ "hacker-news-item-deleted" ] , e => setHackerNews(hackerNews().filter(it => it.id != e.id)));
    application.on([ "stats" ]                    , e => setStats(old => ( {...old, lastUpdateAt: new Date(e.lastUpdateAt), intervals: e.intervals} ) ));
    application.on(
      [ "hacker-news-item-deleted", "lobsters-item-deleted", "youtube-news-item-deleted" ], 
      () => application.deletedItems.count().then(setDeletedItemCount)
    );
    application.on([ "bookmark-deleted" ]         , deleted   => setBookmarks(old => old.filter(it => it.id !== deleted.id)));
    application.on([ "bookmark-added" ]           , bookmark  => setBookmarks(old => [...old, bookmark]));

    const loadToggles = async (): Promise<void> => {
      const toggles       = await application.toggles.list();
  
      setUiOptions({
        showMarineWeather:  toggles.showMarineWeather.isOn,
        showBookmarks:      toggles.showBookmarks.isOn,
      })
    }

    return batch(() => Promise.all([
      loadToggles(),
      application.bookmarks.list().then(setBookmarks),
      application.weather.sevenDays().then(setWeather),
      application.lobsters.list(),
      application.hackerNews.list(),
      application.deletedItems.count().then(setDeletedItemCount)
    ]))
  });

  const newsItems = createMemo<NewsItem[]>(news);
  const now = createMemo(() => application.now()); 

  createEffect(() => {
    //@ts-ignore
    document.title = newsItems().length > 0 ? `News (${newsItems().length})`: 'News';
  });

  const toggleBookmarks = () => setUiOptions(opts => ({ ...opts, showBookmarks: !opts.showBookmarks }));

  return <>
    <div>
      <div class="row">
        <div className={leftColumnClass()}>
          <div class="row">
            <div class="col-12" style="text-align:right">
            </div>
          </div>

          <div class="row">
            <div class="col-12" style="text-align:right">
              {/* ${this.renderBookmarks()} */}
            </div>
          </div>

          <div class="row">
            <div class="col-12">
              <div class="row">
                <div class="col-6">
                  <div class="row">
                    <div class="col-12">
                    <a href="javascript:void(0)" 
                      class={uiOptions().showMarineWeather ? 'badge badge-success' : 'badge badge-primary'} 
                      onclick={() => setUiOptions(opts => ({ ...opts, showMarineWeather: !opts.showMarineWeather }))}>marine weather</a>
                    </div>
                  </div>
                </div>
                <div class="col-6">
                  <Weather forecasts={weather()} />
                </div>
              </div>
              <div class="row">
                <div class="col-12">
                  <div class="row">
                    <div class="col-12">
                      <Toolbar 
                        lastUpdated={stats().lastUpdateAt} 
                        bookmarkCount={bookmarks().length} 
                        deletedCount={deletedItemCount()} 
                        onTogglebookmarks={toggleBookmarks} />
                    </div>
                  </div>

                  <div class="row">
                    <div class="col-12">
                      <Show when={uiOptions().showBookmarks} children={
                        <BookmarksPanel onDelete={application.bookmarks.del} bookmarks={bookmarks()
                      }/> } />
                      
                      <NewsPanel
                        news={newsItems()} 
                        now={now()} 
                        onDelete={application.hackerNews.delete} 
                        onBlock={application.news.block}
                        onUnblock={application.news.unblock}
                        onBookmark={application.bookmarks.add} /> 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class={rightColumnClass()}>
          <Show when={uiOptions().showMarineWeather} children={<MarineWeatherPanel />} />
        </div>
      </div>
    </div>
    </>
};

render(() => <Application />, document.getElementById("application"));

module.exports.Application = Application;