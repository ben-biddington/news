<script>
    import { fade, fly } from 'svelte/transition';

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
</script>

<div id="{id}" class="bs-component">
    <div class="title">{title} {#await load()}<span class="loading" transition:fade>Loading...</span>{/await}</div>
    <ol class="items list-group">
        {#each source as newsItem} <!-- https://svelte.dev/docs#class_name -->
            <li class:deleted={newsItem.deleted} class:new={newsItem.new} class='item list-group-item' id="news-{newsItem.id}" 
                in:fade|local="{{duration:1000}}" out:fade|local="{{duration:0}}">
            <div class="item-body">
                <div class="lead">
                    <a href={newsItem.url} class="title" title="{newsItem.title}">{trim(newsItem.title)}</a>
                    <div class="meta">
                        {#if showAge}
                            <span class="age">{newsItem.ageSince(window.application.now())}</span>
                        {/if}
                        {#if showHost}
                            <span class="host">{newsItem.host}</span>
                        {/if}
                    </div>
                </div>
                <div class="controls">
                    {#if allowBookmark}
                        <a
                            href="javascript:application.bookmarks.add('{newsItem.id}')"
                            class="bookmark btn btn-success">
                            bookmark
                        </a>
                    {/if}

                    {#if allowSnooze}
                        <a
                            href="javascript:application.{useCase}.snooze('{newsItem.id}')"
                            class="snooze btn btn-warning"
                            title="Snooze item with id '{newsItem.id}'">
                            snooze
                        </a>
                    {:else}
                        <a
                            href="javascript:void(0)"
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
                </div>
            </div>
            </li>
        {/each}
    </ol>
</div>