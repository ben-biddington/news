import express = require('express');
import { LogEntry, StructuredLog } from '../structured-log';

export const apply = (app: express.Application) => {
  app.get('/preview/', async (req, res) => {
    await StructuredLog.around(req, res, { trace: process.env.TRACE, prefix: 'preview' }, async log => {
      await get(req, res, log);
    });
  });
}

const get = async (req: express.Request, res: express.Response, log: StructuredLog) => {
  const url = req.query.url;

  log.info(new LogEntry(`Requesting <${url}>`));

  const request = require("request");

  await request({ uri: url}, async (error, _, body) => {
    if (error) {
      res.send(error);
      log.error(new LogEntry(`${error}`));
      return;
    }

    log.trace(new LogEntry(`${body}`));

    res.status(200).send(body);
  });

  console.log(JSON.stringify(log, null, 2));
}
