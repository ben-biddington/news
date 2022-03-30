import { NewsItemPreview } from "../../../../core/news-item-preview";
import { NewsItemPreviewSource } from "../../../../core/ports/news-item-preview-source";
import { hostName } from "../../../../core/url";

export type Options = {
  previewServiceUrl?: string;
};

export class InternetPreviewSource implements NewsItemPreviewSource {
  private readonly opts: Options;

  constructor(opts: Options) {
    this.opts = opts || { previewServiceUrl: undefined };
  }

  get = async (url: string) => {
    // [i] Can't work out how to omit 'Origin' header (1) when running in browser so have to use our own API
    // in this case.
    url = this.opts.previewServiceUrl
      ? `${this.opts.previewServiceUrl}?url=${url}`
      : url;

    console.log({ opts: this.opts });

    // https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
    const request = new XMLHttpRequest();
    IDBRequest;
    request.open("GET", url);

    // [!] (1) Attempt to set a forbidden header was denied: Origin
    // request.setRequestHeader('Origin', undefined);

    request.setRequestHeader("Accept", "text/html");
    request.send();

    await new Promise((accept, reject) => {
      request.addEventListener("load", accept);
      request.addEventListener("error", reject);
    });

    const preview: NewsItemPreview = this.parse(url, request.responseText);

    return Promise.resolve(preview);
  };

  private parse = (url: string, html: string) => {
    //@ts-ignore
    const preview = document.implementation.createHTMLDocument(html);
    preview.write(html);
    preview.close();

    const title = preview.querySelector("p")?.textContent;
    let firstImage = preview.querySelectorAll("img")[0]?.src;

    if (firstImage && firstImage.startsWith("/")) {
      firstImage = hostName(url) + firstImage;
    }

    return { summary: title, image: firstImage };
  };
}
