import { expect } from 'chai';
import { Application } from '../../src/core/application';
import { Notification } from '../../src/core/notification';
import deepEqual from 'deep-eql';
import { detailedDiff as diff } from 'deep-object-diff';

export class MockListener {
  _notifications: Notification[];
  _application: Application;

  constructor(application) {
    this._notifications = [];
    this.use(application);
  }

  add(notification: Notification) {
    this._notifications.push(notification);
  }

  clear() {
    this._notifications = [];
  }

  get(notificationType) {
    return this._notifications.filter(it => it.type === notificationType);
  }

  mustHaveAtLeast(expectedNotification: Notification, times = 1): void {
    if (Object.keys(expectedNotification).length === 1 && Object.keys(expectedNotification)[0] === 'type')
      {
        const expectedType  = expectedNotification.type;
        const matches       = this._notifications.filter(it => it.type == expectedType);

        expect(matches.length >= times,
          `Expected\n\n${JSON.stringify(this._notifications, null, 2)}\n\nto contain at least <${times}> <${expectedType}> notifications. ` + 
          `Got <${matches.length}>.`).to.be.true;

        return;
      }
    
    const matches = this._notifications.filter(it => JSON.stringify(it) == JSON.stringify(expectedNotification));

    expect(matches.length >= times,
      `Expected\n\n${JSON.stringify(this._notifications, null, 2)}\n\nto contain\n\n${JSON.stringify(expectedNotification, null, 2)}\n\n` +
      `at least ${times} times. ` +
      `Got <${matches.length}>`).to.be.true;
  }

  // https://www.chaijs.com/api/bdd/#method_include
  //
  // When the target is an object, .include asserts that the given object val’s properties are a subset of the target’s properties.
  //
  //    expect({a: 1, b: 2, c: 3}).to.include({a: 1, b: 2});
  //
  // When the target is an object, .include asserts that the given object val’s properties are a subset of the target’s properties.
  //
  //    expect({a: 1, b: 2, c: 3}).to.include({a: 1, b: 2});
  //
  // mustHave(expectedNotification: Notification, times = 1) {
  //   expect(
  //     this._notifications, 
  //     `Expected\n\n${JSON.stringify(this._notifications, null, 2)}\n\nto contain\n\n${JSON.stringify(expectedNotification, null, 2)}`
  //   ).to.deep.include.members([expectedNotification]);
  // }

  mustHave(expectedNotification, times = 1, verbose = false) {
    const notificationsWithSameType = this._notifications.filter(it => {
      return it.type === expectedNotification.type;
    });

    const matches = notificationsWithSameType.filter(it => { 
      if (verbose) {
        const difference = diff(it, expectedNotification);

        if (difference) {
          console.log(JSON.stringify(difference, null, 2));
        }
      }

      return deepEqual(it, expectedNotification);
    });

    expect(matches.length === times,
      `Expected\n\n${JSON.stringify(notificationsWithSameType, null, 2)}\n\nto contain\n\n${JSON.stringify(expectedNotification, null, 2)}\n\n${times} times. ` +
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
    this._application?.onAny(notification => {
      this._notifications.push(notification);
    });
  }
}