const { baseUrl, expect, delay, WebInteractor } = require('./ui-integration-test');

const itemsSelector = 'div#rnzNews .items';
const useSvelte     = process.env.USE_SVELTE || false;
const headless      = (process.env.HEADLESS || 'true') === 'true';
const url           = `${baseUrl}?unplug=1&allow-rnz-news&use-svelte=${useSvelte}`

describe('[UI] it shows rnz news', async () => {

    let interactor, page = null;

    before(async ()  => 
    {
        interactor  = new WebInteractor({ headless });
        page        = await interactor.page();
        await page.goto(url);
    });
    
    after(async () => await interactor.close());

    it('for example', async () => {
        await page.evaluate(async () => {
            application.nowIs(new Date('Fri, 12 Jun 2020 09:00:00 +1200'));
            
            application.lobsters.listReturns(Promise.resolve([]));

            //@todo: rather say `new core.NewsItem` than `new mock.NewsItem`
            application.rnzNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc', 
                    'Title 1', 
                    'http://example/1', 
                    new Date('Fri, 12 Jun 2020 08:00:00 +1200'))    
            ]));
            
            window.start();

            await view.waitUntilIdle();
        });

        await page.evaluate(() => {
            application.rnzNews.mustHaveHadListCalled();
        });

        await page.waitForSelector(`${itemsSelector} li`);

        await page.evaluate(() => application.rnzNews.mustHaveHadListCalled());

        const listIds = await page.$$eval(`${itemsSelector} li`, items => items.map(it => ( it.id )));

        expect(listIds).to.eql([ 'news-id-abc' ]);

        const listItems = await page.$$eval(`${itemsSelector} a.title`, items => items.map(it => ( it.innerText )));

        expect(listItems).to.eql([ 'Title 1' ]);

        const listLinks = await page.$$eval(`${itemsSelector} li a.title`, items => items.map(it => ( it.href )));

        expect(listLinks).to.eql([ 'http://example/1' ]);

        const hosts = await page.$$eval(`${itemsSelector} li span.host`, items => items.map(it => ( it.innerText )));

        expect(hosts).to.eql([ ]);

        const ages = await page.$$eval(`${itemsSelector} li span.age`, items => items.map(it => ( it.innerText )));

        expect(ages).to.eql([ "an hour" ]);

        const deleteButtons = await page.$$eval(`${itemsSelector} li a.del`, items => items.map(it => ( it.title )));

        expect(deleteButtons).to.eql([ "Delete item with id 'id-abc'" ]);

        const cssClasses = await page.$$eval(`${itemsSelector} li`, items => items.map(it => ( it.getAttribute('class') )));
        
        expect(cssClasses.map(it => it.split(' ')).flat()).to.include( 'item' );
    });
});

describe('[UI] Deleting rnz news items', async () => {
    let interactor, page = null;

    before(async ()  => 
    {
        interactor = new WebInteractor({ headless });
        page       = await interactor.page();
        await page.goto(url);
    });

    after(async () => await interactor.close());

    it('calls the delete use case', async () => {

        await page.evaluate(() => {
            application.rnzNews.listReturns(Promise.resolve([ 
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
            application.rnzNews.mustHaveHadDeleteCalled('id-abc-def');
        });
    });

    it("deletes list items in response to 'rnz-news-item-deleted' notification", async () => {

        await page.goto(url);

        await page.waitForSelector('div#rnzNews');

        await page.evaluate(() => {
            application.rnzNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    '2ztpzk', 
                    'Title 2', 
                    'http://example/2')
            ]));

            window.start();
        });

        await page.evaluate(() => {
            application.notify(
                'rnz-news-item-deleted',
                { id: '2ztpzk' }
            );
        });

        //@todo: this element finding is not very good it returns either null or {}. There must be a better way.
        const allListItems = await page.evaluate(() => document.querySelector(`div#application div#rnzNews .items li`));

        expect(allListItems).to.be.null;
    });

    //TEST: it allows deleting ids that don't exist
});

describe('[UI] Disallow bookmarking rnz', async () => {
    let interactor, page = null;

    before(async ()  => 
    {
        interactor = new WebInteractor({ headless });
        page       = await interactor.page();
        await page.goto(url);
    });
    
    after(async () => await interactor.close());

    it('calls the bookmark use case', async () => {

        await page.evaluate(() => {
            application.rnzNews.listReturns(Promise.resolve([ 
                new mock.NewsItem(
                    'id-abc-def', 
                    'Title 2', 
                    'http://example/1')
            ]));
        });

        const bookmarkButtons = await page.$$eval(`div#application div#rnzNews .items li a.bookmark`, result => result.map(it => it.innerText));

        expect(bookmarkButtons).to.be.empty;
    });
});