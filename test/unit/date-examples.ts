import { expect } from './application-unit-test';
import { formatDuration } from 'date-fns';
import { Timespan } from '../../src/core/timespan';

describe('Formatting', async () => {
  it('examples', () => {
    expect(formatDuration({ seconds: 90 }, { format: [ 'minutes', 'seconds' ]})).to.eql('90 seconds');
    
    // [?] Not quite what we want
    expect(formatDuration({ seconds: 900 }, { format: [ 'minutes', 'seconds' ]})).to.eql('900 seconds');
  });
});

describe('Timespan', () => {
  it('calculates days correctly', () => {
    expect(Timespan.fromDays(1).milliseconds()).to.eql(86_400_000);
    expect(Timespan.fromDays(2).milliseconds()).to.eql(2 * 86_400_000);
  });
});