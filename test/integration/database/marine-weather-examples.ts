const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { MarineWeather, Screenshot } from '../../../src/adapters/database/marine-weather';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { ConsoleLog } from '@test/../src/core/logging/log';

describe('[marine-weather] Can store screenshots', () => {
  let marineWeather: MarineWeather = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    marineWeather = new MarineWeather(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await marineWeather.init();
  });

  it('can add a single screenshot', async () => {
    const file = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-09.png')));

    await marineWeather.addScreenshot({ file, timestamp: new Date()});

    const attachments: Screenshot[] = await marineWeather.listScreenshots();

    expect(attachments.length).to.eql(1);
  });
});