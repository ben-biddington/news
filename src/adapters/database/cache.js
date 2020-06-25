const { Database } = require('./internal/database');
const { DevNullLog } = require('../../core/logging/log');

class Cache {
    constructor(fileName, log = new DevNullLog()) {
        this._database = new Database(fileName);
        this._log = log;
        this._tableName = '[cache]';
    }

    async init() {
        await this._database.open();
        await this._database.ex('run', 
            `CREATE TABLE IF NOT EXISTS ${this._tableName} (key text PRIMARY KEY, file blob, durationInMilliseconds int, timestamp date)`);
    }

    async add(key, value, duration) {
        return this._database.ex(
            'run', 
            `REPLACE INTO ${this._tableName} (key, file, durationInMilliseconds, timestamp) VALUES (@key, @file, @durationInMilliseconds, DATETIME('now'))`, 
            {
                '@key'                      : key, 
                '@file'                     : value, 
                '@durationInMilliseconds'  : duration.milliseconds()
            }).then(() => {
                this._log.trace(`The key <${key}> has been set with durationInMilliseconds <${duration.milliseconds()}>`);
            });
    }

    async get(key) {
        return this._database.ex('get', `SELECT file, DATETIME('now') as now, durationInMilliseconds, timestamp from ${this._tableName} WHERE key=?`, key).
            then(row => {
                if (!row)
                    return null;

                const { file, now, durationInMilliseconds, timestamp } = row;

                const moment = require('moment');

                const utcNow = moment(now).utc();
                const utcTimestamp = moment(timestamp).utc();

                const expiryTime = moment(utcTimestamp).add(durationInMilliseconds, 'milliseconds').utc();

                const hasExpired = expiryTime.isSameOrBefore(utcNow);

                this._log.trace(
                    `The key <${key}> has:\n\n`   +
                    `\texpiry: ${expiryTime}\n`   +
                    `\tnow is: ${utcNow}\n\n`       + 
                    `Expired?: <${hasExpired}>`);

                return hasExpired ? null : file;
            });
    }
}

module.exports = { Cache } ;