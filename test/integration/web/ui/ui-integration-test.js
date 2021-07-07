const expect = require('chai').expect;
const { WebInteractor } = require('../../../../src/adapters/web/web-interactor');
const { ConsoleListener } = require('../../../support/console-listener');
const { MockToggles } = require('../../../dist/test/support/mock-toggles');
const { delay } = require('../../support/support');
const baseUrl = 'http://localhost:8080/home.html';

const toggles = process.env.TOGGLES ? process.env.TOGGLES.split('&') : ['use-svelte-smui', 'use-svelte', 'use-vue', 'use-react'];

const headless = !process.env.NO_HEADLESS;

const describeFeatured = (features = [], name, fn) => {
  features.forEach(feature => {
    describe(`[${feature}] ${name}`, () => fn(feature));
  });
}

// [i] https://stackoverflow.com/questions/50993498/flat-is-not-a-function-whats-wrong
Object.defineProperty(Array.prototype, 'flat', {
  value: function (depth = 1) {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat((Array.isArray(toFlatten) && (depth > 1)) ? toFlatten.flat(depth - 1) : toFlatten);
    }, []);
  }
});

Object.defineProperty(Array.prototype, 'plus', {
  value: function (extra) {
    return [...this, extra];
  }
});

Object.defineProperty(Array.prototype, 'except', {
  value: function (omitted) {
    return this.filter(it => it != omitted);
  }
});

module.exports = {
  expect,
  WebInteractor,
  ConsoleListener,
  MockToggles,
  delay,
  baseUrl,
  toggles,
  headless,
  describeFeatured
}