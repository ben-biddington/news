const expect = require('chai').expect;

const { CookieToggles } = require('../../../src/adapters/web/toggling/cookie-toggles');

// npm run test.integration -- --grep cookie
describe('How to toggle by cookie', async () => {
    it('for example', async () => {
        const queryString = 'toggle-a=true'

        const toggles = new CookieToggles(queryString);

        expect(toggles.get('toggle-a')).to.be.true;
    });

    it('supports 1 for true', async () => {
        const queryString = 'toggle-a=1'

        const toggles = new CookieToggles(queryString);

        expect(toggles.get('toggle-a')).to.be.true;
    });

    it('just being present is on', async () => {
        const queryString = 'toggle-a'

        const toggles = new CookieToggles(queryString);

        expect(toggles.get('toggle-a')).to.be.true;
    });

    it('defaults off', async () => {
        const toggles = new CookieToggles('');

        expect(toggles.get('toggle-a')).to.be.false;
    });

    it('must match fully', async () => {
        const queryString = 'toggle-ab'

        const toggles = new CookieToggles(queryString);

        expect(toggles.get('toggle-a')).to.be.false;
    });
});