import { Database } from './internal/database';
import { DevNullLog, Log } from '../../core/logging/log';

export type Screenshot = {
  timestamp: Date;
  file: Buffer;
}

export class MarineWeather {
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
      `CREATE TABLE IF NOT EXISTS [screenshots] (
        timestamp date
      )`);
    
    await migrate(this.database);
  }

  async addScreenshot(screenshot: Screenshot) : Promise<void> {
    return this.database.ex(
      'run',
      `INSERT INTO [screenshots] (timestamp, file) VALUES (@timestamp, @file)`, 
      {
          '@timestamp': screenshot.timestamp,
          '@file':  screenshot.file,
      });
  }

  async listScreenshots(): Promise<Screenshot[]> {
    return this.database.ex(
      'all',
      `SELECT timestamp,file from [screenshots] ORDER BY timestamp`).
      then(rows => {
        return rows.map(row => {
          return {
            timestamp: row.timestamp,
            file: row.file 
          }
        })
      });
  }
}

const migrate = async (database: Database) => {
  const addColumn = async (database: Database, name: string, type: string) => {
    const count = await 
      database.ex('get', `SELECT COUNT(*) AS count FROM pragma_table_info('screenshots') WHERE name='${name}'`).
        then(row => parseInt(row.count));
    
    if (count === 0) {
      await database.ex('run', `ALTER TABLE [screenshots] ADD ${name} ${type}`)
    }
  }

  await addColumn(database, 'file', 'blob');
}
