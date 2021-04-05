import { Cloneable } from './cloneable';
import { WeatherQuery } from './weather';

export class Ports extends Cloneable {
    lobsters: any;
    log: any;
    seive: any;
    hackerNews: any;
    rnzNews: any;
    bookmarks: any;
    deletedItems: any; 
    toggles: any;
    weather: WeatherQuery;

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

    static blank() : Ports { return new Ports(null, null, null, null, null); }

    withBookmarks(bookmarks)        { return this.clone(it => it.bookmarks        = bookmarks); }
    withHackerNews(hackerNews)      { return this.clone(it => it.hackerNews       = hackerNews); }
    withLobsters(lobsters)          { return this.clone(it => it.lobsters         = lobsters); }
    withDeletedItems(deletedItems)  { return this.clone(it => it.deletedItems     = deletedItems); }
    withToggles(toggles)            { return this.clone(it => it.toggles          = toggles); }
    with(weather: WeatherQuery)     { return this.clone(it => it.weather          = weather); }
}