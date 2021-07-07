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
           <div class="card shadow-sm">
           {icon(todaysForecast()?.condition)}
           <div class="card-body">
             <h5 class="card-title">{dayName(new Date(todaysForecast()?.date))}</h5>
             <p class="card-text">{todaysForecast()?.text}</p>
             <a href={props.link} class="card-link" target="_blank">Full forecast</a>
           </div>
         </div>
        } /> 
      </div>
    </div>
  </>
}