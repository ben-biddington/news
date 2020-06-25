const get = (url, headers = {}) => {
  const request   = require("request");
  
  return new Promise(function(resolve, reject){
    request({ method: 'get', uri: url, headers }, (error, reply, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(convertReply(reply, body));
    })  
  });
};
  
const post = (url, headers = {}, body = {}) => {
  const request   = require("request");
  
  const _body = Object.keys(body).map(key => `${key}=${body[key]}`).join('&');

  return new Promise(function(resolve, reject){
    request({ method: 'post', uri: url, headers, body: _body }, (error, reply, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(convertReply(reply, body));
    })  
  });
};

const postJson = (url, headers = {}, body = {}) => {
  const request   = require("request");
  
  return new Promise(function(resolve, reject) {
    request({ method: 'post', uri: url, headers, body: JSON.stringify(body) }, (error, reply, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(convertReply(reply, body));
    })  
  });
};

class Internet {
  constructor() {}
  
  get(url, headers) {
    return get(url, headers);
  }

  post(url, headers, body) {
    const request   = require("request");
  
    body = headers["Content-type"] == 'application/json' 
      ? JSON.stringify(body) 
      : Object.keys(body).map(key => `${key}=${body[key]}`).join('&'); 
    
    return new Promise(function(resolve, reject) {
      request({ method: 'post', uri: url, headers, body }, (error, reply, body) => {
        if (error){
          reject(error);
          return;
        }

        resolve(convertReply(reply, body));
      });  
    });
  }
}

module.exports.get  = get;
module.exports.post = post;
module.exports.postJson = postJson;
module.exports.Internet = Internet;

module.exports.del = (url, headers = {}) => {
  const request   = require("request");
  
  return new Promise(function(resolve, reject) {
    request({ method: 'delete', uri: url, headers }, async (error, reply, body) => {
      if (error){
        reject(error);
        return;
      }

      resolve(convertReply(reply, body));
    })  
  });
};

const convertReply = (reply, body) => ({ statusCode: reply.statusCode, headers: { empty: 'on purpose' }, body });
