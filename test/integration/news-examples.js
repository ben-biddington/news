const { del } = require('../../src/adapters/news');

const { MockInternet } = require('../integration/support/net');

const expect = require('chai').expect;

describe('Deleting a news item', async () => {
    it('for example', async () => {
        const internet = new MockInternet()

        await del({ internet }, { id: 'id-abc-def' });

        internet.mustHaveHadDeleteCalled('/news/items/id-abc-def');
    });
});