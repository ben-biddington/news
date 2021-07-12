import { Cache } from '../../../database/cache';
import { Timespan } from '../../../../core/timespan';

let cache: Cache;

export const init = () => {
  cache = new Cache('./cache.db');
  return cache.init();
}

export const cachedFile = async (cacheKey, fn) => {
  if (process.env.NO_CACHE)
    return await fn();

  let file = await cache.get(cacheKey);

  if (file)
    return file;

  file = await fn();

  await cache.add(cacheKey, file, Timespan.fromMinutes(120));

  return file;
}

export const cached = async ({req, res, log, duration = Timespan.fromMinutes(60)}, fn) => {
  const key = req.path;

  const cachedItem = await cache.get(key);

  const cachePeriod = duration;

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

const setHeaders = (res, headers) => {
  Object.keys(headers).forEach(key => {
    res.set(key, headers[key]);
  });
}

export const cacheControlHeaders = (maxAge = 60) => ({
  'Cache-Control': 'public',
  'max-age': maxAge
});