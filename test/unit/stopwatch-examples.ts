const expect = require('chai').expect;
import { delay } from '../support/delay';
import { Stopwatch } from '../../src/core/stopwatch';

describe('Stopwatch', async () => {
  it('works about right', async () => {
    const stopwatch = new Stopwatch();

    stopwatch.start();

    await delay(200);

    stopwatch.stop();

    expect(stopwatch.elapsed).to.be.greaterThan(0);

  });
});