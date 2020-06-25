const expect = require('chai').expect;

class MockListener {
    constructor(application) {
        this._notifications = [];
        this._application = application;
        this._application.onAny(notification => {
            this._notifications.push(notification);
        });
    }

    mustHaveAtLeast(expectedNotification, times=1) {
        const matches = this._notifications.filter(it => JSON.stringify(it) == JSON.stringify(expectedNotification));

        expect(matches.length >= times, 
            `Expected\n\n${JSON.stringify(this._notifications)}\n\nto contain\n\n${JSON.stringify(expectedNotification)}\n\n` +
            `at least ${times} times. ` + 
            `Got <${matches.length}>`).to.be.true;
    }

    mustHave(expectedNotification, times=1) {
        const matches = this._notifications.filter(it => JSON.stringify(it) == JSON.stringify(expectedNotification));

        expect(matches.length === times, 
            `Expected\n\n${JSON.stringify(this._notifications)}\n\nto contain\n\n${JSON.stringify(expectedNotification)}\n\n${times} times. ` + 
            `Got <${matches.length}>`).to.be.true;
    }

    mustNotHave(type) {
        const isMissing = false == this._notifications.some(it => it.type == type);

        expect(isMissing, `Expected\n\n${JSON.stringify(this._notifications)}\n\n NOT to contain type <${type}>`).to.be.true;
    }
}

module.exports.MockListener = MockListener;