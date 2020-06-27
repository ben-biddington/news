const expect = require('chai').expect;
const { UIEvents } = require('../../src/adapters/web/gui/ui-events');
const { delay } = require('./support/support');

describe('UIEvents', () => {
    it('can tell when idle', async () => {
        const events = new UIEvents({ idlePeriod: 50 });

        expect(events.isIdle()).to.be.false;

        await delay(100);

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