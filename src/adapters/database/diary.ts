import { Database } from './internal/database';
import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { Attachment } from '../../../src/core/diary/attachment';
import { parseISO, parse, toDate } from 'date-fns';
import { DevNullLog, Log } from '../../core/logging/log';

export class Diary {
  private database: Database;
  private log: Log;

  constructor(filename: string, log: Log = new DevNullLog()) {
    this.log = log;
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
    
    await this.database.ex(
        'run',
        `CREATE TABLE IF NOT EXISTS [attachment] (
          diaryEntryId int, 
          file blob,
          FOREIGN KEY(diaryEntryId) REFERENCES diary(ROWID)
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

  async update(entry: DiaryEntry) {
    this.log.trace(`Updating entry with id <${entry.id}>`);

    await this.database.ex(
      'run',
      `UPDATE [diary] SET body=@body WHERE ROWID=@id`, 
      {
          '@id':    entry.id,
          '@body':  entry.body,
      });
    
    return this.get(entry.id);
  }

  async attach(diaryEntryId: number, attachment: Attachment) : Promise<void> {
    return this.database.ex(
      'run',
      `INSERT INTO [attachment] (diaryEntryId, file) VALUES (@diaryEntryId, @file)`, 
      {
          '@diaryEntryId': diaryEntryId,
          '@file':  attachment.file,
      });
  }

  async attachments(diaryEntryId: number, attachment: Attachment) : Promise<Attachment[]> {
    return this.database.ex(
      'all',
      `SELECT * from [attachment] WHERE diaryEntryId=@diaryEntryId`, 
      {
          '@diaryEntryId': diaryEntryId,
      }).then(rows => {
        return rows.map(row => {
          return {
            diaryEntryId: diaryEntryId, 
            file: row.file 
          }
        })
      });
  }

  async get(id: string): Promise<DiaryEntry> {
    const result = await this.database.ex('get', `SELECT ROWID as id, body, timestamp FROM [diary] WHERE rowid=?`, id);

    if (result)
      return { id: result.id, timestamp: parseISO(new Date(result.timestamp).toISOString()), body: result.body};
    
    return null;
  }
}