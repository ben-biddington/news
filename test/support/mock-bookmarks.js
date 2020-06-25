const expect = require('chai').expect;

class MockBookMarks {
    constructor() {
        this._bookmarks = this._deletes = [];
    }

    add(bookmark) {
        this._bookmarks.push(bookmark);
        return Promise.resolve();
    }

    list() {
        Promise.resolve(this._bookmarks);
    }

    del(id) {
        this._deletes.push(id);
        Promise.resolve();
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
}

module.exports.MockBookMarks = MockBookMarks;