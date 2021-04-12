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
          const tooltip = `
            <p><strong>${moment(forecast.date).format('dddd')}</strong> ${forecast.temperature.high}°C</p>
            <p>
              ${forecast.text}
            </p>
          `;

          return html`
            <td>
              <a 
                href="javascript:void(0)"
                role="button" 
                data-toggle="popover"
                data-html="true"  
                data-content=${tooltip}
                data-trigger="focus" 
                data-placement="bottom">
                <span style="display:inline-block; width:32px">${symbol(forecast.condition)}</span>
              </a>
            </td>
          `
        })}
        </tr>
      </table>
      `
  },
  connectedCallback() {
    
  },
  updated() {
    $(function () {
      const count = $('[data-toggle="popover"]').length 

      console.log(`Enabling popovers on <${count}> elements`);

      $('[data-toggle="popover"]').popover();
    });
  },
  created () {
    
  }
});