const expect = require('chai').expect;

class MockSeive {
    constructor(block = _ => {}) {
        this._seivedItems = null;
        block(this);
    }

    apply(newsItems) {
        this._fullListToSeive = newsItems;
    
        const result = this._seivedItems || this._fullListToSeive.map(it => it.id);

        return Promise.resolve(result);
    }

    alwaysReturn(what) {
        this._seivedItems = what;
    }

    mustHaveHadApplyCalled(expectedList) {
        expect(this._fullListToSeive).to.eql(expectedList)
    }
}

module.exports.MockSeive = MockSeive;