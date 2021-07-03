import { createMemo, createSignal } from 'solid-js';
import { Player, ContainerFactory } from '@clappr/core';

/*

This works:

  <div id="player"></div>
  <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@clappr/player@latest/dist/clappr.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@clappr/hlsjs-playback@latest/dist/hlsjs-playback.min.js"></script>
  <script>
    var player = new Clappr.Player({source: "https://radionz.streamguys1.com/national/national/playlist.m3u8", parentId: "#player", plugins: [HlsjsPlayback]});
  </script>

*/

// [i] https://github.com/clappr/hlsjs-playback
export const Radio = () => {
  const [playing    , setPlaying]     = createSignal<boolean>(false);
  const [player     , setPlayer]      = createSignal<Player>();
  const [initialised, setInitialised] = createSignal<boolean>(false);
  const [status, setStatus]           = createSignal<string>();

  const playerId = 'player';

  const url = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'; //'https://radionz.streamguys1.com/national/national/playlist.m3u8';

  const onClick = () => {
    if (!initialised()) {
      // https://github.com/clappr/clappr-core#events
      const displayOptions = {
        playInline: true,
        height: 0,
        width: 0,
      }

      const eventHandlers = {
        onReady: () => {
          console.log('Ready');
          setStatus('Ready');
        },
        onPlay: () => setStatus('Playing'),
        onError: () => setStatus('Error'),
      };

      const opts = {
        source: "https://radionz.streamguys1.com/national/national/playlist.m3u8", 
        parentId: `#${playerId}`, 
        ...displayOptions,
        ...eventHandlers,
        // [!] The constant `HlsjsPlayback` resolves to undefined when trying to use `@clappr/hlsjs-playback`
        //  
        //      import { HlsjsPlayback } from '@clappr/hlsjs-playback/dist/'
        //
        //     So we rely on ambient import in home.html instead.
        //@ts-ignore
        plugins: [HlsjsPlayback] // [i] You need this in order to play '.m3u8' format.
      };

      setPlayer(new Player(opts));
      setInitialised(true);
    }
    if (setPlaying(s => !s)) {
      player().play();
    } else {
      player().stop();
    }
  };

  const cssClasses = createMemo(() => playing() ? 'btn btn-primary active' : 'btn btn-primary');
  const badgeClasses = createMemo(() => playing() ? 'badge badge-light' : 'badge badge-success');

  const icon = createMemo(() => playing() 
    ? 
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-stop-btn" viewBox="0 0 16 16">
        <path d="M6.5 5A1.5 1.5 0 0 0 5 6.5v3A1.5 1.5 0 0 0 6.5 11h3A1.5 1.5 0 0 0 11 9.5v-3A1.5 1.5 0 0 0 9.5 5h-3z"/>
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
      </svg>
    </>
    : 
    <>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16">
        <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814l-3.5-2.5z"/>
        <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4z"/>
      </svg>
    </> 
  );

  return <>
    <div id={playerId} style="display:none"></div>

    <button type="button" onclick={onClick} class={cssClasses()}>
      radio new zealand <span class={badgeClasses}>{icon()}</span>
    </button>

    <span>{status()}</span>
  </>
}