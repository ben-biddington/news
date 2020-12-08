<script>
    import { fade, fly } from 'svelte/transition';
    import List, {Group, Item, Graphic, Meta, Label as ListLabel, Separator, Subheader, Text, PrimaryText, SecondaryText} from '@smui/list';
    import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';

    export let application      = {};
    export let id               = 'unknown';
    export let title            = null;
    export let useCase          = 'default';
    export let allowSnooze      = true;
    export let allowBookmark    = true;
    export let source           = [];
    export let load             = () => Promise.resolve();
    export let showHost         = true;
    export let showAge          = true;
    export let titleLengthLimit = 80;
    export let icon             = null;

    const trim = (text, count) => {
        const ellipsis = text.length > count ? '...' : '';
        return `${text.substring(0, count)}${ellipsis}`;
    }

    const snooze = id => application[useCase].snooze(id);

    const cssClassFor = newsItem => {
      return [
        'item', 
        (newsItem.new ? 'new' : ''),
        (newsItem.deleted ? 'deleted' : ''),
      ].filter(it => it != '').join(' ');
    }
</script>

<style>
  span.age { margin-right: 5em; }
</style>

<DataTable id={id} style="display:flex">
  <Head>
    <Row>
      <Cell colspan="2">
        {#if icon}<img src={icon.url} alt="{icon.alt}" width={icon.width} height={icon.height}/>{/if}{#if title}{title}{/if} {#await load()}<span class="loading" transition:fade>Loading...</span>{/await}
      </Cell>
    </Row>
  </Head>
  <Body class="items">
    {#each source as newsItem, i}
      <Row id="news-{newsItem.id}" class={`item ${newsItem.deleted ? 'deleted': ''}`}>
        <Cell>
            <a href={newsItem.url} class="title text-truncate" style="display:block">{trim(newsItem.title, titleLengthLimit)}</a>

            {#if showAge}
              <span class="age">{newsItem.ageSince(window.application.now())}</span>
            {/if}
            {#if showHost}
              <span class="host">{newsItem.host}</span>
            {/if}
        </Cell>
        <Cell>
          {#if allowBookmark}
              <a
                  href="javascript:application.bookmarks.add('{newsItem.id}')"
                  class="bookmark btn">
                  bookmark
              </a>
          {/if}

          {#if allowSnooze}
            <a
                on:click={() => snooze(newsItem.id)} 
                href={"#"} 
                class="snooze btn"
                title="Snooze item with id '{newsItem.id}'">
                snooze
            </a>
          {/if}

          {#if !newsItem.deleted}      
            <a
                href="javascript:application.{useCase}.delete('{newsItem.id}')"
                class="del btn {newsItem.deleted ? 'disabled' : ''}"
                title={newsItem.deleted ? "Item with id '{newsItem.id}' is already deleted": "Delete item with id '{newsItem.id}'"}>
                delete
            </a>
          {/if}
        </Cell>
      </Row>
    {/each}
  </Body>
</DataTable>