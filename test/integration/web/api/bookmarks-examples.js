
const expect = require('chai').expect;

const { add, list, del } = require('../../../../src/adapters/bookmarks');

const trace = process.env.TRACE ? console.log : () => {}

const { postJson, get, del: _delete } = require('../../../../src/adapters/internet');
const { Bookmark } = require('../../../../src/core/dist/bookmark');

describe('Can add bookmarks', async () => {
    it('from local server', async () => {
        const bookmark = new Bookmark('id-1', 'Title 1', 'http://abc/def', 'none');

        const result = await add(
            { post: postJson, trace }, 
            { url: 'http://localhost:8080' }, 
            bookmark);

        expect(result).to.eql(bookmark);
    });
});

describe('Can list bookmarks', async () => {
    it('from local server', async () => {
        await list({ get, trace }, { url: 'http://localhost:8080' });
    });
});

describe('Can delete bookmarks', async () => {
    it('from local server', async () => {
        await add(
            { post: postJson, trace }, 
            { url: 'http://localhost:8080' }, 
            new Bookmark('id-xxx', '', '', ''));

        await del({ del: _delete, trace }, { url: 'http://localhost:8080' }, 'id-xxx');

        const listResult = await list({ get, trace }, { url: 'http://localhost:8080' });

        expect(listResult.map(it => it.id)).to.not.contain('id-xxx');
    });
});