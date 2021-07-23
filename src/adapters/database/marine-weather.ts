import { Database } from './internal/database';
import { DevNullLog, Log } from '../../core/logging/log';
import { format, set, parse, getUnixTime } from 'date-fns'
const path = require('path');
import { writeFileSync, mkdirSync, existsSync } from 'fs';

export type Screenshot = {
  id?: string;
  timestamp: Date;
  file: Buffer;
  name?: string;
  hash?: string;
  filePath?: string;
}

export type FilterOptions = {
  dateMatching?: Date;
  name?: string;
  hash?: string;
}

// [i] https://www.sqlitetutorial.net/sqlite-date/
export class MarineWeather {
  private database: Database;
  private log: Log;
  private storageDirectory: string;

  constructor(filename: string, rootDirectory: string, log: Log = new DevNullLog()) {
    this.log = log;
    this.storageDirectory = rootDirectory;
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

    this.log.trace(`[marine-weather-database] Storing files at <${this.storageDirectory}>`);
  }

  async addScreenshot(screenshot: Screenshot) : Promise<void> {
    const hash      = this.hash(screenshot.file);
    const dateStamp = this.dateString(screenshot.timestamp);
    const fileDir   = path.join(this.storageDirectory, screenshot.name);
    const filePath  = path.join(fileDir, `${dateStamp}-${this.timeString(screenshot.timestamp)}`);

    if (false == existsSync(fileDir)){
      mkdirSync(fileDir, { recursive: true });
    }

    writeFileSync(filePath, screenshot.file);

    return this.database.ex(
      'run',
      `
        INSERT INTO [screenshots] 
          (datestamp, timestamp, name, hash, filePath) 
        VALUES 
          (@datestamp, @timestamp, @name, @hash, @filePath)`, 
      {
          '@datestamp': dateStamp,
          '@timestamp': this.dateTimeString(screenshot.timestamp),
          '@name':      screenshot.name,
          '@hash':      hash,
          '@filePath':  filePath
      });
  }

  async listScreenshots(filterOptions: FilterOptions = null): Promise<Screenshot[]> {
    if (filterOptions)
      return this.find(filterOptions);

    return this.database.ex(
      'all',
      `SELECT ${this.columns} from [screenshots] ORDER BY datestamp`).
      then(this.map);
  }

  // [i] https://stackoverflow.com/questions/49344517/sqlite-compare-dates-without-timestamp
  private async find(filterOptions: FilterOptions = null): Promise<Screenshot[]> {
    let whereClauses = [];

    let args = { }

    if (filterOptions.dateMatching) {
      whereClauses.push('datestamp = @date');
      args['@date'] = this.dateString(filterOptions.dateMatching);
    } 

    if (filterOptions.name) {
      whereClauses.push('name = @name');
      args['@name'] = filterOptions.name;
    }

    if (filterOptions.hash) {
      whereClauses.push('hash = @hash');
      args['@hash'] = filterOptions.hash;
    }

    const whereClause = whereClauses.join(' AND ');

    this.log.trace(`[marine-weather-database] ${whereClause} ${JSON.stringify(filterOptions, null, 2)}`);

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

  private readonly columns: string = 'rowid,timestamp,name,hash,filePath';

  private map(rows: any): Screenshot[] {
    return rows.map(row => {
      return {
        id: row.rowid,
        timestamp: row.timestamp,
        name: row.name,
        hash: row.hash,
        filePath: row.filePath,
      }
    });
  }

  private dateString(date: Date) {              // https://date-fns.org/v2.22.1/docs/format
    return format(date, 'yyyy-MM-dd');          // YYYY-MM-DD
  }

  private dateTimeString(date: Date) {          // https://date-fns.org/v2.22.1/docs/format
    return format(date, "yyyy-MM-dd'T'HH:mm");  // YYYY-MM-DD
  }

  private timeString(date: Date) {              // https://date-fns.org/v2.22.1/docs/format
    return format(date, "HH.mm");               // YYYY-MM-DD
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

  await addColumn(database, 'file'    , 'blob');
  await addColumn(database, 'name'    , 'text');
  await addColumn(database, 'hash'    , 'text');
  await addColumn(database, 'filePath', 'text');
}
