const expect = require('chai').expect;

const { Application, Ports } = require('../../../src/core/application');

const { NewsItem } = require('../../../src/core/news-item')

const { MockLobsters } = require('../../support/mock-lobsters');

const { MockListener } = require('../../support/mock-listener');

const { MockSeive } = require('../../support/mock-seive');

const { MockToggles } = require('../../support/mock-toggles');

const { MockBookMarks } = require('../../support/mock-bookmarks');

const { log } = require('../../support/mock-log');

const { Bookmark } = require('../../../src/core/bookmark');

const mockPorts = () => new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters());

describe('Bookmarking news items', async () => {
    let bookmarks, notifications = null;

    before(async () => {
        bookmarks = new MockBookMarks();

        const hackerNewsItemToBookmark   = new NewsItem('id-a', 'Example A', 'http://abc');
        const lobstersNewsItemToBookmark = new NewsItem('id-b', 'Example B', 'http://def');

        const ports = mockPorts().
            withHackerNews(new MockLobsters(it => it.listReturns(Promise.resolve([ hackerNewsItemToBookmark ])))).
            withLobsters(new MockLobsters(it => it.listReturns(Promise.resolve([ lobstersNewsItemToBookmark ])))).
            withBookmarks(bookmarks);

        const application = new Application(ports, new MockToggles());

        notifications = new MockListener(application);

        await application.hackerNews.list();
        await application.lobsters.list();
        await application.bookmarks.add(hackerNewsItemToBookmark.id);
        await application.bookmarks.add(lobstersNewsItemToBookmark.id);
    });
    
    it('saves them', () => {
        bookmarks.mustHaveBeenAskedToAdd(new Bookmark('id-a', 'Example A', 'http://abc', ''));
        bookmarks.mustHaveBeenAskedToAdd(new Bookmark('id-b', 'Example B', 'http://def', ''));
    });

    it("notifies with 'bookmark-added'", () => {
        notifications.mustHave({
            type: 'bookmark-added',
            id: 'id-a', 
            title: 'Example A',
            url: 'http://abc', 
            source: ''
        });

        notifications.mustHave({
            type: 'bookmark-added',
            id: 'id-b',
            title: 'Example B',
            url: 'http://def', 
            source: ''
        });
    });
});