class MockLobstersUseCase {
    constructor() {
        this._list = [];
        this._listWasCalled = false;
        this._deletedId = null;
    }

    list() {
        console.log('[MockLobstersUseCase] list called');

        this._listWasCalled = true;

        return Promise.resolve(this._list);
    }

    listReturns(what=[]) {
        this._list = what;
    }

    mustHaveHadListCalled() {
        if (false === this._listWasCalled)
            throw new Error("Expected list() to have been called");
    }

    delete(id) {
        console.log(`[MockLobstersUseCase] delete called with id <${id}>`);
        this._deletedId = id;
    }

    mustHaveHadDeleteCalled(expectedId) {
        if (!this._deletedId)
            throw new Error("Expected delete() to have been called");

        if (this._deletedId !== expectedId)
            throw new Error(`Expected delete() to have been called with id <${expectedId}>, but we have <${this._deletedId}>`);
    }

    deleteHasBeenCalled(expectedId) {
        return this._deletedId == expectedId;
    }

    snooze(id) {
        this._snoozed = id;
        return Promise.resolve();
    }

    mustHaveHadSnoozeCalled(expectedId) {
        if (!this._snoozed)
            throw new Error("Expected snooze() to have been called");

        if (this._snoozed !== expectedId)
            throw new Error(`Expected snooze() to have been called with id <${expectedId}>, but we have <${this._snoozed}>`);
    }
}

class MockBookmarkUseCase {
    constructor() {
        this._bookmarks = [];
        this._listWasCalled = false;
        this._deletedBookmarks = [];
    }

    add(bookmark) {
        this._bookmarks.push(bookmark);
    }

    mustHaveHadAddCalled() {
        if (false == this.addHasBeenCalled())
            throw new Error("Expected add() to have been called");
    }
    
    addHasBeenCalled() { return this._bookmarks.length > 0; }

    list() {
        console.log(`[MockBookmarkUseCase] list called returning <${this._bookmarks}>`);
        this._listWasCalled = true;
        return Promise.resolve(this._bookmarks);
    }

    listReturns(bookmarks = []) {
        bookmarks.forEach(bookmark => this._bookmarks.push(bookmark));
    }

    mustHaveHadListCalled() {
        if (false === this.listHasBeenCalled())
            throw new Error("Expected list() to have been called");
    }

    listHasBeenCalled() { return this._listWasCalled; }

    del(id) {
        console.log(`[MockBookmarkUseCase] del called with id <${id}>`);
        this._deletedBookmarks.push(id);
        return Promise.resolve();
    }

    mustHaveHadDeleteCalled(id) {
        if (false === this.hasHadDeleteCalled(id))
            throw new Error(`Expected del() to have been called with id <${id}> but we have these ids <${this._deletedBookmarks}>`);
    }

    hasHadDeleteCalled(id) {
        return this._deletedBookmarks.includes(id);
    }   
}

class MockDeletedItemsUseCase {
    constructor() {
        this._countWasCalled = false;
        this._count = 0;
    }

    count() {
        this._countWasCalled = true;
        return Promise.resolve(this._count);
    }

    mustHaveHadCountCalled() {
        if (false === this._countWasCalled)
            throw new Error("Expected count() to have been called");
    }
}

// [i] Intended to present identical interface to
//
//      src/core/application.js
//
// but not require ports.
//
// The idea here is to maintain strict abstract separation between the UI and the application.
const events  = require('events');
const { MockToggles } = require('../../../test/support/mock-toggles');
const { MockSettings } = require('../../../test/support/mock-settings');

class Application {
    constructor(toggles, settings) {
        this._lobstersUseCase       = new MockLobstersUseCase();
        this._hackerNewsUseseCase   = new MockLobstersUseCase();
        this._events                = new events.EventEmitter();
        this._rnzNewsUseseCase      = new MockLobstersUseCase();
        this.bookmarks              = new MockBookmarkUseCase();
        this.deletedItems           = new MockDeletedItemsUseCase();
        this._now                   = new Date();
        this.toggles                = toggles || new MockToggles();
        this.settings               = settings || new MockSettings();
    }

    pollEvery(milliseconds) { }

    stopPolling() { }

    get lobsters() {
        return this._lobstersUseCase;
    }

    get hackerNews() {
        return this._hackerNewsUseseCase;
    }

    get rnzNews() {
        return this._rnzNewsUseseCase;
    }

    now() { return this._now; }

    nowIs(date) {
        this._now = date;
    }

    useToggles(toggles) {
        this.toggles = toggles;
    }

    onAny(handler)    { this._events.on('*', handler); }
    on(name, handler) { 
        const names = Array.isArray(name) ? name : [ name ];

        names.forEach(n => this._events.on(n, handler)); 
    }

    notify(id, data) {
        console.log(`[application notification] ${id} ${data}`)
        this._events.emit(id, data);
    }

    isToggledOn(toggleName) {
        return this.toggles.get(toggleName);
    }

    setting(name) {
        return this.settings.get(name);
    }
}

module.exports.Application  = Application;
module.exports.NewsItem     = require('../../core/dist/news-item').NewsItem;
module.exports.Bookmark     = require('../../core/dist/bookmark').Bookmark;
module.exports.UIEvents     = require('../../adapters/web/gui/ui-events').UIEvents;
module.exports.MockToggles  = MockToggles;
module.exports.MockSettings = MockSettings;