const applicationSelector = 'div#application';

const { baseUrl, WebInteractor, ConsoleListener } = require('../integration/web/ui/ui-integration-test');

describe('[UI] renders without error', async () => {

    let interactor, page, consoleMessages = null;

    before(async ()  => 
    {
        interactor      = new WebInteractor({ headless: true });
        page            = await interactor.page();
        consoleMessages = new ConsoleListener(page);
    });
    
    after(async () => await interactor.close());

    [ 'svelte', 'vue', 'react', 'svelet-smui' ].forEach(name => {
        const url = `${baseUrl}?&use-${name}`;

        it(`[${name}] for example -- ${url}`, async () => {

            await page.goto(url);
    
            await page.waitForSelector(applicationSelector, { visible: true, timeout: 10000 });

            consoleMessages.mustHaveNoErrors();
        });
    });
});