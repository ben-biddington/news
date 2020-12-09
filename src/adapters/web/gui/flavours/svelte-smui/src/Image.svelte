<script>
    export let width  = null;
    export let height = null;
    export let alt;
    export let src;
    export let visible = false;
</script>

{#if visible}
    <img src={src} width={width} height={height} alt={alt} />
{:else}
    <svg xmlns="http://www.w3.org/2000/svg" width={width} height={height} viewBox="0 0 300 150">
        <rect fill="#ddd" width="300" height="150"/>
        <text fill="rgba(0,0,0,0.5)" font-family="sans-serif" font-size="30" 
            dy="10.5" font-weight="bold" x="50%" y="50%" text-anchor="middle">{width}×{height}</text>
    </svg>
{/if}