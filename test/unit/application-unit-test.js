const expect = require('chai').expect;

const { Application } = require('../../src/core/application');

const { Ports } = require('../../src/core/ports');

const { NewsItem } = require('../../src/core/news-item');

const { MockLobsters } = require('../support/mock-lobsters');

const { MockListener } = require('../support/mock-listener');

const { MockSeive } = require('../support/mock-seive');

const { MockToggles } = require('../support/mock-toggles');

const { MockDeletedItems} = require('../support/mock-deleted-items');

const { MockSettings } = require('../support/mock-settings');

const { MockBookMarks } = require('../support/mock-bookmarks');

const { MockClock } = require('../support/mock-clock');

const { log } = require('../support/mock-log');

const { delay } = require('../integration/support/support');

module.exports.expect = expect;

module.exports.Application = Application;
module.exports.NewsItem = NewsItem;
module.exports.Ports = Ports;
module.exports.MockLobsters = MockLobsters;
module.exports.MockListener = MockListener;
module.exports.MockSeive = MockSeive;
module.exports.MockToggles = MockToggles;
module.exports.MockDeletedItems = MockDeletedItems;
module.exports.MockSettings = MockSettings;
module.exports.MockBookMarks = MockBookMarks;
module.exports.MockClock = MockClock;
module.exports.mockLog = log;
module.exports.delay = delay;