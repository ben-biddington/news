const itemsSelector = '#hackerNews .items';
const { baseUrl, expect, WebInteractor, toggles, describeFeatured, ConsoleListener } = require('./ui-integration-test');

describeFeatured(toggles, '[UI] it shows hacker news', async toggle => {
    let interactor, page = null;

    before(async ()  => 
    {
        interactor  = new WebInteractor({ headless: true });
        page        = await interactor.page();
    });

    beforeEach(async () => {
        await page.goto(`${baseUrl}?unplug&disallow-autostart&${toggle}`);
    });

    after(async () => await interactor.close());

    it('for example', async () => {
        await page.evaluate(async () => {
            application.hackerNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc', 
                    'Title 1', 
                    'http://example/1', 
                    new Date())
            ]));
            
            window.start(); 

            await view.waitUntilIdle({ timeout: 1000 });
            
            application.lobsters.mustHaveHadListCalled();
        });

        await page.waitForSelector(`${itemsSelector} .item`);

        const listIds = await page.$$eval(`${itemsSelector} .item`, items => items.map(it => ( it.id )));

        expect(listIds).to.eql([ 'news-id-abc' ]);

        const listItems = await page.$$eval(`${itemsSelector} .item a.title`, items => items.map(it => ( it.innerText )));

        expect(listItems).to.eql([ 'Title 1' ]);

        const listLinks = await page.$$eval(`${itemsSelector} .item a.title`, items => items.map(it => ( it.href )));

        expect(listLinks).to.eql([ 'http://example/1' ]);

        const hosts = await page.$$eval(`${itemsSelector} .item span.host`, items => items.map(it => ( it.innerText )));

        expect(hosts).to.eql([ "example" ]);

        const deleteButtons = await page.$$eval(`${itemsSelector} .item a.del`, items => items.map(it => ( it.title )));

        expect(deleteButtons).to.not.be.empty;

        const bookmarkControls = await page.$$eval(`${itemsSelector} .item a.bookmark`, items => items.map(it => ( it.getAttribute('class') )));
        
        expect(bookmarkControls.map(it => it.split(' ')).flat()).to.include( 'bookmark' );
    });

    it("reloads list items in response to 'hacker-news-items-loaded' notification", async () => {

        consoleMessages = new ConsoleListener(page);

        await page.evaluate(async () => {
            application.hackerNews.listReturns(Promise.resolve([ ]));

            window.start();

            await view.waitUntilIdle();
        });

        await page.waitForSelector('#hackerNews');

        await page.evaluate(() => {
            application.notify(
                'hacker-news-items-loaded',
                { 
                    items: [
                        new mock.NewsItem(
                            '2ztpzk', 
                            'Who likes to rock the party', 
                            'http://example/2', 
                            new Date())
                    ] 
                }
            );
        });

        await page.waitForSelector(`${itemsSelector} .item`);

        await consoleMessages.mustHaveNoErrors({ delay: 1000 });

        const listItems = await page.$$eval(`${itemsSelector} a.title`, items => items.map(it => ( it.innerText )));

        expect(listItems).to.eql([ 'Who likes to rock the party' ]);
    });
});

describeFeatured(toggles, '[UI] Deleting hacker news items', async feature => {
    let interactor, page = null;

    before(async ()  => 
    {
        interactor  = new WebInteractor({ headless: true });
        page        = await interactor.page();
    });

    beforeEach(async () => {
        await page.goto(`${baseUrl}?unplug&disallow-autostart&${feature}`);
    });

    after(async () => await interactor.close());

    it('calls the delete use case', async () => {

        await page.evaluate(async () => {
            application.hackerNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc-def', 
                    'Title 2', 
                    'http://example/1')
            ]));
            
            window.start();

            await view.waitUntilIdle({ timeout: 1000 });
        });

        await page.waitForSelector(`${itemsSelector} .item`);

        await page.$$eval(`${itemsSelector} .item a.del`, items => items.map(it => ( it.click() )));

        await page.waitForFunction(() => application.hackerNews.deleteHasBeenCalled('id-abc-def'), { timeout: 5000 });

        await page.evaluate(() => {
            application.hackerNews.mustHaveHadDeleteCalled('id-abc-def');
        });
    });

    it("deletes list items in response to 'hacker-news-item-deleted' notification", async () => {

        await page.evaluate(async () => {
            application.hackerNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    '2ztpzk', 
                    'Title 2', 
                    'http://example/2')
            ]));

            window.start();

            await view.waitUntilIdle({ timeout: 1000 });
        });

        await page.waitForSelector(`${itemsSelector} .item`);

        await page.evaluate(() => {
            application.notify(
                'hacker-news-item-deleted',
                { id: '2ztpzk' }
            );
        });

        await page.waitForFunction(() => document.querySelector(`#hackerNews .items .item`) == null, { timeout: 5000 });

        const allListItems = await page.evaluate(() => document.querySelector(`#hackerNews .items .item`));

        expect(allListItems).to.be.null;
    });

    it("deleted list items have 'deleted' css class and no delete button", async () => {
        
        await page.evaluate(async () => {
            application.hackerNews.listReturns(Promise.resolve([ 
                new mock.NewsItem('a', '', '').thatIsDeleted()
            ]));

            window.start();

            await view.waitUntilIdle({ timeout: 1000 });
        });

        await page.waitForSelector(`${itemsSelector} .item`);

        const cssClasses = await page.$$eval(`${itemsSelector} .item`, items => items.map(it => ( it.getAttribute('class') )));
        
        expect(cssClasses.map(it => it.split(' ')).flat().map(it => it.trim())).to.include( 'deleted' );

        const deleteButtons = await page.$$eval(`${itemsSelector} .item a.del`, items => items.map(it => ( it.title )));

        expect(deleteButtons).to.be.empty;
    });

    //TEST: it allows deleting ids that don't exist
});

describeFeatured(toggles, '[UI] Bookmarking hacker news items', async feature => {
    let interactor, page = null;

    before(async ()  => 
    {
        interactor = new WebInteractor({ headless: true });
        page       = await interactor.page();
    });
    
    beforeEach(async () => {
        await page.goto(`${baseUrl}?unplug&disallow-autostart&${feature}`);
    });

    after(async () => await interactor.close());

    it('calls the bookmark use case', async () => {

        await page.evaluate(async () => {
            application.hackerNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc-def', 
                    'Title 2', 
                    'http://example/1', 
                    'source-hn')
            ]));
            
            window.start();

            await view.waitUntilIdle({ timeout: 1000 });
        });

        await page.waitForSelector(`${itemsSelector} .item`);

        await page.$$eval(`${itemsSelector} .item a.bookmark`, items => items.forEach(it => it.click()));

        await page.waitForFunction(() => application.bookmarks.addHasBeenCalled(), { timeout: 10000, polling: 'mutation' });

        await page.evaluate(() => {
            application.bookmarks.mustHaveHadAddCalled('id-abc-def');
        });
    });
});