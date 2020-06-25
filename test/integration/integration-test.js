const expect                        = require('chai').expect;
const { WebInteractor }             = require('../../src/adapters/web/web-interactor');
const { ConsoleListener }           = require('../support/console-listener');
const { delay }                     = require('./support/support');
const { ConsoleLog, DevNullLog }    = require('../../src/core/logging/log');

const baseUrl   = 'http://localhost:8080/home.html';
const log       = new ConsoleLog({ allowTrace: process.env.TRACE});

module.exports = { 
    expect,
    WebInteractor,
    ConsoleListener,
    ConsoleLog, 
    DevNullLog,
    delay,
    baseUrl,
    log
}