const expect = require('chai').expect;
import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { DiaryPortsBuilder } from '../../../src/core/diary/diary-ports';
import { DiaryState } from '../../../src/core/diary/diary-state';
import { DiaryApplication, IDiaryApplication } from '../../../src/core/diary/diary-application'

describe('The diary application', async () => {
  it('listing publishes whatever the list port returns', async () => {
    const entry: DiaryEntry = { id: 'abc', timestamp: new Date(), body: 'A B C' };

    const application = new DiaryApplication(DiaryPortsBuilder.devNull().withList(() => Promise.resolve([ entry ])));
  
    const listener = new MockListener(application);  

    await application.list();

    listener.mustHave(entry);
  });
});

class MockListener {
  private history: DiaryState[] = [];

  constructor(application: IDiaryApplication) {
    application.subscribe(state => this.history.push(state));
  }

  mustHave(expected: DiaryEntry) {
    const ok = this.history.some(it => it.entries.includes(expected));

    expect(this.history[this.history.length - 1].entries).to.include(expected);

    expect(ok).to.be.true;
  }
}