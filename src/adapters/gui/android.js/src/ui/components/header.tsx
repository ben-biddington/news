import { View } from "../index";
import { Show } from "solid-js";
import { Button } from "selenium-webdriver";

export type Props = {
  view: View;
  viewChanged?: (view: View) => void;
  logsCount?: number;
  newsCount?: number;
  readLaterCount?: number;
  onClearLogs: () => void;
  onReload?: () => void;
};

export const Header = (props: Props) => {
  return (
    <>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="d-flex align-items-center">
          <a
            class="navbar-brand"
            href="javascript:void(0)"
            onclick={() => props.viewChanged(View.News)}
          >
            News <span class="badge badge-dark">{props.newsCount}</span>
          </a>
          <button class="btn btn-sm p-0" onClick={props.onReload}>
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
          </button>
        </div>

        <button
          class="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <ul class="navbar-nav mr-auto">
            <li class="nav-item active">
              <button
                type="button"
                class="btn btn-light"
                onclick={() => props.viewChanged(View.ReadLater)}
              >
                Read later{" "}
                <span class="badge badge-dark">{props.readLaterCount}</span>
              </button>
            </li>
            <li class="nav-item">
              <button
                type="button"
                class="btn btn-light"
                onclick={() => props.viewChanged(View.Logs)}
              >
                Logs <span class="badge badge-dark">{props.logsCount}</span>
              </button>
            </li>
            <Show
              when={props.view === View.Logs}
              children={
                <>
                  <li class="nav-item dropdown">
                    <a
                      class="nav-link dropdown-toggle"
                      href="#"
                      id="navbarDropdown"
                      role="button"
                      data-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Options
                    </a>
                    <div class="dropdown-menu" aria-labelledby="navbarDropdown">
                      <a
                        class="dropdown-item"
                        href="javascript:void(0)"
                        onclick={props.onClearLogs}
                      >
                        Clear
                      </a>
                    </div>
                  </li>
                </>
              }
            />
          </ul>
        </div>
      </nav>
    </>
  );
};
