const port = 8080;

const { StructuredLog, LogEntry } = require('./internal/structured-log');
const { SocketNotifier } = require('./internal/sockets');
const { QueryStringToggles } = require('../toggling/query-string-toggles');
const express = require('express')

const { Deleted } = require('../../database/deleted');
const { Bookmarks } = require('../../database/bookmarks');
const { Cache } = require('../../database/cache');
const { Timespan } = require('../../../core/dist/timespan');
const { addBookmark } = require('../../news-adapters');

const app = express();
const io = new SocketNotifier(1080);

app.use(express.static('src/adapters/web/gui'));
app.use(express.json());

const deleted = new Deleted('./news.db');
const bookmarks = new Bookmarks('./bookmarks.db');
const cache = new Cache('./cache.db');
const log = console.log;
const fs = require('fs');
const util = require('util');

const readFile = util.promisify(fs.readFile);

const initialise = async () => {
  await Promise.all([deleted.init(), bookmarks.init(), cache.init()]);

  const { init: initDeleted } = require('./internal/deleted-items-resource');

  initDeleted(app, log, deleted);
}

const cacheControlHeaders = (maxAge = 60) => ({
  'Cache-Control': 'public',
  'max-age': maxAge
});

app.delete(/news\/items/, async (req, res) => {
  io.notify({ verb: 'delete', url: req.path });

  return StructuredLog.around(req, res, { prefix: 'bookmarks' }, async log => {

    const id = req.path.split('/').pop();

    await deleted.add(id);

    log.info(`Deleted <${id}>, you now have <${await deleted.count()}> deleted items`);

    res.status(200).json({ message: `Item <${id}> deleted` })
  });
});

app.post('/lobsters/deleted/sieve', async (req, res) => {
  io.notify({ url: req.path });

  return StructuredLog.around(req, res, { prefix: 'bookmarks' }, async log => {

    const filtered = await deleted.filter(...req.body);

    log.info(`Seived <${req.body.length}> items down to <${filtered.length}>`);

    res.status(200).json(filtered);
  });
});

const setHeaders = (res, headers) => {
  Object.keys(headers).forEach(key => {
    res.set(key, headers[key]);
  });
}

const forwardGet = async (req, res, replacement, opts = {}) => {
  const log = new StructuredLog(req, res, { prefix: opts.prefix });

  const url = replacement(req);

  log.info(new LogEntry(`forwarding <${req.path}> to <${url}>`));

  const request = require("request");

  await request({ uri: url }, async (error, _, body) => {
    if (error) {
      res.send(error);
      log.error(new LogEntry(`${error}`));
      return;
    }

    log.trace(new LogEntry(`${body}`));

    setHeaders(res, cacheControlHeaders());

    res.status(200).send(body);
  });

  console.log(JSON.stringify(log, null, 2));
}

app.get(/lobsters/, async (req, res) =>
  forwardGet(req, res, req => req.path.replace('/lobsters', 'https://lobste.rs'), { prefix: 'lobsters' }));
app.get(/hn/, async (req, res) =>
  forwardGet(req, res, req => req.path.replace('/hn', 'https://hnrss.org'), { prefix: 'hn' }));
app.get(/rnz/, async (req, res) =>
  forwardGet(req, res, req => req.path.replace('/rnz', 'https://www.rnz.co.nz'), { prefix: 'rnz' }));

app.post(/bookmarks/, async (req, res) => {
  return StructuredLog.around(req, res, { prefix: 'bookmarks' }, async log => {

    const toggles = new QueryStringToggles(req.url);
    const bookmark = req.body;

    await addBookmark({ log, toggles }, req.body);

    res.status(200).json(bookmark);
  });
});

app.get(/bookmarks/, async (req, res) => {
  return StructuredLog.around(req, res, { prefix: 'bookmarks' }, async log => {

    const list = await bookmarks.list();

    log.info(new LogEntry(`Found <${list.length}> bookmarks`));

    res.status(200).json(list);
  });
});

app.delete(/bookmarks/, async (req, res) => {
  io.notify({ verb: 'delete', url: req.path });

  return StructuredLog.around(req, res, { prefix: 'bookmarks' }, async log => {

    const id = req.path.split('/').pop();

    log.info(`deleting <${id}>`);

    await bookmarks.del(id);

    res.status(200).json(await bookmarks.list());
  });
});

app.get(/marine-weather/, async (req, res) => {
  return StructuredLog.around(req, res, { prefix: 'marine-weather' }, async log => {
    const placeName = req.path.substring(req.path.lastIndexOf('/') + 1);

    log.info(`${req.path} -> <${placeName}>`);

    return await cachedFile(req, res, async () => {
      const { forecast } = require('../marine-weather');
      const temp = require('temp');
      const filePath = temp.path({ suffix: '.png' });

      const result = await forecast({ log }, placeName.length > 0 ? placeName : 'wellington', { path: filePath });

      return readFile(result.path);
    });
  });
});

app.get('/wellington-weather/week', async (req, res) => {
  return StructuredLog.around(req, res, { trace: process.env.TRACE, prefix: 'wellington-weather' }, log => {
    return cached(req, res, log, () => {
      const { sevenDays } = require('../../dist/adapters/web/metservice');
      const { get } = require('../../internet');

      return sevenDays({ get, log });
    });
  });
});

const cachedFile = async (req, res, fn) => {
  const key = req.path;
  let file = await cache.get(key);

  if (!process.env.NO_CACHE && file != null) {
    res.status(200).write(file, 'binary');
    res.end();
    return;
  }

  file = await fn();

  await cache.add(key, file, Timespan.fromMinutes(120));

  setHeaders(res, cacheControlHeaders(600));
  res.status(200).write(file, 'binary');
  res.end();
  return;
}

const cached = async (req, res, log, fn) => {
  const key = req.path;

  const cachedItem = await cache.get(key);

  const cachePeriod = Timespan.fromMinutes(60);

  if (cachedItem) {
    log.info(`[cache] [hit] <${key}>`);
    res.status(200).json(JSON.parse(cachedItem) /* see test/integration/database/cache-examples.ts for why we're stringifying */);
    return;
  }

  const newItem = await fn();

  await cache.add(
    key,
    JSON.stringify(newItem) /* see test/integration/database/cache-examples.ts for why we're stringifying */,
    cachePeriod);

  log.info(`[cache] [miss] <${key}>`);

  setHeaders(res, cacheControlHeaders(600));

  res.status(200).json(newItem);
}

initialise().then(() => app.listen(port, () =>
  console.log(`Server running on ${port}...`)));