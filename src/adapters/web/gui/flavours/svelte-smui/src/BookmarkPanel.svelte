<script>
    import DataTable, {Head, Body, Row, Cell} from '@smui/data-table';

    export let source = () => Promise.resolve();

    $: bookmarks = [];
    $: open = false;

    const load = () => source().then(result => bookmarks = result);

    const toggle = () => open = open ? false : true;
</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,600,700">
<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto+Mono">
<DataTable class="items">
    <Head>
        <Row>
            <Cell colspan="2">
                <svg on:click={toggle} width="1em" height="1em" viewBox="0 0 16 16" class="bi bi-bookmark-check-fill" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path fill-rule="evenodd" d="M4 0a2 2 0 0 0-2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4zm6.854 5.854a.5.5 0 0 0-.708-.708L7.5 7.793 6.354 6.646a.5.5 0 1 0-.708.708l1.5 1.5a.5.5 0 0 0 .708 0l3-3z"/>
                </svg> ({bookmarks.length})
            </Cell>
        </Row>
    </Head>
    <Body style="display: {open ? 'block' : 'none'};">
        {#await load() then _}
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