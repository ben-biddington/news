import { expect, Application, Ports, MockLobsters, MockListener, MockSeive, MockToggles } from '../application-unit-test';

describe('Viewing hacker news', async () => {
  it('can list news', async () => {
    const hackerNews = new MockLobsters();

    const application = new Application(
      Ports.blank().withHackerNews(hackerNews),
      new MockToggles());
    
    const listener: MockListener = new MockListener(application);

    await application.hackerNews.list();

    hackerNews.mustHaveHadListCalled();

    listener.mustHave(
      {
        "type": "hacker-news-items-loaded",
        "items": [
          {
            "id": "",
            "title": "One",
            "deleted": false,
            "new": true,
            "hostIsBlocked": false,
            "label": "hn"
          },
          {
            "id": "",
            "title": "Two",
            "deleted": false,
            "new": true,
            "hostIsBlocked": false,
            "label": "hn"
          }
        ]
      }
    );
  });
});

describe('Deleting hacker news items', () => {
  const hackerNews = new MockLobsters();

  const application = new Application(
    Ports.blank().withHackerNews(hackerNews),
    new MockToggles());

  const notifications = new MockListener(application);

  it('performs the delete', async () => {
    await application.hackerNews.delete('item-id');

    hackerNews.mustHaveHadDeleteCalled('item-id');
  });

  it('notifies', async () => {
    await application.hackerNews.delete('item-abc-def');

    notifications.mustHave({
      type: 'hacker-news-item-deleted',
      id: 'item-abc-def'
    });
  });

  it('allows registering for the event', async () => {
    let theIdDeleted = null;

    application.on('hacker-news-item-deleted', (e) => {
      theIdDeleted = e.id;
    });

    await application.hackerNews.delete('item-one');

    expect(theIdDeleted).to.eql('item-one');
  });

  it('allows event handlers to fail', async () => {
    application.on('lobsters-item-deleted', _ => {
      throw new Error('Failed on purpose');
    });

    await application.hackerNews.delete('item-one');
  });
})