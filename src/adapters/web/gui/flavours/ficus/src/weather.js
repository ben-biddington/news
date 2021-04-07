import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'
import { symbol } from './icons';
import moment from 'moment';

createComponent('ficus-weather', {
  renderer,
  props: {
    weather: {
      type: Object,
      default: [],
      required: false,
      observed: true 
    }
  },
  state () {
    return {}
  },
  render() {
    return html`
      <div id="weather">
        ${this.props.weather.map(forecast => {
          return html`
            <div style="float:left; display:inline-block; margin:5" title=${moment(forecast.date).format('dddd') + ' -- ' + forecast.text}>
              <span>${moment(forecast.date).format('ddd')}</span>
              <div style="width:32; height:40;">
                ${symbol(forecast.condition)}
              </div>
              <span title=${'high:' + forecast.temperature.high + ', low: ' + forecast.temperature.low}>${forecast.temperature.high}</span>
            </div>
          `
        })}
        <div style="clear: both;"></div>
      </div>
      `
  },
  connectedCallback() {},
  created () {
    console.log('[ficus-weather] Created');
  }
});