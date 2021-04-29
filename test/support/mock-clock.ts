import { Clock } from "../../src/core/ports";

export class MockClock implements Clock {
  private date: Date = new Date();

  now(): Date {
    return this.date;
  }

  nowReturns(date: Date) {
    this.date = date;
  }
}