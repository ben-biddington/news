import { For } from "solid-js";
import { Image } from './Image';

export const MarineWeatherPanel = () => {
  const single =(name: string) =>  (
    <div class="row" style="margin-bottom:2px">
      <div class="col">
        <div class="card shadow">
          <div class="card-header"><strong><a target="_blank" href={`https://www.marineweather.co.nz/forecasts/${name}`}>{name}</a></strong></div>
          <div class="card-body shadow-sm" style="text-align:center">
            <Image width={670} height={537} src={`/marine-weather/${name}`} alt="Marine weather" />
          </div>
        </div>
      </div>
    </div>
  );

  return <>
    <For each={[ 'wellington', 'titahi-bay', 'paekakariki' ]} children={single} />
  </>
}