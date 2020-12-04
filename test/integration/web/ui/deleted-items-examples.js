const { describeFeatured, toggles, baseUrl, expect, delay, WebInteractor } = require('./ui-integration-test');

const selector  = '#deletedItems';
const useSvelte = process.env.USE_SVELTE || true;
const headless  = (process.env.HEADLESS || 'true') === 'true';

describeFeatured(toggles, '[UI] it shows deleted items', async feature => {

    let interactor, page = null;

    before(async ()  => 
    {
        const url       = `${baseUrl}?unplug=1&use-svelte=${useSvelte}`

        interactor  = new WebInteractor({ headless });
        page        = await interactor.page();
        await page.goto(url);
    });

    beforeEach(async () => {
        await page.evaluate(async () => {
            window.start();
            await view.waitUntilIdle();
        });
    });
    
    after(async () => await interactor.close());

    it('for example', async () => {
        await page.waitForSelector(selector);

        await page.evaluate(() => {
            application.deletedItems.mustHaveHadCountCalled();
        });
    });

    it("updates the count on the '*-deleted' notifications", async () => {

        const countLabelSelector = `${selector} span.count`;

        await page.waitForSelector(selector);

        await page.evaluate(() => {
            application.notify(
                'rnz-news-item-deleted',
                { id: '2ztpzk' }
            );
            application.notify(
                'hacker-news-item-deleted',
                { id: '2ztpzk' }
            );
            application.notify(
                'lobsters-item-deleted',
                { id: '2ztpzk' }
            );
        });

        await page.waitForSelector(countLabelSelector);

        const actualCount = await page.$$eval(countLabelSelector, items => items.map(it => ( it.innerText )));

        expect(actualCount).to.eql([ '3' ])
    });
});