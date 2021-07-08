const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { Diary } from '../../../src/adapters/database/diary';
import { ConsoleLog } from '../../../src/core/logging/log';

describe('[diary] Can store diary entries', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('can add entries and it sets id', async () => {
    const newEntry: DiaryEntry = await diary.enter({ body: 'ABC' });

    expect(newEntry.id).to.not.be.null;
    expect(newEntry.body).to.eql('ABC');
    
    // @todo: don't know how to do this 
    // expect(newEntry.timestamp).to.eql(new Date());
  });

  it('can update entries', async () => {
    const original: DiaryEntry  = await diary.enter ({ body: 'ABC' });
    const updated: DiaryEntry   = await diary.update({ ...original, body: 'DEF' });
    
    expect(updated.id).to.eql       (original.id);
    expect(updated.timestamp).to.eql(original.timestamp);
    expect(updated.body).to.eql     ('DEF');
  });
});