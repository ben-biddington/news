import express = require('express');
import { StructuredLog } from '../structured-log';
import { cacheControlHeaders, cachedFile } from '../caching';
import { ConsoleLog, Log } from '../../../../../core/logging/log';
const temp = require('temp');
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const path = require('path');
import { forecast } from '../../../marine-weather';
import { MarineWeather as MarineWeatherDatabase, Screenshot } from '../../../../database/marine-weather'
import { resize } from '../images';

export const init = () => database().init();

export const apply = (app: express.Application) => {
  // /marine-weather/search?date=2021-07-13
  app.get('/marine-weather/search', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'marine-weather-search' }, async log => {
      const date      = new Date(req.query['date'].toString());
      const placeName = req.query['placeName'];

      log.info(`Finding files for date <${date}> and place name <${placeName}>`);

      const files = await database(log).listScreenshots({ dateMatching: new Date(date) });

      log.info(`Found <${files.length}> files for date <${date}>`);

      return res.status(200).json(files);
    });
  });

  // /marine-weather/titahi-bay/2021-07-13
  app.get('/marine-weather/:placeName/:date', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'marine-weather-find-by-place-and-date' }, async log => {
      const date      = req.params.date;
      const placeName = req.params.placeName;

      log.info(`Finding file for date <${date}> and place name <${placeName}>`);

      const files = await database(log).listScreenshots({ dateMatching: new Date(date), name: placeName });

      if (files.length == 0)
      {
        log.info(`Did not find any screenshots`);
        return res.status(200).json([]);
      }

      const latestScreenshot = files[files.length - 1];

      log.info(`Found <${files.length}> files for date <${date}>`);
      log.info(`Returning the most recent <${latestScreenshot.id}, ${latestScreenshot.timestamp}, ${latestScreenshot.name}, ${latestScreenshot.hash}>`);
      
      res.set('X-screenshot', `totalCount: ${files.length}, timestamp: ${latestScreenshot.timestamp}, hash: ${latestScreenshot.hash}`);  

      returnFile(res, latestScreenshot.file);
    });
  });

  // /marine-weather/titahi-bay
  app.get('/marine-weather/:placeName', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'marine-weather' }, async log => {
      const placeName = req.params.placeName;

      if (placeName.length == 0) {
        return res.status(400).json(
          { 
            message: `You need to supply place name in the url, for example 'marine-weather/lyall-bay'` 
          }
        );
      }
      const cacheKey = req.path;
  
      log.info(`${req.path} -> <${placeName}>, cache key = <${cacheKey}>`);
  
      const originalFile = await cachedFile(cacheKey , async () => {
        const filePath = temp.path({ suffix: '.png' });
        const result = await forecast({ log }, placeName.length > 0 ? placeName : 'wellington', { path: filePath });

        const file = await readFile(result.path);
        
        addScreenshot(log, { name: placeName, timestamp: new Date(), file});

        log.info(`Added file to database`);

        return file;
      });
  
      if (req.query["width"]) {
        const resizeOptions = { 
          sourceFileBuffer: originalFile, 
          width: parseInt(req.query["width"].toString())
        };
        
        log.info(`Resizing image to width <${resizeOptions.width}>`);
  
        const file = await resize(resizeOptions);

        return returnFile(res, file);
      }
  
      returnFile(res, originalFile);
    });
  });

  app.get('/marine-weather', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'marine-weather-list' }, async log => {
      log.info(`Listing marine weather screenshots`);

      const files = await database(log).listScreenshots();

      log.info(`Found <${files.length}> screenshots`);

      return res.status(200).json(files);
    });
  });
}

const database = (log: Log = new ConsoleLog({ allowTrace: false })): MarineWeatherDatabase => {
  const diskStorage = `${process.env.HOME}/news/databases/marine-weather/attachments`;
  return new MarineWeatherDatabase(`${process.env.HOME}/news/databases/marine-weather.db`, diskStorage, log);
}

const addScreenshot = async (log: Log, screenshot: Screenshot) => {
  const db = database();

  const fileHash = hash(screenshot.file);

  const count = await db.listScreenshots({ name: screenshot.name, hash: fileHash }).then(it => it.length);

  if (count === 0) {
    log.info(`Saving screenshot to database because one does not exist yet with name <${screenshot.name}> and hash <${fileHash}>`);
    return db.addScreenshot(screenshot);
  } else {
    log.info(`Not saving screenshot to database because one with the same name <${screenshot.name}> and hash <${fileHash}> already exists`);
  }
}

const hash = (file: Buffer) => {
  const crypto = require('crypto');

  const hashSum = crypto.createHash('sha256');
  
  hashSum.update(file);

  return hashSum.digest('hex');
}

const returnFile = (res, file) => {
  setHeaders(res, cacheControlHeaders(600));
  try {
    res.status(200).write(file, 'binary');
  } catch(e) {
    res.status(500).json(e);
  } finally {
    res.end();
  }
}

const setHeaders = (res, headers) => {
  Object.keys(headers).forEach(key => {
    res.set(key, headers[key]);
  });
}
