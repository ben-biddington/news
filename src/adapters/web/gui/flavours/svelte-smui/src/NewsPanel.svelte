<script>
    import { fade, fly } from 'svelte/transition';
    import List, {Group, Item, Graphic, Meta, Label as ListLabel, Separator, Subheader, Text, PrimaryText, SecondaryText} from '@smui/list';

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

<Group id={id}>
    <Subheader>{#if icon}<img src={icon.url} alt="{icon.alt}" width={icon.width} height={icon.height}/>{/if}{#if title}{title}{/if} {#await load()}<span class="loading" transition:fade>Loading...</span>{/await}</Subheader>
    <List class="items" dense={false}>
      {#each source as newsItem, i} <!-- https://svelte.dev/docs#class_name -->
        <Item 
          id="news-{newsItem.id}" 
          class={cssClassFor(newsItem)}>
            <Text>
              <PrimaryText>
                <a href={newsItem.url} class="title" title="{newsItem.title}">{trim(newsItem.title, titleLengthLimit)}</a>
              </PrimaryText>
              
              {#if showAge || showHost}
                <SecondaryText>
                  {#if showAge}
                    <span class="age">{newsItem.ageSince(window.application.now())}</span>
                  {/if}
                  {#if showHost}
                    <span class="host">{newsItem.host}</span>
                  {/if}
                </SecondaryText>
              {/if}
            </Text>
            <Meta>
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
            </Meta>
          </Item>
      {/each}
    </List>
  </Group>