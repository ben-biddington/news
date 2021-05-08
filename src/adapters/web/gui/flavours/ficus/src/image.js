import { createComponent /* https://docs.ficusjs.org/docs/installation/ */ } from 'ficusjs' 
import { html /* [i] https://github.com/WebReflection/uhtml */, renderer } from '@ficusjs/renderers'

createComponent('ficus-img', {
  renderer,
  props: { 
    src: { type: String }, 
    width: { type: Number },
    height: { type: Number },
    alt: { type: String },
    disabled: { type: Boolean }
  },
  state() {
    return {
      loading: false,
      loaded: false
    }
  },
  render() {
    if (false == this.props.disabled) {
      this.load();
    }

    if (this.state.loaded)
      return html `<img width=${this.props.width} height=${this.props.height || this.props.width} src=${this.props.src} alt=${this.props.alt} class="visible" />`

    return html`
      <svg xmlns="http://www.w3.org/2000/svg" width=${this.props.width} height=${this.props.height || this.props.width} fill="silver" class="placeholder bi bi-image" viewBox="0 0 16 16">
        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
      </svg>
    `;
  },
  load() {
    if (false === this.state.loading && this.props.src != null) {
      this.setState(state => ({...state, loading: true }));

      const img = document.createElement("img");

      img.onload = () => {
        this.setState(state => {
          return {...state, loaded: true };
        });
      };
      
      img.src = this.props.src;
    }
  }
});