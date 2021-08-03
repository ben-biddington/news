import { DevNullLog, Log } from '../../core/logging/log';
import { Internet, Response } from '../../core/ports/internet';

export class FetchBasedInternet implements Internet {
  private log: Log;
  
  constructor(log: Log = new DevNullLog()) {
    this.log = log;
  }

  async delete(url, headers) {
    //@ts-ignore
    return fetch(url, { headers, method: 'delete' }).
      then(async reply => ({ statusCode: reply.status, headers: { empty: 'on purpose' }, body: (await reply.text()) }));;
  }

  async post(url, headers, body) {
    if (headers['Content-type'] === 'multipart/form-data')
      return this.postMultipart(url, headers, body);

    //@ts-ignore
    return fetch(url, { headers, method: 'post', body: JSON.stringify(body) }).
      then(async reply => ({ statusCode: reply.status, headers, body: (await reply.text()) }));
  }

  private async postMultipart(url, headers, body) : Promise<Response> {
    this.log.info(`[FetchBasedInternet] Sending file to <${url}>`);
    this.log.info(`[FetchBasedInternet] Sending body <${JSON.stringify(body, null, 2)}>`);

    const formData = new FormData();

    formData.append("attachment", body);

    // [i] Let headers be auto-generated so that we get
    //
    //  multipart/form-data; boundary=--------------------------710326324172122735427581
    //

    //@ts-ignore
    const reply = await fetch(url, { headers: {}, method: 'post', body: formData }).
      then(async reply => ({ statusCode: reply.status, headers, body: (await reply.text()) }));

    this.log.info(`[FetchBasedInternet] Reply status <${reply.statusCode}>`);

    return reply;
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