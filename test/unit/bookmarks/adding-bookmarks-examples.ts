import { MockBookMarks, MockSeive, MockLobsters, MockListener, Application, Ports, MockSettings, MockToggles } from '../application-unit-test';
const { NewsItem } = require('../../../src/core/dist/news-item')
const { log } = require('../../support/mock-log');
const { Bookmark } = require('../../../src/core/dist/bookmark');
const mockPorts = () => new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters(), null);

describe('Bookmarking news items', async () => {
  let bookmarks, notifications, application = null;

  before(async () => {
    bookmarks = new MockBookMarks();

    const hackerNewsItemToBookmark = new NewsItem('id-a', 'Example A', 'http://abc');
    const lobstersNewsItemToBookmark = new NewsItem('id-b', 'Example B', 'http://def');

    const ports = mockPorts().
      withHackerNews(new MockLobsters(it => it.listReturns(Promise.resolve([hackerNewsItemToBookmark])))).
      withLobsters(new MockLobsters(it => it.listReturns(Promise.resolve([lobstersNewsItemToBookmark])))).
      withBookmarks(bookmarks);

    application = new Application(ports, new MockToggles());

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

  it('does what when item cannot be found with the supplied id?');

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

describe('Bookmarking news items rejects duplicates', async () => {
  let bookmarks, notifications, application = null;

  before(async () => {
    bookmarks = new MockBookMarks();
  });

  it('for example', async () => {
    const duplicate = new NewsItem('id-a', 'Example A', 'http://abc')

    const ports = mockPorts().
      withHackerNews(new MockLobsters(it => it.listReturns(Promise.resolve([duplicate])))).
      withBookmarks(bookmarks);

    application = new Application(ports, new MockToggles());

    // [hmmm] You have to load the state before you can bookmark
    await application.hackerNews.list();

    notifications = new MockListener(application);

    await application.bookmarks.add(duplicate.id);

    bookmarks.resetCalls();
    notifications.clear();

    await application.bookmarks.add(duplicate.id);

    bookmarks.mustNotHaveBeenAskedToAddAnything();
    notifications.mustBeEmpty();
  });
});