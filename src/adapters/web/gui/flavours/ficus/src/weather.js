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
      <table id="weather">
        <tr>
        ${this.props.weather.map(forecast => {
          const title=`${moment(forecast.date).format('dddd')} -- ${forecast.text} -- ${forecast.temperature.high}C`;

          return html`
            <td>
              <span style="display:inline-block; width:32px">${symbol(forecast.condition)}</span>
            </td>
          `
        })}
        </tr>
      </table>
      `
  },
  connectedCallback() {},
  created () {
    console.log('[ficus-weather] Created');
  }
});