const { MockLobsters } = require("./mock-lobsters");

class MockDeletedItems {
    constructor(block = _ => {}) {
        this._count = 0;
        this._countWasCalled = false;
        block(this);
    }

    count() {
        this._countWasCalled = true;

        return Promise.resolve(this._count);
    }

    countReturns(what) {
        this._count = what;
    }

    mustHaveHadCountCalled() {
        if (false === this._countWasCalled)
            throw new Error("Expected count() to have been called");
    }
}

module.exports.MockDeletedItems = MockDeletedItems;