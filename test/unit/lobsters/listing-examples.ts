import {
  expect, Application, NewsItem, Ports,
  mockLog as log, MockToggles, MockSeive, MockListener, MockLobsters
} from '../application-unit-test';

import { MockBlockedHosts } from '../../support/mock-blocked-hosts';

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

describe('Listing and blocked hosts', () => {
  const lobsters      = new MockLobsters();
  const toggles       = new MockToggles();
  const blockedHosts  = new MockBlockedHosts();
  let   application;

  beforeEach(() => {
    blockedHosts.add('www.bbc.co.uk');

    application = new Application(
      Ports.blank().
        withBlockedHosts(blockedHosts).
        withLobsters(lobsters).
        withToggles(toggles));
  });

  it('does not return them when toggled OFF', async () => {
    toggles.alwaysReturn(
      {
        showDeleted:      { name: '.', isOn: false },
        showBlocked:      { name: 'show-blocked', isOn: false },
        showBookmarks:    { name: '.', isOn: false },
        showMarineWeather:{ name: '.', isOn: false }
      });

    lobsters.listReturns([
      new NewsItem('id-1', 'Title 1', 'https://www.bbc.co.uk/example'),
      new NewsItem('id-2', 'Title 2', 'https://rnz.co.nz/example'),
    ]);

    const result = await application.lobsters.list();

    expect(result.length).to.eql(1);
    
    expect(result[0]).to.deep.include(
      {
        "title": "Title 2"
      }
    );
  });

  it('returns them when toggled ON', async () => {
    toggles.alwaysReturn(
      {
        showDeleted:      { name: '.', isOn: false },
        showBlocked:      { name: 'show-blocked', isOn: true },
        showBookmarks:    { name: '.', isOn: false },
        showMarineWeather:{ name: '.', isOn: false }
    })

    lobsters.listReturns([
      new NewsItem('id-1', 'Title 1', 'https://www.bbc.co.uk/example'),
      new NewsItem('id-2', 'Title 2', 'https://rnz.co.nz/example'),
    ]);

    const result = await application.lobsters.list();

    expect(result.length).to.eql(2);
  });
});