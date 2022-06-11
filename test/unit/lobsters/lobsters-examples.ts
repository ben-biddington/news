import { NewsItem } from '../../../src/core/news-item';
import {
  expect, Application, PortsBuilder,
  mockLog as log, MockToggles, MockSeive, MockListener, MockLobsters } from '../application-unit-test';
import { MockBlockedHosts } from '../../support/mock-blocked-hosts';

describe('Viewing lobsters news', async () => {
  it('can list news', async () => {
    const lobsters = new MockLobsters();

    const application = new Application(PortsBuilder.new().withLobsters(lobsters), new MockToggles());

    await application.lobsters.list();

    lobsters.mustHaveHadListCalled();
  });
});

describe('Deleting lobsters news items', () => {
  it('performs the delete', () => {
    const lobsters = new MockLobsters(it => it.listReturns([ new NewsItem('a', 'A')]));

    const application = new Application(PortsBuilder.new().withLobsters(lobsters), new MockToggles());

    application.lobsters.delete('item-id');

    lobsters.mustHaveHadDeleteCalled('item-id');
  });

  it('notifies, omitting blocked items', async () => {
    const lobsters = new MockLobsters(
      it => it.listReturns([ 
        new NewsItem('a', 'A'), 
        new NewsItem('b', 'B'),
        new NewsItem('b', 'C (BLOCKED)', 'http://bbc.co.uk'), 
      ]));

    const blockedHosts  = new MockBlockedHosts();

    const application = new Application(PortsBuilder.new().withLobsters(lobsters).withBlockedHosts(blockedHosts), new MockToggles());

    const notifications = new MockListener(application);

    await application.lobsters.list();
    await application.news.block('bbc.co.uk');
    await application.lobsters.delete('a');

    notifications.mustHave({
      type: 'lobsters-item-deleted',
      id: 'a'
    });

    notifications.mustHave({
      "type": "news-items-modified",
      "items": [
        {
          date: undefined,
          url: undefined,
          "id": "b",
          "title": "B",
          "deleted": false,
          "new": false,
          "hostIsBlocked": false,
          "readLater": false,
          "label": "lobsters"
        }
      ]
    });
  });

  it('allows registering for the event', async () => {
    const application = new Application(PortsBuilder.new().withLobsters(new MockLobsters()), new MockToggles());

    let theIdDeleted = null;

    application.on('lobsters-item-deleted', (e) => {
      theIdDeleted = e.id;
    });

    await application.lobsters.delete('item-one');

    expect(theIdDeleted).to.eql('item-one');
  });

  it('allows event handlers to fail', async () => {
    const application = new Application(PortsBuilder.new().withLobsters(new MockLobsters()), new MockToggles());

    application.on('lobsters-item-deleted', _ => {
      throw new Error('Failed on purpose');
    });

    await application.lobsters.delete('item-one');
  });
});

describe('Snoozing lobsters news items', () => {
  it('notifies', async () => {
    const application = new Application(PortsBuilder.new().withLobsters(new MockLobsters()), new MockToggles());

    const notifications = new MockListener(application);

    await application.lobsters.snooze('item-abc-def');

    notifications.mustHave({
      type: 'lobsters-item-snoozed',
      id: 'item-abc-def'
    });
  });
})

describe('Removing lobsters news items', () => {
  it('notifies with change and the item has been omitted', async () => {
    const lobsters = new MockLobsters(
      it => it.listReturns([ 
        new NewsItem('item-a', 'A'), 
        new NewsItem('item-b', 'B')
      ]));

    const application = new Application(PortsBuilder.blank().withLobsters(lobsters));

    const notifications = new MockListener(application);

    await application.lobsters.list();
    await application.lobsters.remove('item-a');

    notifications.mustHave({
      type: "news-items-modified",
      items: [
        {
          date: undefined,
          url: undefined,
          readLater: false,
          "id": "item-b",
          "title": "B",
          "deleted": false,
          "new": true,
          "hostIsBlocked": false,
          "label": "lobsters"
        }
      ]
    });
  });
});