import { createActionDescriptor } from 'mobx/dist/internal';
import { expect } from '../../application-unit-test';

const list = function*(items: number[]) {
  let index = 0;
  while (true) {
    yield items[index++];
  }
}

const asyncList = function*(items: Promise<number>[]) {
  let index = 0;
  while (true) {
    yield items[index++];
  }
}

describe('Generator functions', () => {
  it('returns several times', () => {
    const generator = list([0,1,2,3]);

    expect(generator.next().value).to.eql(0);
    expect(generator.next().value).to.eql(1);
    expect(generator.next().value).to.eql(2);
    expect(generator.next().value).to.eql(3);
  });
});

// https://wanago.io/2018/04/23/demystifying-generators-implementing-async-await/
describe('Generator functions with promises', () => {
  it('there is nothing special about promises', async () => {
    const generator = asyncList([
      Promise.resolve(0),
      Promise.resolve(1)
    ]);

    expect(await generator.next().value).to.eql(0);
    expect(await generator.next().value).to.eql(1);
  });
});