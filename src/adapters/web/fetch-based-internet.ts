import { Internet } from '../../core/ports/internet';

export class FetchBasedInternet implements Internet {
  async delete(url, headers) {
    //@ts-ignore
    return fetch(url, { headers, method: 'delete' }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));;
  }

  async post(url, headers, body) {
    //@ts-ignore
    return fetch(url, { headers, method: 'post', body: JSON.stringify(body) }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));
  }

  async get(url, headers) {
    //@ts-ignore
    return fetch(url, { headers }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));;
  }
}