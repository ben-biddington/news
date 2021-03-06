const { WebInteractor } = require('./web-interactor');
const path = require('path');

const screenshot = async (log, opts = {}) => {
    const options = {
        headless: true,
        ...opts
    };

    const { placeName, day = 1 } = opts;
    
    const interactor      = new WebInteractor({ headless: options.headless });
    const page            = await interactor.page();
    const url             = `https://www.windfinder.com/forecast/${placeName}`;

    log.info(`[windfinder] Using url <${url}>`);

    if (!options.path) {
      throw new Error(`Missing <path> option. You supplied <${options.path}>`);
    }

    try {
      var fullPath = path.resolve(options.path);

      await page.setViewport({ width: 1366, height: 768});
      await page.goto(url, { waitUntil: 'networkidle2' });

      const selector = `div.fc-day-index-${day}`;

      log.info(`[windfinder] css selector: <${selector}>`);

      await page.waitForSelector(selector);
      
      const element = await page.$(selector);
      
      await element.screenshot({ path: fullPath });
    } 
    catch(e) {
      throw new Error(`Failed to take screenshot from url <${url}>, message is <${e.toString()}> and stack trace <${e.stack}>`);
    }
    finally {
        await interactor.close();
    }

    return { path: fullPath }
}

module.exports.screenshot = screenshot;