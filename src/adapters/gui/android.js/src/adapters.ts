import { list } from "../../../../adapters/hn";
import { list as listLobsters } from "../../../../adapters/lobsters";
import { FetchBasedInternet } from "../../../../adapters/web/fetch-based-internet";
import { Application } from "../../../../core/application";
import { Ports, PortsBuilder } from "../../../../core/ports";
import { DeletedItems, DeletedItemsSeive } from "./storage/deleted-items";
import { ReadLaterDatabase } from "../../../../adapters/database/pouchdb/read-later-database";
import { DevNullLog } from "../../../../core/logging/log";

export type Settings = {
  window: Window;
  hackerNewsBaseUrl?: string;
  lobstersBaseUrl: string;
};

export const createApplication = (settings: Settings) => {
  console.log("[createApplication]", { settings });

  return new Application(createAdapters(settings));
};

const createAdapters = ({
  hackerNewsBaseUrl,
  lobstersBaseUrl,
  window,
}: Settings) => {
  const internet = new FetchBasedInternet();
  const deletedItems = new DeletedItems(window);
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
      .withSeive({
        apply: (newsItems) => deletedItemsSeive.apply(newsItems),
      })
      .withLobsters({
        list: () =>
          listLobsters(
            { get: internet.get, trace: console.log },
            { count: 20, url: lobstersBaseUrl }
          ),
        delete: (id) => deletedItems.add(id),
      })
      .withHackerNews({
        list: () =>
          list(
            { get: internet.get, trace: console.log },
            { url: hackerNewsBaseUrl, count: 20 }
          ),
        delete: (id) => deletedItems.add(id),
      })
      // .withBlockedHosts(new LocalStorageBlockedHosts(window))
      .withDeletedItems({
        count: deletedItems.count,
      })
      .withReadLaterList(new ReadLaterDatabase(new DevNullLog(), "read-later"))
      .build()
  );
};
