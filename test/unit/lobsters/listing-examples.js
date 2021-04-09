const { 
    expect, Application,  NewsItem, Ports,
    mockLog: log, MockToggles, MockSeive, MockListener, MockLobsters } = require('../application-unit-test');

describe('Listing lobsters news', async () => {
    it('marks items as new', async() => {
        const lobsters = new MockLobsters();

        const application = new Application(new Ports(lobsters, log, new MockSeive()), new MockToggles());

        lobsters.listReturns([
            new NewsItem('id-1', 'Title 1', 'http://xyz')
        ]);

        await application.lobsters.list();

        lobsters.listReturns([
            new NewsItem('id-1', 'Title 1', 'http://abc'),
            new NewsItem('id-2', 'Title 2', 'http://abc/def'),
        ]);

        const result = await application.lobsters.list();

        expect(result).to.eql([
            new NewsItem('id-1', 'Title 1', 'http://abc'),
            new NewsItem('id-2', 'Title 2', 'http://abc/def').thatIsNew(),
        ]);
    });
});