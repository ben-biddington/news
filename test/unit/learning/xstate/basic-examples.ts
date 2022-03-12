import { expect } from '../../application-unit-test';

type State = {
  items: string []
}

type Options = {
  throttle?: boolean;
  debounce?: boolean;
}

type PayloadAction<T> = {
  type: string,
  payload: T;
}

// https://github.com/reduxjs/redux-toolkit/blob/master/packages/toolkit/src/createAction.ts#L261
const createAction = <T>(type: string) => {
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

const add = createAction<string>('add');
const del = createAction<string>('del');
const pause = createAction<string>('pause');
const unPause = createAction<string>('unpause');

import { createMachine, interpret, assign, Interpreter, StateMachine } from 'xstate';

class Store {
  private store: Interpreter<State>;

  constructor(initialState?: State) {
    const machine = createMachine<State, PayloadAction<string>>({
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

  pause() {
    
  }

  dispatch<T>(action: PayloadAction<T>) {
    this.store.send(action);
  }

  get state(): State {
    return this.store.state.context;
  }

  subscribe(listener: (state: State) => void) {
    this.store.subscribe((s) => listener(s.context));
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
    const deleteItem = createAction('del');
    
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

    store.dispatch(pause(''));

    store.dispatch(add('C'));
    
    expect(result).to.eql([ 'A', 'B' ]); // 'C' was ignored

    store.dispatch(unPause(''));

    store.dispatch(add('C'));
    
    expect(result).to.eql([ 'A', 'B', 'C' ]);
  });

});