const { Bookmarks } = require('./database/bookmarks');

const addBookmark = async (ports= {}, bookmark) => {
    const { log } = ports;
    const bookmarks = new Bookmarks('./bookmarks.db');
    
    log.info(`Adding <${JSON.stringify(bookmark)}>`);

    await Promise.all([
        bookmarks.add(bookmark)
    ]);
}

module.exports.addBookmark = addBookmark;