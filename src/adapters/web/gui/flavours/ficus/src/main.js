// https://docs.ficusjs.org/docs/installation/
import {
  // components
  createComponent,
  withStateTransactions,
  withStore,
  withEventBus,
  withStyles,

  // event bus
  createEventBus,
  getEventBus,

  // stores
  createPersist,
  createStore,
  getStore,

  // modules
  use
} from 'ficusjs'

// import { html, renderer } from 'ficusjs'
import { html, renderer } from '@ficusjs/renderers'

createComponent('ficus-application', {
  renderer,
  props: {
    personName: {
      type: String,
      required: false
    }
  },
  state () {
    return {
      greeting: 'Hello'
    }
  },
  render () {
    return html`
      <div id="application">
        Application here
      </div>
    `
  },
  connectedCallback() {
    console.log('connected');
  },
  mounted () {
    console.log('mounted', window.application);
  }
})