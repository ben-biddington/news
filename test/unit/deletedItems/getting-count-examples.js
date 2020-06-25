const {
    expect, 
    Application, Ports, 
    log, 
    MockLobsters, MockSeive, MockToggles, MockListener, MockDeletedItems } = require('../application-unit-test');

const mockPorts = () => new Ports(new MockLobsters(), log, new MockSeive(), new MockLobsters());

describe('Getting deleted item count', async () => {
    let deletedItems, notifications = null;

    before(async () => {
        deletedItems = new MockDeletedItems(it => it.countReturns(17));

        const ports = mockPorts().withDeletedItems(deletedItems);

        const application = new Application(ports, new MockToggles());

        notifications = new MockListener(application);

        expect(await application.deletedItems.count()).to.eql(17);
    });
    
    it('calls the adapter', () => {
        deletedItems.mustHaveHadCountCalled();
    });

    it("notifies with 'deleted-item-count-changed'", () => {
        notifications.mustHave({
            type: 'deleted-item-count-changed',
            count: 17, 
        });
    });
});