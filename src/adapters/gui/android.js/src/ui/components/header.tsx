import { View } from "../index";
import { Show } from "solid-js";

export type Props = {
  view: View;
  viewChanged?: (view: View) => void;
  logsCount?: number;
  onClearLogs: () => void;
};

export const Header = (props: Props) => {
  return (
    <>
      <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <a
          class="navbar-brand"
          href="javascript:void(0)"
          onclick={() => props.viewChanged(View.News)}
        >
          News
        </a>
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
                onclick={() => props.viewChanged(View.Logs)}
              >
                Logs <span class="badge badge-light">{props.logsCount}</span>
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
                      <a class="dropdown-item" href="#">
                        Another action
                      </a>
                      <div class="dropdown-divider"></div>
                      <a class="dropdown-item" href="#">
                        Something else here
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
