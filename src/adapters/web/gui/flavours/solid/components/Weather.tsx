import { For, createEffect, mergeProps, createMemo } from "solid-js";
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

  createEffect(() => {
    console.log('Enabling popovers for <', props.forecasts.length, '> forecasts');
    try {
      //@ts-ignore
      $('[data-toggle="popover"]').popover();
    } catch { }
  });

  const todaysForecast = createMemo<WeatherForecast>(() => {
    return props.forecasts.find(it => isSameDay(new Date(it.date), props.today));
  });

  const f = (forecast: WeatherForecast) => {
    // [!] tooltips require string values to work, otherwise you get:
    // 
    //  DataCloneError: The object could not be cloned.
    //
    // The issue is that `data-content` needs to be a string. 
    //
    // We were sending actual nodes:
    //
    //   data-content="[object HTMLParagraphElement],[object HTMLParagraphElement]"
    //
    // where it should be:
    //
    //   data-content="<p><strong>Thursday</strong> 12°C</p><p>A few showers, clearing this morning and becoming fine. Southerlies, dying out in the afternoon.</p>"
    //
    // `renderToString` does not seem to work -- https://www.solidjs.com/docs/1.0.0#rendertostring
    const tooltip = `
      <p><strong>${format(new Date(forecast.date), 'EEEE')}</strong> ${forecast.temperature.high}°C</p><p>${forecast.text}</p>
    `;

    const isToday = isSameDay(new Date(forecast.date), props.today);

    return <>
      <li class={`weather-icon ${isToday ? 'today' : undefined} p-1 border rounded shadow-sm list-group-item`}>
        <a
          href="javascript:void(0)"
          role="button" 
          data-toggle="popover"
          data-html="true"  
          data-content={tooltip}
          data-trigger="focus" 
          data-placement="bottom"><span style="display:inline-block">{icon(forecast.condition, 32)}</span>
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
        <div class="card shadow-sm">
          {icon(todaysForecast()?.condition)}
          <div class="card-body">
            <h5 class="card-title">Today</h5>
            <p class="card-text">{todaysForecast()?.text}</p>
            <a href={props.link} class="card-link" target="_blank">Full forecast</a>
          </div>
        </div>
      </div>
    </div>
  </>
}