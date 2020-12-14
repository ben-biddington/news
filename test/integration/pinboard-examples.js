
const expect = require('chai').expect;
const { get }  = require('../../src/adapters/internet');
const { list } = require('../../src/adapters/pinboard');

describe('[pinboard]', async () => {
    it('can list bookmarks', async () => {
        // [i] Find token here
        const token = process.env.PINBOARD_TOKEN;
        
        const all = await list({ get }, token);
    });
});