const { 
    baseUrl, delay, expect, WebInteractor, 
    ConsoleListener, describeFeatured, toggles } = require('./ui-integration-test');

const itemsSelector = 'div#application div#lobsters .items';

describeFeatured(toggles, '[UI] How it displays lobsters news items', async toggles => {
    it('renders items like this', async () => {
        // requires server to be running
        //
        //   $ http-server src/adapters/web/vanilla/

        const puppeteer = require('puppeteer');

        const browser = await puppeteer.launch({ headless: true });
        const page    = await browser.newPage();

        const itemsSelector = 'div#application div#lobsters .items';

        try 
        {
            await page.goto(`${baseUrl}?unplug=1&${toggles}`)

            await page.evaluate(() => {
                application.lobsters.listReturns(Promise.resolve([ 
                    new mock.NewsItem(
                        'id-abc', 
                        'Title 1', 
                        'http://example/1', 
                        new Date())
                ]));
                
                window.start(); 
                
                application.lobsters.mustHaveHadListCalled();
            });

            await page.waitForSelector(`${itemsSelector} li`);

            const listIds = await page.$$eval(`${itemsSelector} li`, items => items.map(it => ( it.id )));

            expect(listIds).to.eql([ 'news-id-abc' ]);

            const listItems = await page.$$eval(`${itemsSelector} a.title`, items => items.map(it => ( it.innerText )));

            expect(listItems).to.eql([ 'Title 1' ]);

            const listLinks = await page.$$eval(`${itemsSelector} li a.title`, items => items.map(it => ( it.href )));

            expect(listLinks).to.eql([ 'http://example/1' ]);

            const hosts = await page.$$eval(`${itemsSelector} li span.host`, items => items.map(it => ( it.innerText )));

            expect(hosts).to.eql([ "example" ]);

            const deleteButtons = await page.$$eval(`${itemsSelector} li a.del`, items => items.map(it => ( it.title )));

            expect(deleteButtons).to.not.be.empty;

            const cssClasses = await page.$$eval(`${itemsSelector} li`, items => items.map(it => ( it.getAttribute('class') )));
            
            expect(cssClasses.map(it => it.split(' ')).flat()).to.include( 'item' );
        } 
        finally 
        {
            await browser.close();
        }
    });
})

describeFeatured(toggles, '[UI] Deleting news items', async toggles => {
    let interactor, page = null;

    before(async ()  => 
    {
        interactor  = new WebInteractor({ headless: true });
        page        = await interactor.page();
    });
    
    after(async () => await interactor.close());

    it('calls the delete use case', async () => {
        const itemsSelector = 'div#application div#lobsters .items';

        await page.goto(`${baseUrl}?unplug=1&${toggles}`);

        await page.evaluate(() => {
            application.lobsters.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc-def', 
                    'Title 2', 
                    'http://example/1')
            ]));
            
            window.start();
        });

        await page.waitForSelector(`${itemsSelector} li`);

        await page.$$eval(`${itemsSelector} li a.del`, items => items.map(it => ( it.click() )));

        await page.evaluate(() => {
            application.lobsters.mustHaveHadDeleteCalled('id-abc-def');
        });
    });

    it("deletes list items in response to 'lobsters-item-deleted' notification", async () => {
        await page.goto(`${baseUrl}?unplug=1`);

        await page.waitForSelector('div#lobsters');

        await page.evaluate(() => {
            application.lobsters.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    '2ztpzk', 
                    'Title 2', 
                    'http://example/2')
            ]));

            window.start();
        });

        await page.evaluate(() => {
            application.notify(
                'lobsters-item-deleted',
                { id: '2ztpzk' }
            );
        });

        //@todo: this element finding is not very good it returns either null or {}. There must be a better way.
        const allListItems = await page.evaluate(() => document.querySelector(`div#application div#lobsters .items li`));

        expect(allListItems).to.be.null;
    });

    it("deleted list items have 'deleted' css class and no delete button", async () => {
        await page.goto(`${baseUrl}?unplug=1`);

        await page.waitForSelector('div#lobsters');

        await page.evaluate(() => {
            application.lobsters.listReturns(Promise.resolve([ 
                new mock.NewsItem('a', '', '').thatIsDeleted()
            ]));

            window.start();
        });

        const cssClasses = await page.$$eval(`${itemsSelector} li`, items => items.map(it => ( it.getAttribute('class') )));
        
        expect(cssClasses).to.eql(['item deleted']);

        const deleteButtons = await page.$$eval(`${itemsSelector} li a.del`, items => items.map(it => ( it.title )));

        expect(deleteButtons).to.eql([]);
    });

    it("reloads list items in response to 'lobsters-items-loaded' notification", async () => {
        consoleMessages = new ConsoleListener(page);

        await page.goto(`${baseUrl}?unplug=1&${toggles}`);

        await page.evaluate(() => {
            application.lobsters.listReturns(Promise.resolve([ ]));

            window.start();
        });

        await page.waitForSelector('div#lobsters');

        await page.evaluate(() => {
            application.notify(
                'lobsters-items-loaded',
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

        await page.waitForSelector(`${itemsSelector} li`);

        await consoleMessages.mustHaveNoErrors({ delay: 1000 });

        const listItems = await page.$$eval(`${itemsSelector} a.title`, items => items.map(it => ( it.innerText )));

        expect(listItems).to.eql([ 'Who likes to rock the party' ]);
    });

    //TEST: it allows deleting ids that don't exist
});

describeFeatured(['use-svelte', 'use-vue', 'use-react'], '[UI] Snoozing lobsters news items', async toggles => {
    let interactor, page = null;
    const itemsSelector = 'div#application div#lobsters .items';

    beforeEach(async ()  => 
    {
        interactor  = new WebInteractor({ headless: true });
        page        = await interactor.page();
        await page.goto(`${baseUrl}?unplug=1&${toggles}`);
        await page.waitForSelector('div#lobsters');
    });

    afterEach(async () => await interactor.close());

    it('calls the snooze use case', async () => {

        await page.evaluate(() => {
            application.lobsters.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc-def', 
                    'Title 2', 
                    'http://example/1')
            ]));
            
            window.start();
        });

        await page.waitForSelector('div#lobsters');

        await page.$$eval(`${itemsSelector} li a.snooze`, items => items.map(it => ( it.click() )));

        await page.evaluate(() => {
            application.lobsters.mustHaveHadSnoozeCalled('id-abc-def');
        });
    });

    it("snoozing just deletes the item from the list", async () => {

        await page.evaluate(() => {
            application.lobsters.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    '2ztpzk', 
                    'Title 2', 
                    'http://example/2')
            ]));

            window.start();
        });

        await page.waitForSelector(`${itemsSelector} li`);

        await page.evaluate(() => {
            application.notify(
                'lobsters-item-snoozed',
                { id: '2ztpzk' }
            );
        });

        await delay(500);

        await page.waitForFunction(() => document.querySelector(`div#application div#lobsters .items li`) == null, { timeout: 5000})

        const allListItems = await page.evaluate(() => document.querySelector(`div#application div#lobsters .items li`));

        expect(allListItems).to.be.null;
    });
});