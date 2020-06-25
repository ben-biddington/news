const expect = require('chai').expect;
const { get, del, Internet } = require('../../../src/adapters/internet');
const { add, getCredential } = require('../../../src/adapters/saved.io');
const credential = getCredential();

const describeWhen = (opts, title, fn) => {
    if (opts.condition() === true) {
        describe(title, fn);  
    } else {
        describe.skip(`[skipped: ${opts.message}] ${title}`, fn);
    }
};


describeWhen({condition: () => credential != null, message: 'credentials not supplied' }, '[saved.io] Can use this bookmark service', async () => {
    const bookmarksToDelete = [];

    after(async () => {
        bookmarksToDelete.forEach(async bookmarkId => {
            await del(`http://devapi.saved.io/bookmarks?devkey=${credential.devKey}&key=${credential.apiKey}&id=${bookmarkId}`) 
        });
    });
    
    it('list like this', async () => {
        const reply = await get(`http://devapi.saved.io/bookmarks?devkey=${credential.devKey}&key=${credential.apiKey}`);

        expect(reply.statusCode).to.eql(200);
    });

    it('add one like this', async () => {
        const result = await add({ internet: new Internet() }, credential, {
            id: 'xxx',
            title:  'Example',
            url:    'http://devapi.saved.io',
            list:   'test'
        });

        bookmarksToDelete.push(result);

        expect(result).to.not.be.empty;
    });
});