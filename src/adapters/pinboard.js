// https://pinboard.in/api/
const list = (ports, token /* https://pinboard.in/settings/password */) => {
    const { get } = ports;

    return get(`https://api.pinboard.in/v1/posts/all?auth_token=${token}`, { 'Accept': 'application/json' });
}

module.exports.list = list;