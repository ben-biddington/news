import { MockToggles } from '../../support/mock-toggles';
import {
  Application, PortsBuilder, expect
} from '../application-unit-test';

import { Toggles } from '../../../src/core/toggles';

describe('Loading toggles', () => {
  it("reads toggles from the supplied source", async () => {
    
    const expected : Toggles = {  
      showDeleted:        { name: 'show-deleted'        , isOn: true },
      showBlocked:        { name: 'show-deleted'        , isOn: true },
      showBookmarks:      { name: 'show-bookmarks'      , isOn: true },
      showMarineWeather:  { name: 'show-marine-weather' , isOn: true }
    }

    const toggleSource = new MockToggles(expected);

    const application = new Application(PortsBuilder.new().withToggles(toggleSource), null);

    const actualToggles = await application.toggles.list();

    expect(actualToggles).to.eql(expected);
  });
});