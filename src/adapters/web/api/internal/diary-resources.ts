import express = require('express');
import { StructuredLog } from './structured-log';
import { Diary } from '../../../database/diary';
import { ConsoleLog } from '../../../../core/logging/log';

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
}

const diary = () => {
  return new Diary('./surf-diary.db', new ConsoleLog({ allowTrace: false }));
}