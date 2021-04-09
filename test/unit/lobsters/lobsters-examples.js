const {
  expect, Application, Ports,
  mockLog: log, MockToggles, MockSeive, MockListener, MockLobsters } = require('../application-unit-test');

describe('Viewing lobsters news', async () => {
  it('can list news', async () => {
    const lobsters = new MockLobsters();

    const application = new Application(new Ports(lobsters, log, new MockSeive()), new MockToggles());

    await application.lobsters.list();

    lobsters.mustHaveHadListCalled();
  });
});

describe('Deleting lobsters news items', () => {
  it('performs the delete', () => {
    const lobsters = new MockLobsters();

    const application = new Application(new Ports(lobsters, log, new MockSeive()), new MockToggles());

    application.lobsters.delete('item-id');

    lobsters.mustHaveHadDeleteCalled('item-id');
  });

  it('notifies', async () => {
    const application = new Application(new Ports(new MockLobsters(), log, new MockSeive()), new MockToggles());

    const notifications = new MockListener(application);

    await application.lobsters.delete('item-abc-def');

    notifications.mustHave({
      type: 'lobsters-item-deleted',
      id: 'item-abc-def'
    });
  });

  it('allows registering for the event', async () => {
    const application = new Application(new Ports(new MockLobsters(), log, new MockSeive()), new MockToggles());

    let theIdDeleted = null;

    application.on('lobsters-item-deleted', (e) => {
      theIdDeleted = e.id;
    });

    await application.lobsters.delete('item-one');

    expect(theIdDeleted).to.eql('item-one');
  });

  it('allows event handlers to fail', async () => {
    const application = new Application(new Ports(new MockLobsters(), log, new MockSeive()), new MockToggles());

    application.on('lobsters-item-deleted', _ => {
      throw new Error('Failed on purpose');
    });

    await application.lobsters.delete('item-one');
  });
});

describe('Snoozing lobsters news items', () => {
  it('notifies', async () => {
    const application = new Application(new Ports(new MockLobsters(), log, new MockSeive()), new MockToggles());

    const notifications = new MockListener(application);

    await application.lobsters.snooze('item-abc-def');

    notifications.mustHave({
      type: 'lobsters-item-snoozed',
      id: 'item-abc-def'
    });
  });
})