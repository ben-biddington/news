const { ToggleSource } = require("../../../core/dist/toggle-source");

class QueryStringToggles extends ToggleSource {
  constructor(queryString) {
    super();
    this._parameters = new URLSearchParams(queryString);
  }

  get(name) {
    return ['true', '1', ''].includes(this._parameters.get(name));
  }

  list() {
    return { 
      showDeleted:        { name: 'show-deleted'        , isOn: this.get('show-deleted') },
      showBlocked:        { name: 'show-blocked'        , isOn: this.get('show-blocked') },
      showBookmarks:      { name: 'show-bookmarks'      , isOn: this.get('show-bookmarks') },
      showMarineWeather:  { name: 'show-marine-weather' , isOn: this.get('show-marine-weather') },
      showwindFinder:     { name: 'show-wind-finder'    , isOn: this.get('show-wind-finder') },
      showVideo:          { name: 'show-video'          , isOn: this.get('show-video') },
    }
  }
}

module.exports.QueryStringToggles = QueryStringToggles;