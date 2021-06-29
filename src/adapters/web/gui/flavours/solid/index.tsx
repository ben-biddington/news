import { createEffect, createMemo, createSignal, onMount } from "solid-js";
import { render } from "solid-js/web";
import { Bookmark } from "../../../../../core/bookmark";
import { NewsItem, ageSince } from "../../../../../core/news-item";
import { format } from 'date-fns';
import { Statistics, Application as Core } from '../../../../../core/application';
export type Props = { 

}

type UIOptions = { showMarineWeather: boolean }

const Application = (props: Props) => {
  //@ts-ignore
  const application: Core = window.application;

  const [uiOptions, setUiOptions]               = createSignal<UIOptions>({ showMarineWeather: false });
  const [bookmarks, setBookmarks]               = createSignal<Bookmark[]>([]);
  const [lobstersNews, setLobstersNews]         = createSignal<NewsItem[]>([]);
  const [hackerNews, setHackerNews]             = createSignal<NewsItem[]>([]);
  const [deletedItemCount, setDeletedItemCount] = createSignal(0);
  const [stats, setStats]                       = createSignal<Statistics>({ lastUpdateAt: new Date() });

  const leftColumnClass   = uiOptions().showMarineWeather ? 'col-sm-7' : 'col-12';
  const rightColumnClass  = uiOptions().showMarineWeather ? 'col-sm-5' : 'col-0';

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

    return Promise.all([
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
  });

  return <>
    <div>
      <div class="row">
        <div className={leftColumnClass}>
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

              <ol>
              {
                newsItems().map(item => (
                  <>
                    <li><button onClick={() => application.hackerNews.delete(item.id)}>del</button> {item.title} ({ageSince(item, now())})</li>
                  </>
                ))
              }
              </ol>
            {/* ${renderNews(newsItems, { onDelete: this.delete, onBookmark: this.bookmark, onBlock: this.block, onUnblock: this.unblock})} */}
            </div>
          </div>
        </div>
        <div class={rightColumnClass}>
          {/* ${this.windfinder()} */}
          {/* ${this.marineWeather()} */}
        </div>
      </div>
    </div>
    </>
};

render(() => <Application />, document.getElementById("application"));

module.exports.Application = Application;