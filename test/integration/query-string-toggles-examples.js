const expect = require('chai').expect;

const { QueryStringToggles } = require('../../src/adapters/web/query-string-toggles');

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

const { UIEvents } = require('../../src/adapters/web/gui/ui-events');
const { delay } = require('./support/support');

describe('UIEvents', () => {
    it('can tell when idle', async () => {
        const events = new UIEvents({ idlePeriod: 50 });

        expect(events.isIdle()).to.be.false;

        await delay(50);

        expect(events.isIdle()).to.be.true;
    });

    it('can wait until idle', async () => {
        const events = new UIEvents({ idlePeriod: 200 });

        expect(events.isIdle()).to.be.false;

        await events.waitUntilIdle({ timeout: 500 });

        await delay(50);

        expect(events.isIdle()).to.be.true;
    });

    it('waiting may time out', async () => {
        const events = new UIEvents({ idlePeriod: 200 });

        expect(events.isIdle()).to.be.false;

        let error = null;

        await events.waitUntilIdle({ timeout: 0 }).catch(e => error = e);

        expect(error.message).to.eql('Timed out after <0ms>');
    });
});