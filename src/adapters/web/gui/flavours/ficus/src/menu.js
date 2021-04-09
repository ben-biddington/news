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
    return html`
      <div id="menu">
        <a href="javascript:void(0)" onclick=${() => this.toggle(this.state.showMarineWeather)}>marine weather<a/>: <span>${this.state.showMarineWeather.isOn ? 'on': 'off'}</span>
      </div>
      <div style="clear:both"></div>
    `;
  },
  toggle(toggle) {
    return application.toggles.save({ name: toggle.name, isOn: !toggle.isOn });
  }
});