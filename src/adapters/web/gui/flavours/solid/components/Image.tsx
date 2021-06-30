import { createEffect,  createMemo, createSignal, onMount, Show } from "solid-js";

export type Props = {
  src: string;
  width: number;
  height: number;
  alt: string;
 }

export const Image = (props: Props) => {
  const [loaded, setLoaded] = createSignal<boolean>(false);
  
  const placeholder = <>
    <svg xmlns="http://www.w3.org/2000/svg" width={props.width} height={props.height || props.width} fill="silver" 
      class="placeholder bi bi-image" viewBox="0 0 16 16">
      <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
      <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
    </svg>
    <img width={props.width} src={props.src} onload={() => setLoaded(true)} style={{ display:'none' }} />
  </>

  return <Show 
    when={loaded()}
    fallback={placeholder} 
    children={<img src={props.src} width={props.width} height={props.height} alt={props.alt} class="visible" />} />
}