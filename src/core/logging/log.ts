export type Log = {
  info: (message) => void;
  trace: (message) => void;
}

export class ConsoleLog implements Log {
  private opts: { allowTrace: boolean };

  constructor(opts = {}) {
    this.opts = { allowTrace: false, ...opts };
  };

  info(message: string) {
    console.log(message);
  }

  get trace() {
    return (message) => {
      if (this.opts.allowTrace) {
        console.log(message);
      }
    }
  }
}

export class DevNullLog implements Log {
  info(message) { }
  trace(message) { }
}