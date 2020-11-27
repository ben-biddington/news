const { Cloneable } = require('./dist/cloneable');

class Ports extends Cloneable{
    constructor(lobsters, log, seive, hackerNews, rnzNews) {
        super();

        this.lobsters     = lobsters;
        this.log          = log || console.log;
        this.seive        = seive;
        this.hackerNews   = hackerNews;
        this.rnzNews      = rnzNews;
        this.bookmarks    = null;
        this.deletedItems = null;
        this.toggles      = null;
    }

    withBookmarks(bookmarks)        { return this.clone(it => it.bookmarks        = bookmarks); }
    withHackerNews(hackerNews)      { return this.clone(it => it.hackerNews       = hackerNews); }
    withLobsters(lobsters)          { return this.clone(it => it.lobsters         = lobsters); }
    withDeletedItems(deletedItems)  { return this.clone(it => it.deletedItems     = deletedItems); }
    withToggles(toggles)            { return this.clone(it => it.toggles          = toggles); }
}

module.exports.Ports = Ports;