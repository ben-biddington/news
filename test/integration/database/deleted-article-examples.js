const expect = require('chai').expect;
const temp = require('temp');

temp.track();

const { Deleted } = require('../../../src/adapters/database/deleted');

describe('[database] Can store deleted articles', () => {
    let deleted = null;

    beforeEach(async () => {
        const tempFile = await temp.open();

        deleted = new Deleted(tempFile.path);
        
        await deleted.init();
    });

    it('can store a deleted item', async () => {
        await deleted.add('item-abc-def');

        expect((await deleted.contains('item-abc-def'))).to.be.true;
    });

    it('can undelete', async () => {
        await deleted.add('item-abc-def');

        expect((await deleted.contains('item-abc-def'))).to.be.true;
        
        await deleted.remove('item-abc-def');

        expect((await deleted.contains('item-abc-def'))).to.be.false;
    });

    it('can count deleted items', async () => {

        await deleted.add('item-1');
        await deleted.add('item-2');
        await deleted.add('item-3');

        expect((await deleted.count())).to.eql(3);
    });

    it('can filter deleted ids', async () => {

        await deleted.add('A');
        await deleted.add('B');
        await deleted.add('C');

        expect(await deleted.filter('A', 'B', 'C')).               to.eql([               ]);
        expect(await deleted.filter('D', 'E', 'F')).               to.eql([ 'D', 'E', 'F' ]);
        expect(await deleted.filter('A', 'B', 'C', 'D', 'E', 'F')).to.eql([ 'D', 'E', 'F' ]);
        expect(await deleted.filter('X', 'Y', 'Z')).               to.eql([ 'X', 'Y', 'Z' ]);
    });

    it('can list deleted ids', async () => {

        await deleted.add('A');
        await deleted.add('B');
        await deleted.add('C');

        expect(await deleted.list()).to.eql([ 'A', 'B', 'C' ]);
    });

    it('can list deleted ids dated before a date', async () => {

        await deleted.add({ id: 'A', timestamp: new Date('17-Jun-2020') });
        await deleted.add({ id: 'B', timestamp: new Date('18-Jun-2020') });
        await deleted.add({ id: 'C', timestamp: new Date('19-Jun-2020') });

        expect(await deleted.list({ before: new Date('19-Jun-2020') })).to.eql([ 'B', 'A' ]);
    });
})