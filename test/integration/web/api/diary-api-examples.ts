const expect = require('chai').expect;
const { add, list, del } = require('../../../../src/adapters/bookmarks');
const trace = process.env.TRACE ? console.log : () => { }
const { postJson, get, del: _delete } = require('../../../../src/adapters/internet');
const { Bookmark } = require('../../../../src/core/dist/bookmark');

describe('Can post diary entries', async () => {
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