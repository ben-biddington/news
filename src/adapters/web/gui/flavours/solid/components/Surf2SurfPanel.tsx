import { createMemo, createResource, createSignal } from "solid-js";
import { Player } from '@clappr/core';

export type Props = {
  beach: Beach;
  getUrl: (name: string) => Promise<string>;
}

export type Beach = {
  name: string;
  id: string;
}

export const Surf2SurfPanel = ({ beach, getUrl }: Props) => {
  const playerId = `surf2surf-${beach.id}`;

  const [url] = createResource(beach.id, getUrl);
  const [playing    , setPlaying]     = createSignal<boolean>(false);
  const [player     , setPlayer]      = createSignal<Player>();
  const [initialised, setInitialised] = createSignal<boolean>(false);
  const [status, setStatus]           = createSignal<string>();
  
  const onClick = () => {
    if (!initialised()) {
       // https://github.com/clappr/clappr-core#events
      const displayOptions = {
        playInline: true,
        width: 670,
        playback : {
          controls: true,
          preload: true,
        }
      }

      const eventHandlers = {
        onReady:  () => setStatus('ready'),
        onPlay:   () => { setStatus('playing'); console.log('playing'); },
        onError:  () => setStatus('error'),
        onStop:   () => setStatus('stopped'), // replace with image
      };

      const opts = {
        source: { source: url(), mimeType: 'video/mp4' }, 
        parentId: `#${playerId}`, 
        ...displayOptions,
        ...eventHandlers,
        // [!] The constant `HlsjsPlayback` resolves to undefined when trying to import it from `@clappr/hlsjs-playback`:
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

  const cssClasses = createMemo(() => playing() ? 'flex-fill btn btn-primary active shadow-sm' : 'flex-fill btn btn-primary shadow-sm');
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
    <div class="row" style="margin-bottom:2px">
      <div class="col">
        <div class="card shadow">
          <div class="card-header">
            <strong>{beach.name}</strong>
          </div>
          <div class="card-body shadow-sm" style="text-align: center">
            {/* 
            
            [i] <video> doesn't know how to play streaming, i.e., m3u8 files.
            
            <video controls crossorigin="anonymous">
              <source src={url()} type="video/mp4" />
            </video>  
            
            */}

            <div id={playerId} style={`text-align: center; width: 670; display:${playing() ? 'block' : 'none'}`}></div> 

            <svg xmlns="http://www.w3.org/2000/svg" width={670} height={360} fill="#1e1e1e" 
              style={`display:${playing() ? 'none' : 'block'}; background-color: black; padding: 75px; cursor: pointer;`}
              onclick={onClick}
              class="bi bi-image" viewBox="0 0 16 16">
              <path d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zM6 5.883a.5.5 0 0 1 .757-.429l3.528 2.117a.5.5 0 0 1 0 .858l-3.528 2.117a.5.5 0 0 1-.757-.43V5.884z"/>
            </svg>
          </div>
          <div class="card-body shadow-sm" style="text-align:center">
            {/* <button type="button" onclick={onClick} class={cssClasses()}>
              {beach.name} <span class={badgeClasses}>{icon()}</span>
            </button> */}
          </div>
        </div>
      </div>
    </div>
  </>
}