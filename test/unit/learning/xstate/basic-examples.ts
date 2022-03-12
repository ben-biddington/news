import { expect } from '../../application-unit-test';
import { produce } from 'immer';

type State = {
  items: string []
}

type Options = {
  throttle?: boolean;
  debounce?: boolean;
}

type Action = {
  type: string,
};

type PayloadAction<T> = Action & {
  payload: T;
}

// https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/createAction.ts#L261
const createPayloadAction = <T>(type: string) => {
  const actionCreator = (payload: T) => {
    return {
      type,
      payload
    };
  }

  actionCreator.type = type;
  actionCreator.toString = () => type;

  return actionCreator;
}

const createAction = (type: string) => {
  const actionCreator = () => {
    return {
      type,
    };
  }

  actionCreator.type = type;
  actionCreator.toString = () => type;

  return actionCreator;
}

const add = createPayloadAction<string>('add');
const del = createPayloadAction<string>('del');
const pause = createAction('pause');
const unPause = createAction('unpause');

import { createMachine, interpret, assign, Interpreter, StateMachine } from 'xstate';

class Store {
  private store: Interpreter<State>;

  constructor(initialState?: State) {
    const machine = createMachine<State, Action>({
      initial: 'active',
      context: initialState ?? {
        items: []
      },
      states: {
        active: {
          on: {
            [add.type]: { 
              actions: [
                assign({ // https://github.com/statelyai/xstate/blob/main/packages/core/src/actions.ts#L466
                  items: (context, event: PayloadAction<string>) => {
                    if (!!event.payload) {
                      context.items.push(event.payload);
                    }
                    return context.items;
                  }
                })
              ]
            },
            [del.type]: { 
              actions: [
                assign({
                  items: (context, event: PayloadAction<string>) => {
                    return context.items.filter(it => it !== event.payload)
                  }
                })
              ]
            },
            [pause.type]: 'paused',
          },
        },
        paused: {
          on: {
            [unPause.type]: 'active',
          },
        }
      }
    });

    this.store = interpret(machine)
      //.onTransition((state) => console.log('transition', state.context))
      .start();
  }

  dispatch<T>(action: PayloadAction<T> | Action) {
    this.store.send(action);
  }

  get state(): State {
    return this.clone(this.store.state.context);
  }

  subscribe(listener: (state: State) => void) {
    return this.store.subscribe((s) => listener(this.clone(s.context))).unsubscribe;
  }

  private clone(state: State): State {
    return JSON.parse(JSON.stringify(state));
    // [!] FAILS -- return produce(state, draft => draft);
  }
}

describe('[xstate] Subscribing to changes', async () => {
  it("for example", async () => {
    const store = new Store();

    let result = [];

    store.subscribe(state => result = state.items);

    store.dispatch(add('A'));
    store.dispatch(add('B'));
    store.dispatch(add('C'));
    
    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });

  it("returns 'state' as clone", async () => {
    const store = new Store();

    store.dispatch(add('A'));

    expect(store.state).to.not.equal(store.state);
  });

  it("returns cloned state to subscribers", async () => {
    const store = new Store();

    store.subscribe((state) => {
      expect(state).to.not.equal(store.state);
    });

    store.dispatch(add('A'));
  });

  it("allows unsubscribe", async () => {
    const store = new Store();

    let result = [];

    const unsubscribe = store.subscribe((state) => {
      // [!] Ooh interesting -- `state` should be a copy here!
      // Otherwise we still get the updates because `state` is a reference
      result = state.items;
    });

    store.dispatch(add('A'));
    store.dispatch(add('B'));
    
    expect(result).to.eql([ 'A', 'B' ]);

    unsubscribe();

    store.dispatch(add('C'));

    // [!] This fails if we don't return cloned state to subscribers
    expect(result).to.eql([ 'A', 'B' ]);

    expect(store.state.items).to.eql([ 'A', 'B', 'C' ]);
  });

  it("allows delete", async () => {
    const store = new Store();

    let result = [];

    store.subscribe(state => result = state.items);

    store.dispatch(add('A'));
    store.dispatch(add('B'));
    store.dispatch(add('C'));

    store.dispatch(del('B'));

    expect(result).to.eql([ 'A', 'C' ]);
  });

  it('action creators', () => {
    const deleteItem = createPayloadAction('del');
    
    expect(deleteItem.type).to.eql('del');
    expect(`${deleteItem}`).to.eql('del');

    expect(deleteItem('A')).to.eql({ type: 'del', payload: 'A' });
  });

  it("supports initial state", async () => {
    const store = new Store({items: [ 'A' ]});

    let result = [];

    store.subscribe(state => result = state.items);

    store.dispatch(add('B'));
    store.dispatch(add('C'));
    
    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });
  
  it("supports pausing (state transition)", async () => {
    const store = new Store({items: [ 'A' ]});

    let result = [];

    store.subscribe(state => result = state.items);

    store.dispatch(add('B'));

    store.dispatch(pause());

    store.dispatch(add('C'));
    
    expect(result).to.eql([ 'A', 'B' ]); // 'C' was ignored

    store.dispatch(unPause());

    store.dispatch(add('C'));
    
    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });

});