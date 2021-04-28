import { makeAutoObservable, runInAction, reaction, observable } from "mobx";
import { EventEmitter } from 'events';
import { NewsItems } from "../news-items";
import { NewsItem } from "../news-item";

export class State {
  private events: EventEmitter;

  constructor(events: EventEmitter) {
    makeAutoObservable(this);
    
    this.events = events;

    reaction(
      ()  => this.lobstersNewsItems, 
      (newValue: NewsItems, oldValue: NewsItems) => this.events.emit('lobsters-items-loaded', { items: newValue.list() }));
  } 

  lobstersNewsItems: NewsItems = new NewsItems();
  hackerNewsItems: NewsItems = new NewsItems();
  youtubeNewsItems: NewsItems = new NewsItems();
  
  newsItems(): NewsItems {
    const result = new NewsItems(this.lobstersNewsItems.list());
    result.addAll(this.hackerNewsItems.list());
    result.addAll(this.youtubeNewsItems.list());
    return result;
  }

  set lobsters(items: NewsItem[]) {
    runInAction(() => {
      items = items.map(item  => item.labelled('lobsters'));

      this.lobstersNewsItems.missing(items).forEach(item => item.new = true);
      
      this.lobstersNewsItems = new NewsItems(items);
    });
  }

  get lobsters(): NewsItem[] { return this.lobstersNewsItems.list() }
}