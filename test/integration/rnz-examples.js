const { list } = require('../../src/adapters/rnz.js');

const { get } = require('./support/net');

const { expect, log } = require('./integration-test');
const { NewsItem } = require('../../src/core/dist/news-item.js');

// npm run test.integration -- --grep hack
describe('Can fetch latest rnz news', async () => {
    it('from remote server', async () => {

        const result = await list({ get, log }, { url: 'https://www.rnz.co.nz', count: 1 });

        expect(result[0]).to.have.keys(NewsItem.keys());
        
        expect(result.length).to.eql(1);
    });

    it('from local server', async () => {
        const result = await list({ get, log }, { url: 'http://localhost:8080/rnz', count: 1 });

        expect(result[0]).to.have.keys(NewsItem.keys());
        
        expect(result.length).to.eql(1);
    });
})