const expect = require('chai').expect;

const { QueryStringToggles } = require('../../../src/adapters/web/toggling/query-string-toggles');

// npm run test.integration -- --grep toggle
describe('How to toggle by query string parameter', async () => {
  it('for example', async () => {
    const queryString = '?toggle-a=true'

    const toggles = new QueryStringToggles(queryString);

    expect(toggles.get('toggle-a')).to.be.true;
  });

  it('supports 1 for true', async () => {
    const queryString = '?toggle-a=1'

    const toggles = new QueryStringToggles(queryString);

    expect(toggles.get('toggle-a')).to.be.true;
  });

  it('just being present is on', async () => {
    const queryString = '?toggle-a'

    const toggles = new QueryStringToggles(queryString);

    expect(toggles.get('toggle-a')).to.be.true;
  });

  it('defaults off', async () => {
    const toggles = new QueryStringToggles('');

    expect(toggles.get('toggle-a')).to.be.false;
  });

  it('must match fully', async () => {
    const queryString = '?toggle-ab'

    const toggles = new QueryStringToggles(queryString);

    expect(toggles.get('toggle-a')).to.be.false;
  });
});