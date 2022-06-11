import {
  expect, Application, NewsItem, PortsBuilder,
  mockLog as log, MockToggles, MockSeive, MockListener, MockLobsters, MockClock
} from '../application-unit-test';

import { MockBlockedHosts } from '../../support/mock-blocked-hosts';

describe('Listing lobsters news', async () => {
  it('marks items as new', async () => {
    const lobsters = new MockLobsters();

    const application = new Application(PortsBuilder.new().withLobsters(lobsters));

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

  it('notifies with <stats> and <lobsters-items-loaded>', async () => {
    const lobsters  = new MockLobsters();
    const clock     = new MockClock();
    const ports     = PortsBuilder.new().withLobsters(lobsters).withLog(log).withClock(clock).build();

    lobsters.listReturns([
      new NewsItem('id-1', 'Title 1', 'http://xyz')
    ]);

    const now = new Date('01-Apr-2021');

    clock.nowReturns(now);

    const application = new Application(ports, new MockToggles());

    const listener: MockListener = new MockListener(application);

    await application.lobsters.list();

    listener.mustHave(
      { 
        type: "stats",
        "intervals": {
          "statisticsEmitInSeconds": 30,
          "updateIntervalInSeconds": null
        },
        lastUpdateAt: new Date("2021-03-31T11:00:00.000Z")
      }
    );

    listener.mustHave(
      {
        "type": "lobsters-items-loaded",
        "items": [
          {
            date: undefined,
            readLater: false,
            "id": "id-1",
            "title": "Title 1",
            "url": "http://xyz",
            "deleted": false,
            "new": true,
            "hostIsBlocked": false,
            "label": "lobsters"
          }
        ]
      }
    );
  });

  it('calling multiple times does not add duplicates', async () => {
    const lobsters = new MockLobsters();
    const application = new Application(PortsBuilder.new().withLobsters(lobsters));
    
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
      PortsBuilder.new().
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