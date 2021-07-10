import express = require('express');
import { StructuredLog } from '../structured-log';
import { cached } from '../caching';
import { Timespan } from '../../../../../core/timespan';
import { get } from '../../../sea-temp';

export const apply = (app: express.Application) => {
  app.get('/sea-temp/:name', async (req, res) => {
    return StructuredLog.around(req, res, { trace: process.env.TRACE, prefix: 'sea-temp' }, log => {
      const name = req.params.name; // 'lyall-bay' for example
  
      return cached({req, res, log, duration: Timespan.fromDays(3)}, () => get(name));
    });
  });
}
