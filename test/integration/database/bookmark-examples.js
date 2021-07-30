const expect = require('chai').expect;
const temp   = require('temp');

temp.track();

const { Bookmarks } = require('../../../src/adapters/database/bookmarks');
const { Bookmark }  = require('../../../src/core/dist/bookmark');

describe('[bookmarks] Can store bookmarks', () => {
    let tempFile, bookmarks = null;

    before(async () => {
        tempFile  = await temp.open();
        bookmarks = new Bookmarks(tempFile.path);
        await bookmarks.init();
    });

    it('for example', async () => {
        const exampleBookmark = new Bookmark('abc', 'Title 1', 'http://abc/def', 'source-rnz');

        await bookmarks.add(exampleBookmark);

        expect((await bookmarks.contains('abc'))).to.be.true;

        const theStoredValue = await bookmarks.get('abc');

        expect(theStoredValue).to.eql(exampleBookmark);
    });

    it('listing returns all fields', async () => {
       
        const exampleBookmark = {
            id: "23516088",
            title: "Google resumes senseless attack on URL bar, hides full addresses on Chrome 85",
            url: "https://www.androidpolice.com/2020/06/12/google-resumes-its-senseless-attack-on-the-url-bar-hides-full-addresses-on-chrome-canary/",
            source:""}

        await bookmarks.add(exampleBookmark);

        const theStoredValue = (await bookmarks.list()).find(it => it.id == '23516088');

        expect(theStoredValue).to.eql(exampleBookmark);
    });
});

describe('[bookmarks] Can delete bookmarks', () => {
    let tempFile, bookmarks = null;

    before(async () => {
        tempFile  = await temp.open();
        bookmarks = new Bookmarks(tempFile.path);
        await bookmarks.init();
    });

    it('for example', async () => {
        const { v4: uuid } = require('uuid');

        const id = uuid();

        const exampleBookmark = new Bookmark(id, 'Title 1', 'http://abc/def', 'source-rnz');

        await bookmarks.add(exampleBookmark);
        await bookmarks.del(id);

        expect(await bookmarks.get(id)).to.be.null;
    });
});