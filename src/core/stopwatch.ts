import { differenceInMilliseconds } from 'date-fns';

export class Stopwatch {
  private started: Date;
  private stopped: Date;

  stop() {
    this.stopped = new Date();
  }

  start() {
    this.started = new Date();
  }

  get elapsed() {
    return differenceInMilliseconds(this.stopped, this.started);
  }
}