import {
  expect, Application, NewsItem, Ports,
  mockLog as log, MockToggles, MockSeive, MockListener, MockLobsters
} from '../application-unit-test';

describe('Listing lobsters news', async () => {
  it('marks items as new', async () => {
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
      new NewsItem('id-1', 'Title 1', 'http://abc').labelled('lobsters'),
      new NewsItem('id-2', 'Title 2', 'http://abc/def').labelled('lobsters').thatIsNew(),
    ]);
  });

  it('calling multiple times does not add duplicates', async () => {
    const lobsters = new MockLobsters();
    const application = new Application(new Ports(lobsters, log, new MockSeive()), new MockToggles());
    
    const listener = new MockListener(application);

    await application.lobsters.list();
    await application.lobsters.list();
    await application.lobsters.list();

    const notifications = listener.get('lobsters-items-loaded');

    const counts = notifications.map(it => it.items.length);

    expect(counts).to.eql([2, 2, 2]);
  });
});