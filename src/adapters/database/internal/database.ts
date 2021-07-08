import { Database as SqliteDatabase, OPEN_READWRITE, OPEN_CREATE } from 'sqlite3';

// [i] https://github.com/mapbox/node-sqlite3/wiki/API#databaseexecsql-callback
export class Database {
  private _fileName: string;

  constructor(fileName) {
    this._fileName = fileName;
  }

  ex(name, query, args={}) {
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

  get(query, ...args) {
    return this.connected((db: SqliteDatabase) => {
      return new Promise((accept, reject) => {
        db.get(query, args, (e, row) => {
          console.log(`row <${JSON.stringify(row, null, 2)}>`);
          console.log(`e <${e}>`);
          if (e) {
            reject(e);
            return;
          }

          accept(row);
        })
      });
    });
  }

  private async connected(fn) {
    const db = this.open();

    try {
      return await fn(db);
    } finally {
      db.close();
    }
  }

  open(): SqliteDatabase {
    return new SqliteDatabase(this._fileName, OPEN_READWRITE | OPEN_CREATE);
  }
}