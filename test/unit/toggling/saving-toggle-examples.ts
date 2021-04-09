import { MockToggles } from '../../support/mock-toggles';
import {
  Application, Ports,
  MockListener, expect
} from '../application-unit-test';

describe('Saving a toggle value', async () => {
  it("notifies with toggle saved", async () => {
    const application = new Application(Ports.blank(), {}, null);

    const notifications = new MockListener(application);

    await application.toggles.save({ name: 'example-toggle', isOn: true });

    notifications.mustHaveAtLeast({
        type: 'toggle-saved',
        toggle: { name: 'example-toggle', isOn: true }
      }
    );
  });

  it("[special] can update marine weather", async () => {
    const application = new Application(Ports.blank(), {}, null);

    await application.toggles.save({ name: 'show-marine-weather', isOn: true });

    let newValue = await application.toggles.list();

    expect(newValue.showMarineWeather).to.eql({ name: 'show-marine-weather', isOn: true });

    await application.toggles.save({ name: 'show-marine-weather', isOn: false });

    newValue = await application.toggles.list();

    expect(newValue.showMarineWeather).to.eql({ name: 'show-marine-weather', isOn: false });
  });
});