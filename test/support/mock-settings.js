class MockSettings {
    constructor(block = _ => {}) {
        this._settings = [];
        
        block(this);
    }

    return(value) {
        this._settings[name] = value;
    }

    get(name) {
        return this._settings[name];
    }
}

module.exports.MockSettings = MockSettings;