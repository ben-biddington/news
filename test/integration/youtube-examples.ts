const { expect } = require('./integration-test');
const { NewsItem } = require('../../src/core/dist/news-item');
import { YoutubeNewsSource } from '../../src/adapters/youtube';

const trace = process.env.TRACE ? console.log : () => { }

const { get } = require('./support/net');

// npm run test.integration -- --grep hack
describe('Can fetch a youtube channel feed', async () => {
  it('from remote server', async () => {
    const source = new YoutubeNewsSource({ get, trace});
    
    const result = await source.list(
      { 
        count: 1, 
        channelId: 'UCJquYOG5EL82sKTfH9aMA9Q' 
      });

    expect(result[0].id).to.not.be.null;

    expect(result[0]).to.have.keys(NewsItem.keys());

    expect(result.length).to.eql(1);
  });

  it('from local server', async () => {
    const opts = { 
      count: 1, 
      channelId: 'UCJquYOG5EL82sKTfH9aMA9Q' 
    }

    const localSource = new YoutubeNewsSource({ get, trace}, { url: 'http://localhost:8080/youtube'});

    const localResult = await localSource.list(opts);

    const remoteSource = new YoutubeNewsSource({ get, trace});

    const remoteResult = await remoteSource.list(opts);

    expect(remoteResult[0]).to.eql(localResult[0]);
  });
});