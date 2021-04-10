import { expect, MockListener, Application, Ports, MockSettings } from '../application-unit-test';
import { MockBlockedHosts } from '../../support/mock-blocked-hosts';

describe('Blocking a host', async () => {
  let application: Application;
  let listener;
  let blockedHosts: MockBlockedHosts;

  beforeEach(async () => {
    blockedHosts = new MockBlockedHosts();
    application = new Application(Ports.blank().withBlockedHosts(blockedHosts), new MockSettings());
    listener    = new MockListener(application);
    
    await application.news.block('bbc.co.uk');
  });
  
  it('it notifies with <news-host-blocked>', async () => {
    listener.mustHave({
      type: "news-host-blocked",
      host: "bbc.co.uk"
    });
  });

  it('adds it to the blocked hosts list', () => {
    blockedHosts.mustHave('bbc.co.uk');
  });

  it('marks news items with some flag meaning they are blocked');
});