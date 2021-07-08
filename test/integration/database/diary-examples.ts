const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { Diary } from '../../../src/adapters/database/diary';

describe('[diary] Can store diary entries', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path);

    await diary.init();
  });

  it('can add entries and it sets id', async () => {
    
    const newEntry: DiaryEntry = await diary.enter({body: 'ABC'});

    expect(newEntry.id).to.not.be.null;
    expect(newEntry.body).to.eql('ABC');
  });
});