
import { createSignal, mergeProps } from "solid-js";

type Options = { 
  showMarineWeather: boolean,
}

type Props = {
  showMarineWeather: boolean;
  onOptionsChange?: (opts: Options) => void;
}

export const Options = (props: Props) => {
  props = mergeProps(
    { 
      onOptionsChange: () => {},
      showMarineWeather: false, 
    }, 
    props);

  const [show, setShow] = createSignal<boolean>(false);

  const toggleMarineWeather = () => {
    props.onOptionsChange({ showMarineWeather: !props.showMarineWeather });
  }

  const icon = () => {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check2" viewBox="0 0 16 16">
      <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
    </svg>
  }

  const cssClasses = () => props.showMarineWeather ? 'btn btn-sm btn-secondary active' : 'btn btn-sm btn-secondary'

  const menuCssClasses = () => show() ? 'dropdown-menu dropdown-menu-right p-2 show' : 'dropdown-menu dropdown-menu-right p-2';

  return <>
    <div class="btn-group">
      <button type="button" onClick={() => setShow(v => !v)} class="btn btn-secondary dropdown-toggle" data-toggle="dropdown">
        Options
      </button>
      <div class={menuCssClasses()} style="width: 100%;">
        <button onClick={toggleMarineWeather} class={cssClasses()}>{icon()}</button> <span>Marine weather</span>
      </div>
    </div>
  </>
}