import { expect } from 'chai';
import { Application } from '../../src/core/application';
import { Notification } from '../../src/core/notification';

export class MockListener {
  _notifications: Notification[];
  _application: Application;

  constructor(application) {
    this._notifications = [];
    this.use(application);
  }

  clear() {
    this._notifications = [];
  }

  get(notificationType) {
    return this._notifications.filter(it => it.type === notificationType);
  }

  mustHaveAtLeast(expectedNotification, times = 1) {
    const matches = this._notifications.filter(it => JSON.stringify(it) == JSON.stringify(expectedNotification));

    expect(matches.length >= times,
      `Expected\n\n${JSON.stringify(this._notifications, null, 2)}\n\nto contain\n\n${JSON.stringify(expectedNotification, null, 2)}\n\n` +
      `at least ${times} times. ` +
      `Got <${matches.length}>`).to.be.true;
  }

  mustHave(expectedNotification, times = 1) {
    const matches = this._notifications.filter(it => JSON.stringify(it) == JSON.stringify(expectedNotification));

    expect(matches.length === times,
      `Expected\n\n${JSON.stringify(this._notifications, null, 2)}\n\nto contain\n\n${JSON.stringify(expectedNotification, null, 2)}\n\n${times} times. ` +
      `Got <${matches.length}>`).to.be.true;
  }

  mustNotHave(type) {
    const isMissing = false == this._notifications.some(it => it.type == type);

    expect(isMissing, `Expected\n\n${JSON.stringify(this._notifications)}\n\n NOT to contain type <${type}>`).to.be.true;
  }

  mustBeEmpty() {
    expect(this._notifications).to.be.empty;
  }

  use(application) {
    this._application = application;
    this._application.onAny(notification => {
      this._notifications.push(notification);
    });
  }
}