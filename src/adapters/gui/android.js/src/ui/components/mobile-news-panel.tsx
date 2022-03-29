import { For } from "solid-js";
import { ageSince, NewsItem } from "../../../../../../core/news-item";

export type Props = {
  items?: NewsItem[];
  now: Date;
  onDelete?: (id: string) => void;
  onBookmark?: (id: string) => void;
  onReadLater?: (item: NewsItem) => void;
  onPreview?: (item: NewsItem) => void;
};

export const MobileNewsPanel = (props: Props) => {
  return (
    <>
      <For
        each={props.items}
        children={(item) => (
          <>
            <div
              class="card mb-1 border-0 shadow news-item-row rounded-0"
              style="background: linear-gradient(to bottom, rgb(218, 224, 229, 0.7), rgba(117, 67, 67, 0.0));"
            >
              <div class="card-body p-2">
                <div class="d-flex justify-content-between bg-white align-items-center">
                  <div class="p-1">
                    <div class="p-1" style="padding-top:0.750rem">
                      <a href={item.url}>{item.title}</a>
                    </div>
                    <p style="font-size:0.5em">{item.preview?.summary}</p>
                  </div>
                  <div class="p-1">
                    <DeleteButton onDelete={() => props.onDelete(item.id)} />
                  </div>
                </div>

                <div class="d-flex justify-content-between bg-white align-items-center">
                  <div class="p-1" style="font-size:0.6em">
                    <div class="d-flex flex-row">
                      <div class="ml-0 pl-0 p-1">
                        {/* Source */}
                        <span class={`source ${item.label}`}>
                          <img src={sourceIcon(item)} width={16} height={16} />
                        </span>
                      </div>
                      <div class="p-1">
                        {/* Host */}
                        <span class="badge badge-secondary">{item.host}</span>
                      </div>
                      <div class="p-1">
                        {/* Age */}
                        <span>{ageSince(item, props.now)}</span>
                      </div>
                    </div>
                  </div>
                  <div class="p-1">
                    <button type="button" class="btn btn-light">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-exclamation-diamond-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098L9.05.435zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
                      </svg>
                    </button>

                    {/* Preview */}
                    <button
                      type="button"
                      class="btn btn-light"
                      onclick={() => props.onPreview(item)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-eye-fill"
                        viewBox="0 0 16 16"
                      >
                        <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                        <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                      </svg>
                    </button>

                    {/* Read later */}
                    <button
                      type="button"
                      class="btn btn-light"
                      onclick={() => props.onReadLater(item)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-pin"
                        viewBox="0 0 16 16"
                      >
                        <path d="M4.146.146A.5.5 0 0 1 4.5 0h7a.5.5 0 0 1 .5.5c0 .68-.342 1.174-.646 1.479-.126.125-.25.224-.354.298v4.431l.078.048c.203.127.476.314.751.555C12.36 7.775 13 8.527 13 9.5a.5.5 0 0 1-.5.5h-4v4.5c0 .276-.224 1.5-.5 1.5s-.5-1.224-.5-1.5V10h-4a.5.5 0 0 1-.5-.5c0-.973.64-1.725 1.17-2.189A5.921 5.921 0 0 1 5 6.708V2.277a2.77 2.77 0 0 1-.354-.298C4.342 1.674 4 1.179 4 .5a.5.5 0 0 1 .146-.354zm1.58 1.408-.002-.001.002.001zm-.002-.001.002.001A.5.5 0 0 1 6 2v5a.5.5 0 0 1-.276.447h-.002l-.012.007-.054.03a4.922 4.922 0 0 0-.827.58c-.318.278-.585.596-.725.936h7.792c-.14-.34-.407-.658-.725-.936a4.915 4.915 0 0 0-.881-.61l-.012-.006h-.002A.5.5 0 0 1 10 7V2a.5.5 0 0 1 .295-.458 1.775 1.775 0 0 0 .351-.271c.08-.08.155-.17.214-.271H5.14c.06.1.133.191.214.271a1.78 1.78 0 0 0 .37.282z" />
                      </svg>
                    </button>

                    {/* Bookmark */}
                    <button
                      type="button"
                      class="btn btn-light"
                      onclick={() => props.onBookmark(item.id)}
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
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      />
    </>
  );
};

const DeleteButton = (props: { onDelete: (id: string) => void }) => (
  <>
    <button
      type="button"
      class="btn btn-light shadow-sm"
      onClick={(id) => props.onDelete(id)}
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
    </button>
  </>
);

const sourceIcon = (item) => {
  const labels = {
    lobsters: "https://lobste.rs/apple-touch-icon-144.png",
    hn: "https://news.ycombinator.com/favicon.ico",
  };

  return labels[item.label];
};
