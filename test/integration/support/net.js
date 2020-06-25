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

  mustHaveHadDeleteCalled(expectedUrl) {
    expect(this._verb).to.eql('DELETE');
    expect(this._url).to.eql(expectedUrl);
  }
}

module.exports.fakeGet   = fakeGet;
module.exports.cannedGet = cannedGet;
module.exports.get = require('../../../src/adapters/internet').get;
module.exports.postJson = require('../../../src/adapters/internet').postJson;
module.exports.MockInternet = MockInternet