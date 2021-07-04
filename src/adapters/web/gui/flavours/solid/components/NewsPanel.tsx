import { createSignal, For, mergeProps } from "solid-js";

import { ageSince, NewsItem } from '../../../../../../core/news-item';

type Props = {
  news: NewsItem[];
  onDelete?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onBlock?: (host: string) => void;
  onUnblock?: (host: string) => void;
  now: Date;
}

const sourceIcon = item => {
  // https://fsymbols.com/generators/smallcaps/
  const labels = {
    hn:       '🅷',
    lobsters: '🅻',
    youtube:  '🅨'
  }

  return labels[item.label];
}

export const NewsPanel = (props: Props) => {
  const [isLoaded, setLoaded] = createSignal<boolean>(false);

  props = mergeProps({ news: []}, props);

  const controls = (newsItem: NewsItem) => {
    return <>
      <ul class="news-controls list-group list-group-horizontal rounded-0">
        <li class="list-group-item">
          <span class={`source ${newsItem.label}`}>
            {sourceIcon(newsItem)}
          </span>
        </li>
        <li class="list-group-item">
          <span class="age">{ageSince(newsItem, props.now)}</span>
        </li>
        <li class="list-group-item icon">
          <a href="javascript:void(0)" onclick={() => props.onBookmark(newsItem.id)} title={`bookmark ${newsItem.title}`} class="icon">
            <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
              <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
            </svg>
          </a>
        </li>
        <li class="list-group-item">
          <span class="host">
            <span class="host-name badge badge-secondary">
              {newsItem.host}
            </span>
            <a href="javascript:void(0)" 
              class="host-block badge badge-danger" 
              onclick={newsItem.hostIsBlocked ? () => props.onUnblock(newsItem.host): () => props.onBlock(newsItem.host)}>{newsItem.hostIsBlocked ? 'unblock': 'block'}</a>
          </span>
        </li>
      </ul>
    </>
  }

  const cssClass = (newsItem: NewsItem) => `news-item-row ${newsItem.hostIsBlocked ? 'blocked': ''}`;

  const f = (newsItem: NewsItem, i) => (
    <tr class={cssClass(newsItem)}>
      <td width="20" style="vertical-align: middle;text-align: center;">{i()+1}</td>
      <td width="20" style="vertical-align: middle;text-align: center;">
        <a href="javascript:void(0)" onclick={() => props.onDelete(newsItem.id)} title={`delete ${newsItem.title} (${newsItem.id})`} class="icon">
          <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="icon bi bi-trash" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
          </svg>
        </a>
      </td>
      <td>
        <div style="margin-bottom:10px">
          <a href={newsItem.url}><span class="news-title">{newsItem.title}</span></a>
        </div>
          {controls(newsItem)}
      </td>
    </tr>
  );

  const loading = <>
    <tr>
      <td>...</td>
    </tr>
  </>;

  return <>
    <div id="news" class="shadow">
      <table class="table">
        <thead>
          <tr>
            <td colspan="3"><strong>News</strong> ({props.news.length})</td>
          </tr>
        </thead>
        <tbody>
          <For each={props.news} fallback={loading} children={f} />
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3">&nbsp;</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </>
}