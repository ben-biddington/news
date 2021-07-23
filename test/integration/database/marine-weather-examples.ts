const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { MarineWeather, Screenshot } from '../../../src/adapters/database/marine-weather';
import { readFileSync, existsSync } from 'fs';
import { resolve, join } from 'path';
import { ConsoleLog } from '@test/../src/core/logging/log';

describe('[marine-weather] Can store screenshots', () => {
  let marineWeather: MarineWeather = null;
  let tempDir;

  beforeEach(async () => {
    const tempFile = await temp.open();

    marineWeather = new MarineWeather(tempFile.path, tempDir = await temp.mkdir(), new ConsoleLog({ allowTrace: false }));

    await marineWeather.init();
  });

  it('can add a single screenshot', async () => {
    const file = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-09.png')));

    await marineWeather.addScreenshot({ 
      file,
      timestamp: new Date('2021-07-09'),
      name: 'lyall-bay'
    });

    const screenshots: Screenshot[] = await marineWeather.listScreenshots();

    expect(screenshots.length).to.eql(1);
    expect(screenshots[0].name).to.eql('lyall-bay');
    expect(screenshots[0].hash).to.eql('aeb74c577ab34a0ea68320d10cdd7b32e4d609a92009e2ba45b0e8239ee8fe92');
    expect(screenshots[0].filePath).to.eql(`${tempDir}/lyall-bay/2021-07-09-12.00`);

    expect(existsSync(screenshots[0].filePath)).to.be.true;
  });

  it('can query for screenshots by date', async () => {
    const file = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-09.png')));

    await marineWeather.addScreenshot({ file, name: 'lyall-bay', timestamp: new Date('01-Nov-1999')});
    await marineWeather.addScreenshot({ file, name: 'lyall-bay', timestamp: new Date('02-Nov-1999')});
    await marineWeather.addScreenshot({ file, name: 'lyall-bay', timestamp: new Date('03-Nov-1999')});

    expect((await marineWeather.listScreenshots({ dateMatching: new Date('31-Oct-1999') })).length).to.eql(0);
    expect((await marineWeather.listScreenshots({ dateMatching: new Date('01-Nov-1999') })).length).to.eql(1);
    expect((await marineWeather.listScreenshots({ dateMatching: new Date('02-Nov-1999') })).length).to.eql(1);
    expect((await marineWeather.listScreenshots({ dateMatching: new Date('03-Nov-1999') })).length).to.eql(1);
    expect((await marineWeather.listScreenshots({ dateMatching: new Date('04-Nov-1999') })).length).to.eql(0);
  });

  it('can query for screenshots by date and time', async () => {
    const file = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-09.png')));

    await marineWeather.addScreenshot({ file, name: 'lyall-bay', timestamp: new Date('02-Nov-1999')});

    expect((await marineWeather.listScreenshots({ dateMatching: new Date('01-Nov-1999 23:59:59') })).length).to.eql(0);

    expect((await marineWeather.listScreenshots({ dateMatching: new Date('02-Nov-1999 00:00:00') })).length).to.eql(1);
    expect((await marineWeather.listScreenshots({ dateMatching: new Date('02-Nov-1999 12:00:00') })).length).to.eql(1);
    expect((await marineWeather.listScreenshots({ dateMatching: new Date('02-Nov-1999 23:59:59') })).length).to.eql(1);

    expect((await marineWeather.listScreenshots({ dateMatching: new Date('03-Nov-1999 00:00:00') })).length).to.eql(0);
  });

  it('can query for screenshots by name and hash', async () => {
    const fileA = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-09.png')));
    const fileB = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-20-11.25')));
    const fileC = readFileSync(resolve(join(__dirname, './diary/samples/2021-07-20-15.28')));

    await marineWeather.addScreenshot({ file: fileA, name: 'a', timestamp: new Date('02-Nov-1999')});
    await marineWeather.addScreenshot({ file: fileB, name: 'b', timestamp: new Date('02-Nov-1999')});
    await marineWeather.addScreenshot({ file: fileC, name: 'c', timestamp: new Date('02-Nov-1999')});

    const successfulQuery = (await marineWeather.listScreenshots(
      { 
        name: 'a', 
        hash: 'aeb74c577ab34a0ea68320d10cdd7b32e4d609a92009e2ba45b0e8239ee8fe92'
      }));
    
    expect(successfulQuery.length).to.eql(1);

    const successfulResult = successfulQuery[0];
    
    expect(successfulResult.name).to.eql('a');
    
    expect((await marineWeather.listScreenshots(
      { 
        name: 'b', 
        hash: 'aeb74c577ab34a0ea68320d10cdd7b32e4d609a92009e2ba45b0e8239ee8fe92' 
      }))).to.be.empty;

    expect((await marineWeather.listScreenshots(
      { 
        name: 'c', 
        hash: 'aeb74c577ab34a0ea68320d10cdd7b32e4d609a92009e2ba45b0e8239ee8fe92' 
      }))).to.be.empty;
  });
});