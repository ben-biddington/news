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

  private async postMultipart(url, headers, body /* Blob -- https://developer.mozilla.org/en-US/docs/Web/API/Blob  */) : Promise<Response> {
    this.log.info(`[FetchBasedInternet] Sending file to <${url}>`);
    this.log.info(`[FetchBasedInternet] Sending file size='${body.size}', type='${body.type}' `);

    const custom = new CustomFormData();
    await custom.appendFile("attachment", "image.png", body);

    const newBlob = custom.toBlob(); 
    this.log.info(`[FetchBasedInternet] Blob size='${newBlob.size}', type='${newBlob.type}' `);

    return await fetch(
      url, 
      { 
        headers: { 'Content-Type': `multipart/form-data; boundary=${custom.boundary}` }, 
        method: 'post', 
        body: newBlob 
      }).
      then(async reply => ({ statusCode: reply.status, headers, body: (await reply.text()) }));
  }

  async put(url, headers, body) {
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

//
// 5-Jun-2022 -- Present for Timmy.
// 
// Represents sending a single file by "multipart/form-data". 
// This means you could send additional headers along with the file. 
//
// Usage:
//
//  const custom = new CustomFormData();
//  await custom.appendFile("attachment", "image.png", body);
//
//  const reply = await fetch(
//    url, 
//    { 
//      headers: { 'Content-Type': `multipart/form-data; boundary=${custom.boundary}` }, 
//      method: 'post', 
//      body: newBlob 
//    });
//
class CustomFormData {
  private readonly data: Array<BlobPart> = [];

  async appendFile(name: string, fileName: string, blob: Blob) {
    var enc = new TextEncoder();
    
    this.data.push(
      enc.encode(
      `--${this.boundary}\r\n` + 
      `Content-Disposition: form-data; name="${name}"; filename="${fileName}"\r\n` + 
      `Content-Type: ${blob.type}\r\n\r\n`
      ),
      new Uint8Array(await blob.arrayBuffer()),
      enc.encode(`\r\n--${this.boundary}--\r\n`))
  }

  toBlob() {
    return new Blob(this.data)
  }

  get boundary() {
    return `---------------------------17803515373095409092864358501`; //@todo: how do you decide what value to give this?
  }
}