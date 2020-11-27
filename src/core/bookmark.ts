export class Bookmark {
    id: string = '';
    title: string = '';
    url: string = '';
    source: string = '';

    constructor(id, title, url, source) {
        this.id     = id;
        this.title  = title;
        this.url    = url;
        this.source = source;
    }
}