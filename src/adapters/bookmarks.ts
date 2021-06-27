import { Bookmark } from "../core/bookmark";

export const add = (ports: any = {}, opts: any = {}, bookmark) : Promise<void> => {
  const { post, trace = _ => { } } = ports;
  const { url = '' } = opts;

  trace(`Posting to <${url}>`);

  return post(`${url}/bookmarks`, { 'Content-type': 'application/json' }, bookmark).then(mustBeOkay).then(parse);
}

export const list = (ports: any = {}, opts: any = {}, bookmark): Promise<Bookmark[]> => {
  const { get, trace = _ => { } } = ports;
  const { url = '' } = opts;

  trace(`Getting <${url}>`);

  return get(`${url}/bookmarks`, { headers: { 'Accept': 'application/json' } }).then(mustBeOkay).then(parse);
}

export const del = (ports: any = {}, opts: any = {}, id): Promise<void> => {
  const { del, trace = _ => { } } = ports;
  const { url = '' } = opts;

  trace(`Deleting <${url}>`);

  return del(`${url}/bookmarks/${id}`).then(mustBeOkay).then(parse);
}

const mustBeOkay = reply => {
  if (reply.statusCode != 200)
    throw new Error(`Request returned status <${reply.statusCode}> and body <${reply.body}>, expected <200>`);

  return reply;
}

const parse = reply => {
  try {
    return JSON.parse(reply.body);
  } catch (e) {
    throw new Error(`Failed to parse the following as json:\n${reply.body}`);
  }
}