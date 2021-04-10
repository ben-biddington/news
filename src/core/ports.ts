import { Cloneable } from './cloneable';
import { WeatherQuery } from './weather';
import { ToggleSource, DevNullToggleSource } from './toggle-source';
import { BlockedHosts } from './blocked-hosts';
import { DevNullSeive } from './dev-null-seive';
import { DevNullBlockedHosts } from './dev-null-blocked-hosts';

export class Ports extends Cloneable {
  lobsters: any;
  log: any;
  seive: any;
  hackerNews: any;
  rnzNews: any;
  bookmarks: any;
  deletedItems: any;
  toggles: ToggleSource;
  weather: WeatherQuery;
  blockedHosts: BlockedHosts = new DevNullBlockedHosts();

  constructor(lobsters, log, seive, hackerNews, rnzNews) {
    super();

    this.lobsters = lobsters;
    this.log = log || console.log;
    this.seive = seive || new DevNullSeive();
    this.hackerNews = hackerNews;
    this.rnzNews = rnzNews;
    this.bookmarks = null;
    this.deletedItems = null;
    this.toggles = new DevNullToggleSource();
  }

  static blank(): Ports { return new Ports(null, null, null, null, null); }

  withBookmarks(bookmarks) { return this.clone(it => it.bookmarks = bookmarks); }
  withHackerNews(hackerNews) { return this.clone(it => it.hackerNews = hackerNews); }
  withLobsters(lobsters) { return this.clone(it => it.lobsters = lobsters); }
  withDeletedItems(deletedItems) { return this.clone(it => it.deletedItems = deletedItems); }
  withToggles(toggles: ToggleSource) { return this.clone(it => it.toggles = toggles); }
  with(weather: WeatherQuery) { return this.clone(it => it.weather = weather); }
  withBlockedHosts(blockedHosts: BlockedHosts) { return this.clone(it => it.blockedHosts = blockedHosts); }
  withSeive(seive) { return this.clone(it => it.seive = seive); }
}