const expect = require('chai').expect;
const temp = require('temp');
temp.track();

import { DiaryEntry } from '../../../../src/core/diary/diary-entry';
import { Diary } from '../../../../src/adapters/database/diary';
import { ConsoleLog } from '../../../../src/core/logging/log';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import { Attachment } from '@test/../src/core/diary/attachment';

describe('[diary] Can attach files', () => {
  let diary = null;

  beforeEach(async () => {
    const tempFile = await temp.open();

    diary = new Diary(tempFile.path, new ConsoleLog({ allowTrace: false }));

    await diary.init();
  });

  it('can add a single file attachment', async () => {
    const entry: DiaryEntry = await diary.enter({ body: 'ABC' });

    const file = readFileSync(resolve(join(__dirname, './samples/2021-07-09.png')));

    await diary.attach(entry.id, { file });

    const attachments: Attachment[] = await diary.attachments(entry.id);

    expect(attachments.length).to.eql(1);
  });
});