const { Database } = require('./internal/database');
const { Bookmark } = require('../../core/bookmark');

class Bookmarks {
    constructor(fileName, log = _ => {}) {
        this._database = new Database(fileName);
        this._log = log;
        this._tableName = '[bookmarks]';
    }

    async init() {
        await this._database.open();
        await this._database.ex('run', 
            `CREATE TABLE IF NOT EXISTS ${this._tableName} (id text PRIMARY KEY, title text, timestamp date, url text, source text)`);
        this._log(`Database initialised at <${this._fileName}>`);
    }

    async add(bookmark) {
        return this._database.ex(
            'run', 
            `REPLACE INTO ${this._tableName} (id, title, timestamp, url, source) VALUES (@id, @title, DATETIME('now'), @url, @source)`, 
            {
                '@id'    : bookmark.id, 
                '@title' : bookmark.title, 
                '@url'   : bookmark.url, 
                '@source': bookmark.source
            });
    }

    async contains(id) {
        return this._database.ex('get', `SELECT COUNT(1) as count FROM ${this._tableName} WHERE id=?`, id).
            then(row => row.count).then(count => count > 0);
    }

    async get(id) {
        return this._database.ex('get', `SELECT id, title, timestamp, url, source FROM ${this._tableName} WHERE id=?`, id).
            then(row => {
                return row ? new Bookmark(row.id, row.title, row.url, row.source) : null;
            });
    }

    async list() {
        return this._database.ex('all', `SELECT id, title, timestamp, url, source FROM ${this._tableName} ORDER BY timestamp DESC`).
            then(row => row.map(it => new Bookmark(it.id, it.title, it.url, it.source)));
    }

    async del(id) {
        return this._database.ex('run', `DELETE FROM ${this._tableName} WHERE id=?`, id);
    }
}

module.exports.Bookmarks = Bookmarks;