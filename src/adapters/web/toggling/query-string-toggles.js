class QueryStringToggles {
    constructor(queryString) {
        this._parameters = new URLSearchParams(queryString);
    }

    get(name) {
        return ['true', '1', ''].includes(this._parameters.get(name));
    }
}

module.exports.QueryStringToggles = QueryStringToggles;