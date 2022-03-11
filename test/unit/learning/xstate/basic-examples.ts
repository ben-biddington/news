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

const add = (item: string) => ({ type: 'add', payload: item });
const del = (item: string) => ({ type: 'del', payload: item });

import { createMachine, interpret, assign, Interpreter } from 'xstate';

class Store {
  private counterService: Interpreter<State>;

  constructor() {
    const counterMachine = createMachine<State>({
      initial: 'active',
      context: {
        items: []
      },
      states: {
        active: {
          on: {
            add: { 
              actions: [
                assign({
                  items: (context, event: PayloadAction<string>) => {
                    if (!!event.payload) {
                      context.items.push(event.payload);
                    }
                    return context.items;
                  }
                })
              ]
            },
            del: { 
              actions: [
                assign({
                  items: (context, event: PayloadAction<string>) => {
                    return context.items.filter(it => it !== event.payload)
                  }
                })
              ]
            },
          }
        }
      }
    });

    this.counterService = interpret(counterMachine)
      //.onTransition((state) => console.log(state.context))
      .start();
  }

  dispatch<T>(action: PayloadAction<T>) {
    // @ts-ignore
    this.counterService.send(action);
  }

  subscribe(listener: (state: State) => void) {
    this.counterService.subscribe((s) => listener(s.context));
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
});