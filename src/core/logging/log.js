class ConsoleLog {
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

class DevNullLog {
    log(message) { }
    trace(message) { }
}

module.exports = { ConsoleLog, DevNullLog }