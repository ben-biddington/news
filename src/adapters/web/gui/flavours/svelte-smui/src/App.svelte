<script>
  import Button, {Label, Icon} from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import NewsPanel from './NewsPanel.svelte';
  import TopAppBar, {Row as TopAppBarRow, Section, Title} from '@smui/top-app-bar';
  import List, {Group, Item, Graphic, Meta, Separator, Subheader, Text, PrimaryText, SecondaryText} from '@smui/list';
  
  const application = window.application;

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
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">
<style>
  .top-app-bar-container {
    max-width: 100%;
    min-width: 480px;
    overflow: auto;
    display: block;
  }
</style>

{#await loadDeletedItemCount() then _}
   <div class="top-app-bar-container">
    <TopAppBar variant="static" prominent=true dense=true color='primary'>
        <Row>
          <Section>
            <IconButton class="material-icons">menu</IconButton>
            <Title>News</Title>
          </Section>
          <Section align="end" toolbar>
            <IconButton class="material-icons" aria-label="Bookmark this page">delete</IconButton>
            {deletedItemCount} deleted items
          </Section>
        </Row>
    </TopAppBar>
  </div>
{/await}

<div style="display: flex; margin-bottom:10px; padding-bottom:15px; border-bottom: 1px dashed silver">
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
            icon={{ url: 'https://lobste.rs/favicon.ico', width: 16, height: 16, alt: "Lobsters" }} 
            bind:source={lobstersNews} />
        </div>

    </div>
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
          icon={{ url: 'https://news.ycombinator.com/favicon.ico', width: 16, height: 16, alt: "Hacker news" }}  
          bind:source={hackerNews} />
        </div>
    </div>
</div>

<div id="weather" style="padding:15px">
  <img src="/wellington-weather/current" alt="Current weather" style="width:10%; height:auto"/>
  <img src="/wellington-weather/today" alt="Today's weather" style="width:25%; height:auto"/>
  <img src="/wellington-weather/week" alt="This week's weather" style="width:25%; height:auto"/>
</div>

<div id="bookmarks">
  <DataTable class="items">
    <Head>
      <Row>
        <Cell colspan="2">
          Bookmarks ({bookmarks.length})
        </Cell>
      </Row>
    </Head>
    <Body>
      {#await loadBookmarks() then _}
        {#each bookmarks as bookmark, i}
          <Row id="bookmark-{bookmark.id}" class="item">
            <Cell>
              <div class="text-truncate">
                <a href={bookmark.url} class="title col text-truncate" style="display:inline-block">{bookmark.title}</a>
              </div>
            </Cell>
            <Cell>
              <a
                href="javascript:application.bookmarks.del('{bookmark.id}')"
                class="del"
                title="Delete item with id '{bookmark.id}'">
                delete
              </a>
            </Cell>
          </Row>
        {/each}
      {/await}
    </Body>
  </DataTable>
</div>
