component Main {
  state application : Object = `window.application`
  state toggles     : Object = `window.toggles`
  state baseUrl     : String = `window.settings.get('baseUrl') || ''`

/*
  There is going to be an interop issue here when we need to react to application events.

  For example, in order to bind to a list of news items, how would we connect the javascript data structures? 
*/

  fun connect {
    
    `
    (() => {
      window.application.hackerNews.list()
      application.on("hacker-news-items-loaded", console.log)
    })()
    `
  }

  fun componentDidMount : Promise(Never, Void) {
    connect()
  }

  fun render : Html {
    <button 
      onClick={(event : Html.Event) : String {
        Debug.log(`window.toggles`)
      }}>
      "Click ME!"
    </button>
  }
}