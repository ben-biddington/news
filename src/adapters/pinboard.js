//
// "All API methods are GET requests, even when good REST habits suggest they should use a different verb." -- https://pinboard.in/api/
//

// https://pinboard.in/api/
const list = (ports, token /* https://pinboard.in/settings/password */) => {
    const { get } = ports;

    return get(`https://api.pinboard.in/v1/posts/all?auth_token=${token}*format=json`, { 'Accept': 'application/json' });
}

const add = (ports, token /* https://pinboard.in/settings/password */, url) => {
    const { get } = ports;

    return get(
        `https://api.pinboard.in/v1/posts/add?auth_token=${token}&` + 
        `format=json&` +
        `url=${url}&` +
        `description=${url}`, 
        { });
}

module.exports.list = list;
module.exports.add = add;