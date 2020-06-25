const expect = require('chai').expect;

const { Application, Ports } = require('../../src/core/application');

const { NewsItem } = require('../../src/core/news-item');

const { MockLobsters } = require('../support/mock-lobsters');

const { MockListener } = require('../support/mock-listener');

const { MockSeive } = require('../support/mock-seive');

const { MockToggles } = require('../support/mock-toggles');

const { log } = require('../support/mock-log');

describe('Viewing rnz news', async () => {
    it('can list news', () => {
        const rnz = new MockLobsters();

        const application = new Application(
            new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters(), rnz), 
            new MockToggles());

        application.rnzNews.list();

        rnz.mustHaveHadListCalled();
    });

    it('returns the newest first', async () => {
        const rnz = new MockLobsters();
        
        rnz.listReturns([
            new NewsItem('a', '', '', new Date('Fri, 12 Jun 2020 08:00:00 +1200')),
            new NewsItem('b', '', '', new Date('Fri, 12 Jun 2020 09:00:00 +1200')),
            new NewsItem('c', '', '', new Date('Fri, 12 Jun 2020 10:00:00 +1200')),
        ]);

        const application = new Application(
            new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters(), rnz), 
            new MockToggles());

        const result = await application.rnzNews.list();

        expect(result.map(it => it.id)).to.eql([ 'c', 'b', 'a']);
    });
});

describe('Deleting rnz news items', () => {
    const rnz = new MockLobsters();

    const application = new Application(
        new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters(), rnz), 
        new MockToggles());
    
    const notifications = new MockListener(application);

    it('performs the delete', async () => {
        await application.rnzNews.delete('item-id');

        rnz.mustHaveHadDeleteCalled('item-id');
    });

    it('notifies', async () => {
        await application.rnzNews.delete('item-abc-def');

        notifications.mustHave({
            type: 'rnz-news-item-deleted',
            id: 'item-abc-def'
        });
    });

    it('allows registering for the event', async () => {
        let theIdDeleted = null;

        application.on('rnz-news-item-deleted', (e) => {
            theIdDeleted = e.id;
        });

        await application.rnzNews.delete('item-one');

        expect(theIdDeleted).to.eql('item-one');
    });

    it('allows event handlers to fail', async () => {
        application.on('rnz-item-deleted', _ => {
            throw new Error('Failed on purpose');
        });

        await application.rnzNews.delete('item-one');
    });
})