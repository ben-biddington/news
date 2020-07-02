const { ConsoleListener, WebInteractor } = require('../integration-test');

const { wellington } = require('../../../src/adapters/web/windfinder');

const fs = require('fs');

const { ConsoleLog } = require('../../../src/core/logging/log');

describe.skip('[screenshotting] Windfinder', () => {
    let interactor, page, consoleMessages = null;

    before(async ()  => 
    {
        interactor      = new WebInteractor({ headless: false });
        page            = await interactor.page();
        consoleMessages = new ConsoleListener(page);
    });
    
    after(async () => await interactor.close());

    it('can fetch one', async () => {
        const { path } = await wellington({ path: `windfinder-wellington.png`, headless: true });

        fs.unlinkSync(path);
    });
});