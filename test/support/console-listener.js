const expect = require('chai').expect;

const delay = ms => new Promise(res => setTimeout(res, ms));

// https://github.com/puppeteer/puppeteer/blob/4fdb1e3cab34310b4a1012c3024a94bc422b3b92/src/Events.ts
class ConsoleListener {
    constructor(page) {
        this._consoleErrors = [];
        this._consoleMessages = [];
        this._stopped = false;
        
        page.on('console'  , args => {
            if (!this._stopped) {
                this._consoleMessages.push(args);
            }
        });

        page.on('pageerror', args => {
            if (!this._stopped) {
                this._consoleErrors.push(args);
            }
        });

        page.on('error', args => {
            if (!this._stopped) {
                this._consoleErrors.push(args);
            }
        });
    }

    messageCount() {
        return this._consoleMessages.length;
    }

    messages() {
        return this._consoleMessages;
    }

    stop() { this._stopped = true; }

    async mustHaveNoErrors(opts = {}) {
        this.stop();

        await opts.delay ? delay(opts.delay) : Promise.resolve();

        expect(this._consoleErrors).to.eql([]);
    }
}

module.exports.ConsoleListener = ConsoleListener;