import { WeatherQuery } from './weather';
import { ToggleSource, DevNullToggleSource } from './toggle-source';
import { BlockedHosts } from './blocked-hosts';
import { DevNullSeive } from './dev-null-seive';
import { DevNullBlockedHosts } from './dev-null-blocked-hosts';
import { NewsSource } from './news-source';
import { Bookmark } from './bookmark';
import { NewsItem } from './news-item';
import { DevNullLog, Log } from './logging/log';

export interface Clock {
  now: () => Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

type BookmarksPort = { 
  add: (Bookmark: Bookmark) => void;
  list: () => Promise<Bookmark[]>;
  del: (id: string) => Promise<void>;
}

type NewsSourcePort = { 
  list: () => Promise<NewsItem[]>;
  delete: (id: string) => Promise<void>;
}

type DeletedItemsQuery = { 
  count: () => Promise<number>;
}

type Seive = { 
  apply: (newsItem) => Promise<string[]>;
}

export class PortsBuilder {
  private ports: Ports;

  constructor(ports: Ports = {}) {
    this.ports = ports;
  }

  static blank() {
    return new PortsBuilder();
  }

  static new(): PortsBuilder {
    return new PortsBuilder().
      withLog(new DevNullLog()).
      withToggles(new DevNullToggleSource()).
      withSeive(new DevNullSeive()).
      withBlockedHosts(new DevNullBlockedHosts()).
      withClock(new SystemClock());
  }

  withLog(log: Log): PortsBuilder {
    return new PortsBuilder({ ...this.ports, log });
  } 

  withToggles(toggles: ToggleSource): PortsBuilder {
    return new PortsBuilder({ ...this.ports, toggles });
  }

  withClock(clock: Clock): PortsBuilder {
    return new PortsBuilder({ ...this.ports, clock });
  } 

  withBookmarks(bookmarks: BookmarksPort) {
    return new PortsBuilder({ ...this.ports, bookmarks });
  }

  withSeive(seive: Seive) {
    return new PortsBuilder({ ...this.ports, seive });
  }

  withLobsters(port: NewsSourcePort): PortsBuilder {
    return new PortsBuilder({ ...this.ports, lobsters: port });
  }

  withHackerNews(port: NewsSourcePort): PortsBuilder {
    return new PortsBuilder({ ...this.ports, hackerNews: port });
  }

  withYoutube(port: NewsSource): PortsBuilder {
    return new PortsBuilder({ ...this.ports, youtube: port });
  }

  withBlockedHosts(blockedHosts: BlockedHosts): PortsBuilder {
    return new PortsBuilder({ ...this.ports, blockedHosts });
  }

  withDeletedItems(deletedItems: DeletedItemsQuery): PortsBuilder {
    return new PortsBuilder({ ...this.ports, deletedItems });
  }

  withWeatherQuery(weather: WeatherQuery): PortsBuilder {
    return new PortsBuilder({ ...this.ports, weather });
  }

  build() {
    return this.ports;
  }
}

export type Ports = {
  readonly lobsters?: NewsSourcePort;
  readonly log?: Log;
  readonly seive?: Seive;
  readonly hackerNews?: NewsSourcePort;
  readonly rnzNews?: any;
  readonly bookmarks?: BookmarksPort;
  readonly deletedItems?: DeletedItemsQuery;
  readonly toggles?: ToggleSource;
  readonly weather?: WeatherQuery;
  readonly blockedHosts?: BlockedHosts;
  readonly youtube?: NewsSource;
  readonly clock?: Clock;
}