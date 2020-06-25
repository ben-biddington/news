// puppeteer docs: https://pptr.dev/#?product=Puppeteer&version=v4.0.0&show=api-class-page
class WebInteractor {
    constructor(opts = {}) {
        this._opts = { headless: true, ...opts };
    }

    async page() {
        if (!this._page) {
            const puppeteer = require('puppeteer');

            this._browser = await puppeteer.launch({ headless: this._opts.headless, args: [ '--start-maximized', '--start-fullscreen' ] });
            this._page    = await this._browser.newPage();
        }

        return this._page;
    }

    async close() {
        if (this._browser) {
            await this._page.close();
            await this._browser.close();
        }
    }
}

module.exports.WebInteractor = WebInteractor;