import { expect } from '../../application-unit-test';

import { Subject, BehaviorSubject, pipe, Observable, from } from 'rxjs';
import { filter, map } from 'rxjs/operators';

type State = {
  items: string []
}

class Store {
  private state: State;
  private items: string[] = [];
  private subject: BehaviorSubject<State>;
  private observable: Observable<State>;
  private observableItems: Observable<string[]>;

  constructor() {
    this.state = { items: [] };
    this.observableItems = new BehaviorSubject<string[]>(this.items);
    this.subject = new BehaviorSubject<State>(this.state);
    this.observable = this.subject.pipe(map((state: State) => {
      return { items: this.state.items.filter(it => it) }
    }));
  }

  add(item: string) {
    this.items.push(item);
    this.state = { items: [...this.state.items, item] };
    this.subject.next(this.state);
  }

  subscribe(listener: (state: State) => void) {
    this.observable.subscribe({
      next: listener
    });
  }

  onItemsChanged(listener: (items: string[]) => void) {
    this.observableItems.subscribe({
      next: listener
    });
  }
}

describe('[rxjs] Subscribing to changes', async () => {
  it("for example", async () => {
    const store = new Store();

    let result = [];

    store.subscribe(state => result = state.items);

    store.add('A');
    store.add('B');
    store.add('C');
    store.add(null);
    store.add(undefined);

    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });

  it("allows subscribing to certain fields", async () => {
    const store = new Store();

    let result = [];

    store.onItemsChanged(items=> result = items);

    store.add('A');
    store.add('B');
    store.add('C');

    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });
});