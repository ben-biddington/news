const { ConsoleListener, WebInteractor } = require('../integration-test');

const { wellington } = require('../../../src/adapters/web/marine-weather');

const fs = require('fs');

const { ConsoleLog } = require('../../../src/core/logging/log');

describe.skip('[screenshotting] Marine weather', () => {
    let interactor, page, consoleMessages = null;

    before(async ()  => 
    {
        interactor      = new WebInteractor({ headless: true });
        page            = await interactor.page();
        consoleMessages = new ConsoleListener(page);
    });
    
    after(async () => await interactor.close());

    it('can fetch one', async () => {
        const { path } = await wellington({ path: `marine-weather.png`, headless: true });

        fs.unlinkSync(path);
    });
});

describe.skip('[screenshotting] Wellington weather', () => {
    it('can fetch current', async () => {
        const { current } = require('../../../src/adapters/web/wellington-weather');

        const { path } = await current({ log: new ConsoleLog() }, { path: `wellington-weather.png`, headless: true });

        fs.unlinkSync(path);
    });

    it('can fetch today', async () => {
        const { today } = require('../../../src/adapters/web/wellington-weather');

        const { path } = await today({ log: new ConsoleLog() }, { path: `wellington-weather.png`, headless: true });

        fs.unlinkSync(path);
    });
});