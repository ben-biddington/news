const { Application, Ports } = require('../../../src/core/application');

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

        const ports = mockPorts().withBookmarks(bookmarks);

        const application = new Application(ports, new MockToggles());

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