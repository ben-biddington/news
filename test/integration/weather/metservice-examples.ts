import { expect }           from '../integration-test';
import { fakeGet }          from '../support/net';
import { sevenDays }        from '../../../src/adapters/web/metservice';
import { WeatherForecast }  from '../../../src/core/weather';

describe('Seven day forecast', () => {
  it('parses reply as expected', async () => {
    const get = fakeGet(`${__dirname}/sample.json`);

    const result = await sevenDays({ get });

    expect(result.length).to.eql(7);

    const dayOne: WeatherForecast = result[0];

    expect(dayOne.condition).to.eql('windy');
    expect(dayOne.date).to.eql(new Date("2021-04-05T12:00:00+12:00"));
    expect(dayOne.sunrise).to.eql('2021-04-05T06:38:00+12:00');
    expect(dayOne.sunset).to.eql('2021-04-05T18:08:00+12:00');
    expect(dayOne.text).to.eql('Cloudy at times. Chance of a shower in Upper Hutt. Strong northwesterlies, gale at times, easing this evening.');
    expect(dayOne.temperature).to.eql({ high: 20, low: 13 });

    const dayTwo: WeatherForecast = result[1];
    expect(dayTwo.date).to.eql(new Date("2021-04-06T12:00:00+12:00"));

    const dayThree: WeatherForecast = result[2];
    expect(dayThree.date).to.eql(new Date("2021-04-07T12:00:00+12:00"));
  });

  it('requests the right url');
})