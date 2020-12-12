<!-- https://getbootstrap.com/docs/4.2/components/toasts/ -->
<script>
    import { fade, fly } from 'svelte/transition';
    export let application;
    
    $: text     = '';
    $: show     = false;

    const delay = (time) => {
        return new Promise((accept, _) => {
            setTimeout(accept, time);
        });
    }

    application.on(
      [ "lobsters-item-deleted", "hacker-news-item-deleted" ], 
      e => {
        console.log(`[toast] Showing notification`);  
        text = "Item deleted";
        show = true;
        delay(3000).then(close);
      });

    const close = () => {
        show = false;
    }  

</script>

{#if show}
    <div    class="toast" 
            role="alert" 
            style="position: absolute; top: 20; left: 50%; opacity: 90; display: block;" 
            in:fade|local="{{duration:500}}" out:fade|local="{{duration:1000}}">
        <div class="toast-header">
            <!-- <img src="..." class="rounded mr-2" alt="..."> -->
            <strong class="mr-auto"></strong>
            <small>Just now</small>
            <button type="button" on:click={() => close()} class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>  
        <div class="toast-body">
            {text}
        </div>
    </div>
{/if}