import { For, createEffect, mergeProps } from "solid-js";
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

    const forecastDate = new Date(forecast.date);

    const isToday = isSameDay(forecastDate, props.today);

    console.log('forecast.date == props.today', 'forecast date', forecastDate, 'today', props.today);

    return <>
      <span class={`weather-icon ${isToday ? 'today' : undefined} p-1 border rounded shadow-sm`}>
        <a
          href={props.link}
          role="button" 
          data-toggle="popover"
          data-html="true"  
          data-content={tooltip}
          data-trigger="focus" 
          data-placement="bottom"><span style="display:inline-block">{icon(forecast.condition, 32)}</span></a>
      </span>
    </>
  }

  return <>
    <For each={props.forecasts || []} children={f} />
  </>
}