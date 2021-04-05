const { expect }   = require('../integration-test');

const trace = process.env.TRACE ? console.log : () => {}

const { fakeGet } = require('../support/net');

const { sevenDays } = require('../../../src/adapters/metservice');

describe.only('Seven day forecast', () => {
  it('requests the right url');

  it('parses reply as expected', async () => {
    const get = fakeGet(`${__dirname}/sample.json`);

    const result = await sevenDays(get);

    expect(result.length).to.eql(7);

    const dayOne = result[0];

    expect(dayOne.condition).to.eql('windy');
    expect(dayOne.sunrise).to.eql('2021-04-05T06:38:00+12:00');
    expect(dayOne.sunset).to.eql('2021-04-05T18:08:00+12:00');
    expect(dayOne.text).to.eql('Cloudy at times. Chance of a shower in Upper Hutt. Strong northwesterlies, gale at times, easing this evening.');
    expect(dayOne.temperature).to.eql({ high: 20, low: 13 });
  });
})