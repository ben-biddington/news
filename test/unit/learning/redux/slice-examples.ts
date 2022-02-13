import { expect } from '../../application-unit-test';

import { combineReducers, createStore, Store as ReduxStore } from 'redux'
import { ActionCreatorWithoutPayload, ActionCreatorWithPayload, CaseReducerActions, createSlice, PayloadAction, Slice, SliceCaseReducers } from '@reduxjs/toolkit'

type User = { name: string }

interface State {
  user?: User;
  items: string [];
}

type UserActions = {
  setName: ActionCreatorWithPayload<string> | ActionCreatorWithoutPayload
}

type ItemsActions = {
  add: ActionCreatorWithPayload<string> | ActionCreatorWithoutPayload
}

type Actions = {
  user: CaseReducerActions<SliceCaseReducers<User>>;
  items: CaseReducerActions<SliceCaseReducers<string[]>>;
}

// https://redux-toolkit.js.org/api/createSlice
// [i] Slices make action creators automatically, which means they're not known until runtime, so types no good.

class Store {
  private reduxStore: ReduxStore;
  private _userSlice: Slice<User>;
  private _itemsSlice: Slice<string[]>;

  constructor() {
    const initialState = { items: [], user: { name: 'anon' } };

    this._userSlice = this.createUserSlice(initialState.user);
    this._itemsSlice = this.createItemsSlice(initialState.items);

    const reducer = combineReducers({
      user: this._userSlice.reducer,
      items: this._itemsSlice.reducer,
    });

    this.reduxStore = createStore(reducer);
  }

  get actions(): Actions {
    return {
      user: this._userSlice.actions,
      items: this._itemsSlice.actions,
    };
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

  private createUserSlice(initialState: User): Slice<User> {
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

    store.dispatch(store.actions.user.setName('Cyril'));

    expect(result.user?.name).to.eql('Cyril');
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