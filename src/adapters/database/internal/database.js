class Database {
    constructor(fileName) {
        this._fileName = fileName;
    }

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

    // -- private --

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

module.exports.Database = Database;