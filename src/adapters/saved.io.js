const add = async (ports={}, credential, bookmark) => {
    const { internet } = ports;

    const { devKey, apiKey } = credential;

    if (!devKey)
        throw new Error(`Missing credential with <devKey>`);

    if (!apiKey)
        throw new Error(`Missing credential with <apiKey>`);

    const reply = await internet.post(
        `http://devapi.saved.io/bookmarks?devkey=${credential.devKey}&key=${credential.apiKey}`, 
        { },
        bookmark);

    if (reply.statusCode != 200)
        throw new Error(`Failed to add bookmark, status returned was <${reply.statusCode}> and body:\n${reply.body}`);

    const body = JSON.parse(reply.body);    

    return body.bk_id;
}

const getCredential = () => {
    const fs = require('fs');

    const path = '.saved.io.credential';

    if (false == fs.existsSync(path))
        return null;

    return JSON.parse(fs.readFileSync(path, {encoding:'utf8', flag:'r'}));
}

module.exports = { add, getCredential }