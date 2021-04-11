import { EventEmitter } from 'events';
import { BlockedHosts } from '../../../blocked-hosts';
import { State } from '../../state';
import { Toggles } from "../../../toggles";
import { NewsItem } from '../../../news-item';

export class NewsUseCases {
  private events: EventEmitter;
  private blockedHostList: BlockedHosts;
  private state: State;

  constructor(state: State, blockedHostList: BlockedHosts, events: EventEmitter) {
    this.state            = state;
    this.events           = events;
    this.blockedHostList  = blockedHostList;
  }

  async block(host: string): Promise<void> {
    await this.blockedHostList.add(host);
    
    this.events.emit('news-host-blocked', { host });
    
    return this.update();
  }

  async unblock(host: string): Promise<void> {
    await this.blockedHostList.remove(host);
    return this.update();
  }

  async list(list, seive, blockedHosts: BlockedHosts, toggles: Toggles) {
    const fullList = await this.markBlocked(await list(), blockedHosts);

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

  private async update() {
    this.state.lobstersNewsItems.set(await this.markBlocked(this.state.lobstersNewsItems.list(), this.blockedHostList));
    this.state.hackerNewsItems.set  (await this.markBlocked(this.state.hackerNewsItems.list()  , this.blockedHostList));

    this.events.emit('news-items-modified', { items: [ ...this.state.hackerNewsItems.list(), ...this.state.lobstersNewsItems.list()] });
  }

  private async markBlocked(list: NewsItem[], blockedHosts: BlockedHosts): Promise<NewsItem[]> {
    return Promise.all(list.map(
      async (item: NewsItem) => {
        const isBlocked = await blockedHosts.has(item.host);
        return item.withBlockedHost(isBlocked);
      }));
  }
}