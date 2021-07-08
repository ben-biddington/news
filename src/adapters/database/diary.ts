import { Database } from './internal/database';
import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { Database as SqliteDatabase, OPEN_CREATE, OPEN_READWRITE } from 'sqlite3';


export class Diary {
  private database: Database;
  private filename: string;

  constructor(filename: string) {
    this.filename = filename;
    this.database = new Database(filename);
  }

  async init() {
    await this.database.open();
    await this.database.ex(
      'run',
      `CREATE TABLE IF NOT EXISTS [diary] (
        body      text, 
        timestamp date
      )`);
  }

  async enter(entry: DiaryEntry) {
    await this.database.ex(
      'run',
      `INSERT INTO [diary] (body, timestamp) VALUES (@body, DATETIME('now'))`, 
      {
          '@body': entry.body,
      });
    
    // [i] last_insert_rowid() only works on the same connection 
    // https://www.codeproject.com/questions/830792/sqlite-last-insert-rowid-returns-always 
    const id = (await this.database.ex('get', `SELECT MAX(ROWID) as id FROM [diary]`)).id;

    return this.get(id);
  }

  async get(id: string): Promise<DiaryEntry> {
    const result = await this.database.ex('get', `SELECT ROWID as id, body, timestamp FROM [diary] WHERE rowid=?`, id);

    if (result)
      return { id: result.id, timestamp: result.timestamp, body: result.body};
    
    return null;
  }
}