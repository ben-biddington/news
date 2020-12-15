<script>
    import { fade, fly } from 'svelte/transition';
    import List, {Group, Item, Graphic, Meta, Label as ListLabel, Separator, Subheader, Text, PrimaryText, SecondaryText} from '@smui/list';
    import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';
    import LoadingIcon from './LoadingIcon.svelte';

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
  span.age { margin-left: 5em; margin-right: 3em; }

  a.title { font-size:16px }

  a.icon { color:black; position:relative; bottom:.1em }
</style>

<DataTable id={id} style="display:flex">
  <Head>
    <Row>
      <Cell colspan="3">
        {#if icon}
          <LoadingIcon load={load} icon={icon} delayInMs='1000' />
        {/if}
        {#if title}{title}{/if}
      </Cell>
    </Row>
  </Head>
  <Body class="items">
    {#each source as newsItem, i}
      <Row id="news-{newsItem.id}" class={`item ${newsItem.deleted ? 'deleted': ''}`}>
        <Cell width="25">{i+1}</Cell>
        <Cell>
            <a href={newsItem.url} class="title text-truncate" target="_blank" style="display:block" out:fade|local="{{duration:500}}">{trim(newsItem.title, titleLengthLimit)}</a>
            <span>
              <a href="javascript:application.{useCase}.delete('{newsItem.id}')" title="delete '{newsItem.title}'" class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"></path>
                  <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4L4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"></path>
                </svg>
              </a>
              <a href="javascript:application.bookmarks.add('{newsItem.id}')" title="bookmark '{newsItem.title}'" class="icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" class="bi bi-bookmark-heart-fill" viewBox="0 0 16 16">
                  <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm4 4.41c1.387-1.425 4.854 1.07 0 4.277C3.146 5.48 6.613 2.986 8 4.412z"></path>
                </svg>
              </a>
            </span>
            {#if showAge}
              <span class="age">{newsItem.ageSince(window.application.now())}</span>
            {/if}
            {#if showHost}
              <span class="host">{newsItem.host}</span>
            {/if}
        </Cell>
        <Cell align="right">
          {#if allowBookmark}
              <a
                  href="javascript:application.bookmarks.add('{newsItem.id}')"
                  class="bookmark btn btn-light">
                  bookmark
              </a>
          {/if}

          {#if allowSnooze}
            <a
                on:click={() => snooze(newsItem.id)} 
                href={"#"} 
                class="snooze btn btn-light"
                title="Snooze item with id '{newsItem.id}'">
                snooze
            </a>
          {/if}

          {#if !newsItem.deleted}
            <a
                href="javascript:application.{useCase}.delete('{newsItem.id}')"
                class="del btn btn-light {newsItem.deleted ? 'disabled' : ''}"
                title={newsItem.deleted ? "Item with id '{newsItem.id}' is already deleted": "Delete item with id '{newsItem.id}'"}>
                delete
            </a>
          {/if}
        </Cell>
      </Row>
    {:else}
      <Row>
        <Cell colspan="3">---</Cell>
      </Row>
    {/each}
  </Body>
</DataTable>