import { WeatherForecast, WeatherQuery } from '../../src/core/weather';
import { expect, MockListener, Application, Ports, MockSettings, MockToggles } from './application-unit-test';

class MockWeatherQuery implements WeatherQuery {
  private result: WeatherForecast[] = [];

  constructor(result: WeatherForecast[]) {
    this.result = result;
  }

  sevenDays(): Promise<WeatherForecast[]> {
    return Promise.resolve(this.result);
  }
}

describe('Viewing weather', async () => {
  it('it notifies with weather', async () => {

    const expectedWeather: Array<WeatherForecast> = [{
      date: new Date("2021-04-05T20:53:46.142Z"),
      condition: 'Windy',
      sunrise: new Date("2021-04-05T20:53:46.142Z"),
      sunset: new Date("2021-04-05T20:53:46.142Z"),
      text: 'a', 
      temperature: { high: 20, low: 10} 
    }];

    const weatherQuery = new MockWeatherQuery(expectedWeather);

    const application = new Application(
      Ports.blank().with(weatherQuery),
      new MockToggles(), 
      new MockSettings());
    
    const listener = new MockListener(application);

    await application.weather.sevenDays();

    listener.mustHave({
      type:"weather-loaded",
      weather:
      [
        {
          date:"2021-04-05T20:53:46.142Z",
          condition:"Windy",
          sunrise:"2021-04-05T20:53:46.142Z",
          sunset:"2021-04-05T20:53:46.142Z",
          text:"a",
          temperature:
          {
            high:20,
            low:10
          }
        }
      ]
    });
  });
});

class Item {
  id?: string;
  title?: string;
  date?: Date;
}

class ItemBuilder {
  private readonly item: Item;

  constructor(item?: Item) {
    this.item = item;
  }

  static create(): ItemBuilder {
    return new ItemBuilder();
  }

  withId<T extends string>(id: string) {
    return new ItemBuilder({ ...this.item, id });
  }

  titled<T extends string>(title: string) {
    return new ItemBuilder({ ...this.item, title });
  }

  dated<T extends Date>(date: Date | string) {
    if (date instanceof Date) 
    {
      return new ItemBuilder({ ...this.item, date });
    }
    
    return new ItemBuilder({ ...this.item, date: new Date(date) });
  }

  build(): Item { return this.item; }
}

const item = () => {
  let result: Item = { };

  return {
    withId: (result: Item, id: string) => {
      return (id: string) => {}
    },
    build: () => result,
  }
 };

describe('A news item builder', () => {
  it('returns an item', () => {
    const value: Item = ItemBuilder.create().
      withId('abc').
      titled('An example').
      dated('19-Nov-1976').
      build();

    expect(value).to.eql({
      id: 'abc',
      title: 'An example',
      date: new Date('19-Nov-1976')
    })
  });
});

import { ConsoleLog } from '../../src/core/logging/log';

describe('Console log', () => {
  it('allows trace', () => {
    const log = new ConsoleLog();

    expect(typeof log.trace).to.eql('function');
    expect(typeof log.info).to.eql('function');
  });
});