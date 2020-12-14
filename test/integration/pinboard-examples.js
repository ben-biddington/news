
const expect = require('chai').expect;
const { get }  = require('../../src/adapters/internet');
const { list } = require('../../src/adapters/pinboard');

describe('[pinboard] can list bookmarks', async () => {
    it('for example', async () => {
        // [i] Find token here
        const token = process.env.PINBOARD_TOKEN;
        
        const all = await list({ get }, token);
    });
});

describe('[pinboard] can add bookmarks', async () => {
    it('sends the url');
    it('sends the web page title (first need to *find* the title from the web page)');
});