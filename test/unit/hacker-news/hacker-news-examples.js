const expect = require('chai').expect;

const { log, Application, Ports, MockLobsters, MockListener, MockSeive, MockToggles } = require('../application-unit-test');

describe('Viewing hacker news', async () => {
    it('can list news', () => {
        const hackerNews = new MockLobsters();

        const application = new Application(
            new Ports(new MockLobsters(), log, new MockSeive(), hackerNews), 
            new MockToggles());

        application.hackerNews.list();

        hackerNews.mustHaveHadListCalled();
    });
});

describe('Deleting hacker news items', () => {
    const hackerNews = new MockLobsters();

    const application = new Application(
        new Ports(new MockLobsters(), log, new MockSeive(), hackerNews), 
        new MockToggles());
    
    const notifications = new MockListener(application);

    it('performs the delete', async () => {
        await application.hackerNews.delete('item-id');

        hackerNews.mustHaveHadDeleteCalled('item-id');
    });

    it('notifies', async () => {
        await application.hackerNews.delete('item-abc-def');

        notifications.mustHave({
            type: 'hacker-news-item-deleted',
            id: 'item-abc-def'
        });
    });

    it('allows registering for the event', async () => {
        let theIdDeleted = null;

        application.on('hacker-news-item-deleted', (e) => {
            theIdDeleted = e.id;
        });

        await application.hackerNews.delete('item-one');

        expect(theIdDeleted).to.eql('item-one');
    });

    it('allows event handlers to fail', async () => {
        application.on('lobsters-item-deleted', _ => {
            throw new Error('Failed on purpose');
        });

        await application.hackerNews.delete('item-one');
    });
})