import { expect }           from '@test/integration/integration-test';
import { fakeGet, get }     from '@test/integration/support/net';
import { settings }         from '@test/integration/support/support';

const describeIf = (condition: { when: boolean, skipMessage: string }, name, fn) => {
  if (condition.when) {
    describe(name, fn);
  } else {
    describe.skip(`[${condition.skipMessage}] ${name}`, fn);
  }
}

const tokenIsPresent = { 
  when: settings.noaaToken?.length > 0, 
  skipMessage: `Skipped because no token is available`
}

// [i] https://grantwinney.com/what-is-noaa-api/#authorization
describeIf(tokenIsPresent, 'Noaa -- the basics', () => {
  it('parses reply as expected', async () => {
    const token = settings.noaaToken;

    const result = await get('https://www.ncdc.noaa.gov/cdo-web/api/v2/stations', { token });

    console.log(result);

    expect(result.statusCode).to.eql(200);
  });

  it('requests the right url');
})