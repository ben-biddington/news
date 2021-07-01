import { expect } from './application-unit-test';
import { formatDuration } from 'date-fns';

describe('Formatting', async () => {
  it('examples', () => {
    expect(formatDuration({ seconds: 90 }, { format: [ 'minutes', 'seconds' ]})).to.eql('90 seconds');
    
    // [?] Not quite what we want
    expect(formatDuration({ seconds: 900 }, { format: [ 'minutes', 'seconds' ]})).to.eql('900 seconds');
  });
});