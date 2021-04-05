export interface Log {
  info: (message) => void;
  trace: (message) => void;
}

export class ConsoleLog implements Log {
  _opts: any;

  constructor(opts = {}) {
    this._opts = { allowTrace: false, ...opts };
  };

  info(message) {
    console.log(message);
  }

  trace(message) {
    if (this._opts.allowTrace) {
      console.log(message);
    }
  }
}

export class DevNullLog implements Log {
  info(message) { }
  trace(message) { }
}