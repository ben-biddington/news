import { ConsoleLog, DevNullLog } from '@test/../src/core/logging/log';
import { get } from '../../../../src/adapters/web/sea-temp';
import { expect }           from '@test/integration/integration-test';

describe('Fetching from "https://seatemperature.info"', () => {
  it('works', async () => {
    const reply = await get({ log: new DevNullLog() }, 'lyall-bay', { headless: true });

    expect(reply).to.be.above(9);
    expect(reply).to.be.below(20);
  })
})