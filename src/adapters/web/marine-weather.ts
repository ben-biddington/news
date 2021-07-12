import { WebInteractor } from './web-interactor';
const path = require('path');

export const wellington = async (opts: any = {}) => {
  const options = {
    headless: true,
    ...opts
  };

  const interactor = new WebInteractor({ headless: options.headless });
  const page = await interactor.page();

  var fullPath = path.resolve(options.path);

  try {
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto('https://www.marineweather.co.nz/forecasts/lyall-bay', { waitUntil: 'networkidle2' });

    const selector = 'body.marine-forecasts div.container section#content article.page table.responsive'

    await page.waitForSelector(selector);

    const element = await page.$(selector);

    await element.screenshot({ path: fullPath });
  } finally {
    await interactor.close();
  }

  return {
    path: fullPath
  }
}

export const forecast = (ports, name, opts = {}) => get(ports, name, opts);

const get = async (ports, name, opts) => {
  const { log } = ports;
  const options = {
    headless: true,
    ...opts
  };

  const interactor = new WebInteractor({ headless: options.headless });
  const page = await interactor.page();

  var fullPath = path.resolve(options.path);

  log.info(`Fetching marine weather for <${name}> saving to file <${fullPath}>`);

  try {
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(`https://www.marineweather.co.nz/forecasts/${name}`, { waitUntil: 'networkidle2' });

    const selector = 'body.marine-forecasts div.container section#content article.page table.responsive'

    await page.waitForSelector(selector);

    const element = await page.$(selector);

    await element.screenshot({ path: fullPath });
  } finally {
    await interactor.close();
  }

  return {
    path: fullPath
  }
}