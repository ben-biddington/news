import { WeatherForecast, WeatherQuery } from '../../src/core/weather';
import { MockListener, Application, Ports, MockSettings, MockToggles } from './application-unit-test';

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