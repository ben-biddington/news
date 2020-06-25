import Vue from 'vue'
import App from './App.vue';

// https://vuejs.org/v2/guide/instance.html

new Vue({
  el: 'body',
  data: {},
  //components: {App},   
  render: createElement => createElement(App), /* https://vuejs.org/v2/api/#render, https://vuejs.org/v2/guide/render-function.html#createElement-Arguments */
  created: function () {
    console.log(`[vue] application started`);
  },
  beforeMount: function () {
    console.log(`[vue-beforeMount] application mounting`);
  },
  mounted: function () {
    console.log(`[vue-mounted] application mounted`);
  },
});