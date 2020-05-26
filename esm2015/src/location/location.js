import { __decorate, __metadata } from "tslib";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EventEmitter, Injectable, ɵɵinject } from '@angular/core';
import { LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
import { joinWithSlash, normalizeQueryParams, stripTrailingSlash } from './util';
import * as i0 from "@angular/core";
/**
 * @description
 *
 * A service that applications can use to interact with a browser's URL.
 *
 * Depending on the `LocationStrategy` used, `Location` persists
 * to the URL's path or the URL's hash segment.
 *
 * @usageNotes
 *
 * It's better to use the `Router#navigate` service to trigger route changes. Use
 * `Location` only if you need to interact with or create normalized URLs outside of
 * routing.
 *
 * `Location` is responsible for normalizing the URL against the application's base href.
 * A normalized URL is absolute from the URL host, includes the application's base href, and has no
 * trailing slash:
 * - `/my/app/user/123` is normalized
 * - `my/app/user/123` **is not** normalized
 * - `/my/app/user/123/` **is not** normalized
 *
 * ### Example
 *
 * <code-example path='common/location/ts/path_location_component.ts'
 * region='LocationComponent'></code-example>
 *
 * @publicApi
 */
let Location = /** @class */ (() => {
    var Location_1;
    let Location = Location_1 = class Location {
        constructor(platformStrategy, platformLocation) {
            /** @internal */
            this._subject = new EventEmitter();
            /** @internal */
            this._urlChangeListeners = [];
            this._platformStrategy = platformStrategy;
            const browserBaseHref = this._platformStrategy.getBaseHref();
            this._platformLocation = platformLocation;
            this._baseHref = stripTrailingSlash(_stripIndexHtml(browserBaseHref));
            this._platformStrategy.onPopState((ev) => {
                this._subject.emit({
                    'url': this.path(true),
                    'pop': true,
                    'state': ev.state,
                    'type': ev.type,
                });
            });
        }
        /**
         * Normalizes the URL path for this location.
         *
         * @param includeHash True to include an anchor fragment in the path.
         *
         * @returns The normalized URL path.
         */
        // TODO: vsavkin. Remove the boolean flag and always include hash once the deprecated router is
        // removed.
        path(includeHash = false) {
            return this.normalize(this._platformStrategy.path(includeHash));
        }
        /**
         * Reports the current state of the location history.
         * @returns The current value of the `history.state` object.
         */
        getState() {
            return this._platformLocation.getState();
        }
        /**
         * Normalizes the given path and compares to the current normalized path.
         *
         * @param path The given URL path.
         * @param query Query parameters.
         *
         * @returns True if the given URL path is equal to the current normalized path, false
         * otherwise.
         */
        isCurrentPathEqualTo(path, query = '') {
            return this.path() == this.normalize(path + normalizeQueryParams(query));
        }
        /**
         * Normalizes a URL path by stripping any trailing slashes.
         *
         * @param url String representing a URL.
         *
         * @returns The normalized URL string.
         */
        normalize(url) {
            return Location_1.stripTrailingSlash(_stripBaseHref(this._baseHref, _stripIndexHtml(url)));
        }
        /**
         * Normalizes an external URL path.
         * If the given URL doesn't begin with a leading slash (`'/'`), adds one
         * before normalizing. Adds a hash if `HashLocationStrategy` is
         * in use, or the `APP_BASE_HREF` if the `PathLocationStrategy` is in use.
         *
         * @param url String representing a URL.
         *
         * @returns  A normalized platform-specific URL.
         */
        prepareExternalUrl(url) {
            if (url && url[0] !== '/') {
                url = '/' + url;
            }
            return this._platformStrategy.prepareExternalUrl(url);
        }
        // TODO: rename this method to pushState
        /**
         * Changes the browser's URL to a normalized version of a given URL, and pushes a
         * new item onto the platform's history.
         *
         * @param path  URL path to normalize.
         * @param query Query parameters.
         * @param state Location history state.
         *
         */
        go(path, query = '', state = null) {
            this._platformStrategy.pushState(state, '', path, query);
            this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
        }
        /**
         * Changes the browser's URL to a normalized version of the given URL, and replaces
         * the top item on the platform's history stack.
         *
         * @param path  URL path to normalize.
         * @param query Query parameters.
         * @param state Location history state.
         */
        replaceState(path, query = '', state = null) {
            this._platformStrategy.replaceState(state, '', path, query);
            this._notifyUrlChangeListeners(this.prepareExternalUrl(path + normalizeQueryParams(query)), state);
        }
        /**
         * Navigates forward in the platform's history.
         */
        forward() {
            this._platformStrategy.forward();
        }
        /**
         * Navigates back in the platform's history.
         */
        back() {
            this._platformStrategy.back();
        }
        /**
         * Registers a URL change listener. Use to catch updates performed by the Angular
         * framework that are not detectible through "popstate" or "hashchange" events.
         *
         * @param fn The change handler function, which take a URL and a location history state.
         */
        onUrlChange(fn) {
            this._urlChangeListeners.push(fn);
            this.subscribe(v => {
                this._notifyUrlChangeListeners(v.url, v.state);
            });
        }
        /** @internal */
        _notifyUrlChangeListeners(url = '', state) {
            this._urlChangeListeners.forEach(fn => fn(url, state));
        }
        /**
         * Subscribes to the platform's `popState` events.
         *
         * @param value Event that is triggered when the state history changes.
         * @param exception The exception to throw.
         *
         * @returns Subscribed events.
         */
        subscribe(onNext, onThrow, onReturn) {
            return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
        }
    };
    /**
     * Normalizes URL parameters by prepending with `?` if needed.
     *
     * @param  params String of URL parameters.
     *
     * @returns The normalized URL parameters string.
     */
    Location.normalizeQueryParams = normalizeQueryParams;
    /**
     * Joins two parts of a URL with a slash if needed.
     *
     * @param start  URL string
     * @param end    URL string
     *
     *
     * @returns The joined URL string.
     */
    Location.joinWithSlash = joinWithSlash;
    /**
     * Removes a trailing slash from a URL string if needed.
     * Looks for the first occurrence of either `#`, `?`, or the end of the
     * line as `/` characters and removes the trailing slash if one exists.
     *
     * @param url URL string.
     *
     * @returns The URL string, modified if needed.
     */
    Location.stripTrailingSlash = stripTrailingSlash;
    Location.ɵprov = i0.ɵɵdefineInjectable({ factory: createLocation, token: Location, providedIn: "root" });
    Location = Location_1 = __decorate([
        Injectable({
            providedIn: 'root',
            // See #23917
            useFactory: createLocation,
        }),
        __metadata("design:paramtypes", [LocationStrategy, PlatformLocation])
    ], Location);
    return Location;
})();
export { Location };
export function createLocation() {
    return new Location(ɵɵinject(LocationStrategy), ɵɵinject(PlatformLocation));
}
function _stripBaseHref(baseHref, url) {
    return baseHref && url.startsWith(baseHref) ? url.substring(baseHref.length) : url;
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2xvY2F0aW9uL2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFakUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0scUJBQXFCLENBQUM7QUFDckQsT0FBTyxFQUFDLGFBQWEsRUFBRSxvQkFBb0IsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLFFBQVEsQ0FBQzs7QUFVL0U7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQTJCRztBQU1IOztJQUFBLElBQWEsUUFBUSxnQkFBckIsTUFBYSxRQUFRO1FBWW5CLFlBQVksZ0JBQWtDLEVBQUUsZ0JBQWtDO1lBWGxGLGdCQUFnQjtZQUNoQixhQUFRLEdBQXNCLElBQUksWUFBWSxFQUFFLENBQUM7WUFPakQsZ0JBQWdCO1lBQ2hCLHdCQUFtQixHQUE4QyxFQUFFLENBQUM7WUFHbEUsSUFBSSxDQUFDLGlCQUFpQixHQUFHLGdCQUFnQixDQUFDO1lBQzFDLE1BQU0sZUFBZSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxXQUFXLEVBQUUsQ0FBQztZQUM3RCxJQUFJLENBQUMsaUJBQWlCLEdBQUcsZ0JBQWdCLENBQUM7WUFDMUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxrQkFBa0IsQ0FBQyxlQUFlLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUU7Z0JBQ3ZDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO29CQUNqQixLQUFLLEVBQUUsSUFB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QUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztBQUNyRixDQUFDO0FBRUQsU0FBUyxlQUFlLENBQUMsR0FBVztJQUNsQyxPQUFPLEdBQUcsQ0FBQyxPQUFPLENBQUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdGFibGUsIMm1ybVpbmplY3R9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7TG9jYXRpb25TdHJhdGVneX0gZnJvbSAnLi9sb2NhdGlvbl9zdHJhdGVneSc7XG5pbXBvcnQge1BsYXRmb3JtTG9jYXRpb259IGZyb20gJy4vcGxhdGZvcm1fbG9jYXRpb24nO1xuaW1wb3J0IHtqb2luV2l0aFNsYXNoLCBub3JtYWxpemVRdWVyeVBhcmFtcywgc3RyaXBUcmFpbGluZ1NsYXNofSBmcm9tICcuL3V0aWwnO1xuXG4vKiogQHB1YmxpY0FwaSAqL1xuZXhwb3J0IGludGVyZmFjZSBQb3BTdGF0ZUV2ZW50IHtcbiAgcG9wPzogYm9vbGVhbjtcbiAgc3RhdGU/OiBhbnk7XG4gIHR5cGU/OiBzdHJpbmc7XG4gIHVybD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBIHNlcnZpY2UgdGhhdCBhcHBsaWNhdGlvbnMgY2FuIHVzZSB0byBpbnRlcmFjdCB3aXRoIGEgYnJvd3NlcidzIFVSTC5cbiAqXG4gKiBEZXBlbmRpbmcgb24gdGhlIGBMb2NhdGlvblN0cmF0ZWd5YCB1c2VkLCBgTG9jYXRpb25gIHBlcnNpc3RzXG4gKiB0byB0aGUgVVJMJ3MgcGF0aCBvciB0aGUgVVJMJ3MgaGFzaCBzZWdtZW50LlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogSXQncyBiZXR0ZXIgdG8gdXNlIHRoZSBgUm91dGVyI25hdmlnYXRlYCBzZXJ2aWNlIHRvIHRyaWdnZXIgcm91dGUgY2hhbmdlcy4gVXNlXG4gKiBgTG9jYXRpb25gIG9ubHkgaWYgeW91IG5lZWQgdG8gaW50ZXJhY3Qgd2l0aCBvciBjcmVhdGUgbm9ybWFsaXplZCBVUkxzIG91dHNpZGUgb2ZcbiAqIHJvdXRpbmcuXG4gKlxuICogYExvY2F0aW9uYCBpcyByZXNwb25zaWJsZSBmb3Igbm9ybWFsaXppbmcgdGhlIFVSTCBhZ2FpbnN0IHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZi5cbiAqIEEgbm9ybWFsaXplZCBVUkwgaXMgYWJzb2x1dGUgZnJvbSB0aGUgVVJMIGhvc3QsIGluY2x1ZGVzIHRoZSBhcHBsaWNhdGlvbidzIGJhc2UgaHJlZiwgYW5kIGhhcyBub1xuICogdHJhaWxpbmcgc2xhc2g6XG4gKiAtIGAvbXkvYXBwL3VzZXIvMTIzYCBpcyBub3JtYWxpemVkXG4gKiAtIGBteS9hcHAvdXNlci8xMjNgICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICogLSBgL215L2FwcC91c2VyLzEyMy9gICoqaXMgbm90Kiogbm9ybWFsaXplZFxuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICogPGNvZGUtZXhhbXBsZSBwYXRoPSdjb21tb24vbG9jYXRpb24vdHMvcGF0aF9sb2NhdGlvbl9jb21wb25lbnQudHMnXG4gKiByZWdpb249J0xvY2F0aW9uQ29tcG9uZW50Jz48L2NvZGUtZXhhbXBsZT5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICAvLyBTZWUgIzIzOTE3XG4gIHVzZUZhY3Rvcnk6IGNyZWF0ZUxvY2F0aW9uLFxufSlcbmV4cG9ydCBjbGFzcyBMb2NhdGlvbiB7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlSHJlZjogc3RyaW5nO1xuICAvKiogQGludGVybmFsICovXG4gIF9wbGF0Zm9ybVN0cmF0ZWd5OiBMb2NhdGlvblN0cmF0ZWd5O1xuICAvKiogQGludGVybmFsICovXG4gIF9wbGF0Zm9ybUxvY2F0aW9uOiBQbGF0Zm9ybUxvY2F0aW9uO1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VMaXN0ZW5lcnM6ICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKVtdID0gW107XG5cbiAgY29uc3RydWN0b3IocGxhdGZvcm1TdHJhdGVneTogTG9jYXRpb25TdHJhdGVneSwgcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbikge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kgPSBwbGF0Zm9ybVN0cmF0ZWd5O1xuICAgIGNvbnN0IGJyb3dzZXJCYXNlSHJlZiA9IHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZ2V0QmFzZUhyZWYoKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uID0gcGxhdGZvcm1Mb2NhdGlvbjtcbiAgICB0aGlzLl9iYXNlSHJlZiA9IHN0cmlwVHJhaWxpbmdTbGFzaChfc3RyaXBJbmRleEh0bWwoYnJvd3NlckJhc2VIcmVmKSk7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5vblBvcFN0YXRlKChldikgPT4ge1xuICAgICAgdGhpcy5fc3ViamVjdC5lbWl0KHtcbiAgICAgICAgJ3VybCc6IHRoaXMucGF0aCh0cnVlKSxcbiAgICAgICAgJ3BvcCc6IHRydWUsXG4gICAgICAgICdzdGF0ZSc6IGV2LnN0YXRlLFxuICAgICAgICAndHlwZSc6IGV2LnR5cGUsXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIHRoZSBVUkwgcGF0aCBmb3IgdGhpcyBsb2NhdGlvbi5cbiAgICpcbiAgICogQHBhcmFtIGluY2x1ZGVIYXNoIFRydWUgdG8gaW5jbHVkZSBhbiBhbmNob3IgZnJhZ21lbnQgaW4gdGhlIHBhdGguXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBwYXRoLlxuICAgKi9cbiAgLy8gVE9ETzogdnNhdmtpbi4gUmVtb3ZlIHRoZSBib29sZWFuIGZsYWcgYW5kIGFsd2F5cyBpbmNsdWRlIGhhc2ggb25jZSB0aGUgZGVwcmVjYXRlZCByb3V0ZXIgaXNcbiAgLy8gcmVtb3ZlZC5cbiAgcGF0aChpbmNsdWRlSGFzaDogYm9vbGVhbiA9IGZhbHNlKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5ub3JtYWxpemUodGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wYXRoKGluY2x1ZGVIYXNoKSk7XG4gIH1cblxuICAvKipcbiAgICogUmVwb3J0cyB0aGUgY3VycmVudCBzdGF0ZSBvZiB0aGUgbG9jYXRpb24gaGlzdG9yeS5cbiAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgdmFsdWUgb2YgdGhlIGBoaXN0b3J5LnN0YXRlYCBvYmplY3QuXG4gICAqL1xuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5nZXRTdGF0ZSgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIGdpdmVuIHBhdGggYW5kIGNvbXBhcmVzIHRvIHRoZSBjdXJyZW50IG5vcm1hbGl6ZWQgcGF0aC5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIGdpdmVuIFVSTCBwYXRoLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHJldHVybnMgVHJ1ZSBpZiB0aGUgZ2l2ZW4gVVJMIHBhdGggaXMgZXF1YWwgdG8gdGhlIGN1cnJlbnQgbm9ybWFsaXplZCBwYXRoLCBmYWxzZVxuICAgKiBvdGhlcndpc2UuXG4gICAqL1xuICBpc0N1cnJlbnRQYXRoRXF1YWxUbyhwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJyk6IGJvb2xlYW4ge1xuICAgIHJldHVybiB0aGlzLnBhdGgoKSA9PSB0aGlzLm5vcm1hbGl6ZShwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBOb3JtYWxpemVzIGEgVVJMIHBhdGggYnkgc3RyaXBwaW5nIGFueSB0cmFpbGluZyBzbGFzaGVzLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zIFRoZSBub3JtYWxpemVkIFVSTCBzdHJpbmcuXG4gICAqL1xuICBub3JtYWxpemUodXJsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBMb2NhdGlvbi5zdHJpcFRyYWlsaW5nU2xhc2goX3N0cmlwQmFzZUhyZWYodGhpcy5fYmFzZUhyZWYsIF9zdHJpcEluZGV4SHRtbCh1cmwpKSk7XG4gIH1cblxuICAvKipcbiAgICogTm9ybWFsaXplcyBhbiBleHRlcm5hbCBVUkwgcGF0aC5cbiAgICogSWYgdGhlIGdpdmVuIFVSTCBkb2Vzbid0IGJlZ2luIHdpdGggYSBsZWFkaW5nIHNsYXNoIChgJy8nYCksIGFkZHMgb25lXG4gICAqIGJlZm9yZSBub3JtYWxpemluZy4gQWRkcyBhIGhhc2ggaWYgYEhhc2hMb2NhdGlvblN0cmF0ZWd5YCBpc1xuICAgKiBpbiB1c2UsIG9yIHRoZSBgQVBQX0JBU0VfSFJFRmAgaWYgdGhlIGBQYXRoTG9jYXRpb25TdHJhdGVneWAgaXMgaW4gdXNlLlxuICAgKlxuICAgKiBAcGFyYW0gdXJsIFN0cmluZyByZXByZXNlbnRpbmcgYSBVUkwuXG4gICAqXG4gICAqIEByZXR1cm5zICBBIG5vcm1hbGl6ZWQgcGxhdGZvcm0tc3BlY2lmaWMgVVJMLlxuICAgKi9cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsICYmIHVybFswXSAhPT0gJy8nKSB7XG4gICAgICB1cmwgPSAnLycgKyB1cmw7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9wbGF0Zm9ybVN0cmF0ZWd5LnByZXBhcmVFeHRlcm5hbFVybCh1cmwpO1xuICB9XG5cbiAgLy8gVE9ETzogcmVuYW1lIHRoaXMgbWV0aG9kIHRvIHB1c2hTdGF0ZVxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgYnJvd3NlcidzIFVSTCB0byBhIG5vcm1hbGl6ZWQgdmVyc2lvbiBvZiBhIGdpdmVuIFVSTCwgYW5kIHB1c2hlcyBhXG4gICAqIG5ldyBpdGVtIG9udG8gdGhlIHBsYXRmb3JtJ3MgaGlzdG9yeS5cbiAgICpcbiAgICogQHBhcmFtIHBhdGggIFVSTCBwYXRoIHRvIG5vcm1hbGl6ZS5cbiAgICogQHBhcmFtIHF1ZXJ5IFF1ZXJ5IHBhcmFtZXRlcnMuXG4gICAqIEBwYXJhbSBzdGF0ZSBMb2NhdGlvbiBoaXN0b3J5IHN0YXRlLlxuICAgKlxuICAgKi9cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5wdXNoU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKFxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKSwgc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIENoYW5nZXMgdGhlIGJyb3dzZXIncyBVUkwgdG8gYSBub3JtYWxpemVkIHZlcnNpb24gb2YgdGhlIGdpdmVuIFVSTCwgYW5kIHJlcGxhY2VzXG4gICAqIHRoZSB0b3AgaXRlbSBvbiB0aGUgcGxhdGZvcm0ncyBoaXN0b3J5IHN0YWNrLlxuICAgKlxuICAgKiBAcGFyYW0gcGF0aCAgVVJMIHBhdGggdG8gbm9ybWFsaXplLlxuICAgKiBAcGFyYW0gcXVlcnkgUXVlcnkgcGFyYW1ldGVycy5cbiAgICogQHBhcmFtIHN0YXRlIExvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqL1xuICByZXBsYWNlU3RhdGUocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKTogdm9pZCB7XG4gICAgdGhpcy5fcGxhdGZvcm1TdHJhdGVneS5yZXBsYWNlU3RhdGUoc3RhdGUsICcnLCBwYXRoLCBxdWVyeSk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKFxuICAgICAgICB0aGlzLnByZXBhcmVFeHRlcm5hbFVybChwYXRoICsgbm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnkpKSwgc3RhdGUpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBmb3J3YXJkIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBmb3J3YXJkKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuZm9yd2FyZCgpO1xuICB9XG5cbiAgLyoqXG4gICAqIE5hdmlnYXRlcyBiYWNrIGluIHRoZSBwbGF0Zm9ybSdzIGhpc3RvcnkuXG4gICAqL1xuICBiYWNrKCk6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtU3RyYXRlZ3kuYmFjaygpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlZ2lzdGVycyBhIFVSTCBjaGFuZ2UgbGlzdGVuZXIuIFVzZSB0byBjYXRjaCB1cGRhdGVzIHBlcmZvcm1lZCBieSB0aGUgQW5ndWxhclxuICAgKiBmcmFtZXdvcmsgdGhhdCBhcmUgbm90IGRldGVjdGlibGUgdGhyb3VnaCBcInBvcHN0YXRlXCIgb3IgXCJoYXNoY2hhbmdlXCIgZXZlbnRzLlxuICAgKlxuICAgKiBAcGFyYW0gZm4gVGhlIGNoYW5nZSBoYW5kbGVyIGZ1bmN0aW9uLCB3aGljaCB0YWtlIGEgVVJMIGFuZCBhIGxvY2F0aW9uIGhpc3Rvcnkgc3RhdGUuXG4gICAqL1xuICBvblVybENoYW5nZShmbjogKHVybDogc3RyaW5nLCBzdGF0ZTogdW5rbm93bikgPT4gdm9pZCkge1xuICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5wdXNoKGZuKTtcbiAgICB0aGlzLnN1YnNjcmliZSh2ID0+IHtcbiAgICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh2LnVybCwgdi5zdGF0ZSk7XG4gICAgfSk7XG4gIH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9ub3RpZnlVcmxDaGFuZ2VMaXN0ZW5lcnModXJsOiBzdHJpbmcgPSAnJywgc3RhdGU6IHVua25vd24pIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMuZm9yRWFjaChmbiA9PiBmbih1cmwsIHN0YXRlKSk7XG4gIH1cblxuICAvKipcbiAgICogU3Vic2NyaWJlcyB0byB0aGUgcGxhdGZvcm0ncyBgcG9wU3RhdGVgIGV2ZW50cy5cbiAgICpcbiAgICogQHBhcmFtIHZhbHVlIEV2ZW50IHRoYXQgaXMgdHJpZ2dlcmVkIHdoZW4gdGhlIHN0YXRlIGhpc3RvcnkgY2hhbmdlcy5cbiAgICogQHBhcmFtIGV4Y2VwdGlvbiBUaGUgZXhjZXB0aW9uIHRvIHRocm93LlxuICAgKlxuICAgKiBAcmV0dXJucyBTdWJzY3JpYmVkIGV2ZW50cy5cbiAgICovXG4gIHN1YnNjcmliZShcbiAgICAgIG9uTmV4dDogKHZhbHVlOiBQb3BTdGF0ZUV2ZW50KSA9PiB2b2lkLCBvblRocm93PzogKChleGNlcHRpb246IGFueSkgPT4gdm9pZCl8bnVsbCxcbiAgICAgIG9uUmV0dXJuPzogKCgpID0+IHZvaWQpfG51bGwpOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uVGhyb3csIGNvbXBsZXRlOiBvblJldHVybn0pO1xuICB9XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgVVJMIHBhcmFtZXRlcnMgYnkgcHJlcGVuZGluZyB3aXRoIGA/YCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSAgcGFyYW1zIFN0cmluZyBvZiBVUkwgcGFyYW1ldGVycy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIG5vcm1hbGl6ZWQgVVJMIHBhcmFtZXRlcnMgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBub3JtYWxpemVRdWVyeVBhcmFtczogKHBhcmFtczogc3RyaW5nKSA9PiBzdHJpbmcgPSBub3JtYWxpemVRdWVyeVBhcmFtcztcblxuICAvKipcbiAgICogSm9pbnMgdHdvIHBhcnRzIG9mIGEgVVJMIHdpdGggYSBzbGFzaCBpZiBuZWVkZWQuXG4gICAqXG4gICAqIEBwYXJhbSBzdGFydCAgVVJMIHN0cmluZ1xuICAgKiBAcGFyYW0gZW5kICAgIFVSTCBzdHJpbmdcbiAgICpcbiAgICpcbiAgICogQHJldHVybnMgVGhlIGpvaW5lZCBVUkwgc3RyaW5nLlxuICAgKi9cbiAgcHVibGljIHN0YXRpYyBqb2luV2l0aFNsYXNoOiAoc3RhcnQ6IHN0cmluZywgZW5kOiBzdHJpbmcpID0+IHN0cmluZyA9IGpvaW5XaXRoU2xhc2g7XG5cbiAgLyoqXG4gICAqIFJlbW92ZXMgYSB0cmFpbGluZyBzbGFzaCBmcm9tIGEgVVJMIHN0cmluZyBpZiBuZWVkZWQuXG4gICAqIExvb2tzIGZvciB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBlaXRoZXIgYCNgLCBgP2AsIG9yIHRoZSBlbmQgb2YgdGhlXG4gICAqIGxpbmUgYXMgYC9gIGNoYXJhY3RlcnMgYW5kIHJlbW92ZXMgdGhlIHRyYWlsaW5nIHNsYXNoIGlmIG9uZSBleGlzdHMuXG4gICAqXG4gICAqIEBwYXJhbSB1cmwgVVJMIHN0cmluZy5cbiAgICpcbiAgICogQHJldHVybnMgVGhlIFVSTCBzdHJpbmcsIG1vZGlmaWVkIGlmIG5lZWRlZC5cbiAgICovXG4gIHB1YmxpYyBzdGF0aWMgc3RyaXBUcmFpbGluZ1NsYXNoOiAodXJsOiBzdHJpbmcpID0+IHN0cmluZyA9IHN0cmlwVHJhaWxpbmdTbGFzaDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUxvY2F0aW9uKCkge1xuICByZXR1cm4gbmV3IExvY2F0aW9uKMm1ybVpbmplY3QoTG9jYXRpb25TdHJhdGVneSBhcyBhbnkpLCDJtcm1aW5qZWN0KFBsYXRmb3JtTG9jYXRpb24gYXMgYW55KSk7XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEJhc2VIcmVmKGJhc2VIcmVmOiBzdHJpbmcsIHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIGJhc2VIcmVmICYmIHVybC5zdGFydHNXaXRoKGJhc2VIcmVmKSA/IHVybC5zdWJzdHJpbmcoYmFzZUhyZWYubGVuZ3RoKSA6IHVybDtcbn1cblxuZnVuY3Rpb24gX3N0cmlwSW5kZXhIdG1sKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHVybC5yZXBsYWNlKC9cXC9pbmRleC5odG1sJC8sICcnKTtcbn1cbiJdfQ==