const expect = require('chai').expect;
const { NewsItem } = require('../../src/core/news-item');

describe('News item host', async () => {
    it('calculates host automatically', () => {
        const newsItem = NewsItem.blank().withUrl('http://abc/def/ghi');

        expect(newsItem.url).to.eql('http://abc/def/ghi');
        expect(newsItem.host).to.eql('abc');
    });

    it('defaults to blank', () => {
        const newsItem = NewsItem.blank();

        expect(newsItem.host).to.eql('');
    });

    it('undefined url defaults to blank', () => {
        const newsItem = NewsItem.blank().withUrl(undefined);

        expect(newsItem.host).to.eql('');
    });
});

describe('News item age', async () => {
    it('calculates age automatically based on date', () => {
        const now = new Date('Fri, 12 Jun 2020 07:00:00 +1200');

        const newsItem = NewsItem.blank().dated(new Date('Fri, 12 Jun 2020 08:00:00 +1200'));

        expect(newsItem.ageSince(now)).to.eql('an hour');
    });
});