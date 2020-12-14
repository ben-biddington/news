const fakeGet = filePath => (url, headers) => {
  const fs = require('fs');
  return new Promise(function(resolve, reject){
    fs.readFile(filePath, 'utf-8', (err, data) => {
        err ? reject(err) : resolve({ statusCode: 200, body: data });
    });
  });
};

const cannedGet = body => {
  return (_, __) => {
    return Promise.resolve({ statusCode: 200, body});
  };
}

const expect = require('chai').expect;

class MockInternet {
  delete(url, headers) {
    this._verb = "DELETE";
    this._url = url;
    this._headers = headers;

    return Promise.resolve({ statusCode: 200, body: ''});
  }

  get(url, headers) {
    this._verb = "GET";
    this._url = url;
    this._headers = headers;

    return Promise.resolve({ statusCode: 200, body: ''});
  }

  post(url, headers, body) {
    this._verb = "POST";
    this._url = url;
    this._headers = headers;
    this._body = body;

    return Promise.resolve({ statusCode: 200, body: ''});
  }

  mustHaveHadDeleteCalled(expectedUrl) {
    expect(this._verb).to.eql('DELETE');
    expect(this._url).to.eql(expectedUrl);
  }

  mustHaveHadGetCalled(expectedUrl) {
    expect(this._verb).to.eql('GET');
    expect(this._url).to.eql(expectedUrl);
  }

  mustHaveHadPostCalled(expectedUrl, expectedHeaders={}, expectedBody={}) {
    expect(this._verb).to.eql('POST');
    expect(this._url).to.eql(expectedUrl);
    expect(this._headers).to.eql(expectedHeaders);
    expect(this._body).to.eql(expectedBody);
  }
}

module.exports.fakeGet   = fakeGet;
module.exports.cannedGet = cannedGet;
module.exports.get = require('../../../src/adapters/internet').get;
module.exports.postJson = require('../../../src/adapters/internet').postJson;
module.exports.MockInternet = MockInternet