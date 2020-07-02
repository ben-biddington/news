const { WebInteractor } = require('./web-interactor');
const path = require('path');

const wellington = async (opts = {}) => {
    const options = {
        headless: true,
        ...opts
    };

    const interactor      = new WebInteractor({ headless: options.headless });
    const page            = await interactor.page();

    var fullPath = path.resolve(options.path);

    try {
        await page.setViewport({ width: 1366, height: 768});
        await page.goto('https://www.windfinder.com/forecast/wellington', { waitUntil: 'networkidle2' });

        const selector = 'div .weathertable-container'

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

module.exports.wellington = wellington;