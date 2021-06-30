import { createEffect,  createMemo, createSignal, onMount, Show } from "solid-js";
import { render } from "solid-js/web";
import { Bookmark } from "../../../../../core/bookmark";
import { NewsItem, ageSince } from "../../../../../core/news-item";
import { format } from 'date-fns';
import { Statistics, Application as Core } from '../../../../../core/application';
import { NewsPanel } from './components/NewsPanel';
import { MarineWeatherPanel } from './components/MarineWeatherPanel';

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
    application.on([ "stats" ]                    , setStats);

    const loadToggles = async (): Promise<void> => {
      const toggles       = await application.toggles.list();
  
      setUiOptions({
        showMarineWeather:  toggles.showMarineWeather.isOn,
        showBookmarks:      toggles.showBookmarks.isOn,
      })
    }

    return Promise.all([
      loadToggles(),
      application.bookmarks.list().then(setBookmarks),
      application.weather.sevenDays(),
      application.lobsters.list(),
      application.hackerNews.list(),
      application.youtube.list(),
      application.deletedItems.count().then(setDeletedItemCount)
    ])
  });

  const newsItems = createMemo<NewsItem[]>(news);

  const now = createMemo(() => application.now()); 

  createEffect(() => {
    //@ts-ignore
    document.title = newsItems().length > 0 ? `News (${newsItems().length})`: 'News'

    console.log('[showMarineWeather]', uiOptions().showMarineWeather);
  });

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
              <p>There are {newsItems().length} news items</p>
              <p>Last updated: {format(stats().lastUpdateAt, 'HH:mm')}</p>

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
        <div class={rightColumnClass()}>
          <Show when={uiOptions().showMarineWeather} children={<MarineWeatherPanel />} />
        </div>
      </div>
    </div>
    </>
};

render(() => <Application />, document.getElementById("application"));

module.exports.Application = Application;