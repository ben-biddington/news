const { Cloneable } = require('./cloneable');

class NewsItem extends Cloneable {
    static blank() {
        return new NewsItem('', '', '', new Date());
    }

    constructor(id, title, url, date) {
        super();

        this._id = id;
        this._title = title;
        this._url = url;
        this._date = date;
        this._deleted = false;
    }

    get id()    { return this._id }
    get title() { return this._title }
    get url()   { return this._url }
    get date()  { return this._date }
    get deleted()      { return this._deleted }
    set deleted(value) { this._deleted = value; }

    get host()  { return require('url').parse(this._url || '').hostname || ''; }

    withUrl(url) {
        return this.clone(it => it._url = url);
    }

    dated(date) {
        return this.clone(it => it._date = date);
    }

    ageSince(when) {
        const moment = require('moment');
        
        const difference = moment.duration(moment(when).diff(moment(this._date)));

        return difference.humanize();
    }

    thatIsDeleted() {
        const result = new NewsItem(this._id, this._title, this._url, this._date);

        result._deleted = true;

        return result;
    }
}

module.exports.NewsItem = NewsItem