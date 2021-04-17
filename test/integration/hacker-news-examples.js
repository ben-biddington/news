const { expect } = require('./integration-test');
const { NewsItem } = require('../../src/core/dist/news-item');
const { list } = require('../../src/adapters/hn.js');

const trace = process.env.TRACE ? console.log : () => { }

const { get, cannedGet } = require('./support/net');

// npm run test.integration -- --grep hack
describe('Can fetch latest hacker news', async () => {
  it('from local server', async () => {
    const result = await list({ get, trace }, { count: 1, url: 'http://localhost:8080/hn' });

    expect(result[0]).to.have.keys(NewsItem.keys());

    expect(result.length).to.eql(1);
  });

  it('from remote server', async () => {
    const result = await list({ get, trace }, { count: 1, url: 'https://hnrss.org' });

    expect(result[0]).to.have.keys(NewsItem.keys());

    expect(result.length).to.eql(1);
  });

  it('translates ids correctly', async () => {
    // [i] https://hnrss.org/frontpage
    const sampleFeed =
      `<rss version="2.0">
          <channel>
          <title>Hacker News: Front Page</title>
          <link>https://news.ycombinator.com/</link>
          <description>Hacker News RSS</description>
          <docs>https://hnrss.org/</docs>
          <generator>go-hnrss v1.0-10-g4f1b850</generator>
          <lastBuildDate>Wed, 17 Jun 2020 21:58:01 +0000</lastBuildDate>
          <atom:link href="https://hnrss.org/frontpage" rel="self" type="application/rss+xml"/>
              <item>
                  <title>Covid-19: The T Cell Story</title>
                  <description>
                      <p>Article URL: <a href="https://berthub.eu/articles/posts/covid-19-t-cells/">https://berthub.eu/articles/posts/covid-19-t-cells/</a></p> <p>Comments URL: <a href="https://news.ycombinator.com/item?id=23556841">https://news.ycombinator.com/item?id=23556841</a></p> <p>Points: 15</p> <p># Comments: 0</p>
                  </description>
                  <pubDate>Wed, 17 Jun 2020 21:13:37 +0000</pubDate>
                  <link>
                      https://berthub.eu/articles/posts/covid-19-t-cells/
                  </link>
                  <dc:creator>xearl</dc:creator>
                  <comments>https://news.ycombinator.com/item?id=23556841</comments>
                  <guid isPermaLink="false">https://news.ycombinator.com/item?id=23556841</guid>
              </item>
          </channel>
      </rss>`;

    const get = cannedGet(sampleFeed);

    const result = await list({ get, trace }, { count: 1, url: 'https://hnrss.org' });

    const item = result[0];

    expect(item.id).to.eql('23556841');
  });

  //TEST: it must return non-null fields
});