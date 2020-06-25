const expect = require('chai').expect;

const { QueryStringSettings } = require('../../src/adapters/web/query-string-settings');

describe('How to obtain query string settings', async () => {
    it('for example', () => {
        const queryString = '?toggle-a=true'

        const toggles = new QueryStringSettings(queryString);

        expect(toggles.get('toggle-a')).to.eql('true');
    });

    it('can supply full url', () => {
        const queryString = 'http://abc/def?toggle-a=true'

        const toggles = new QueryStringSettings(queryString);

        expect(toggles.get('toggle-a')).to.eql('true');
    });

    it('can leave out the question mark', () => {
        const queryString = 'toggle-a=true'

        const toggles = new QueryStringSettings(queryString);

        expect(toggles.get('toggle-a')).to.eql('true');
    });

    it('missing returns null', () => {
        const queryString = '?toggle-a=true'

        const toggles = new QueryStringSettings(queryString);

        expect(toggles.get('xxx')).to.be.null;
    });

    it('accepts a default', () => {
        const queryString = '?toggle-a=true'

        const toggles = new QueryStringSettings(queryString);

        expect(toggles.get('xxx', 'def')).to.eql('def');
    });
});