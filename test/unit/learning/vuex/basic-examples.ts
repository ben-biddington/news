import { expect } from '../../application-unit-test';
import Vuex from 'vuex';
import { Store as VuexStore } from 'vuex'

type State = {
  items: string []
}

class Store {
  private store: VuexStore<State>;

  constructor() {
    this.store = new VuexStore<State>({
      state: {
        items: []
      },
      mutations: {
        add (state: State, item: string) {
          state.items.push(item);
        }
      }
    })
  }

  add(item: string) {
    this.store.commit(item);
  }

  subscribe(listener: (state: State) => void) {
    this.store.subscribe((mutation, state) => listener(state));
  }
}

describe('[vuex] Subscribing to changes', async () => {
  it('does not work standalone', () => {
    expect(() => new Store()).to.throw('must call Vue.use(Vuex) before creating a store instance.');
  });

  it.skip("for example", async () => {
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
});