<script>
  import Button, {Label, Icon} from '@smui/button';
  import IconButton from '@smui/icon-button';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';
  import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
  import NewsPanel from './NewsPanel.svelte';

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
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">
<style>
  .flexy {
      margin: 0 auto;
      width: 100%;
  }
</style>

<div class="flexy">
  <NewsPanel application={window.application} load={loadLobstersNews} id="lobsters" useCase="lobsters" title="Lobsters" bind:source={lobstersNews} />
  <NewsPanel application={window.application} load={loadHackerNews} id="hackerNews" useCase="hackerNews" title="Hacker news" bind:source={hackerNews} />
  <DataTable table$aria-label="Bookmarks">
    <Head>
      <Row>
        <Cell colspan="4">Bookmarks ({bookmarks.length})</Cell>
      </Row>
    </Head>
    <Body>
      {#await loadBookmarks() then _}
        {#each bookmarks as bookmark, i}
          <Row id="bookmark-{bookmark.id}">
            <Cell>
              {i+1}
            </Cell>
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