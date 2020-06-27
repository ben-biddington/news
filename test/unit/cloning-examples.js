const { expect, NewsItem } = require('./application-unit-test');

describe('Cloning', async () => {
    it('returns a different instance', () => {
        const a = new NewsItem('a', 'Title A', 'http://url.a', new Date());
        const b = new NewsItem('a', '', '', '');

        expect(a).to.       equal(a);
        expect(a).to.   not.equal(b);

        const cloneOfA = a.clone();
        expect(a).to.   not.equal(cloneOfA);
    });

    it('preserves all keys', () => {
        const a = new NewsItem('a', 'Title A', 'http://url.a', new Date());

        const cloneOfA = a.clone();
        
        expect(Object.keys(a)).to.eql(Object.keys(cloneOfA));
    });

    it('supports customisation', () => {
        const a = new NewsItem('a', 'Title A', 'http://url.a', new Date());
        expect(a).to.equal(a);

        const updatedA = a.thatIsNew();
        expect(a).to.equal(a);
        expect(a).to.not.equal(updatedA);
        expect(Object.keys(a)).to.eql(Object.keys(updatedA));
    });
});