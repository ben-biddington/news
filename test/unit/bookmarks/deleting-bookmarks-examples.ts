import { MockBookMarks, MockSeive, MockLobsters, MockListener, Application, Ports, MockSettings, MockToggles } from '../application-unit-test';
const { log } = require('../../support/mock-log');
const mockPorts = () => new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters(), null);

describe('Bookmarking news items', async () => {
    let bookmarks, notifications = null;

    before(async () => {
        bookmarks = new MockBookMarks();

        const ports = mockPorts().withBookmarks(bookmarks);

        const application = new Application(ports);

        notifications = new MockListener(application);

        await application.bookmarks.del('id-a');
    });
    
    it('deletes the bookmark', () => {
        bookmarks.mustHaveBeenAskedToDelete('id-a');
    });

    it("notifies with 'bookmark-deleted'", () => {
        notifications.mustHave({
            type: 'bookmark-deleted',
            id: 'id-a'
        });
    });
});