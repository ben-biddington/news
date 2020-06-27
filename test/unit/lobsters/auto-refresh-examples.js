const { 
    delay, Application, Ports, NewsItem,
    mockLog: log, MockToggles, MockSeive, MockListener, MockLobsters } = require('../application-unit-test');

describe('Automatically refreshing lobsters news on a schedule', async () => {
    it("notifies with 'lobsters-items-loaded'", async () => {
        const lobsters = new MockLobsters();
        
        lobsters.listReturns([
            new NewsItem('id-1', 'Title 1', 'http://xyz')
        ]);

        const toggles = new MockToggles(it => it.returnTrue('allow-lobsters-auto-refresh'));

        const application = new Application(new Ports(lobsters, log, new MockSeive()), toggles);

        const notifications = new MockListener(application);

        application.pollEvery(200);

        await delay(750);

        application.stopPolling();

        notifications.mustHaveAtLeast({
            type: 'lobsters-items-loaded',
            items: [
                new NewsItem('id-1', 'Title 1', 'http://xyz').thatIsNew()
            ]
        }, 
            2
        );
    });

    it('show that it seived the results, too!');

    it("does nothing when toggled off", async () => {
        const lobsters = new MockLobsters();
        
        lobsters.listReturns([
            new NewsItem('id-1', 'Title 1', 'http://xyz')
        ]);

        const toggles = new MockToggles();

        const application = new Application(new Ports(lobsters, log, new MockSeive()), toggles);

        const notifications = new MockListener(application);

        application.pollEvery(500);

        await delay(1000);

        application.stopPolling();

        notifications.mustNotHave('lobsters-items-loaded');
    });
});