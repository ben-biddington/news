const { Bookmarks } = require('./database/bookmarks');

const addBookmark = async (ports= {}, bookmark) => {
    const { log } = ports;
    const bookmarks = new Bookmarks('./bookmarks.db');
    
    try {
        log.info(`Adding <${JSON.stringify(bookmark)}>`);

        await Promise.all([
            bookmarks.add(bookmark)
        ]);
    } finally {
        bookmarks.close();
    }
}

module.exports.addBookmark = addBookmark;