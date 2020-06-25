class QueryStringSettings {
    constructor(queryString) {
        this._parameters = new URLSearchParams(queryString.substring(queryString.indexOf('?')));
    }

    get(name, _default = null) {
        return this._parameters.get(name) || _default;
    }
}

module.exports.QueryStringSettings = QueryStringSettings;