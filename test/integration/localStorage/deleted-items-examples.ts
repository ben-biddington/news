import { DevNullLog } from '@test/../src/core/logging/log';
import { expect } from 'chai';
import { addDays } from 'date-fns';
import { DeletedItems, Clock } from "../../../src/adapters/gui/android.js/src/storage/deleted-items"

class MockStorage implements Storage {
  private readonly map: Map<string,string> = new Map();
  
  [name: string]: any;
  length: number;
  clear(): void {
    throw new Error('Method not implemented.');
  }
  
  getItem(key: string): string {
    return this.map[key] || null;
  }

  key(index: number): string {
    throw new Error('Method not implemented.');
  }
  
  removeItem(key: string): void {
    throw new Error('Method not implemented.');
  }

  setItem(key: string, value: string): void {
    this.map[key] = value;
  }
}

class MockClock implements Clock {
  private _now: Date;

  now = () => this._now;
  nowIs = (date: Date) => this._now = date;
}

describe('Deleted items clears old entries', () => {
  it('clears items older than one week each time you add a new entry', () => {
    const today = new Date("16-June-2022");
    const yesterday = addDays(today, -1);
    const twoDaysAgo = addDays(today, -2);
    const sevenDaysAgo = addDays(today, -7);
    const eightDaysAgo = addDays(today, -8);

    const storage = new MockStorage();
    const clock = new MockClock();

    const deletedItems = new DeletedItems(new DevNullLog(), storage, clock);

    clock.nowIs(eightDaysAgo);

    deletedItems.add('A');
    
    clock.nowIs(sevenDaysAgo);

    deletedItems.add('B');

    clock.nowIs(twoDaysAgo);

    deletedItems.add('C');

    clock.nowIs(yesterday);

    deletedItems.add('D');

    expect(deletedItems.items.map(it => it.id)).to.eql(['B', 'C', 'D']);
  });
})