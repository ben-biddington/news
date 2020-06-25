const { 
    delay, Application, Ports,
    mockLog: log, MockToggles, MockSeive, MockListener, MockLobsters } = require('../application-unit-test');

    const { NewsItem } = require('../../../src/core/news-item');

describe('Automatically refreshing lobsters news on a schedule', async () => {
    it("notifies with 'hacker-new-items-loaded'", async () => {
        const hackerNews = new MockLobsters();
        
        hackerNews.listReturns([
            new NewsItem('id-1', 'Title 1', 'http://xyz')
        ]);

        const toggles = new MockToggles(it => it.returnTrue('allow-auto-refresh'));

        const application = new Application(
            new Ports(new MockLobsters(), log, new MockSeive()).withHackerNews(hackerNews), toggles);

        const notifications = new MockListener(application);

        application.pollEvery(200);

        await delay(750);

        application.stopPolling();

        notifications.mustHaveAtLeast({
            type: 'hacker-news-items-loaded',
            items: [
                new NewsItem('id-1', 'Title 1', 'http://xyz')
            ]
        }, 
            2
        );
    });

    it('show that it seived the results, too!');

    it("does nothing when toggled off", async () => {
        const hackerNews = new MockLobsters();
        
        hackerNews.listReturns([
            new NewsItem('id-1', 'Title 1', 'http://xyz')
        ]);

        const toggles = new MockToggles();

        const application = new Application(
            new Ports(new MockLobsters(), log, new MockSeive()).withHackerNews(hackerNews), toggles);

        const notifications = new MockListener(application);

        application.pollEvery(500);

        await delay(1000);

        application.stopPolling();

        notifications.mustNotHave('hacker-news-items-loaded');
    });
});