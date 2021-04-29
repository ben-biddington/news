import { MockListener, Application, Ports, NewsItem, MockSettings, MockLobsters } from '../application-unit-test';
import { MockBlockedHosts } from '../../support/mock-blocked-hosts';

describe('Blocking a host', async () => {
  let application: Application;
  let listener;
  let ports;
  let blockedHosts: MockBlockedHosts;

  beforeEach(async () => {
    blockedHosts  = new MockBlockedHosts();
    ports   = Ports.blank().
      withBlockedHosts(blockedHosts).
      withLobsters(new MockLobsters(it => it.listReturns([ 
        new NewsItem('id'   , 'title'   , 'https://bbc.co.uk/example'),
        new NewsItem('id-1' , 'title-1' , 'https://rnz.co.nz/news'),
        new NewsItem('id-2' , 'title-2' , 'https://rnz.co.nz/news').thatIsDeleted()
      ])));
    application   = new Application(ports, new MockSettings());
    listener      = new MockListener(application);
    
    await application.lobsters.list();
    await application.news.block('bbc.co.uk');
  });
  
  it('it notifies with <news-items-modified>, filtering out deleted items', async () => {
    listener.mustHave({
      type: "news-items-modified",
      items: [
        {
          "id": "id",
          "title": "title",
          "url": "https://bbc.co.uk/example",
          "deleted": false,
          "new": false,
          "hostIsBlocked": true,
          "label": "lobsters"
        },
        {
          "id": "id-1",
          "title": "title-1",
          "url": "https://rnz.co.nz/news",
          "deleted": false,
          "new": false,
          "hostIsBlocked": false,
          "label": "lobsters"
        }
      ]
    });
  });

  it('adds it to the blocked hosts list', () => {
    blockedHosts.mustHave('bbc.co.uk');
  });
});

describe('Unblocking a host', async () => {
  let application: Application;
  let listener;
  let ports;
  let blockedHosts: MockBlockedHosts;

  beforeEach(async () => {
    blockedHosts  = new MockBlockedHosts();
    ports   = Ports.blank().
      withBlockedHosts(blockedHosts).
      withLobsters(new MockLobsters(it => it.listReturns([ new NewsItem('id', 'title', 'https://bbc.co.uk/example')])));
    application   = new Application(ports, new MockSettings());
    listener      = new MockListener(application);

    await application.lobsters.list();
  });
  
  it('removes from the blocked hosts list', async () => {
    await application.news.block('bbc.co.uk');
    
    blockedHosts.mustHave('bbc.co.uk');

    await application.news.unblock('bbc.co.uk');
    
    blockedHosts.mustNotHave('bbc.co.uk');
  });

  it('it notifies with <news-items-modified>', async () => {
    await application.news.block('bbc.co.uk');
    
    blockedHosts.mustHave('bbc.co.uk');

    listener.clear();

    await application.news.unblock('bbc.co.uk');

    blockedHosts.mustNotHave('bbc.co.uk');

    listener.mustHave({
      type: "news-items-modified",
      items: [
        {
          "id": "id",
          "title": "title",
          "url": "https://bbc.co.uk/example",
          "deleted": false,
          "new": false,
          "hostIsBlocked": false,
          "label": "lobsters"
        }
      ]  
    });
  });
});