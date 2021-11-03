import { createSignal } from "solid-js";
import { Player } from '@clappr/core';

export type Props = {
  beach: Beach;
  getUrl: (name: string) => Promise<string>;
}

export type Beach = {
  name: string;
  id: string;
}

// [i] https://m3u8player.net/, https://d2ce82tpc3p734.cloudfront.net/v1/manifest/b1f4432f8f95be9e629d97baabfed15b8cacd1f8/TVNZ_1/d4a139de-dc20-408b-b78c-bca80bf7e43f/4.m3u8
export const Surf2SurfPanel = ({ beach, getUrl }: Props) => {
  const playerId = `surf2surf-${beach.id}`;
  
  const [playing    , setPlaying]     = createSignal<boolean>(false);
  const [player     , setPlayer]      = createSignal<Player>();
  const [initialised, setInitialised] = createSignal<boolean>(false);
  const [status, setStatus]           = createSignal<string>();

  const onClick = async () => {
    if (!initialised()) {
       // https://github.com/clappr/clappr-core#events
       // https://github.com/clappr/clappr-core#hammer_and_wrench-configuration
      const displayOptions = {
        playInline: true,
        width: 670,
        poster: 'https://www.surf2surf.com/reports/showimage.php?id=167&ts=1635968270',
        playback : {
          controls: true,
          preload: true,
        }
      }

      const eventHandlers = {
        events: { 
          onReady:  () => { setStatus('loading...'); },
          onPause:  () => { player().stop(); },
          onPlay:   () => { setStatus('playing'); },
          onError:  () => { setStatus('error'); },
          onStop:   () => { setStatus('stopped'); setPlaying(false) }
        }
      };

      const opts = {
        source: { source: await getUrl(beach.id), mimeType: 'video/mp4' }, 
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

  return <>
    <div class="row" style="margin-bottom:2px">
      <div class="col">
        <div class="card shadow">
          <div class="card-header">
            <strong>{beach.name}</strong> <span style="color: silver">{status()}</span>
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