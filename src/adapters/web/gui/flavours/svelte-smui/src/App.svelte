<script>
  import Button, {Label, Icon} from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import NewsPanel from './NewsPanel.svelte';
  import BookmarkPanel from './BookmarkPanel.svelte';
  import TopAppBar, {Row as TopAppBarRow, Section, Title} from '@smui/top-app-bar';
  import List, {Group, Item, Graphic, Meta, Separator, Subheader, Text, PrimaryText, SecondaryText} from '@smui/list';
  
  const application = window.application;
  const toggles     = window.toggles;

  $: bookmarks = [];
    
  const loadBookmarks = () => window.application.bookmarks.list().then(result => bookmarks = result);

  $: lobstersNews = [];

  const loadLobstersNews = () => window.application.lobsters.list().then(result => lobstersNews = result);

  $: hackerNews = [];

  const loadHackerNews = () => window.application.hackerNews.list().then(result => hackerNews = result);

  application.on("bookmark-added"             , bookmark    => bookmarks  = [...bookmarks, bookmark ]);
  application.on("bookmark-deleted"           , e           => bookmarks  = bookmarks.filter(it => it.id != e.id));

  application.on(
      [ "lobsters-item-deleted", "lobsters-item-snoozed" ], 
      e => lobstersNews = lobstersNews.filter(it => it.id != e.id));
    
  application.on("lobsters-items-loaded"      , e => lobstersNews = e.items);

  application.on("hacker-news-items-loaded"   , e => hackerNews = e.items);
  application.on("hacker-news-item-deleted"   , e           => hackerNews = hackerNews.filter(it => it.id != e.id));

  application.on(
      [ "hacker-news-item-deleted", "lobsters-item-deleted" ], 
    _ => deletedItemCount = deletedItemCount + 1);

  $: deletedItemCount = 0;
  const loadDeletedItemCount = () => window.application.deletedItems.count().then(result => deletedItemCount = result);

  $: uiOptions = {
    showWeather: toggles.get('show-weather'),
    showDeleted: toggles.get('show-deleted')
  }
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">
<style>
  .toggle {
    margin-right:5px;
  }
</style>

<nav class="navbar navbar-expand-lg navbar-light">
  <span class="navbar-brand">News</span>
  <div class="custom-control custom-switch toggle">
    <input checked={uiOptions.showWeather} type="checkbox" class="custom-control-input" id="weatherSwitch" on:click={e => { uiOptions.showWeather = uiOptions.showWeather ? false : true; }}>
    <label class="custom-control-label" for="weatherSwitch">Weather</label>
  </div>
  <div class="custom-control custom-switch toggle">
    <input checked={uiOptions.showDeleted} type="checkbox" class="custom-control-input" id="deletedSwitch" on:click={e => { uiOptions.showDeleted = uiOptions.showDeleted ? false : true; }}>
    <label class="custom-control-label" for="deletedSwitch">Show deleted</label>
  </div>
  <ul class="navbar-nav flex-row ml-md-auto d-none d-md-flex">
    <li class="nav-item">
      <a class="nav-link =p1" href="/" target="_blank">
        {#await loadDeletedItemCount() then _}
        <svg width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-trash-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path fill-rule="evenodd" d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0v-7z"/>
        </svg> <span>{deletedItemCount}</span>
        {/await}
      </a>
    </li>
  </ul>
</nav>

<div style="display: flex; margin-bottom:10px; padding-bottom:15px;">
    <!-- Column -->
    <div style="
        flex: 1;
        /* Space between columns */
        margin: 0 8px;

        /* Layout each column */
        display: flex;
        flex-direction: column;
    ">
        <div style="
            /* Take available height */
            flex: 1;
        ">
          <NewsPanel 
            application={window.application} load={loadLobstersNews} 
            id="lobsters" useCase="lobsters" 
            icon={{ url: '/lobsters-favicon.ico', width: 16, height: 16, alt: "Lobsters" }} 
            bind:source={lobstersNews} />
        </div>

    </div>
</div>

<div style="display: flex; margin-bottom:10px; padding-bottom:15px;">
    <!-- Column -->
    <div style="
        flex: 1;
        /* Space between columns */
        margin: 0 8px;

        /* Layout each column */
        display: flex;
        flex-direction: column;
    ">
        <div style="
            /* Take available height */
            flex: 1;
        ">
          <NewsPanel application={window.application} load={loadHackerNews} id="hackerNews" useCase="hackerNews" 
          icon={{ url: '/hacker-news-favicon.ico', width: 16, height: 16, alt: "Hacker news" }}  
          allowSnooze={false} 
          bind:source={hackerNews} />
        </div>
    </div>
</div>

<div id="weather" style="padding:15px; display: {uiOptions.showWeather ? 'block' : 'none'}">
  <img src="/wellington-weather/current" alt="Current weather" style="width:10%; height:auto"/>
  <img src="/wellington-weather/today" alt="Today's weather" style="width:25%; height:auto"/>
  <img src="/wellington-weather/week" alt="This week's weather" style="width:25%; height:auto"/>
  <script src="https://www.windfinder.com/widget/forecast/js/wellington?unit_wave=m&unit_rain=mm&unit_temperature=c&unit_wind=kts&days=4&show_day=0"></script>
</div>

<div id="bookmarks" style="display: flex; margin-bottom:10px; padding-bottom:15px;">
    <!-- Column -->
    <div style="
        flex: 1;
        /* Space between columns */
        margin: 0 8px;

        /* Layout each column */
        display: flex;
        flex-direction: column;
    ">
        <div style="
            /* Take available height */
            flex: 1;
        ">
          <BookmarkPanel source={window.application.bookmarks.list} />
        </div>
    </div>
</div>
