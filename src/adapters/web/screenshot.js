const { WebInteractor } = require('./web-interactor');
const path = require('path');

const get = async (ports, url, opts) => {
  const { log } = ports;
  const options = {
    headless: true,
    ...opts
  };

  const interactor = new WebInteractor({ headless: options.headless });
  const page = await interactor.page();

  var fullPath = path.resolve(options.path);

  log.info(`Fetching <${url}> saving to file <${fullPath}>`);

  try {
    await page.setViewport({ width: 1366, height: 768 });
    await page.goto(url, { waitUntil: 'networkidle2' });

    const selector = 'body';

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

module.exports.get = get;