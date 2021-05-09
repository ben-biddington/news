import { expect } from '../../application-unit-test';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, throttleTime, debounceTime } from 'rxjs/operators';
import { delay, until, range, random } from '../../../support';

type State = {
  items: string []
}

type Options = {
  throttle?: boolean;
  debounce?: boolean;
}

class Store {
  private state: State;
  private items: string[] = [];
  private subject: BehaviorSubject<State>;
  private observable: Observable<State>;
  private observableItems: Observable<string[]>;

  constructor(opts: Options = { throttle: false, debounce: false }) {
    const { debounce, throttle } = opts;

    this.state = { items: [] };
    this.observableItems = new BehaviorSubject<string[]>(this.items);
    this.subject = new BehaviorSubject<State>(this.state);
    this.observable = this.subject.
      pipe(map((state: State) => { return { items: this.state.items.filter(it => it) } }));

    if (throttle) {
      this.observable = this.observable.pipe(throttleTime(100));
    }

    if (debounce) {
      this.observable = this.observable.pipe(debounceTime(200));
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

    await Promise.all(range(1, count, 1).map((i) => {
      return delay(random(50, 200)).then(() => store.add(`item-${i}`));
    }));

    // [i] throttle *ignores* some requests
    expect(items.length).to.be.lessThan(count);
  });

   // "It's like delay, but passes only the most recent notification from each burst of emissions." -- https://rxjs.dev/api/operators/debounceTime
   it("allows debounce which is more like rate limiting", async () => {
    const count = 10;
    
    const store = new Store({ debounce: true });

    let items = [];
    let notificationCount = 0;
    
    store.subscribe(state => { notificationCount ++; items = state.items; });

    await Promise.all(range(1, count, 1).map((i) => {
      return delay(random(50, 200)).then(() => store.add(`item-${i}`));
    }));

    await until(() => items.length == count);

    // [i] debounce does not drop any
    expect(items.length).to.eql(count);
    expect(notificationCount).to.be.lessThan(count);
  });
});