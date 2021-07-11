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

  async put(url, headers, body) {
    console.log('[FetchBasedInternet]', url, JSON.stringify(body, null, 2));

    //@ts-ignore
    return fetch(url, { headers, method: 'put', body: JSON.stringify(body) }).
      then(async reply => {
        const body = await reply.text();

        console.log('[FetchBasedInternet] body:', body);

        return { statusCode: reply.status, headers: { empty: 'on purpose' }, body };
      });
  }

  async get(url, headers) {
    //@ts-ignore
    return fetch(url, { headers }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));;
  }
}