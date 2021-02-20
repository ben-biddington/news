component Main {
  state application : Object = `window.application`
  state toggles     : Object = `window.toggles`
  state baseUrl     : Object = `window.settings.get('baseUrl') || ''`
  /*
  
  const toggles     = window.toggles;
  const baseUrl     = window.settings.get('baseUrl') || '';
  */

  fun render : Html {
    <button>
      "Click ME!"
    </button>
  }
}