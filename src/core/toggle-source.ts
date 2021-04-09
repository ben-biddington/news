import { Toggles } from './toggles';

export abstract class ToggleSource {
  abstract list(): Toggles;
  abstract get(name: string): boolean;
}

export class DevNullToggleSource extends ToggleSource {
  get(_: string): boolean { return false; }
  list(): Toggles { return null; }
}