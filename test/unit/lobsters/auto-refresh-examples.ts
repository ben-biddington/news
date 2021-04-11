import {
  delay, Application, Ports, NewsItem,
  mockLog as log, MockToggles, MockSeive, MockListener, MockLobsters } from '../application-unit-test';

describe('Automatically refreshing lobsters news on a schedule', async () => {
  it("notifies with 'lobsters-items-loaded'", async () => {
    const lobsters = new MockLobsters();

    lobsters.listReturns([
      new NewsItem('id-1', 'Title 1', 'http://xyz').thatIsNew()
    ]);

    const toggles = new MockToggles();

    const application = new Application(new Ports(lobsters, log, new MockSeive(), new MockLobsters()), toggles);

    const notifications = new MockListener(application);

    application.pollEvery(200);

    await delay(750);

    application.stopPolling();

    notifications.mustHaveAtLeast({
      type: 'lobsters-items-loaded',
      items: [
        new NewsItem('id-1', 'Title 1', 'http://xyz').thatIsNew().labelled('lobsters')
      ]
    },
      2
    );
  });

  it('show that it seived the results, too!');
});