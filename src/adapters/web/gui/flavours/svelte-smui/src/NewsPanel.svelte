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
  span.age { margin-right: 5em; }

  a.title { font-size:16px }
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
            <a href={newsItem.url} class="title text-truncate" style="display:block">{trim(newsItem.title, titleLengthLimit)}</a>

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
    {/each}
  </Body>
</DataTable>