const { WebInteractor } = require('./web-interactor');
const path = require('path');
const { DevNullLog } = require('../../core/logging/log');

const current   = async (ports = {}, opts = {}) => 
    find(ports, opts, 'https://www.metservice.com/towns-cities/locations/wellington'         , 'current-conditions');
const today     = async (ports = {}, opts = {}) => 
    find(ports, opts, 'https://www.metservice.com/towns-cities/locations/wellington'         , 'city-forecast-tabs');
const week      = async (ports = {}, opts = {}) => 
    find(ports, opts, 'https://www.metservice.com/towns-cities/locations/wellington/7-days'  , 'city-forecast-tabs');

const find = (ports, opts, url, name) => {
    const { log = new DevNullLog() } = ports;

    log.trace(`finding element with data-module-name='${name}'`);

    return screenshot(url, opts, async page => {
        await page.waitForSelector('div.Tile');

        const tiles = await page.$$('div.Tile');

        const elements = await Promise.all(tiles.map(async element => {
            const dataModuleName = await element.evaluate(element => element.getAttribute('data-module-name'));

            return { element, dataModuleName };
        }));

        return elements.find(element => { 
            const matches = element.dataModuleName == name;
            
            log.trace(
                `checking element: data-module-name='${element.dataModuleName}', ` + 
                `matches='${matches}' ` + 
                `list count: ${tiles.length}`);

            return matches;
        }).element;
    });
}

// [i] https://pptr.dev/#?product=Puppeteer&version=v4.0.0&show=api-pagescreenshotoptions
const screenshot = async (url, opts, fn) => {
    const options = { headless: true, ...opts };

    const interactor      = new WebInteractor({ headless: options.headless });
    const page            = await interactor.page();

    var fullPath = path.resolve(options.path);

    try {
        await page.setViewport({ width: 4000, height: 2000});
        await page.goto(url, { waitUntil: 'networkidle2' });

        const element = await fn(page);

        await element.screenshot({ path: fullPath, type: 'png', /*quality: 100*/ });
    } finally {
        await interactor.close();
    }

    return { path: fullPath }
}

module.exports = { current, today, week };