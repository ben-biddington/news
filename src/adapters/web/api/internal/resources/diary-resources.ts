import express = require('express');
import { StructuredLog } from '../structured-log';
import { Diary } from '../../../../database/diary';
import { ConsoleLog, Log } from '../../../../../core/logging/log';
import { DiaryEntry } from '../../../../../core/diary/diary-entry';
import ca from 'date-fns/locale/ca';
import { resize } from '../images';

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

  // [i] `req.files` is populated from multipart/form-data posts
  app.post('/diary/:entryId/attachments', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      try {
        //@ts-ignore
        const files = req.files;
      
        // //@ts-ignore
        if (!files || Object.keys(files).length === 0) {
          log.error(`No files supplied. Expected 'request.files' to be something.`);
          return res.status(400).send('No files were uploaded.');
        }

        const fileNames = Object.keys(files);

        log.info(`Uploaded file names <${fileNames}>`);

        const file = files[fileNames[0]]; // <name,data,size,encoding,tempFilePath,truncated,mimetype,md5,mv>

        const entryId: number = parseInt(req.params.entryId);

        log.info(`Adding attachment to diary entry <${entryId}> it has name <${file.name}> and size <${file.size}B>`);

        await diary(log).attach(entryId, { diaryEntryId: entryId, file: file.data });

        res.status(200).json();
      }
      catch(e) {
        log.error(e);
        res.status(500).json(e);
      }
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

  app.get('/diary/:entryId/attachments/:attachmentId', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {

      log.info(`Finding attachment id <${req.params.attachmentId}> for diary entry <${req.params.entryId}>`);

      const attachment = await diary(log).attachment(parseInt(req.params.attachmentId));

      if (!attachment)
        return res.status(404).json(`Attachment with id <${req.params.attachmentId}> not found`);

      let file = attachment.file;

      if (req.query["width"]) {
        const resizeOptions = { 
          sourceFileBuffer: file, 
          width: parseInt(req.query["width"].toString())
        };
        
        log.info(`Resizing attachment to width <${resizeOptions.width}>`);
  
        file = await resize(resizeOptions);
      }

      return returnFile(log, res, file);
    });
  });

  const returnFile = (log: StructuredLog, res, file) => {
    try {
      res.status(200).write(file, 'binary');
    } catch(e) {
      log.error(e);
      res.status(500).json(e);
    } finally {
      res.end();
    }
  }

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
    const getImageUrls = async (diaryEntry: DiaryEntry): Promise<string[]> => {
      const attachments = await diary().attachments(parseInt(diaryEntry.id));

      return attachments.map(attachment => `/diary/${diaryEntry.id}/attachments/${attachment.id}`);
    }

    return StructuredLog.around(req, res, { prefix: 'diary' }, async log => {
      const list: DiaryEntry[] = await diary(log).list();

      const listWithImages = await Promise.all(list.map(async it => ({ ...it, images: (await getImageUrls(it)) })));

      log.info(`Returning <${listWithImages.length}> diary entries`);

      res.status(200).json(listWithImages);
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