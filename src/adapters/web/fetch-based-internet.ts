import { DevNullLog, Log } from '../../core/logging/log';
import { Internet, Response } from '../../core/ports/internet';

export type Options = {
  noCors?: boolean;
}

export class FetchBasedInternet implements Internet {
  private readonly log: Log;
  private readonly opts: Options;

  constructor(log: Log = new DevNullLog(), opts: Options = { }) {
    this.opts = { noCors: false, ...opts };
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

    return reply;
  }

  async put(url, headers, body) {
    //@ts-ignore
    return fetch(url, { headers, method: 'put', body: JSON.stringify(body) }).
      then(async reply => {
        const body = await reply.text();

        return { statusCode: reply.status, headers: { empty: 'on purpose' }, body };
      });
  }

  get = async (url, headers) => {
    //@ts-ignore
    const reply = await fetch(url, { mode: this.opts.noCors ? 'no-cors' : 'cors', headers });

    const body = await reply.text(); 

    return  { 
      statusCode: reply.status, 
      headers: { empty: `reply headers for <${url}> left empty on purpose` }, 
      body 
    };
  };
}