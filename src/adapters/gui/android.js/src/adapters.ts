import { list } from "../../../../adapters/hn";
import { list as listLobsters } from "../../../../adapters/lobsters";
import { FetchBasedInternet } from "../../../../adapters/web/fetch-based-internet";
import { Application } from "../../../../core/application";
import { Ports, PortsBuilder } from "../../../../core/ports";
import { DeletedItems, DeletedItemsSeive } from "./storage/deleted-items";
import { ReadLaterDatabase } from "../../../../adapters/database/pouchdb/read-later-database";
import { DevNullLog, Log } from "../../../../core/logging/log";
import { InternetPreviewSource } from "./internet-preview-source";

export type Settings = {
  window: Window;
  hackerNewsBaseUrl?: string;
  lobstersBaseUrl: string;
  previewServiceUrl: string;
  log: Log;
};

export const createApplication = (settings: Settings) => {
  console.log("[createApplication]", { settings });
  return new Application(createAdapters(settings));
};

const createAdapters = ({
  hackerNewsBaseUrl,
  lobstersBaseUrl,
  previewServiceUrl,
  window,
  log = new DevNullLog()
}: Settings) => {
  const internet = new FetchBasedInternet();
  const deletedItems = new DeletedItems(log, window.localStorage);
  const deletedItemsSeive = new DeletedItemsSeive(window);

  return (
    PortsBuilder.new()
      // .withLog(log)
      //.withToggles(toggles)
      // .withBookmarks({
      //   add: (bookmark) =>
      //     addBookmark({ post: internet.post }, { url: baseUrl }, bookmark),
      //   list: () =>
      //     listBookmarks(
      //       { get: internet.get, trace: log.trace },
      //       { url: baseUrl }
      //     ),
      //   del: (id) =>
      //     deleteBookmark(
      //       { del: internet.delete, trace: log.trace },
      //       { url: baseUrl },
      //       id
      //     ),
      // })
      .with({
        log,
        seive: {
          apply: (newsItems) => deletedItemsSeive.apply(newsItems),
        },
        lobsters: {
          list: () =>
            listLobsters(
              { get: internet.get, trace: console.log },
              { count: 20, url: lobstersBaseUrl }
            ),
          delete: (id) => deletedItems.add(id),
        },
        hackerNews:{
          list: () =>
            list(
              { get: internet.get, trace: console.log },
              { url: hackerNewsBaseUrl, count: 20 }
            ),
          delete: (id) => deletedItems.add(id),
        }, 
        deletedItems: {
          count: deletedItems.count,
        },
        readlaterList: new ReadLaterDatabase(new DevNullLog(), "read-later"),
        newsItemPreviewSource: new InternetPreviewSource({ previewServiceUrl })
      })
      // .withBlockedHosts(new LocalStorageBlockedHosts(window))
      .build()
  );
};
