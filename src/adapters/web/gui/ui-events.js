class UIEvents {
    constructor(opts = { }) {
        const events  = require('events');
        this._events = new events.EventEmitter();
        opts = { idlePeriod: 200, ...opts }
        this._idlePeriod = opts.idlePeriod;
        this._lastRender = this.now();
    }

    notifyRendering() {
        this._lastRender = this.now();
        this._events.emit('view-rendered', { time: this._lastRender });
    }

    onRender(handler) {
        this._events.on('view-rendered', handler);
    }

    async waitUntilIdle(opts = { }) {
        opts = { timeout: 500, ...opts };

        const startTime = new Date();
        
        const timedOut = () => new Date() - startTime >= opts.timeout;

        const delay = ms => new Promise(res => setTimeout(res, ms));

        while(false == this.isIdle()) {
            if (timedOut())
                throw new Error(`Timed out after <${opts.timeout}ms>`);

            await delay(10);
        }
    }

    isIdle() {
        return (this.now() - this._lastRender) > this._idlePeriod; 
    }

    now() { return new Date(); }
}

module.exports = { UIEvents }