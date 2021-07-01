import { MockBlockedHosts } from "../../support/mock-blocked-hosts";

const {
  expect,
  Application, PortsBuilder, NewsItem,
  MockToggles, MockSeive, MockLobsters } = require('../application-unit-test');

describe('Seiving lobsters news', async () => {
  it('filters out deleted news items', async () => {
    const lobsters = new MockLobsters();

    const fullList = [
      new NewsItem('A', 'item A').thatIsNew(),
      new NewsItem('B', 'item B').thatIsNew(),
      new NewsItem('C', 'item C').thatIsNew(),
    ];

    lobsters.listReturns(fullList);

    const seive = new MockSeive();
    seive.alwaysReturn(['B']);

    const application = new Application(PortsBuilder.new().withLobsters(lobsters).withSeive(seive), new MockToggles());

    const seivedResult = await application.lobsters.list();

    lobsters.mustHaveHadListCalled();
    seive.mustHaveHadApplyCalled(fullList);

    // https://masteringjs.io/tutorials/mocha/chai
    expect(seivedResult[0]).to.deep.include(
      {
        id: 'B',
        title: 'item B',
        new: true
      }
    );
  });

  it('marks news items with blocked hosts with a flag', async () => {
    const lobsters = new MockLobsters();
    const blockedHosts = new MockBlockedHosts();

    await blockedHosts.add('www.bbc.com');

    lobsters.listReturns([
      new NewsItem('A', '', 'https://a'),
      new NewsItem('B', 'Prince Philip: Gun salutes planned across UK after Duke of Edinburgh dies aged 99', 'https://www.bbc.com/news/uk-56698794'),
      new NewsItem('C', '', 'https://c')
    ]);

    const application = new Application(PortsBuilder.new().withLobsters(lobsters).withBlockedHosts(blockedHosts), null);

    const result = await application.lobsters.list();
    
    expect(result.find(it => it.id === 'A').hostIsBlocked).to.be.false;
    expect(result.find(it => it.id === 'B').hostIsBlocked).to.be.true;
    expect(result.find(it => it.id === 'C').hostIsBlocked).to.be.false;
  });

  it('can be opted-out, and marked deleted instead', async () => {
    const lobsters = new MockLobsters(it =>
      it.listReturns(
        [
          new NewsItem('A', 'item A'),
          new NewsItem('B', 'item B'),
        ]
      )
    );

    const seive = new MockSeive(it => it.alwaysReturn(['B']));

    const toggles = new MockToggles(it => it.alwaysReturn({
      showBookmarks: { name: 'show-bookmarks', isOn: false },
      showBlocked: { name: 'show-blocked', isOn: false },
      showDeleted: { name: 'show-deleted', isOn: true },
      showMarineWeather: { name: 'show-weather', isOn: false }
    }));

    const application = new Application(PortsBuilder.new().withLobsters(lobsters).withSeive(seive).withToggles(toggles), null);

    const seivedResult = await application.lobsters.list();

    expect(seivedResult.map(it => ({ id: it.id, deleted: it.deleted }))).to.eql([
      {
        id: 'A',
        deleted: true
      },
      {
        id: 'B',
        deleted: false
      },
    ]);
  });
});