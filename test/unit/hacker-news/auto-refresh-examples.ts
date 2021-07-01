import {
  delay, Application, PortsBuilder,
  mockLog as log, MockToggles, MockSeive, MockListener, MockLobsters, NewsItem } from '../application-unit-test';

describe('Automatically refreshing hacker news on a schedule', async () => {
  it("notifies with 'hacker-new-items-loaded'", async () => {
    const hackerNews = new MockLobsters();

    hackerNews.listReturns([
      new NewsItem('id-1', 'Title 1', 'http://xyz')
    ]);

    const toggles = new MockToggles();

    const application = new Application(
      PortsBuilder.new().
        withHackerNews(hackerNews).
        withLobsters(new MockLobsters()), toggles);

    const notifications = new MockListener(application);

    application.pollEvery(200);

    await delay(750);

    application.stopPolling();

    notifications.mustHaveAtLeast(
      {
        type: 'hacker-news-items-loaded',
        items: [
          new NewsItem('id-1', 'Title 1', 'http://xyz').labelled('hn')
        ]
      },
      2
    );
  });

  it('show that it seived the results, too!');
});