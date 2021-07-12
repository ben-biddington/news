import express = require('express');
import { StructuredLog } from '../structured-log';
import { cacheControlHeaders, cachedFile } from '../caching';
import { ConsoleLog, Log } from '../../../../../core/logging/log';
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);
const path = require('path');
import { forecast } from '../../../marine-weather';
import { MarineWeather as MarineWeatherDatabase, Screenshot } from '../../../../database/marine-weather'

export const init = () => database().init();

export const apply = (app: express.Application) => {
  app.get('/marine-weather/search', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'marine-weather-search' }, async log => {
      const date      = new Date(req.query['date'].toString());
      const placeName = req.query['placeName'];

      log.info(`Finding file for date <${date}> and place name <${placeName}>`);

      const files = await database(log).listScreenshots({ dateMatching: new Date(date) });

      log.info(`Found <${files.length}> files for date <${date}>`);

      return res.status(200).json(files);
    });
  });

  app.get('/marine-weather/:placeName', async (req, res) => {
    return StructuredLog.around(req, res, { prefix: 'marine-weather' }, async log => {
      const placeName = req.params.placeName;
      const temp = require('temp');

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
        
        database().addScreenshot({ name: placeName, timestamp: new Date(), file});

        log.info(`Added file to database`);

        return file;
      });
  
      if (req.query["width"]) {
        const resizeOptions = { 
          sourceFileBuffer: originalFile, 
          targetFileName: path.join(temp.dir, `marine-weather-${placeName}.png`),
          width: parseInt(req.query["width"].toString())
        };
        
        log.info(`Resizing to <${resizeOptions.targetFileName}> with width <${req.query["width"]}>`);
  
        await resize(log, resizeOptions);
  
        log.info(`Returning <${resizeOptions.targetFileName}>`);
  
        return returnFile(res, await readFile(resizeOptions.targetFileName));
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

const database = (log: Log = new ConsoleLog({ allowTrace: false })): MarineWeatherDatabase => {
  return new MarineWeatherDatabase('./marine-weather.db', log);
}

const returnFile = (res, file) => {
  setHeaders(res, cacheControlHeaders(600));
  res.status(200).write(file, 'binary');
  res.end();
}

const setHeaders = (res, headers) => {
  Object.keys(headers).forEach(key => {
    res.set(key, headers[key]);
  });
}
