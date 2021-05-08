import { expect } from '../../application-unit-test';

import { createStore, Store as ReduxStore } from 'redux'

interface State {
  items: string [];
}

class Store {
  private reduxStore: ReduxStore;

  constructor() {
    this.reduxStore = createStore<State, any, any, any>(this.reducer, { items: [] });
  }

  add(item: string) {
    this.reduxStore.dispatch({ type: 'ADD', text: item});
  }

  subscribe(listener: (state: State) => void) {
    this.reduxStore.subscribe(() => listener(this.reduxStore.getState()))
  }

  private reducer(state: State, action) {
    switch (action.type) {
      case 'ADD':
        return { items: [ ...state.items, action.text ] }
      default:
        return state
    }
  }
}

describe('Subscribing to changes', async () => {
  it("for example", async () => {
    const store = new Store();

    let result = [];

    store.subscribe(state => result = state.items);

    store.add('A');
    store.add('B');
    store.add('C');

    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });
});