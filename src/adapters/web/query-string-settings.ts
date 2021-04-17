export class QueryStringSettings {
  private _parameters: any;
  private _extras: any;

  constructor(queryString) {
    // @ts-ignore
    this._parameters = new URLSearchParams(queryString.substring(queryString.indexOf('?')));
    this._extras = [];
  }

  get(name, _default = null) {
    return this._extras[name] || this._parameters.get(name) || _default;
  }

  set(name, value) {
    this._extras[name] = value;
  }
}