import express = require('express');
import { StructuredLog } from '../structured-log';
import { Diary } from '../../../../database/diary';
import { ConsoleLog, Log } from '../../../../../core/logging/log';
import { DiaryEntry } from '../../../../../core/diary/diary-entry';

export const init = () => diary().init();

export const apply = (app: express.Application) => {
  app.post(/diary$/, async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      
      log.info(`Adding diary entry`);

      log.info(JSON.stringify(req.body, null, 2));

      const result = await diary().enter(req.body);
      
      res.status(200).json(result);
    });
  });

  app.post('/diary/:entryId/attachments', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      //@ts-ignore
      const files = req.files;
    
      //@ts-ignore
      if (!files || Object.keys(files).length === 0) {
        return res.status(400).send('No files were uploaded.');
      }

      log.info(`Files list <${files}>, <${Object.keys(files)}>, <${Object.keys(files.attachments)}>`);

      const file = files.attachments; // <name,data,size,encoding,tempFilePath,truncated,mimetype,md5,mv>

      const entryId: number = parseInt(req.params.entryId);

      log.info(`Adding attachment to diary entry <${entryId}> it has name <${file.name}> and size <${file.size}B>`);

      await diary(log).attach(entryId, { diaryEntryId: entryId, file: file.data });

      log.info(`Done`);
      
      res.status(200).json();
    });
  });

  app.get('/diary/:entryId/attachments', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {

      log.info(`Finding attachments for diary entry <${req.params.entryId}>`);

      const attachments = await diary(log).attachments(parseInt(req.params.entryId));

      log.info(`Found <${attachments.length}> attachments`);

      res.status(200).json(attachments.map(it => `/diary/${req.params.entryId}/attachments/${it.id}`));
    });
  });

  app.delete('/diary/:entryId/attachments', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      log.info(`Deleting attachments for diary entry <${req.params.entryId}>`);

      await diary().deleteAttachments(req.params.entryId);

      res.status(200);
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