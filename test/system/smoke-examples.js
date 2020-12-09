const applicationSelector = 'div#application';

const { headless, baseUrl, WebInteractor, ConsoleListener } = require('../integration/web/ui/ui-integration-test');

describe('[UI] renders without error', async () => {

    let interactor, page, consoleMessages = null;

    before(async ()  => 
    {
        interactor      = new WebInteractor({ headless });
        page            = await interactor.page();
        consoleMessages = new ConsoleListener(page);
    });
    
    after(async () => await interactor.close());

    [ 'svelte', 'vue', 'react', 'svelte-smui' ].forEach(name => {
        const url = `${baseUrl}?&use-${name}`;
        const timeout = 30*1000;

        it(`[${name}] for example -- ${url}`, async () => {

            await page.goto(url);
    
            await page.waitForSelector(applicationSelector, { visible: true, timeout });

            consoleMessages.mustHaveNoErrors();
        });

        it(`[${name}] it renders unplugged -- ${url}`, async () => {

            await page.goto(`${baseUrl}?&use-${name}&unplugged`);
    
            await page.waitForSelector(applicationSelector, { visible: true, timeout });

            consoleMessages.mustHaveNoErrors();
        });
    });
});