import { parseStringPromise, Parser } from 'xml2js';
import { Log } from '../../core/logging/log';

export interface RssFeedItem {
  id: string;
  link: string;
}

export const feed = (ports: any = {}, opts: any = {}): Promise<RssFeedItem[]> => {
  const { get, log } = ports;
  const { feedUrl, customFields = {}, versionTwo = false } = opts;

  if (!feedUrl)
    throw new Error("Missing the 'feedUrl' option");

  const Parser = require("rss-parser");
  const parser = new Parser({ customFields });

  return get(feedUrl, { Accept: "text/xml" }).
    then(reply => { log.trace(reply.body); parse(log, reply.body); return reply; }).
    then(reply => {
      if (versionTwo === true)
        return parse(log, reply.body);
      
      return parser.
        parseString(reply.body).
        then(it => it.items).
        catch(e => { throw new Error(`Failed to parse the following text as rss feed from <${feedUrl}>:\n${reply.body}`); });
    });
};

const parse = async (log: Log, xml: string): Promise<RssFeedItem[]> => {
  const result = await new Parser({ explicitArray: false, ignoreAttrs: true }).parseStringPromise(xml);
  
  return Array.isArray(result.rss.channel.item) ? result.rss.channel.item : [ result.rss.channel.item ];
}