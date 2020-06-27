const { 
    expect, 
    Application, Ports, NewsItem,
    MockToggles, MockSeive, MockLobsters } = require('../application-unit-test');

describe('Seiving lobsters news', async () => {
    it('filters out deleted news items', async () => {
        const lobsters = new MockLobsters();
        
        const fullList = [
            { 
                id: 'A',
                title: 'item A'
            },
            { 
                id: 'B',
                title: 'item B'
            },
            { 
                id: 'C',
                title: 'item C'
            }
        ];

        lobsters.listReturns(fullList);

        const seive = new MockSeive();
        seive.alwaysReturn([ 'B' ]);

        const application = new Application(new Ports(lobsters, console.log, seive), new MockToggles());

        const seivedResult = await application.lobsters.list();

        lobsters.mustHaveHadListCalled();
        seive.mustHaveHadApplyCalled(fullList);

        expect(seivedResult).to.eql([
            { 
                id: 'B',
                title: 'item B',
                new: true
            },
        ]);
    });

    it('can be opted-out, and marked deleted instead', async () => {
        const lobsters = new MockLobsters(it => 
            it.listReturns(
                [
                    new NewsItem('A', 'item A'),
                    new NewsItem('B', 'item B'),
                ]
            )
        );

        const seive = new MockSeive(it => it.alwaysReturn([ 'B' ]));

        const toggles = new MockToggles(it => it.returnTrue('show-deleted'));

        const application = new Application(new Ports(lobsters, console.log, seive), toggles);

        const seivedResult = await application.lobsters.list();

        expect(seivedResult.map(it => ({ id: it.id, deleted: it.deleted }))).to.eql([
            { 
                id: 'A',
                deleted: true
            },
            { 
                id: 'B',
                deleted: false
            },
        ]);
    });
});