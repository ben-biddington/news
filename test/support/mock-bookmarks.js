const expect = require('chai').expect;

class MockBookMarks {
    constructor() {
        this._bookmarks = this._deletes = [];
        this._addCalls = [];
    }

    add(bookmark) {
        this._addCalls.push(bookmark);
        this._bookmarks.push(bookmark);
        return Promise.resolve();
    }

    list() {
        return Promise.resolve(this._bookmarks);
    }

    del(id) {
        this._deletes.push(id);
        return Promise.resolve();
    }

    clear() {
        this._bookmarks = this._deletes = [];
    }

    resetCalls() {
        this._addCalls = [];
    }

    mustHaveBeenAskedToAdd(expected) {
        expect(JSON.stringify(this._bookmarks)).to.contain(JSON.stringify(expected));
    }

    mustHaveBeenAskedToDelete(id) {
        expect(this._bookmarks).to.contain(id);
    }

    mustHaveHadDeleteCalled(id) {
        expect(this._deletes).to.contain(id);
    }

    mustNotHaveBeenAskedToAddAnything() {
        expect(this._addCalls).to.be.empty;
    }
}

module.exports.MockBookMarks = MockBookMarks;