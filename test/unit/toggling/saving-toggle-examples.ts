import { 
  Application, Ports,
  MockToggles, MockListener } from '../application-unit-test';

describe.only('Saving a toggle value', async () => {
  it("notifies with toggle changed", async () => {
      const application = new Application(Ports.blank(),  new MockToggles(), null);

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