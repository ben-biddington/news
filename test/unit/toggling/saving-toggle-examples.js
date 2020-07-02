const { 
  Application, Ports,
  mockLog: log, MockToggles, MockSeive, MockListener, MockLobsters } = require('../application-unit-test');

describe('Saving a toggle value', async () => {
  it("notifies with toggle changed", async () => {
      const toggles = new Ports(new MockLobsters(), log, new MockSeive()).withToggles(new MockToggles());

      const application = new Application(toggles,  new MockToggles());

      const notifications = new MockListener(application);

      application.toggles.save({ 'example-toggle': true });

      notifications.mustHaveAtLeast({
          type: 'toggle-saved',
          toggle: { 'example-toggle': true }
        }
      );
  });

  it('persists the toggle');
});