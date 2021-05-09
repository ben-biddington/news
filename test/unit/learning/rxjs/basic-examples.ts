import { expect } from '../../application-unit-test';

import { BehaviorSubject, pipe, Observable, from } from 'rxjs';
import { map, throttleTime } from 'rxjs/operators';
const delay = ms => new Promise(res => setTimeout(res, ms));
const until = async (condition: () => boolean) => {
  while(false == condition()) {
    await delay(500);
  }
};

const range = (start, stop, step) => Array.from({ length: (stop - start) / step + 1}, (_, i) => start + (i * step));

const random = (min, max) => {
  return Math.floor(
    Math.random() * (max - min) + min
  )
}

type State = {
  items: string []
}

type Options = {
  throttle: boolean
}

class Store {
  private state: State;
  private items: string[] = [];
  private subject: BehaviorSubject<State>;
  private observable: Observable<State>;
  private observableItems: Observable<string[]>;

  constructor(opts: Options = { throttle: false }) {
    const { throttle = false } = opts;

    this.state = { items: [] };
    this.observableItems = new BehaviorSubject<string[]>(this.items);
    this.subject = new BehaviorSubject<State>(this.state);
    this.observable = this.subject.
      pipe(map((state: State) => { return { items: this.state.items.filter(it => it) } }));

    if (throttle) {
      this.observable = this.observable.pipe(throttleTime(100))
    }
  }

  add(item: string) {
    this.items.push(item);

    const currentValue: State = this.subject.getValue();

    this.state = { items: [...currentValue.items, item] };
    
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

  // "Lets a value pass, then ignores source values for the next duration milliseconds." -- https://rxjs.dev/api/operators/throttleTime
  it("allows throttling", async () => {
    const count = 10;
    
    const store = new Store({ throttle: true });

    let items = [];

    store.subscribe(state => items = state.items);

    const x = range(1, count, 1);

    const promises = x.map((i) => {
      return delay(random(100, 250)).then(() => {
        store.add(`item-${i}`);
      }).catch(e => { throw e; });
    });

    await Promise.all([promises]);

    expect(items.length).to.be.lessThan(count);
  });

  // debounce drops duplicates
});