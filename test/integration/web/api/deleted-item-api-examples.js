const expect = require('chai').expect;

const { get, postJson } = require('../../support/net');

const { del, Internet } = require('../../../../src/adapters/internet');

const { listDeleted, deletedCount } = require('../../../../src/adapters/news'); 

describe('Seiving a list of ids to find ones that have not been selected', () => { 
    it('looks like this', async () => { 
        const result = await postJson(
            'http://localhost:8080/lobsters/deleted/sieve',
            { 'Content-type': 'application/json' },
            [ 'A', 'B', 'C' ]
        )
        
        expect(result.statusCode).to.eql(200);
        expect(result.body).to.eql('["A","B","C"]');
    });
});

describe('Deleting news items', () => { 
    it('looks like this', async () => { 
        const result = await del('http://localhost:8080/news/items/abc')
        
        expect(result.statusCode).to.eql(200);
    });
});

describe('Listing deleted items', () => {
    it('looks like this', async () => { 
        const result = await listDeleted({ internet: new Internet() }, { baseUrl: 'http://localhost:8080' });
        
        expect(result.length).to.be.greaterThan(0);
    });

    it('can get count', async () => { 
        const result = await deletedCount({ internet: new Internet() }, { baseUrl: 'http://localhost:8080' });
        
        expect(result).to.be.greaterThan(0);
    });

    it('can list deleted items older than some number of days');
});
