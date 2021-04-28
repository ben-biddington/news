import { EventEmitter } from 'events';
import { BlockedHosts } from '../../blocked-hosts';
import { State } from '../state';
import { Ports } from '../../ports';
import { Toggles } from "../../toggles";
import { NewsItem } from '../../news-item';

export class NewsUseCases {
  private ports: Ports;
  private events: EventEmitter;
  private blockedHostList: BlockedHosts;
  private state: State;

  constructor(ports: Ports, state: State, blockedHostList: BlockedHosts, events: EventEmitter) {
    this.ports            = ports;
    this.state            = state;
    this.events           = events;
    this.blockedHostList  = blockedHostList;
  }

  async block(host: string): Promise<void> {
    await this.blockedHostList.add(host);
    
    this.events.emit('news-host-blocked', { host });
    
    return this.update(this.filterDeleted);
  }

  async unblock(host: string): Promise<void> {
    await this.blockedHostList.remove(host);
    return this.update(this.filterDeleted);
  }

  async list(list, seive, blockedHosts: BlockedHosts, toggles: Toggles) {
    let fullList = await this.markBlocked(await list(), blockedHosts);

    if (false === toggles.showBlocked.isOn) {
      fullList = fullList.filter(it => false === it.hostIsBlocked);
    }

    const theIdsToReturn = await seive.apply(fullList);

    if (toggles.showDeleted.isOn) {
      return fullList.map(it => {
        it.deleted = false == theIdsToReturn.includes(it.id);
        return it;
      });
    } else {
      return fullList.filter(it => theIdsToReturn.includes(it.id));
    }
  }

  async delete(id: string) {
    await (this.ports.lobsters || this.ports.hackerNews).delete(id);

    await this.remove(id);
  }

  async remove(id: string) {
    const hn = this.state.hackerNewsItems.list();

    hn.forEach(it => {
      if (it.id === id) {
        it.deleted = true;
      }
    });

    this.state.hackerNewsItems.set(hn);

    const lobsters = this.state.lobstersNewsItems.list();

    lobsters.forEach(it => {
      if (it.id === id) {
        it.deleted = true;
      }
    });

    this.state.lobstersNewsItems.set(lobsters);

    const youtube = this.state.youtubeNewsItems.list();

    youtube.forEach(it => {
      if (it.id === id) {
        it.deleted = true;
      }
    });

    this.state.youtubeNewsItems.set(youtube);

    this.onModified(this.filter(this.allNews(), this.filterDeleted, this.filterBlocked));
  }
  
  private async update(...filters: Array<(input: NewsItem[]) => NewsItem[]>) {
    this.state.lobstersNewsItems.set(await this.markBlocked(this.state.lobstersNewsItems.list(), this.blockedHostList));
    this.state.hackerNewsItems.set  (await this.markBlocked(this.state.hackerNewsItems.list()  , this.blockedHostList));
    this.state.youtubeNewsItems.set (await this.markBlocked(this.state.youtubeNewsItems.list()  , this.blockedHostList));

    this.onModified(this.filter(this.allNews(), ...filters));
  }

  private onModified(items: NewsItem[]): void {
    this.events.emit(
      'news-items-modified', 
      { 
        items
      });
  }

  private allNews(): NewsItem[] {
    return [ 
      ...this.state.hackerNewsItems.list(), 
      ...this.state.lobstersNewsItems.list(),
      ...this.state.youtubeNewsItems.list() 
    ];
  }

  private filter(items: NewsItem[], ...filters: Array<(input: NewsItem[]) => NewsItem[]>) {
    let result: NewsItem[] = items;

    for (let i = 0; i < filters.length; i++) {
      result = filters[i](result);
    }

    return result;
  }

  private filterDeleted(items: NewsItem[]) { return items.filter(it => false === it.deleted); }
  private filterBlocked(items: NewsItem[]) { return items.filter(it => false === it.hostIsBlocked); }

  private async markBlocked(list: NewsItem[], blockedHosts: BlockedHosts): Promise<NewsItem[]> {
    return Promise.all(list.map(
      async (item: NewsItem) => {
        const isBlocked = await blockedHosts.has(item.host);
        return item.withBlockedHost(isBlocked);
      }));
  }
}