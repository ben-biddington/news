import { Database } from './internal/database';
import { DevNullLog, Log } from '../../core/logging/log';
import { format, set, parse, getUnixTime } from 'date-fns'

export type Screenshot = {
  timestamp: Date;
  file: Buffer;
}

export type FilterOptions = {
  dateMatching: Date;
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
      `INSERT INTO [screenshots] (datestamp, timestamp, file) VALUES (@datestamp, @timestamp, @file)`, 
      {
          '@datestamp': this.dateString(screenshot.timestamp),
          '@timestamp': this.dateTimeString(screenshot.timestamp),
          '@file':      screenshot.file,
      });
  }

  async listScreenshots(filterOptions: FilterOptions = null): Promise<Screenshot[]> {
    if (filterOptions)
      return this.find(filterOptions);

    return this.database.ex(
      'all',
      `SELECT timestamp,file from [screenshots] ORDER BY datestamp`).
      then(rows => {
        return rows.map(row => {
          return {
            timestamp: row.timestamp,
            file: row.file 
          }
        })
      });
  }

  // [i] https://stackoverflow.com/questions/49344517/sqlite-compare-dates-without-timestamp
  private async find(filterOptions: FilterOptions = null): Promise<Screenshot[]> {
    const midnight = set(filterOptions.dateMatching, { hours: 0, minutes: 0 });

    console.log(`Filtering to screenshots matching between <${midnight}> and <${filterOptions.dateMatching}>`);

      // await this.database.ex(
      //   'all',
      //   `
      //     SELECT 
      //       strftime('%s', timestamp) as ts, timestamp
      //     FROM 
      //       [screenshots] 
      //     ORDER BY timestamp`).
      //   then(rows => {
      //     return rows.map(row => {
      //       console.log('ts', row.ts, 'timestamp', row.timestamp);
      //     })
      //   });

    return this.database.ex(
      'all',
      `
        SELECT 
          timestamp,file 
        FROM 
          [screenshots] 
        WHERE 
          datestamp = @date
        ORDER BY timestamp`, 
        {
          '@date': this.dateString(filterOptions.dateMatching)
        }
        ).
      then(rows => {
        rows.forEach(row => {
          console.log(new Date(row.timestamp));
        });

        return rows.map(row => {
          return {
            timestamp: row.timestamp,
            file: row.file 
          }
        })
      });
  }

  private dateString(date: Date) {
    return format(date, 'yyyy-MM-dd'); // YYYY-MM-DD
  }

  private dateTimeString(date: Date) {
    return format(date, 'yyyy-MM-ddTHH:mm'); // YYYY-MM-DD
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
