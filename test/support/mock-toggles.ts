import { Toggle } from '../../src/core/toggle';
import { ToggleSource } from '../../src/core/toggle-source';
import { Toggles } from '../../src/core/toggles';

export class MockToggles extends ToggleSource {
  private _toggles: Toggles;
  
  list(): Toggles {
    return this._toggles;
  }

  constructor(arg: ((a: MockToggles) => void) | Toggles = () => {}) {
    super();

    if (typeof arg === 'function'){
      this._toggles = null;
      arg(this);
    } else {
      this._toggles = arg;
    }
  }

  alwaysReturn(toggles: Toggles) {
    this._toggles = toggles;
  }

  get(name): boolean {
    return this._toggles[this.key(name)]?.isOn || false;
  }

  private key(name) {
    if (this._toggles === null)
      return name;

    return Object.keys(this._toggles).find(k => this._toggles[k].name === name) || name;
  }

  save(toggle: Toggle) {

  }
}

module.exports.MockToggles = MockToggles;