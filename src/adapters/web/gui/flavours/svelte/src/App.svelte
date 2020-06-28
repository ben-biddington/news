<script>
    import { fade } from 'svelte/transition';
    import NewsPanel from './NewsPanel.svelte';
	  import { afterUpdate } from 'svelte';

	  afterUpdate(() => {
		  window.view.notifyRendering();
    });
    
    //
    // [!] https://svelte.dev/docs#3_$_marks_a_statement_as_reactive
    //
    $: bookmarks = [];
    
    const loadBookmarks = () => window.application.bookmarks.list().then(result => bookmarks = result);

    $: rnzNews = [];

    const loadRnzNews = () => window.application.rnzNews.list().then(result => rnzNews = result);

    $: lobstersNews = [];

    const loadLobstersNews = () => window.application.lobsters.list().then(result => lobstersNews = result);

    $: hackerNews = [];

    const loadHackerNews = () => window.application.hackerNews.list().then(result => hackerNews = result);

    $: deletedItemCount = 0;

    const loadDeletedItemCount = () => window.application.deletedItems.count().then(result => deletedItemCount = result);

    const toggles = applicationCache.toggles;

    application.on(
      [ "lobsters-item-deleted", "lobsters-item-snoozed" ], 
      e => lobstersNews = lobstersNews.filter(it => it.id != e.id));
    
    application.on("lobsters-items-loaded"      , e => lobstersNews = e.items);
    application.on("hacker-news-items-loaded"   , e => hackerNews = e.items);
    application.on("hacker-news-item-deleted"   , e           => hackerNews = hackerNews.filter(it => it.id != e.id));
    application.on("bookmark-added"             , bookmark    => bookmarks  = [...bookmarks, bookmark ]);
    application.on("bookmark-deleted"           , e           => bookmarks  = bookmarks.filter(it => it.id != e.id));
    application.on("rnz-news-item-deleted"      , e           => rnzNews    = rnzNews.filter(it => it.id != e.id));

    application.on(
      [ "rnz-news-item-deleted", "hacker-news-item-deleted", "lobsters-item-deleted" ], 
    _ => deletedItemCount = deletedItemCount + 1);
    
    $: page = 'news';

    const navigate = name => page = name;

    $: currentEvent = null;

    application.onAny(e => {
      currentEvent = e;
    });

    // [i] https://svelte.dev/tutorial/custom-css-transitions
    const pulse = (node, { delay = 0, duration = 400}) => {
      const opacity = +getComputedStyle(node).opacity;

      return {
        delay,
        duration,
        css: t => {
          const multiplier = t <= 0.5 ? 1 : -1;

          if(t == 1)
          {
            currentEvent = null;
          }

          return `opacity: ${t * opacity * multiplier}`
        }
      };
    }
</script>

{#await loadDeletedItemCount()}{/await}

<div id="application">
  <div id="navigation">
    <ul class="items">
      <li class="logo"><img src="https://svelte.dev/svelte-logo-horizontal.svg" alt="Svelte icon" width="90" height="20" style="position:relative; right:10; top:2" /></li>
      <li><a href="#" on:click={() => navigate('news')}>news</a></li>
      <li><a href="#" on:click={() => navigate('weather')}>weather</a></li>
    </ul>
  </div>
  {#if page == 'news'}
    <div class="container-fluid">
      <div class="row justify-content-end">
        <div class="col-12 col-md-8">
          <div id="news" transition:fade>
            <NewsPanel load={loadLobstersNews} id="lobsters" useCase="lobsters" title="Lobsters" bind:source={lobstersNews} />

            {#await loadHackerNews()}{/await}
            <NewsPanel id="hackerNews" useCase="hackerNews" title="Hacker news" bind:source={hackerNews} allowSnooze={false} />

            {#if application.isToggledOn('allow-rnz-news')}
              {#await loadRnzNews()}{/await}
              <NewsPanel id="rnzNews" useCase="rnzNews" title="RNZ news" bind:source={rnzNews} 
                allowSnooze={false} allowBookmark={false} showHost={false} showAge={true} />
            {/if}
          </div>
        </div>
        <div class="col-6 col-md-4">
          <div id="bookmarks">
            <div class="title">Bookmarks ({bookmarks.length})</div>
            <ol class="items">
            {#await loadBookmarks()}{/await}
            {#each bookmarks as bookmark}
              <li class="item" id="bookmark-{bookmark.id}" transition:fade>
                <a href={bookmark.url} class="title">{bookmark.title}</a>
                {#if application.isToggledOn('allow-bookmark-favourites')}
                  {#if bookmark.favourite == true}
                    <a
                      href="#"
                      class="bookmark-favourite-on btn btn-success">
                      <img alt="Favourite bookmark" class="favourite" src="/assets/icons/heart.svg" width="10" height="10" />
                    </a>
                  {:else}
                    <a
                      href="#"
                      class="bookmark-favourite-off btn btn-success">
                      <img alt="Favourite bookmark" class="favourite" src="/assets/icons/heart.svg" width="10" height="10" />
                    </a>
                  {/if}
                {/if}
                <a
                  href="javascript:application.bookmarks.del('{bookmark.id}')"
                  class="del"
                  title="Delete item with id '{bookmark.id}'">
                  delete
                </a>
              </li>
            {/each}
            </ol>
          </div>
        </div>
      </div>
    </div>

    <div id="marine-weather">
      <div class="title">Marine weather</div>
      <div class="body"><img src="/marine-weather" width="670" height="557" /></div>
    </div>
  {/if}
  {#if page == 'weather'}
  <div id="weather" transition:fade>
    <div class="metservice">
      <img src="/wellington-weather/current" width="380" height="514" />
      <img src="/wellington-weather/today" width="776" height="294" />
      <img src="/wellington-weather/week" width="776" height="388" />
    </div>
  </div>
  {/if}
  <div id="deletedItems"><span class=count>{deletedItemCount}</span> deleted items</div>
</div>
