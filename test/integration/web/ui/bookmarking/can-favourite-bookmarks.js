const itemsSelector = '#application #bookmarks .items';

const { 
    delay, describeFeatured, toggles, baseUrl, 
    expect, WebInteractor, ConsoleListener, MockToggles } = require('../ui-integration-test');
const { application } = require('express');

describeFeatured(['use-svelte'], '[UI] Bookmarks', async feature => {
    let interactor, page, consoleMessages = null;

    before(async ()  => 
    {
        interactor      = new WebInteractor({ headless: true });
        page            = await interactor.page();
        consoleMessages = new ConsoleListener(page);
    });

    beforeEach(async () => {
        await page.goto(`${baseUrl}?unplug=1&disallow-autostart&${feature}`, { waitUntil: 'domcontentloaded' });
    });
        
    after(async () => await interactor.close());

    it('shows favourite icon only when favourites are allowed', async () => {
        await page.evaluate(async () => {
            const featureToggles = new mock.MockToggles(it => it.returnTrue('allow-bookmark-favourites'));

            application.useToggles(featureToggles);

            application.bookmarks.listReturns([ 
                new mock.Bookmark(
                    'id-1',
                    'Title 1', 
                    'http://example/1', 
                    'source-hn')
            ]);

            window.start();

            await view.waitUntilIdle();
        });

        await page.waitForSelector(`${itemsSelector} li`);

        const favouritesLinks = await page.$$eval(`${itemsSelector} li a.bookmark-favourite-off`, items => items.map(it => ( it.class )));

        expect(favouritesLinks).to.not.be.empty;
    });
    
    it('favouriting triggers the right use case');
});