import { Database } from './internal/database';
import { DiaryEntry } from '../../../src/core/diary/diary-entry';
import { Attachment } from '../../../src/core/diary/attachment';
import { DevNullLog, Log } from '../../core/logging/log';

export class Diary {
  private database: Database;
  private log: Log;

  constructor(filename: string, log: Log = new DevNullLog()) {
    this.log = log;
    this.database = new Database(filename);
    log.trace(`Using database file at <${filename}>`);
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

    await migrate(this.database);
  }

  async enter(entry: DiaryEntry) {
    await this.database.ex(
      'run',
      `
      INSERT INTO [diary] 
        (body, timestamp, location, start, end, board, tide)
      VALUES 
        (@body, DATETIME('now'), @location, @start, @end, @board, @tide)`, 
      {
          '@body': entry.body,
          '@location': entry.location,
          '@start': entry.session?.start,
          '@end': entry.session?.end,
          '@board': entry.board,
          '@tide': entry.tide,
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
      `
        UPDATE [diary] 
        SET 
          body=@body,
          location=@location, 
          start=@start, 
          end=@end, 
          board=@board, 
          tide=@tide
        WHERE ROWID=@id`, 
      {
          '@id':        entry.id,
          '@body':      entry.body,
          '@location':  entry.location,
          '@start':     entry.session?.start,
          '@end':       entry.session.end,
          '@board':     entry.board,
          '@tide':      entry.tide,
      });
    
    return this.get(entry.id);
  }

  async attach(diaryEntryId: number, attachment: Attachment) : Promise<void> {
    this.log.info(`[diary-db] Adding attachment for diary entry <${diaryEntryId}> <${typeof attachment.file}>`);

    return this.database.ex(
      'run',
      `INSERT INTO [attachment] (diaryEntryId, file) VALUES (@diaryEntryId, @file)`, 
      {
          '@diaryEntryId': diaryEntryId,
          '@file': attachment.file,
      });
  }

  async attachments(diaryEntryId: number) : Promise<Attachment[]> {
    this.log.info(`[diary-db] Listing attachments for diary entry <${diaryEntryId}>`);

    return this.database.ex(
      'all',
      `SELECT ROWID from [attachment] WHERE diaryEntryId=@diaryEntryId`, 
      {
          '@diaryEntryId': diaryEntryId,
      }).then(rows => {
        
        this.log.info(`[diary-db] Found <${rows.length}> attachments for diary entry <${diaryEntryId}>`);

        return rows.map(row => {
          this.log.info(`[diary-db] Found <${JSON.stringify(row, null, 2)}>`);

          return {
            id: row.rowid,
            diaryEntryId: diaryEntryId, 
          }
        })
      });
  }

  async list(): Promise<DiaryEntry[]> {
    const results = await this.database.ex(
      'all', `SELECT ${this.allColumns()} FROM [diary] ORDER BY start DESC LIMIT 50`);

    return results.map((result) => ({
      id: result.id, 
      timestamp: new Date(result.timestamp), 
      body: result.body,
      location: result.location,
      session: { 
        start:  result.start ? new Date(result.start): null, 
        end:    result.end   ? new Date(result.end): null 
      },
      board: result.board,
      tide: result.tide
    }));
  }

  async get(id: string): Promise<DiaryEntry> {
    const result = await this.database.ex('get', `SELECT ${this.allColumns()} FROM [diary] WHERE rowid=?`, id);

    if (result)
      return { 
        id: result.id, 
        timestamp: new Date(result.timestamp), 
        body: result.body,
        location: result.location,
        session: { 
          start:  result.start ? new Date(result.start): null, 
          end:    result.end   ? new Date(result.end): null 
        },
        board: result.board,
        tide: result.tide
      };
    
    return null;
  }

  async delete(id: string): Promise<void> {
    await this.deleteAttachments(id);
    await this.database.ex('run', `DELETE FROM [diary] WHERE rowid=?`, id);
  }

  async deleteAttachments(id: string): Promise<void> {
    await this.database.ex('run', `DELETE FROM [attachment] WHERE diaryEntryId=?`, id);
  }

  private allColumns() {
    return 'ROWID as id, body, timestamp, location, start, end, board, tide';
  }
}

const migrate = async (database: Database) => {
  const addColumn = async (database: Database, name: string, type: string) => {
    const count = await 
      database.ex('get', `SELECT COUNT(*) AS count FROM pragma_table_info('diary') WHERE name='${name}'`).
        then(row => parseInt(row.count));
    
    if (count === 0) {
      await database.ex('run', `ALTER TABLE [diary] ADD ${name} ${type}`)
    }
  }

  await addColumn(database, 'location', 'text');
  await addColumn(database, 'start'   , 'date');
  await addColumn(database, 'end'     , 'date');
  await addColumn(database, 'board'   , 'text');
  await addColumn(database, 'tide'    , 'text');
}