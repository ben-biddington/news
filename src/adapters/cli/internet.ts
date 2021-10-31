export interface Request {
  url: string;
  headers?: any;
  body?: any;
}

export interface Response {
  statusCode: number;
  body: any;
}

export type Options = {
  failOnPurpose?: boolean,
  useTor?: boolean;
  torAddress?: string;
}

const defaultOptions: Options = { };

export const get = (r: Request): Promise<Response> => createGet()(r);

export const createGet = (opts: Options = defaultOptions): (request: Request) => Promise<Response> => {
  opts = { useTor: false, failOnPurpose: false, torAddress: 'socks5h://127.0.0.1:9050', ...opts };

  return (r: Request) => {
    const request = require("request");
    const { SocksProxyAgent } = require('socks-proxy-agent');

    return new Promise(function(resolve, reject){
      const blocked = ['airbnb', 'box'];
      const containsBlockedCompany = (url: string) => blocked.some(it => url.toLowerCase().includes(it));
      const isBlocked = containsBlockedCompany(r.url); 

      if (opts.failOnPurpose && isBlocked) {
        return reject(`The url <${r.url}> is rejected because it contains a name in <${blocked.join(', ')}>`);
      }

      try {
        request({
          agent: opts.useTor && new SocksProxyAgent(opts.torAddress), 
          method: 'get', 
          uri: r.url, 
          headers: {
            ...r.headers, 
            'User-agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:93.0) Gecko/20100101 Firefox/93.0'
          } 
        }, 
        (error: any, reply: any, body: any) => {
          if (error){
            reject(error);
            return;
          }
  
          resolve(reply);
        });
      }
      catch(e) {
        reject(e);
      }
    });
  }
}