import { BlockedHosts } from "../../src/core/blocked-hosts";
import { expect } from 'chai';

export class MockBlockedHosts extends BlockedHosts {
  private blockedList: String[] = [];

  add(host: String): Promise<void> {
    this.blockedList.push(host);
    return Promise.resolve();
  }

  remove(host: string): Promise<void> {
    this.blockedList = this.blockedList.filter(it => it != host);
    return Promise.resolve();
  }

  has(host: String): Promise<boolean> {
    return Promise.resolve(this.blockedList.includes(host));
  }

  mustHave(expected: String): void {
    expect(this.blockedList).to.contain(expected);
  }

  mustNotHave(expected: String): void {
    expect(this.blockedList).to.not.contain(expected);
  }
}