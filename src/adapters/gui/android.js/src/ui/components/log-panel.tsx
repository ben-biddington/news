import { For } from "solid-js";

export type Props = {
  logs?: LogEntry[];
};

export type LogEntry = {
  type: "text" | "json";
  text: any;
};

export const LogPanel = (props: Props) => {
  return (
    <>
      <ul class="list-group">
        <For
          each={props.logs}
          children={(item) => (
            <>
              <li class="list-group-item">
                <div class="card">
                  <div class="card-header">
                    {
                      <span class="badge badge-pill badge-info">
                        {item.type}
                      </span>
                    }
                  </div>
                  <div class="card-body">
                    {/* <h5 class="card-title">Special title treatment</h5> */}
                    {item.type === "text" ? (
                      item.text
                    ) : (
                      <>
                        <pre>{JSON.stringify(item.text, null, 2)}</pre>
                      </>
                    )}
                  </div>
                </div>
              </li>
            </>
          )}
        />
      </ul>
    </>
  );
};
