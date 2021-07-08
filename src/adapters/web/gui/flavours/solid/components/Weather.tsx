import { For, Show, mergeProps, createMemo, createSignal } from "solid-js";
import { isSameDay } from 'date-fns';
import { WeatherForecast } from "../../../../../../core/weather";
import { icon } from './icons';
import { format } from 'date-fns';

export type Props = {
  forecasts: WeatherForecast[];
  link?: string;
  today: Date;
}

export const Weather = (props: Props) => {
  props = mergeProps({ link: 'javascript:void(0)'}, props);

  const [date, setDate] = createSignal<Date>(new Date(props.today));

  const todaysForecast = createMemo<WeatherForecast>(() => {
    return props.forecasts.find(it => isSameDay(new Date(it.date), date()));
  });

  const dayName = (date: Date) => {
    if (isSameDay(new Date(props.today), date))
      return 'Today';

    return date ? format(date, 'EEEE') : '';
  }

  const thermometerHigh = () => {
    return <>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-thermometer-high" viewBox="0 0 16 16">
        <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V2.5a.5.5 0 0 1 1 0v8.585a1.5 1.5 0 0 1 1 1.415z"/>
        <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
      </svg>
    </>
  }

  const thermometerLow = () => {
    return <>
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-thermometer-low" viewBox="0 0 16 16">
        <path d="M9.5 12.5a1.5 1.5 0 1 1-2-1.415V9.5a.5.5 0 0 1 1 0v1.585a1.5 1.5 0 0 1 1 1.415z"/>
        <path d="M5.5 2.5a2.5 2.5 0 0 1 5 0v7.55a3.5 3.5 0 1 1-5 0V2.5zM8 1a1.5 1.5 0 0 0-1.5 1.5v7.987l-.167.15a2.5 2.5 0 1 0 3.333 0l-.166-.15V2.5A1.5 1.5 0 0 0 8 1z"/>
      </svg>
    </>
  }

  const f = (forecast: WeatherForecast) => {
    const isToday = isSameDay(new Date(forecast.date), date());

    return <>
      <li class={`weather-icon ${isToday ? 'today' : undefined} p-1 border rounded shadow-sm list-group-item`}>
        <a
          href="javascript:void(0)"
          onClick={() => setDate(new Date(forecast.date))}
          role="button"><span style="display:inline-block">{icon(forecast.condition, 32)}</span>
        </a>
      </li>
    </>
  }

  return <>
    <div class="d-flex flex-column align-items-center p-1">
      <div class="p-1 m-2">
        <ul class="list-group list-group-horizontal">
          <For each={props.forecasts || []} children={f} />
        </ul>
      </div>
      
      <div class="w-50">
        <Show when={props.forecasts.length > 0} children={
           <div class="card shadow-sm weather-today">
           {icon(todaysForecast()?.condition)}
           <div class="card-body">
             <h5 class="card-title">{dayName(new Date(todaysForecast()?.date))}</h5>
             <p class="forecast-text card-text">{todaysForecast()?.text}</p>
             <p class="card-text">
              {thermometerHigh()} {todaysForecast().temperature.high}°C {thermometerLow()}{todaysForecast().temperature.low}°C
             </p>
             <p class="card-text">
              <a href={props.link} class="card-link" target="_blank">Full forecast</a>
             </p>
           </div>
         </div>
        } /> 
      </div>
    </div>
  </>
}