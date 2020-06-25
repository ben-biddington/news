const add = (ports = {}, opts = {}, bookmark) => {
    const { post, trace = _ => {} } = ports;
    const { url = '' } = opts;
  
    trace(`Posting to <${url}>`);

    return post(`${url}/bookmarks`, { 'Content-type': 'application/json' }, bookmark).then(mustBeOkay).then(parse);
}

const list = (ports = {}, opts = {}, bookmark) => {
    const { get, trace = _ => {} } = ports;
    const { url = '' } = opts;
  
    trace(`Getting <${url}>`);

    return get(`${url}/bookmarks`, { headers: { 'Accept': 'application/json' } }).then(mustBeOkay).then(parse);
}

const del = (ports = {}, opts = {}, id) => {
    const { del, trace = _ => {} } = ports;
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

module.exports.add = add;
module.exports.list = list;
module.exports.del = del;