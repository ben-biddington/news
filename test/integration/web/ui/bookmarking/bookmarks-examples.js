const itemsSelector = '#bookmarks .items';

const { 
    describeFeatured, toggles, baseUrl, headless,
    expect, WebInteractor, ConsoleListener } = require('../ui-integration-test');

describeFeatured(toggles, '[UI] Bookmarks', async feature => {
    let interactor, page, consoleMessages = null;

    before(async ()  => 
    {
        interactor      = new WebInteractor({ headless: false });
        interactor      = new WebInteractor({ headless });
        page            = await interactor.page();
        consoleMessages = new ConsoleListener(page);
    });

    beforeEach(async () => {
        await page.goto(`${baseUrl}?unplug=1&disallow-autostart&${feature}`, { waitUntil: 'domcontentloaded' });
    });
        
    after(async () => await interactor.close());

    describe('they are displayed in a list', () => {
        it('for example', async () => {
            await page.evaluate(async () => {
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

            await page.waitForSelector(`${itemsSelector} .item`);

            //@todo: must be a better way than delaying -- custom event when rendering?
            await consoleMessages.mustHaveNoErrors({ delay: 1000 });
    
            await page.evaluate(() => {
                application.bookmarks.mustHaveHadListCalled();
            });
    
            const listIds = await page.$$eval(`${itemsSelector} .item`, items => items.map(it => ( it.id )));

            expect(listIds).to.eql([ 'bookmark-id-1' ]);

            const listTitles = await page.$$eval(`${itemsSelector} .item a.title`, items => items.map(it => ( it.innerText )));
    
            expect(listTitles).to.eql([ 'Title 1' ]);
    
            const deleteButtons = await page.$$eval(`${itemsSelector} .item a.del`, items => items.map(it => ( it.title )));
    
            expect(deleteButtons).to.not.be.empty;
        });
    });

    describe("list items are added in response to 'bookmark-added' notification", () => {
        it('for example', async () => {
            await page.evaluate(async () => {
                window.start();

                await view.waitUntilIdle();

                application.notify(
                    'bookmark-added',
                    { id: 'id-1337', title: 'Title 1', url: 'http://abc/def', source: '' }
                );
            });

            await page.waitForSelector(`${itemsSelector} .item`);

            const listIds = await page.$$eval(`${itemsSelector} .item`, items => items.map(it => ( it.id )));

            expect(listIds).to.eql([ 'bookmark-id-1337' ]);
        });
    });

    describe('they may be deleted', () => {
        it('invokes the delete use case', async () => {
            await page.evaluate(async () => {
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

            await page.waitForSelector(`${itemsSelector} .item`);

            await consoleMessages.mustHaveNoErrors({ delay: 1000 });
    
            await page.$$eval(`${itemsSelector} .item a.del`, items => items.map(it => ( it.click() )));

            await page.waitForFunction(() => application.bookmarks.hasHadDeleteCalled('id-1'), { timeout: 5000 });

            await page.evaluate(() => {
                application.bookmarks.mustHaveHadDeleteCalled('id-1');
            });
        });

        it("deletes list item nodes in response to 'bookmark-deleted' notification", async () => {

            await page.evaluate(async () => {
                application.bookmarks.listReturns([ 
                    new mock.Bookmark(
                        'id-1',
                        'Title 1', 
                        'http://example/1', 
                        'source-hn'),
                    new mock.Bookmark(
                        'id-2',
                        'Title 2', 
                        'http://example/2', 
                        'source-hn'), 
                ]);

                window.start();

                await view.waitUntilIdle();
            });

            await page.waitForSelector(`${itemsSelector} .item`);

            await consoleMessages.mustHaveNoErrors({ delay: 1000 });
            
            await page.evaluate(() => {
                application.notify(
                    'bookmark-deleted',
                    { id: 'id-2' }
                );
            });

            await page.waitForFunction(
                () => document.querySelectorAll(`div#bookmarks .items .item`).length == 1, 
                { timeout: 1000 });

            const allListItems = await page.$$eval(`div#bookmarks .items .item a.title`, items => items.map(it => ( it.innerText )));

            expect(allListItems).to.eql([ 'Title 1' ]);
        }); 
    });
});