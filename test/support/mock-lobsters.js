//@todo: rename to `MockNewsSource`
class MockLobsters {
    constructor(block = _ => {}) {
        this._list = [
            {
                title: 'One'
            },
            {
                title: 'Two'
            }
         ];
        this._listWasCalled = false;
        block(this);
    }

    list() {
        this._listWasCalled = true;

        return this._list;
    }

    listReturns(what=[]) {
        this._list = what;
    }

    mustHaveHadListCalled() {
        if (false === this._listWasCalled)
            throw new Error("Expected list() to have been called");
    }

    delete(id) {
        this._deletedArticleId = id;

        return Promise.resolve();
    }

    mustHaveHadDeleteCalled(expectedId) {
        if (this._deletedArticleId !== expectedId)
            throw new Error(`Expected delete() to have been called with <${expectedId}>, but we have value <${this._deletedArticleId}>`);
    }
}

module.exports.MockLobsters = MockLobsters;