<img src={icon.url} alt={icon.alt} class={disallowAnimation || loaded ? '' : 'loading-icon-title'} width={icon.width} height={icon.height} />

<script>
    import { fade, fly } from 'svelte/transition';
    export let load = () => Promise.resolve();
    export let icon;
    export let delayInMs;
    export let disallowAnimation = false;

    $: loaded = false;

    const loading = () => load().then(() => delay(delayInMs)).then(() => loaded=true);

    const delay = ms => new Promise(res => setTimeout(res, ms));

</script>
<style>

  img.loading-icon-title {
    -webkit-animation: pulse .5s infinite ease-in-out;
    -o-animation: pulse .5s infinite ease-in-out;
    -ms-animation: pulse .5s infinite ease-in-out; 
    -moz-animation: pulse .5s infinite ease-in-out; 
    animation: pulse .5s infinite ease-in-out;
  }

  @-webkit-keyframes pulse {
    0% { opacity: 0.2; }
    50% { opacity: 1; }
    100% { opacity: 0.2; }
  }

  @keyframes pulse {
      0% { opacity: 0.2; }
      50% { opacity: 1; }
      100% { opacity: 0.2; }
  }
</style>

{#await loading()}
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}