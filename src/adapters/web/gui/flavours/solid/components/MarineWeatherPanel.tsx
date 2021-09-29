import { createSignal, For } from "solid-js";
import { Image } from './Image';

export type Props = {
  onSortChange: (places: string[]) => void;
  names: string[];
}

export const MarineWeatherPanel = ({ onSortChange, names }: Props) => {
  const [places, setPlaces]         = createSignal<string[]>(names);

  const moveToTop = (name: string) => {
    const newValue = places().filter(it => it != name);

    setPlaces([ name, ...newValue ]);

    onSortChange(places());
  }

  const single =(name: string) =>  (
    <div class="row" style="margin-bottom:2px">
      <div class="col">
        <div class="card shadow">
          <div class="card-header">
            <button class="btn btn-light" title="Move to the top" onclick={() => moveToTop(name)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-double-up" viewBox="0 0 16 16">
                <path fill-rule="evenodd" d="M7.646 2.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 3.707 2.354 9.354a.5.5 0 1 1-.708-.708l6-6z"/>
                <path fill-rule="evenodd" d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707l-5.646 5.647a.5.5 0 0 1-.708-.708l6-6z"/>
              </svg>
            </button>
            <strong><a target="_blank" href={`https://www.marineweather.co.nz/forecasts/${name}`}>{name}</a></strong>
          </div>
          <div class="card-body shadow-sm" style="text-align:center">
            <Image width={670} height={537} src={`/marine-weather/${name}`} alt="Marine weather" />
          </div>
        </div>
      </div>
    </div>
  );

  return <>
    <For each={places()} children={single} />
  </>
}