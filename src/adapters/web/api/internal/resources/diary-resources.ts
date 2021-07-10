import express = require('express');
import { StructuredLog } from '../structured-log';
import { Diary } from '../../../../database/diary';
import { ConsoleLog } from '../../../../../core/logging/log';
import { DiaryEntry } from '../../../../../core/diary/diary-entry';

export const init = () => diary().init();

export const apply = (app: express.Application) => {
  app.post(/diary/, async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      
      log.info(`Adding diary entry`);

      log.info(JSON.stringify(req.body, null, 2));

      const result = await diary().enter(req.body);
      
      res.status(200).json(result);
    });
  });

  app.get(/diary/, async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      const list: DiaryEntry[] = await diary().list();

      log.info(`Returning <${list.length}> diary entries`);

      res.status(200).json(list);
    });
  });

  app.delete('/diary/:id', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      const list: DiaryEntry[] = await diary().list();

      log.info(`Deleting diary entry with id <${req.params.id}>`);

      await diary().delete(req.params.id);

      res.status(200).json(list);
    });
  });
}

const diary = () => {
  return new Diary('./surf-diary.db', new ConsoleLog({ allowTrace: false }));
}