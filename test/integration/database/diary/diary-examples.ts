const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { DiaryEntry, Session } from '../../../../src/core/diary/diary-entry';
import { Diary } from '../../../../src/adapters/database/diary';
import { ConsoleLog } from '../../../../src/core/logging/log';
import { toNewZealandTime } from '../../../../src/core/date';
import { format } from 'date-fns';

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

describe('[diary] Can add location', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('for example', async () => {
    const newEntry: DiaryEntry = await diary.enter({ body: 'ABC', location: 'Lyall' });

    expect(newEntry.location).to.eql('Lyall');
  });
});

describe('[diary] Can add start and end time', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('for example', async () => {
    const session = {
      start: new Date('2021-07-08T21:00:00.000Z'),
      end: new Date('2021-07-08T23:00:00.000Z'),
    };

    const newEntry: DiaryEntry = await diary.enter({ 
      body: 'ABC', 
      session
    });

    expect(format(toNewZealandTime(newEntry.session.start), 'pppp')).to.eql('9:00:00 AM GMT+12:00');
    expect(format(toNewZealandTime(newEntry.session.end)  , 'pppp')).to.eql('11:00:00 AM GMT+12:00');
  });

  it('dates default to null', async () => {
    const newEntry: DiaryEntry = await diary.enter({ 
      body: 'ABC', 
    });

    expect(newEntry.session.start).to.be.null;
    expect(newEntry.session.end).to.be.null;
  });
});

describe('[diary] Can add board', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('for example', async () => {
    const newEntry: DiaryEntry = await diary.enter({ body: 'ABC', board: 'Long' });

    expect(newEntry.board).to.eql('Long');
  });
});

describe('[diary] Can add tide', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('for example', async () => {
    const newEntry: DiaryEntry = await diary.enter({ body: 'ABC', tide: 'High at 11' });

    expect(newEntry.tide).to.eql('High at 11');
  });
});

describe('[diary] Can list all', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('default to empty', async () => {
    expect((await diary.list()).length).to.eql(0);
  });

  it('for example', async () => {
    await Promise.all([
      diary.enter({ body: 'ABC', tide: 'High at 11' }),
      diary.enter({ body: 'ABC', tide: 'High at 11' }),
      diary.enter({ body: 'ABC', tide: 'High at 11' }),
      diary.enter({ body: 'ABC', tide: 'High at 11' }),
      diary.enter({ body: 'ABC', tide: 'High at 11' }),
    ]);

    expect((await diary.list()).length).to.eql(5);
  });
});