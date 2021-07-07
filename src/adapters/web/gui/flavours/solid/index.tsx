import { batch, createEffect, createMemo, createSignal, onMount, For, Show } from "solid-js";
import { render } from "solid-js/web";
import { Bookmark } from "../../../../../core/bookmark";
import { NewsItem } from "../../../../../core/news-item";
import { WaterTemperature } from "../../../../../core/weather";
import { WeatherForecast } from "../../../../../core/weather";
import { Statistics, Application as Core } from '../../../../../core/application';
import { NewsPanel } from './components/NewsPanel';
import { MarineWeatherPanel } from './components/MarineWeatherPanel';
import { Weather } from './components/Weather';
import { Toolbar } from './components/Toolbar';
import { BookmarksPanel } from './components/BookmarksPanel';
import { HttpLiveStreamingRadio } from './components/radio/HttpLiveStreamingRadio';

type UIOptions = { 
  showMarineWeather: boolean,
  showBookmarks: boolean
}

const Application = () => {
  //@ts-ignore
  const application: Core = window.application;
  const [itemDeleted, setItemDeleted]           = createSignal<boolean>();
  const [uiOptions, setUiOptions]               = createSignal<UIOptions>({ showMarineWeather: false, showBookmarks: false });
  const [bookmarks, setBookmarks]               = createSignal<Bookmark[]>([]);
  const [lobstersNews, setLobstersNews]         = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews]             = createSignal<NewsItem[]>([]);
  const [deletedItemCount, setDeletedItemCount] = createSignal(0);
  const [stats, setStats]                       = createSignal<Statistics>({ lastUpdateAt: new Date() });
  const [weather, setWeather]                   = createSignal<WeatherForecast[]>([]);
  const [seaTemp, setSeaTemp]                   = createSignal<WaterTemperature[]>([]);
  const [loading, setLoading]                   = createSignal();

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
      () => {
        setItemDeleted(true);
        application.deletedItems.count().then(setDeletedItemCount);
      }
    );
    application.on([ "bookmark-deleted" ]         , deleted   => setBookmarks(old => old.filter(it => it.id !== deleted.id)));
    application.on([ "bookmark-added" ]           , bookmark  => setBookmarks(old => [...old, bookmark]));

    const loadToggles = async (): Promise<void> => {
      const toggles       = await application.toggles.list();
  
      console.log('Setting UI options');

      setUiOptions({
        showMarineWeather:  toggles.showMarineWeather.isOn,
        showBookmarks:      toggles.showBookmarks.isOn,
      })
    }

    return batch(() => Promise.all([
      loadToggles(),
      application.bookmarks.list().then(setBookmarks),
      application.weather.sevenDays().then(setWeather),
      application.weather.seaTemperature().then(setSeaTemp),
      loadNews(),
      application.deletedItems.count().then(setDeletedItemCount)
    ]))
  });

  const loadNews = async (): Promise<any> => {
    setLoading(true);

    await Promise.all([
      application.lobsters.list(),
      application.hackerNews.list()
    ]);

    setLoading(false);
  }

  const newsItems = createMemo<NewsItem[]>(news);
  const now = createMemo(() => application.now()); 

  createEffect(() => {
    //@ts-ignore
    document.title = newsItems().length > 0 ? `News (${newsItems().length})`: 'News';
  });

  createEffect(() => {
    console.log(JSON.stringify(uiOptions(), null, 2));
  });

  const toggleBookmarks = () => setUiOptions(opts => ({ ...opts, showBookmarks: !opts.showBookmarks }));

  return <>
    <div class="container-fluid">
      <div class="row">
        <div className="col-sm-8">
          
          <div class="row justify-content-center">
            <div id="info" class={`${!loading() ? 'loaded': ''} alert w-25 alert-primary justify-content-center`} role="alert">
              loading
            </div>
          </div>
          
          <div class="row">
            <div class="col-12">
              <div class="row">
                <div class="col-4">
                  <div class="row">
                    <div class="col-12">
                      &nbsp;
                    </div>
                  </div>
                </div>
                <div class="col-4">
                  {/* <Show when={itemDeleted()} children={<span class="fadeOut badge badge-pill badge-primary">Primary</span>} /> */}
                </div>
                <div class="col-4">
                  &nbsp;
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
                        onTogglebookmarks={toggleBookmarks} 
                      />
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
                        onBookmark={application.bookmarks.add}
                        onReload={loadNews} /> 
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="col-sm-4 border-left border-right">
          <div class="row p-2">
            <div class="btn-group shadow-sm flex-fill" role="group">
              <HttpLiveStreamingRadio title="RNZ" playlistUrl="https://radionz.streamguys1.com/national/national/playlist.m3u8" />
              <HttpLiveStreamingRadio title="George FM" playlistUrl="https://livestream.mediaworks.nz/radio_origin/george_128kbps/playlist.m3u8" />
              <HttpLiveStreamingRadio title="Hauraki" playlistUrl="https://ais-nzme.streamguys1.com/nz_009/playlist.m3u8" />
              <HttpLiveStreamingRadio title="Active" playlistUrl="https://radio123-gecko.radioca.st/radioactivefm" />
            </div>
          </div>
          <div class="p-2" style="min-height:700px">
            <Weather forecasts={weather()} today={new Date()} link="https://www.metservice.com/towns-cities/locations/wellington/7-days" />
          </div>
          <div class="row p-2 justify-content-center">
            <div class="m-2 water-temp">
              <ul class="list-group list-group-horizontal">
                <For each={seaTemp()} children={
                  (temp: WaterTemperature): Element => {
                    return <>
                      <li class="list-group-item">
                        <span style="width: 16px">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-thermometer-half" viewBox="0 0 16 16">
                            <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V6.5a.5.5 0 0 1 1 0v4.585a1.5 1.5 0 0 1 1 1.415z"/>
                            <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
                          </svg>
                          {temp.name} {temp.temperature}°C
                        </span>
                      </li>
                    </>
                  }
                } />
              </ul>
            </div>
            <Show when={uiOptions().showMarineWeather} children={<MarineWeatherPanel />} />
          </div>
        </div>
      </div>
    </div>
    </>
};

render(() => <Application />, document.getElementById("application"));

module.exports.Application = Application;