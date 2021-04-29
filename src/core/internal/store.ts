import { makeAutoObservable, runInAction, reaction } from "mobx";
import { EventEmitter } from 'events';
import { NewsItem } from "../news-item";
import { State } from "./state";
import { Clock } from "../ports";

export class Store {
  private events: EventEmitter;
  private clock: Clock;
  private state: State = {
     lastUpdatedDate: new Date(), 
     lobsters: [], 
     hackerNews: [], 
     youtube: []  
  };

  constructor(events: EventEmitter, clock: Clock) {
    makeAutoObservable(this);
    
    this.events = events;
    this.clock  = clock;

    reaction(
      () => this.state.hackerNews,
      (newValue: NewsItem[], oldValue: NewsItem[]) => {
        this.state.lastUpdatedDate = this.clock.now();
        this.events.emit('hacker-news-items-loaded' , { items: newValue });
      });
    
    reaction(
      () => this.state.lobsters,
      (newValue: NewsItem[], oldValue: NewsItem[]) => {
        this.state.lastUpdatedDate = this.clock.now();
        this.events.emit('lobsters-items-loaded' , { items: newValue });
      });

    reaction(
      () => this.state.youtube,
      (newValue: NewsItem[], oldValue: NewsItem[]) => {
        this.state.lastUpdatedDate = this.clock.now();
        this.events.emit('youtube-items-loaded' , { items: newValue });
      });
  } 
  
  list(): NewsItem[] {
    return [ 
      ...this.hackerNews, 
      ...this.lobsters,
      ...this.youtube 
    ];
  }

  find(id: string) : NewsItem {
    const results = [ 
      ...this.state.hackerNews,
      ...this.state.lobsters,
      ...this.state.youtube, 
    ].filter(it => it.id == id);

    return results.length > 0 ? results[0] : null;
  }

  remove(id: string) {
    runInAction(() => {
      this.hackerNews.forEach(it => {
        if (it.id === id) {
          it.deleted = true;
        }
      });

      this.lobsters.forEach(it => {
        if (it.id === id) {
          it.deleted = true;
        }
      });

      this.youtube.forEach(it => {
        if (it.id === id) {
          it.deleted = true;
        }
      });
    });
  }

  subscribe(listener: (state: State) => void) {
    reaction(
      () => this.state,
      (value) => listener(value)); 
  }

  get lobsters(): NewsItem[] { return [ ...this.state.lobsters ]; }

  set lobsters(items: NewsItem[]) {
    runInAction(() => {
      items = items.map(item  => item.labelled('lobsters'));

      items.forEach(item => item.new = this.isMissingFrom(this.state.lobsters, item));
      
      this.state = { ...this.state, lobsters: items };
    });
  }

  get hackerNews(): NewsItem[] { return [ ...this.state.hackerNews ]; }

  set hackerNews(items: NewsItem[]) {
    runInAction(() => {
      items = items.map(item  => item.labelled('hn'));

      items.forEach(item => item.new = this.isMissingFrom(this.state.hackerNews, item));
      
      this.state = { ...this.state, hackerNews: items };
    });
  }

  get youtube(): NewsItem[] { return [ ...this.state.youtube ]; }

  set youtube(items: NewsItem[]) {
    runInAction(() => {
      items = items.map(item  => item.labelled('youtube'));

      items.forEach(item => item.new = this.isMissingFrom(this.state.youtube, item));
      
      this.state = { ...this.state, youtube: items };
    });
  }

  private isMissingFrom(from: NewsItem[], item: NewsItem) : boolean {
    return false === from.map(it => it.id).includes(item.id);
  }
}