const { 
  Application, Ports,
  mockLog: log, MockToggles, MockSeive, MockListener, MockLobsters } = require('../application-unit-test');

describe('Saving a toggle value', async () => {
  it("notifies with toggle changed", async () => {
      const ports = new Ports(new MockLobsters(), log, new MockSeive());

      const application = new Application(ports,  new MockToggles());

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