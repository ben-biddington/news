import { Application } from '../../../src/core/application';
import {
  delay, PortsBuilder, NewsItem, MockListener, MockLobsters } from '../application-unit-test';

describe('Automatically refreshing lobsters news on a schedule', async () => {
  it("notifies with 'lobsters-items-loaded'", async () => {
    const lobsters = new MockLobsters();

    lobsters.listReturns([
      new NewsItem('id-1', 'Title 1', 'http://xyz').thatIsNew()
    ]);

    const application = new Application(
      PortsBuilder.new().
        withLobsters(lobsters).
        withHackerNews(new MockLobsters()));

    const notifications = new MockListener(application);

    application.pollEvery(200);

    await delay(750);

    application.stopPolling();

    notifications.mustHaveAtLeast({ type: 'lobsters-items-loaded' }, 2);
  });

  it('show that it seived the results, too!');
});