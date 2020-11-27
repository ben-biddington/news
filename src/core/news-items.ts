export class NewsItems {
    private _newsItems: Array<any> = [];

    constructor() {}

    addAll(newsItems: Array<any>) {
        newsItems.forEach(item => this._newsItems.push(item));
    }

    get(newsItemId) {
        return this._newsItems.find(it => it.id == newsItemId);
    }

    missing(newsItems = []) {
        const ids = this._newsItems.map(it => it.id);
        return newsItems.filter(it => false == ids.includes(it.id));
    }
}