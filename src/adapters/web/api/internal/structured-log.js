const { Cloneable } = require("../../../../core/dist/cloneable");
const { Stopwatch } = require('../../../../core/dist/stopwatch');

class StructuredLog {
  constructor(req, res, opts = { trace: false, prefix: '' }) {
    this.duration = '0';
    this.path = req.path;
    this.verb = req.method;
    this.headers = req.headers;
    this.logs = [];
    this.errors = [];
    this.statusCode = res.statusCode;
    this.responseHeaders = res.headers || [];
    this._trace = opts.trace;
    this._prefix = opts.prefix ? `${opts.prefix}` : '';
  }

  static async around(req, res, opts, block) {
    const log = new StructuredLog(req, res, opts);
    
    const stopwatch = new Stopwatch();
    stopwatch.start();

    try {
      const result = await block(log);

      await Promise.resolve(result);
    }
    catch (error) {
      log.error(error);
    }
    finally {
      stopwatch.stop();

      log.duration = `${stopwatch.elapsed}ms`;

      console.log(JSON.stringify(log, null, 2));
    }
  }

  info(logEntry) {
    if (typeof (logEntry) == 'string') {
      logEntry = new LogEntry(logEntry);
    }

    this.logs.push(logEntry.prefixedWith(this._prefix));
  }

  error(e) {
    this.errors.push(
      {
        message: e.toString(),
        stackTrace: e.stack.split("\n")
      });
  }

  trace(logEntry) {
    if (this._trace) {
      if (typeof (logEntry) == 'string') {
        logEntry = new LogEntry(logEntry);
      }
      this.logs.push(logEntry.prefixedWith(this._prefix));
    }
  }
}

class LogEntry extends Cloneable {
  constructor(text) {
    super();
    this.timestamp = new Date().toUTCString();
    this.text = text;
  }

  prefixedWith(value) {
    if (value && value != '')
      return this.clone(it => it.text = `[${value}] ${this.text}`)

    return this.clone();
  }
}

module.exports = { LogEntry, StructuredLog }