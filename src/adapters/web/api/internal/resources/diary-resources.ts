import express = require('express');
import { StructuredLog } from '../structured-log';
import { Diary } from '../../../../database/diary';
import { ConsoleLog, Log } from '../../../../../core/logging/log';
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

  app.put('/diary/:entryId', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      
      const entryId = req.params.entryId;

      const value = { ...req.body, id: entryId };

      log.info(`Updating diary entry <${entryId}>`);

      log.info(JSON.stringify(value , null, 2));

      const result = await diary().update(value);
      
      res.status(200).json(result);
    });
  });

  app.get(/diary/, async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      const list: DiaryEntry[] = await diary(log).list();

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

const diary = (log: Log = new ConsoleLog({ allowTrace: false })) => {
  return new Diary(`${process.env.HOME}/news/databases/surf-diary.db`, log);
}