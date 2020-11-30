<script>
    import { fade, fly } from 'svelte/transition';
    import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';

    export let application      = {};
    export let id               = 'unknown';
    export let title            = 'Default title';
    export let useCase          = 'default';
    export let allowSnooze      = true;
    export let allowBookmark    = true;
    export let source           = [];
    export let load             = () => Promise.resolve();
    export let showHost         = true;
    export let showAge          = true;

    const trim = (text, count) => {
        const ellipsis = text.length > count ? '...' : '';
        return `${text.substring(0, count)}${ellipsis}`;
    }

    const snooze = id => application[useCase].snooze(id);
</script>

<DataTable id="{id}" table$aria-label="Bookmarks">
    <Head>
      <Row>
        <Cell colspan="4">{title} {#await load()}<span class="loading" transition:fade>Loading...</span>{/await}</Cell>
      </Row>
    </Head>
    <Body>
      {#each source as newsItem, i} <!-- https://svelte.dev/docs#class_name -->
        <Row>
          <Cell>
          {i+1}
          </Cell>
          <Cell style="min-width: 75px">
            <a href={newsItem.url} class="title" title="{newsItem.title}">{trim(newsItem.title, 50)}</a>
            <div class="meta">
                {#if showAge}
                    <span class="age">{newsItem.ageSince(window.application.now())}</span>
                {/if}
                {#if showHost}
                    <span class="host">{newsItem.host}</span>
                {/if}
            </div>
          </Cell>
          <Cell>
           {#if allowBookmark}
              <a
                  href="javascript:application.bookmarks.add('{newsItem.id}')"
                  class="bookmark btn btn-success">
                  bookmark
              </a>
            {/if}

            {#if allowSnooze}
                <a
                    on:click={() => snooze(newsItem.id)} 
                    href={"#"} 
                    class="snooze btn btn-warning"
                    title="Snooze item with id '{newsItem.id}'">
                    snooze
                </a>
            {:else}
                <a
                    href={"#"}
                    class="snooze btn btn-warning disabled"
                    title="Snooze not allowed on this item">
                    snooze
                </a>    
            {/if}
                    
            {#if newsItem.deleted == false}
                <a
                    href="javascript:application.{useCase}.delete('{newsItem.id}')"
                    class="del btn btn-danger"
                    title="Delete item with id '{newsItem.id}'">
                    delete
                </a>
            {/if}
          </Cell>
        </Row>
        {/each}
    </Body>
  </DataTable>