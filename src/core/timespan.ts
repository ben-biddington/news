export class Timespan {
    private _timeInMilliseconds : number;

    constructor(timeInMilliseconds) {
        this._timeInMilliseconds = timeInMilliseconds;
    }

    static fromSeconds(value) {
        return new Timespan(value * 1000);
    }

    static fromMinutes(value) {
        return this.fromSeconds(value * 60);
    }

    milliseconds() {
        return this._timeInMilliseconds;
    }
}