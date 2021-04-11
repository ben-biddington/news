import { EventEmitter } from 'events';
import { apply as block } from './block'
import { BlockedHosts } from '../../../blocked-hosts';
import { State } from '../../state';
import { Toggles } from "../../../toggles";

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
    const fullList = await block(await list(), blockedHosts);

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
    this.state.lobstersNewsItems.set(await block(this.state.lobstersNewsItems.list(), this.blockedHostList));
    this.state.hackerNewsItems.set  (await block(this.state.hackerNewsItems.list()  , this.blockedHostList));

    this.events.emit('news-items-modified', { items: [ ...this.state.hackerNewsItems.list(), ...this.state.lobstersNewsItems.list()] });
  }
}