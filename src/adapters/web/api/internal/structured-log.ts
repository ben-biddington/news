import { Cloneable } from '../../../../core/cloneable';
import { Stopwatch } from '../../../../core/stopwatch';

export class StructuredLog {
  duration: string = '0ms';
  private path: string;
  private verb: string;
  private headers: object;
  private logs = [];
  private errors = [];
  private statusCode: number;
  private responseHeaders: object[]
  private _trace: boolean;
  private _prefix: string;

  constructor(req, res, opts = { trace: false, prefix: '' }) {
    this.statusCode = res.statusCode;
    this.path = req.path;
    this.verb = req.method;
    this.headers = req.headers;
    this.logs = [];
    this.errors = [];
    this.responseHeaders = res.headers || [];
    this._trace = opts.trace;
    this._prefix = opts.prefix ? `${opts.prefix}` : '';
  }

  static async around(req, res, opts, block: (log: StructuredLog) => void) {
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

      log.statusCode = res.statusCode;
      log.duration = `${stopwatch.elapsed}ms`;

      console.log(JSON.stringify(log, null, 2));
    }
  }

  info(logEntry) {
    if (typeof (logEntry) == 'string') {
      logEntry = new LogEntry(logEntry);
    }

    this.logs.push(this.prefixedWith(logEntry));
  }

  error(e) {
    this.errors.push(
      {
        message: e.toString(),
        stackTrace: e.stack?.split("\n")
      });
  }

  trace(logEntry) {
    if (this._trace) {
      if (typeof (logEntry) == 'string') {
        logEntry = new LogEntry(logEntry);
      }
      this.logs.push(this.prefixedWith(logEntry));
    }
  }

  private prefixedWith(entry) {
    if (this._prefix && this._prefix != '') {
      return {...entry, text: `[${this._prefix}] ${entry.text}`}
    }
  };
}

export class LogEntry {
  timestamp: string;
  text: string;

  constructor(text) {
    this.timestamp = new Date().toUTCString();
    this.text = text;
  }
}