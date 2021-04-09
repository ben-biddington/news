import { MockToggles } from '../../support/mock-toggles';
import {
  Application, Ports, expect
} from '../application-unit-test';

import { Toggles } from '../../../src/core/toggles';

describe('Loading toggles', () => {
  it("reads toggles from the supplied source", async () => {
    
    const expected : Toggles = {  
      showDeleted:        { name: 'show-deleted'        , isOn: true },
      showBookmarks:      { name: 'show-bookmarks'      , isOn: true },
      showMarineWeather:  { name: 'show-marine-weather' , isOn: true }
    }

    const toggleSource = new MockToggles(expected);

    const application = new Application(Ports.blank().withToggles(toggleSource), null);

    const actualToggles = await application.toggles.list();

    expect(actualToggles).to.eql(expected);
  });
});