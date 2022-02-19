import { expect } from '../../application-unit-test';
import { delay } from '../../../support/delay';

// In summary, it's the resolving promise and then calling `iterator.next` with the resolved
// value that is the secret here. Yield handily pauses execution until promise has resolved.

const run = (generator) => {
    const iterator = generator();
    const handleNext = (value: any = undefined) => {
      const next = iterator.next(value);                                             // Get to next 'yield' and get whatever it is, in this case a promise 
                                                                                     // It is the argument to `next` here `value` here which is returning
                                                                                     // the result of the promise *back* to the generator. 
      if (next.done) {
        return next.value;
      } else {
        return Promise.resolve(next.value)                                           
                 .then(
                   result => handleNext(result), // <-------------------------------- This is where the actual value is returned to the yield
                   //                                                                 because `result` is passed into `iterator.next`
                   err    => Promise.resolve(iterator.throw(err)).then(handleNext)
                 );
      }
    };

    return handleNext();
}

const getFirstName = (): Promise<string> => {
  return delay(2000)
    .then(() => Promise.resolve('Ben'));
}

const getLastName = (): Promise<string> => {
  return delay(750)
    .then(() => Promise.resolve('Biddington'));
}

// https://wanago.io/2018/04/23/demystifying-generators-implementing-async-await/
describe('Generator functions advanced', () => {
  it('handle promises by stepping through yields and resolving', async () => {
    
    // [i] https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Iterators_and_Generators
    const generator: () => Generator<any, void, unknown> = function*() {
      // [question] How does `run` affect the return value? It is substituting <string> for <promise>
      // [answer] [https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/yield]
      //
      //   If an optional value is passed to the generator's next() method, 
      //   that value becomes the value returned by the generator's current yield operation.
      //
      // So you can communicate *back* to the generator by calling
      //
      //  generator.next(<new value>)
      // 
      const firstName: string = (yield getFirstName()) as string;
      const secondName: string = (yield getLastName()) as string;

      expect(`${firstName} ${secondName}`).to.eql('Ben Biddington');
    }

    return run(generator);
  });
});