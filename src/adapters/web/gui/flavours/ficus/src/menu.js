import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'

createComponent('ficus-menu', {
  renderer,
  props: {},
  state() {
    return {
      showDeleted       : false,
      showMarineWeather : false
     }
  },
  async created() {
    const toggles = await window.application.toggles.list();

    this.setState(state => {
        return {
        ...state, 
        showDeleted       : toggles.showDeleted,
        showMarineWeather : toggles.showMarineWeather
      };
    });

    window.application.on(
      [ "toggle-saved" ], 
      e => {
        this.setState(state => {
          const key = Object.keys(state).find(k => state[k].name === e.toggle.name);

          state[key] = e.toggle;

          return { ...state };
        });
      }
    );
  },
  render() {
    const cssClasses = this.state.showMarineWeather.isOn ? 'btn btn-light btn-sm active' : 'btn btn-light btn-sm'; 
    
    return html`
      <div id="menu">
        <button aria-pressed=${this.state.showMarineWeather.isOn} data-toggle="button" class=${cssClasses} onclick=${() => this.toggle(this.state.showMarineWeather)}>marine weather</button>
        <div class="dropdown" style="display:none">
          <button class="btn btn-sm btn-light dropdown-toggle" type="button" id="dropdownMenu2" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Options
          </button>
          <div class="dropdown-menu" aria-labelledby="dropdownMenu2">
            <button class="dropdown-item" type="button">Marine weather</button>
          </div>
        </div>
      </div>
      <div style="clear:both"></div>
    `;
  },
  toggle(toggle) {
    return application.toggles.save({ name: toggle.name, isOn: !toggle.isOn });
  }
});