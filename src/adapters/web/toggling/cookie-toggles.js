class CookieToggles {
  constructor(cookie) {
    // "__test=1; _ga=GA1.1.1954298143.1586659473; ajs_user_id=null; ajs_group_id=null;
    const values = cookie.split(';').map(pair => pair.split('='));
      
    this._parameters = {};

    values.forEach(value => {
      this._parameters[value[0]] = value[1] || true;
    });
  }

  get(name) {
    return [ true, 'true', '1', ''].includes(this._parameters[name]);
  }
}

module.exports.CookieToggles = CookieToggles;