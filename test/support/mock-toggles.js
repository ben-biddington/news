class MockToggles {
    constructor(block = _ => {}) {
        this._toggles = [];
        
        block(this);
    }

    returnTrue(name) {
        this._toggles[name] = true;
    }

    get(name) {
        return this._toggles[name] === true;
    }
}

module.exports.MockToggles = MockToggles;