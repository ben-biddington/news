<script>
  import Button, {Label, Icon} from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import NewsPanel from './NewsPanel.svelte';
  import TopAppBar, {Row as TopAppBarRow, Section, Title} from '@smui/top-app-bar';
  import List, {Group, Item, Graphic, Meta, Label as ListLabel, Separator, Subheader, Text, PrimaryText, SecondaryText} from '@smui/list';

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
  .flexy {
      width: 100%;
  }

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

<div class="flexy">
  <NewsPanel application={window.application} load={loadLobstersNews} id="lobsters" useCase="lobsters" title="Lobsters" bind:source={lobstersNews} />
  <NewsPanel application={window.application} load={loadHackerNews} id="hackerNews" useCase="hackerNews" title="Hacker news" bind:source={hackerNews} />
  <Group id="bookmarks">
    <Subheader>Bookmarks ({bookmarks.length})</Subheader>
    <List class="items" dense={true}>
      {#await loadBookmarks() then _}
        {#each bookmarks as bookmark, i}
          <Item id="bookmark-{bookmark.id}">
            <div class="text-truncate">
              <a href={bookmark.url} class="title col text-truncate" style="display:inline-block">{bookmark.title}</a>
            </div>
            <Meta>
              <a
                href="javascript:application.bookmarks.del('{bookmark.id}')"
                class="del"
                title="Delete item with id '{bookmark.id}'">
                delete
              </a>
            </Meta>
          </Item>
        {/each}
      {/await}
    </List>
  </Group>
</div>