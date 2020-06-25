class Deleted {
    constructor(fileName, log = _ => {}) {
        this._fileName = fileName;
        this._log = log;
    }

    async init() {
        this._database = await this.open();
        await this.ex('run', 'CREATE TABLE IF NOT EXISTS [news_deleted] (id text PRIMARY KEY, timestamp date)');
        this._log(`Database initialised at <${this._fileName}>`);
    }

    add(args) {
        if (typeof(args) === 'object') {
            const { id, timestamp } = args;

            return this.ex(
                'run', 
                `REPLACE INTO [news_deleted] (id, timestamp) VALUES (@id, @timestamp)`, 
                {
                    '@id'       : id, 
                    '@timestamp': timestamp
                });
        }

        return this.ex('run', `REPLACE INTO [news_deleted] (id, timestamp) VALUES ('${args}', DATETIME('now'))`);
    }

    remove(id) {
        return this.ex('run', 'DELETE FROM [news_deleted] WHERE id=?', id);
    }

    count() {
        return this.ex('get', `SELECT COUNT(1) as count FROM [news_deleted]`).
            then(row => row.count);
    }

    async contains(id) {
        return this.ex('get', `SELECT COUNT(1) as count FROM [news_deleted] WHERE id=?`, id).
            then(row => row.count).then(count => count > 0);
    }

    async filter(...ids) {
        const inClause = ids.map(it => `'${it}'`).join(',');
        const deletedIds = await 
            this.ex('all', `SELECT id FROM [news_deleted] WHERE id IN (${inClause})`).
            then(row => row.map(it => it.id));

        return ids.filter(id => false == deletedIds.includes(id));
    }

    async list(opts = {}) {
        if (opts.before)
            return this.ex('all', `SELECT id FROM [news_deleted] WHERE timestamp < ? ORDER BY timestamp DESC`, opts.before).
                then(row => row.map(it => it.id));

        return this.ex('all', `SELECT id FROM [news_deleted] ORDER BY timestamp DESC`).
            then(row => row.map(it => it.id));
    }

    // -- private --

    ex(name, query, args) {
        return this.connected(db => {
          return new Promise((accept, reject) => {
            db[name](query, args, (e, row) => {
              if (e) {
                reject(e);
                return;
              }
      
              accept(row);
            })
          });
        });
      }
    
    async connected(fn) {
        const db = this.open();

        try {
            return await fn(db);
        } finally {
            db.close();
        }
    }

    open() {
        const sqlite3 = require('sqlite3');
        return new sqlite3.Database(this._fileName, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE);
    }
}

module.exports.Deleted = Deleted;