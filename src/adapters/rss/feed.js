const feed = (ports = {}, opts = {}) => {
    const { get, log } = ports;
    const { feedUrl, customFields = {} } = opts;

    if (!feedUrl)
        throw new Error("Missing the 'feedUrl' option");

    const Parser = require("rss-parser");
    const parser = new Parser({ customFields });

    return get(feedUrl, { Accept: "text/xml" }).
        then(reply => { log.trace(reply.body); return reply; }).
        then(reply => {
            try {
                return parser.parseString(reply.body);
            } catch (e) {
                throw new Error(`Failed to parse the following as rss feed from <${feedUrl}>:\n${reply.body}`);
            }
        }).
        then((rss) => rss.items);
};

module.exports.feed = feed;
