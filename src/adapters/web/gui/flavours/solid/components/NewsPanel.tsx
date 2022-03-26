import { createEffect, createSignal, For, mergeProps, Show } from "solid-js";

import { ageSince, NewsItem } from "../../../../../../core/news-item";

export enum View {
  News,
  ReadLater,
}

type Props = {
  view?: View;
  news: NewsItem[];
  allowReadLater?: boolean;
  allowLoading?: boolean;
  loading?: boolean;
  readLater?: NewsItem[];
  onReload?: () => Promise<void>;
  onDelete?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onBlock?: (host: string) => void;
  onUnblock?: (host: string) => void;
  onReadLater?: (item: NewsItem) => void;
  onDeleteReadLater?: (id: string) => void;
  now: Date;
};

const sourceIcon = (item) => {
  // https://fsymbols.com/generators/smallcaps/
  const labels = {
    hn: "🅷",
    lobsters: "🅻",
    youtube: "🅨",
  };

  return labels[item.label];
};

export const NewsPanel = (props: Props) => {
  props = mergeProps(
    {
      view: View.News,
      news: [],
      readLater: [],
      allowReadLater: false,
      allowLoading: false,
      loading: false,
      onReload: () => {},
    },
    props
  );

  const [items, setItems] = createSignal<NewsItem[]>(props.news);
  const [view, setView] = createSignal<View>(props.view);

  createEffect(() => {
    setItems(view() === View.News ? props.news : props.readLater);
  });

  const deleteItem = (id: string) => {
    if (view() === View.News) {
      props.onDelete(id);
    } else {
      props.onDeleteReadLater(id);
    }
  };

  const reload = async () => {
    props.onReload();
  };

  const controls = (newsItem: NewsItem) => {
    return (
      <>
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
            <a
              href="javascript:void(0)"
              onclick={() => props.onBookmark(newsItem.id)}
              title={`bookmark ${newsItem.title}`}
              class="icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                class="icon bi bi-bookmark-heart-fill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"
                ></path>
              </svg>
            </a>
          </li>
          <li class="list-group-item">
            <span class="host">
              <span class="host-name badge badge-secondary">
                {newsItem.host}
              </span>
              <a
                href="javascript:void(0)"
                class="host-block badge badge-danger"
                onclick={
                  newsItem.hostIsBlocked
                    ? () => props.onUnblock(newsItem.host)
                    : () => props.onBlock(newsItem.host)
                }
              >
                {newsItem.hostIsBlocked ? "unblock" : "block"}
              </a>
            </span>
          </li>
        </ul>
      </>
    );
  };

  const cssClass = (newsItem: NewsItem) =>
    `news-item-row ${newsItem.hostIsBlocked ? "blocked" : ""}`;

  const f = (newsItem: NewsItem, i) => (
    <tr class={cssClass(newsItem)}>
      <td width="20" style="vertical-align: middle;text-align: center;">
        {i() + 1}
      </td>
      <td width="20" style="vertical-align: middle;text-align: center;">
        <a
          href="javascript:void(0)"
          onclick={() => deleteItem(newsItem.id)}
          title={`delete ${newsItem.title} (${newsItem.id})`}
          class="icon"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            class="icon bi bi-trash"
            viewBox="0 0 16 16"
          >
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
            <path
              fill-rule="evenodd"
              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
            ></path>
          </svg>
        </a>
        <Show
          when={props.allowReadLater}
          children={
            <a
              href="javascript:void(0)"
              onclick={() => props.onReadLater(newsItem)}
              title={`read ${newsItem.title} (${newsItem.id}) later`}
              class="icon"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-alarm"
                viewBox="0 0 16 16"
              >
                <path d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9V5.5z" />
                <path d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1h-3zm1.038 3.018a6.093 6.093 0 0 1 .924 0 6 6 0 1 1-.924 0zM0 3.5c0 .753.333 1.429.86 1.887A8.035 8.035 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5zM13.5 1c-.753 0-1.429.333-1.887.86a8.035 8.035 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1z" />
              </svg>
            </a>
          }
        />
      </td>
      <td>
        <div style="margin-bottom:10px">
          <a href={newsItem.url}>
            <span class="news-title">{newsItem.title}</span>
          </a>
        </div>
        {controls(newsItem)}
      </td>
    </tr>
  );

  return (
    <>
      <div id="news" class="shadow">
        <table class="table">
          <thead>
            <tr>
              <td colspan="3">
                <div class="container">
                  <div class="row">
                    <div class="col justify-content-start">
                      <strong>
                        <a
                          href="javascript: void(0)"
                          onclick={() => setView(View.News)}
                        >
                          News
                        </a>
                      </strong>{" "}
                      ({props.news.length})
                      <Show
                        when={props.allowReadLater}
                        children={
                          <>
                            {" "}
                            <strong>
                              <a
                                href="javascript: void(0)"
                                onclick={() => setView(View.ReadLater)}
                              >
                                Read later ({props.readLater.length})
                              </a>
                            </strong>
                          </>
                        }
                      />
                      <span class="ml-2">
                        <a
                          href="javascript:void(0)"
                          onClick={() => reload()}
                          class="icon"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-bootstrap-reboot"
                            viewBox="0 0 16 16"
                          >
                            <path d="M1.161 8a6.84 6.84 0 1 0 6.842-6.84.58.58 0 1 1 0-1.16 8 8 0 1 1-6.556 3.412l-.663-.577a.58.58 0 0 1 .227-.997l2.52-.69a.58.58 0 0 1 .728.633l-.332 2.592a.58.58 0 0 1-.956.364l-.643-.56A6.812 6.812 0 0 0 1.16 8z" />
                            <path d="M6.641 11.671V8.843h1.57l1.498 2.828h1.314L9.377 8.665c.897-.3 1.427-1.106 1.427-2.1 0-1.37-.943-2.246-2.456-2.246H5.5v7.352h1.141zm0-3.75V5.277h1.57c.881 0 1.416.499 1.416 1.32 0 .84-.504 1.324-1.386 1.324h-1.6z" />
                          </svg>
                        </a>
                      </span>
                    </div>
                    <div class="col">
                      <div class="justify-content-center flex-row">
                        <Show
                          when={
                            props.loading === true && props.allowLoading
                          }
                          children={
                            <>
                              <span
                                class="alert alert-primary"
                                role="alert"
                              >
                                loading
                              </span>
                            </>
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </thead>
          <tbody>
            <For
              each={items()}
              fallback={
                <>
                  <tr>
                    <td>...</td>
                  </tr>
                </>
              }
              children={f}
            />
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">&nbsp;</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
};
