/**
 * @license Angular v8.0.0-beta.8+48.sha-04b5ea0.with-local-changes
 * (c) 2010-2019 Google LLC. https://angular.io/
 * License: MIT
 */

import { EventEmitter, Injectable, defineInjectable, ɵsetClassMetadata } from '@angular/core';
import { LocationStrategy } from '@angular/common';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A spy for {\@link Location} that allows tests to fire simulated location events.
 *
 * \@publicApi
 */
class SpyLocation {
    constructor() {
        this.urlChanges = [];
        this._history = [new LocationState('', '', null)];
        this._historyIndex = 0;
        /**
         * \@internal
         */
        this._subject = new EventEmitter();
        /**
         * \@internal
         */
        this._baseHref = '';
        /**
         * \@internal
         */
        this._platformStrategy = (/** @type {?} */ (null));
    }
    /**
     * @param {?} url
     * @return {?}
     */
    setInitialPath(url) { this._history[this._historyIndex].path = url; }
    /**
     * @param {?} url
     * @return {?}
     */
    setBaseHref(url) { this._baseHref = url; }
    /**
     * @return {?}
     */
    path() { return this._history[this._historyIndex].path; }
    /**
     * @private
     * @return {?}
     */
    state() { return this._history[this._historyIndex].state; }
    /**
     * @param {?} path
     * @param {?=} query
     * @return {?}
     */
    isCurrentPathEqualTo(path, query = '') {
        /** @type {?} */
        const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        /** @type {?} */
        const currPath = this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();
        return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
    }
    /**
     * @param {?} pathname
     * @return {?}
     */
    simulateUrlPop(pathname) {
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
    }
    /**
     * @param {?} pathname
     * @return {?}
     */
    simulateHashChange(pathname) {
        // Because we don't prevent the native event, the browser will independently update the path
        this.setInitialPath(pathname);
        this.urlChanges.push('hash: ' + pathname);
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
    }
    /**
     * @param {?} url
     * @return {?}
     */
    prepareExternalUrl(url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    }
    /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    go(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        if (this._historyIndex > 0) {
            this._history.splice(this._historyIndex + 1);
        }
        this._history.push(new LocationState(path, query, state));
        this._historyIndex = this._history.length - 1;
        /** @type {?} */
        const locationState = this._history[this._historyIndex - 1];
        if (locationState.path == path && locationState.query == query) {
            return;
        }
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
        this._subject.emit({ 'url': url, 'pop': false });
    }
    /**
     * @param {?} path
     * @param {?=} query
     * @param {?=} state
     * @return {?}
     */
    replaceState(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        /** @type {?} */
        const history = this._history[this._historyIndex];
        if (history.path == path && history.query == query) {
            return;
        }
        history.path = path;
        history.query = query;
        history.state = state;
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push('replace: ' + url);
    }
    /**
     * @return {?}
     */
    forward() {
        if (this._historyIndex < (this._history.length - 1)) {
            this._historyIndex++;
            this._subject.emit({ 'url': this.path(), 'state': this.state(), 'pop': true });
        }
    }
    /**
     * @return {?}
     */
    back() {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            this._subject.emit({ 'url': this.path(), 'state': this.state(), 'pop': true });
        }
    }
    /**
     * @param {?} onNext
     * @param {?=} onThrow
     * @param {?=} onReturn
     * @return {?}
     */
    subscribe(onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    }
    /**
     * @param {?} url
     * @return {?}
     */
    normalize(url) { return (/** @type {?} */ (null)); }
}
SpyLocation.decorators = [
    { type: Injectable },
];
/** @nocollapse */ SpyLocation.ngInjectableDef = defineInjectable({ token: SpyLocation, factory: function SpyLocation_Factory(t) { return new (t || SpyLocation)(); }, providedIn: null });
/*@__PURE__*/ ɵsetClassMetadata(SpyLocation, [{
        type: Injectable
    }], null, null);
class LocationState {
    /**
     * @param {?} path
     * @param {?} query
     * @param {?} state
     */
    constructor(path, query, state) {
        this.path = path;
        this.query = query;
        this.state = state;
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A mock implementation of {\@link LocationStrategy} that allows tests to fire simulated
 * location events.
 *
 * \@publicApi
 */
class MockLocationStrategy extends LocationStrategy {
    constructor() {
        super();
        this.internalBaseHref = '/';
        this.internalPath = '/';
        this.internalTitle = '';
        this.urlChanges = [];
        /**
         * \@internal
         */
        this._subject = new EventEmitter();
    }
    /**
     * @param {?} url
     * @return {?}
     */
    simulatePopState(url) {
        this.internalPath = url;
        this._subject.emit(new _MockPopStateEvent(this.path()));
    }
    /**
     * @param {?=} includeHash
     * @return {?}
     */
    path(includeHash = false) { return this.internalPath; }
    /**
     * @param {?} internal
     * @return {?}
     */
    prepareExternalUrl(internal) {
        if (internal.startsWith('/') && this.internalBaseHref.endsWith('/')) {
            return this.internalBaseHref + internal.substring(1);
        }
        return this.internalBaseHref + internal;
    }
    /**
     * @param {?} ctx
     * @param {?} title
     * @param {?} path
     * @param {?} query
     * @return {?}
     */
    pushState(ctx, title, path, query) {
        this.internalTitle = title;
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        /** @type {?} */
        const externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push(externalUrl);
    }
    /**
     * @param {?} ctx
     * @param {?} title
     * @param {?} path
     * @param {?} query
     * @return {?}
     */
    replaceState(ctx, title, path, query) {
        this.internalTitle = title;
        /** @type {?} */
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.internalPath = url;
        /** @type {?} */
        const externalUrl = this.prepareExternalUrl(url);
        this.urlChanges.push('replace: ' + externalUrl);
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    onPopState(fn) { this._subject.subscribe({ next: fn }); }
    /**
     * @return {?}
     */
    getBaseHref() { return this.internalBaseHref; }
    /**
     * @return {?}
     */
    back() {
        if (this.urlChanges.length > 0) {
            this.urlChanges.pop();
            /** @type {?} */
            const nextUrl = this.urlChanges.length > 0 ? this.urlChanges[this.urlChanges.length - 1] : '';
            this.simulatePopState(nextUrl);
        }
    }
    /**
     * @return {?}
     */
    forward() { throw 'not implemented'; }
}
MockLocationStrategy.decorators = [
    { type: Injectable },
];
/** @nocollapse */
MockLocationStrategy.ctorParameters = () => [];
/** @nocollapse */ MockLocationStrategy.ngInjectableDef = defineInjectable({ token: MockLocationStrategy, factory: function MockLocationStrategy_Factory(t) { return new (t || MockLocationStrategy)(); }, providedIn: null });
/*@__PURE__*/ ɵsetClassMetadata(MockLocationStrategy, [{
        type: Injectable
    }], function () { return []; }, null);
class _MockPopStateEvent {
    /**
     * @param {?} newUrl
     */
    constructor(newUrl) {
        this.newUrl = newUrl;
        this.pop = true;
        this.type = 'popstate';
    }
}

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */

export { SpyLocation, MockLocationStrategy };
//# sourceMappingURL=testing.js.map
