import { readFileSync } from "fs";

const expect = require('chai').expect;
const { postJson, postFile, get, del: _delete } = require('../../../../../src/adapters/internet');

let deletes = [];

const cleanup = async () => {
  await Promise.all(deletes.map(entryId => _delete(`http://localhost:8080/diary/${entryId}`)));
  deletes = [];
}

describe('Can post diary entries', async () => {
  after(async () => {
    await cleanup();
  });

  it('for example', async () => {
    const result = await postJson(
      'http://localhost:8080/diary', 
      { 'Content-type': 'application/json' }, 
      { 
        body: 'A B C', 
        location: 'Lyall',
        session: {
          start:  new Date('2021-07-08T21:00:00.000Z'),
          end:    new Date('2021-07-08T23:00:00.000Z'),
        } 
      });
      
    const body = JSON.parse(result.body);

    deletes.push(body.id); 

    expect(result.statusCode).to.eql(200);
    
    expect({ body: body.body, location: body.location, session: body.session }).to.eql({ 
      body: 'A B C', 
      location: 'Lyall',
      session: {
        start:  '2021-07-08T21:00:00.000Z',
        end:    '2021-07-08T23:00:00.000Z'
      } 
    });
  });
});

describe('Can list diary entries', async () => {
  it('for example', async () => {
    const result = await get(
      'http://localhost:8080/diary', 
      { 'Accept': 'application/json' });
      
    const body = JSON.parse(result.body);

    expect(result.statusCode).to.eql(200);
    
    expect(body.length).to.not.be.undefined;
  });
});

describe('Can delete diary entries', async () => {
  it('for example', async () => {
    const deletable = await postJson(
      'http://localhost:8080/diary', 
      { 'Content-type': 'application/json' }, 
      { 
        body: 'This can be deleted', 
      });
      
    const id = JSON.parse(deletable.body).id;
    
    const result = await _delete(`http://localhost:8080/diary/${id}`);
      
    expect(result.statusCode).to.eql(200);
  });
});

describe('Can add attachments', async () => {
  let entryId = 0;

  before(async () => {
    const result = await postJson(
      'http://localhost:8080/diary', 
      { 'Content-type': 'application/json' }, 
      { 
        body: 'A B C', 
        location: 'Lyall',
        session: {
          start:  new Date('2021-07-08T21:00:00.000Z'),
          end:    new Date('2021-07-08T23:00:00.000Z'),
        } 
      });
      
      entryId = JSON.parse(result.body).id;

      deletes.push(entryId);
  });

  after(async () => {
    after(async () => {
      await cleanup();
    });
  });

  it('for example', async () => {
    const result = await postFile(
      `http://localhost:8080/diary/${entryId}/attachments`,
      {}, 
      readFileSync(`${__dirname}/samples/2021-07-30.png`));

    expect(result.statusCode).to.eql(200);

    const attachmentsReply = await get(`http://localhost:8080/diary/${entryId}/attachments`);

    const attachments = JSON.parse(attachmentsReply.body);

    expect(attachments.length).to.eql(1);

    expect(attachments[0]).to.match(new RegExp(`diary/${entryId}/attachments/[0-9]+`));
  });
});