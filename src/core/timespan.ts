export class Timespan {
  private _timeInMilliseconds: number;

  constructor(timeInMilliseconds) {
    this._timeInMilliseconds = timeInMilliseconds;
  }

  static fromSeconds(value) {
    return new Timespan(value * 1000);
  }

  static fromMinutes(value) {
    return this.fromSeconds(value * 60);
  }

  static fromDays(value) {
    return new Timespan(1000 * 60 * 60 * 24 * value);
  }

  milliseconds() {
    return this._timeInMilliseconds;
  }
}