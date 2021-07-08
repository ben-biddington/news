const port = 8080;

const { StructuredLog, LogEntry } = require('../../dist/adapters/web/api/internal/structured-log');
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

  return StructuredLog.around(req, res, { prefix: 'items' }, async log => {

    const id = req.path.split('/').pop();

    io.notify({ verb: 'delete', url: req.path, id });

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
app.get(/youtube/, async (req, res) =>
  forwardGet(req, res, req => req.url.replace('/youtube', 'https://www.youtube.com'), { prefix: 'youtube' }));
app.get(/^rnz/, async (req, res) =>
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

const path = require('path');

app.get(/marine-weather/, async (req, res) => {
  return StructuredLog.around(req, res, { prefix: 'marine-weather' }, async log => {
    const placeName = req.path.substring(req.path.lastIndexOf('/') + 1);
    const temp = require('temp');

    log.info(`${req.path} -> <${placeName}>`);

    const cacheKey = req.path;

    const originalFile = await cachedFile(cacheKey , async () => {
      const { forecast } = require('../marine-weather');
      const filePath = temp.path({ suffix: '.png' });
      const result = await forecast({ log }, placeName.length > 0 ? placeName : 'wellington', { path: filePath });

      return readFile(result.path);
    });

    if (req.query["width"]) {
      const resizeOptions = { 
        sourceFileBuffer: originalFile, 
        targetFileName: path.join(temp.dir, `marine-weather-${placeName}.png`),
        width: parseInt(req.query["width"])
      };
      
      log.info(`Resizing to <${resizeOptions.targetFileName}> with width <${req.query["width"]}>`);

      await resize(log, resizeOptions);

      log.info(`Returning <${resizeOptions.targetFileName}>`);

      return returnFile(res, await readFile(resizeOptions.targetFileName));
    }

    returnFile(res, originalFile);
  });
});

app.get(/windfinder/, async (req, res) => {
  return StructuredLog.around(req, res, { prefix: 'windfinder' }, async log => {
    const placeName = req.path.substring(req.path.lastIndexOf('/') + 1);
    const temp = require('temp');
    
    log.info(`${req.path} -> <${placeName}>`);

    const cacheKey = `${req.path}-${req.query["day"]}`;

    const originalFile = await cachedFile(cacheKey , async () => {
      const { screenshot } = require('../windfinder');
      const filePath = temp.path({ suffix: '.png' });
      
      const result = await screenshot(log, { placeName, path: filePath, day: req.query["day"] });

      return readFile(result.path);
    });

    returnFile(res, originalFile);
  });
});

app.get(/screenshot/, async (req, res) => {
  return StructuredLog.around(req, res, { prefix: 'screenshot' }, async log => {
    const url = req.query["url"];
    const temp = require('temp');
    
    const cacheKey = `screnshot-${url}`;

    const originalFile = await cachedFile(cacheKey , async () => {
      const { get : screenshot} = require('../screenshot');
      const result = await screenshot({ log }, url, { path: temp.path({ suffix: '.png' }) });
      return readFile(result.path);
    });

    returnFile(res, originalFile);
  });
});

// [i] https://ahmadawais.com/resize-optimize-images-javascript-node/
const resize = async (log, opts) => {  
  const { sourceFileBuffer, targetFileName, width } = opts;
  
  const Jimp = require('jimp');

  const image = await Jimp.read(sourceFileBuffer);
  await image.resize(width, Jimp.AUTO);
  await image.quality(100);
  await image.writeAsync(targetFileName);

  log.info(`[resize] ${Object.keys(image)}`);
}

app.get('/wellington-weather/week', async (req, res) => {
  return StructuredLog.around(req, res, { trace: process.env.TRACE, prefix: 'wellington-weather' }, log => {
    return cached(req, res, log, () => {
      const { sevenDays } = require('../../dist/adapters/web/metservice');
      const { get } = require('../../internet');

      return sevenDays({ get, log });
    });
  });
});

app.get(/sea-temp/, async (req, res) => {
  return StructuredLog.around(req, res, { trace: process.env.TRACE, prefix: 'sea-temp' }, log => {
    const id = req.path.substring(req.path.lastIndexOf('/') + 1);

    return cached(req, res, log, async () => {
      const { get } = require('../../dist/adapters/web/sea-temp');

      return await get(id);
    });
  });
});

const { init: initialiseDiary, apply } = require('../../dist/adapters/web/api/internal/diary-resources');

initialiseDiary();
apply(app);

const returnFile = (res, file) => {
  setHeaders(res, cacheControlHeaders(600));
  res.status(200).write(file, 'binary');
  res.end();
}

const cachedFile = async (cacheKey, fn) => {
  if (process.env.NO_CACHE)
    return await fn();

  let file = await cache.get(cacheKey);

  if (file)
    return file;

  file = await fn();

  await cache.add(cacheKey, file, Timespan.fromMinutes(120));

  return file;
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