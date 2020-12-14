
const expect = require('chai').expect;
const { get }  = require('../../src/adapters/internet');
const { MockInternet }  = require('./support/net');
const { list, add } = require('../../src/adapters/pinboard');

describe('[pinboard] can list bookmarks', async () => {
    it('for example', async () => {
        // [i] Find token here
        const token = process.env.PINBOARD_TOKEN;
        
        const all = await list({ get }, token);
    });
});

//
// [!] "All API methods are GET requests, even when good REST habits suggest they should use a different verb." -- https://pinboard.in/api/
//
describe('[pinboard] can add bookmarks', async () => {
    it('sends the url', async () => {
        const internet = new MockInternet();
        const mockGet = (url, headers) => internet.get(url, headers);

        const reply = await add({ get: mockGet }, 'xxx-token-xxx', 'https://www.rnz.co.nz/');

        internet.mustHaveHadGetCalled(
            'https://api.pinboard.in/v1/posts/add?auth_token=xxx-token-xxx&format=json&url=https://www.rnz.co.nz/&description=https://www.rnz.co.nz/', 
            { 
                'Content-type': 'application/json',
                'Accept': 'application/json' 
            });
    });

    it('sends the web page title (first need to *find* the title from the web page)');
});