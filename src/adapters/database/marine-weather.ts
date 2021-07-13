import { Database } from './internal/database';
import { DevNullLog, Log } from '../../core/logging/log';
import { format, set, parse, getUnixTime } from 'date-fns'

export type Screenshot = {
  id?: string;
  timestamp: Date;
  file: Buffer;
  name?: string;
  hash?: string;
}

export type FilterOptions = {
  dateMatching?: Date;
  name?: string;
}

// [i] https://www.sqlitetutorial.net/sqlite-date/
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
      `
        CREATE TABLE IF NOT EXISTS [screenshots] (
          datestamp text,
          timestamp text
        )
      `);
    
    await migrate(this.database);
  }

  async addScreenshot(screenshot: Screenshot) : Promise<void> {
    return this.database.ex(
      'run',
      `
        INSERT INTO [screenshots] 
          (datestamp, timestamp, file, name, hash) 
        VALUES 
          (@datestamp, @timestamp, @file, @name, @hash)`, 
      {
          '@datestamp': this.dateString(screenshot.timestamp),
          '@timestamp': this.dateTimeString(screenshot.timestamp),
          '@file':      screenshot.file,
          '@name':      screenshot.name,
          '@hash':      this.hash(screenshot.file),
      });
  }

  async listScreenshots(filterOptions: FilterOptions = null): Promise<Screenshot[]> {
    if (filterOptions)
      return this.find(filterOptions);

    this.log.info(`[marine-weather-database] Listing all available screenshots`);

    return this.database.ex(
      'all',
      `SELECT ${this.columns} from [screenshots] ORDER BY datestamp`).
      then(this.map);
  }

  // [i] https://stackoverflow.com/questions/49344517/sqlite-compare-dates-without-timestamp
  private async find(filterOptions: FilterOptions = null): Promise<Screenshot[]> {
    this.log.info(`[marine-weather-database] Finding screenshots for date <${this.dateString(filterOptions.dateMatching)}>`);

    let whereClause = 'datestamp = @date';

    let args = {
      '@date': this.dateString(filterOptions.dateMatching)
    }

    if (filterOptions.name) {
      whereClause += ' AND name = @name';
      args['@name'] = filterOptions.name
    }

    return this.database.ex(
      'all',
      `
        SELECT 
          ${this.columns} 
        FROM 
          [screenshots]
        WHERE 
          ${whereClause}
        ORDER BY timestamp`, 
        args
        ).
      then(rows => {
        rows.forEach(row => {
          this.log.trace(`[marine-weather-database] timestamp: ${row.timestamp}, name: ${row.name}`);
        });

        return this.map(rows);
      });
  }

  private readonly columns: string = 'rowid,timestamp,file,name,hash';

  private map(rows: any): Screenshot[] {
    return rows.map(row => {
      return {
        id: row.rowid,
        timestamp: row.timestamp,
        file: row.file, 
        name: row.name,
        hash: row.hash,
      }
    });
  }

  private dateString(date: Date) {              // https://date-fns.org/v2.22.1/docs/format
    return format(date, 'yyyy-MM-dd');          // YYYY-MM-DD
  }

  private dateTimeString(date: Date) {          // https://date-fns.org/v2.22.1/docs/format
    return format(date, "yyyy-MM-dd'T'HH:mm");  // YYYY-MM-DD
  }

  private hash(file: Buffer) {
    const crypto = require('crypto');
  
    const hashSum = crypto.createHash('sha256');
    
    hashSum.update(file);
  
    return hashSum.digest('hex');
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
  await addColumn(database, 'name', 'text');
  await addColumn(database, 'hash', 'text');
}
