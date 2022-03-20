import { list } from "../../../../adapters/hn";
import { list as listLobsters } from "../../../../adapters/lobsters";
import { FetchBasedInternet } from "../../../../adapters/web/fetch-based-internet";
import { Application } from "../../../../core/application";
import { Ports, PortsBuilder } from "../../../../core/ports";

export type Settings = {
  hackerNewsBaseUrl?: string;
  lobstersBaseUrl: string;
};

export const createApplication = (settings: Settings) => {
  console.log("[createApplication]", { settings });

  return new Application(createAdapters(settings));
};

const createAdapters = ({ hackerNewsBaseUrl, lobstersBaseUrl }: Settings) => {
  const internet = new FetchBasedInternet();

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
      // .withSeive({
      //   apply: (newsItems) => {
      //     return internet
      //       .post(
      //         `${baseUrl}/lobsters/deleted/sieve`,
      //         { "Content-type": "application/json", Accept: "application/json" },
      //         newsItems.map((it) => it.id)
      //       )
      //       .then((reply) => JSON.stringify(reply.body));
      //   },
      // })
      .withLobsters({
        list: () =>
          listLobsters(
            { get: internet.get, trace: console.log },
            { count: 20, url: lobstersBaseUrl }
          ),
        delete: (id) => Promise.resolve(),
      })
      .withHackerNews({
        list: () =>
          list(
            { get: internet.get, trace: console.log },
            { url: hackerNewsBaseUrl, count: 20 }
          ),
        delete: (id) => Promise.resolve(),
      })
      // .withBlockedHosts(new LocalStorageBlockedHosts(window))
      // .withDeletedItems({
      //   count: () => deletedCount({ internet }, { baseUrl: baseUrl }),
      // })
      .build()
  );
};
