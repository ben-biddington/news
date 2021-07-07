const { expect } = require('@test/integration/integration-test');
import { wellington } from '../../src/adapters/web/sea-temp';

// npm run test.integration -- --grep hack
describe.skip('Can fetch sea temp  ', async () => {
  it('works like this', async () => {
    expect(await wellington()).to.be.above(9);
    expect(await wellington()).to.be.below(20);
  });
});