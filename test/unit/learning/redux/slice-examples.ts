import { expect } from '../../application-unit-test';

import { combineReducers, createStore, Store as ReduxStore } from 'redux'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type User = { name: string }

interface State {
  user?: User;
  items: string [];
}

// https://redux-toolkit.js.org/api/createSlice
// [i] Slices make action creators automatically, which means they're not known until runtime, so types no good.

class Store {
  private reduxStore: ReduxStore;

  constructor() {
    const initialState = { items: [], user: { name: 'anon' } };

    const reducer = combineReducers({
      user: this.createUserSlice(initialState.user).reducer,
      items: this.createItemsSlice(initialState.items).reducer,
    });

    this.reduxStore = createStore(reducer);
  }

  get state() {
    return this.reduxStore.getState();
  }

  dispatch<T>(action: PayloadAction<T>) {
    this.reduxStore.dispatch(action);
  }

  subscribe(listener: (state: State) => void) {
    this.reduxStore.subscribe(() => listener(this.reduxStore.getState()))
  }

  private createUserSlice(initialState: User) {
    return createSlice({
      name: 'user',
      initialState,
      reducers: {
        setName: (state, action: PayloadAction<string>) => {
          state.name = action.payload;
        },
      },
    });
  }

  private createItemsSlice(initialState: string[]) {
    return createSlice({
      name: 'items',
      initialState,
      reducers: {
        add: (state, action: PayloadAction<string>) => {
          state.push(action.payload);
        },
      },
    });
  }
}

describe('Redux slices', async () => {
  it("for example can set name", async () => {
    const store = new Store();

    let result: State = null;

    store.subscribe(state => result = state);

    store.dispatch({ type: 'user/setName', payload: 'Ben' });

    expect(result.user?.name).to.eql('Ben');
  });

  it("for example can add items", async () => {
    const store = new Store();

    let result: State = null;

    store.subscribe(state => result = state);

    store.dispatch({ type: 'items/add', payload: 'A' });
    store.dispatch({ type: 'items/add', payload: 'B' });
    store.dispatch({ type: 'items/add', payload: 'C' });

    expect(result.user?.name).to.eql('anon');
    expect(result.items).to.eql([ 'A', 'B', 'C' ]);
  });
});