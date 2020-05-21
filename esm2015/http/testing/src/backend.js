/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { HttpEventType } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { TestRequest } from './request';
import * as i0 from "@angular/core";
/**
 * A testing backend for `HttpClient` which both acts as an `HttpBackend`
 * and as the `HttpTestingController`.
 *
 * `HttpClientTestingBackend` works by keeping a list of all open requests.
 * As requests come in, they're added to the list. Users can assert that specific
 * requests were made and then flush them. In the end, a verify() method asserts
 * that no unexpected requests were made.
 *
 *
 */
let HttpClientTestingBackend = /** @class */ (() => {
    class HttpClientTestingBackend {
        constructor() {
            /**
             * List of pending requests which have not yet been expected.
             */
            this.open = [];
        }
        /**
         * Handle an incoming request by queueing it in the list of open requests.
         */
        handle(req) {
            return new Observable((observer) => {
                const testReq = new TestRequest(req, observer);
                this.open.push(testReq);
                observer.next({ type: HttpEventType.Sent });
                return () => {
                    testReq._cancelled = true;
                };
            });
        }
        /**
         * Helper function to search for requests in the list of open requests.
         */
        _match(match) {
            if (typeof match === 'string') {
                return this.open.filter(testReq => testReq.request.urlWithParams === match);
            }
            else if (typeof match === 'function') {
                return this.open.filter(testReq => match(testReq.request));
            }
            else {
                return this.open.filter(testReq => (!match.method || testReq.request.method === match.method.toUpperCase()) &&
                    (!match.url || testReq.request.urlWithParams === match.url));
            }
        }
        /**
         * Search for requests in the list of open requests, and return all that match
         * without asserting anything about the number of matches.
         */
        match(match) {
            const results = this._match(match);
            results.forEach(result => {
                const index = this.open.indexOf(result);
                if (index !== -1) {
                    this.open.splice(index, 1);
                }
            });
            return results;
        }
        /**
         * Expect that a single outstanding request matches the given matcher, and return
         * it.
         *
         * Requests returned through this API will no longer be in the list of open requests,
         * and thus will not match twice.
         */
        expectOne(match, description) {
            description = description || this.descriptionFromMatcher(match);
            const matches = this.match(match);
            if (matches.length > 1) {
                throw new Error(`Expected one matching request for criteria "${description}", found ${matches.length} requests.`);
            }
            if (matches.length === 0) {
                let message = `Expected one matching request for criteria "${description}", found none.`;
                if (this.open.length > 0) {
                    // Show the methods and URLs of open requests in the error, for convenience.
                    const requests = this.open
                        .map(testReq => {
                        const url = testReq.request.urlWithParams;
                        const method = testReq.request.method;
                        return `${method} ${url}`;
                    })
                        .join(', ');
                    message += ` Requests received are: ${requests}.`;
                }
                throw new Error(message);
            }
            return matches[0];
        }
        /**
         * Expect that no outstanding requests match the given matcher, and throw an error
         * if any do.
         */
        expectNone(match, description) {
            description = description || this.descriptionFromMatcher(match);
            const matches = this.match(match);
            if (matches.length > 0) {
                throw new Error(`Expected zero matching requests for criteria "${description}", found ${matches.length}.`);
            }
        }
        /**
         * Validate that there are no outstanding requests.
         */
        verify(opts = {}) {
            let open = this.open;
            // It's possible that some requests may be cancelled, and this is expected.
            // The user can ask to ignore open requests which have been cancelled.
            if (opts.ignoreCancelled) {
                open = open.filter(testReq => !testReq.cancelled);
            }
            if (open.length > 0) {
                // Show the methods and URLs of open requests in the error, for convenience.
                const requests = open.map(testReq => {
                    const url = testReq.request.urlWithParams.split('?')[0];
                    const method = testReq.request.method;
                    return `${method} ${url}`;
                })
                    .join(', ');
                throw new Error(`Expected no open requests, found ${open.length}: ${requests}`);
            }
        }
        descriptionFromMatcher(matcher) {
            if (typeof matcher === 'string') {
                return `Match URL: ${matcher}`;
            }
            else if (typeof matcher === 'object') {
                const method = matcher.method || '(any)';
                const url = matcher.url || '(any)';
                return `Match method: ${method}, URL: ${url}`;
            }
            else {
                return `Match by function: ${matcher.name}`;
            }
        }
    }
    HttpClientTestingBackend.ɵfac = function HttpClientTestingBackend_Factory(t) { return new (t || HttpClientTestingBackend)(); };
    HttpClientTestingBackend.ɵprov = i0.ɵɵdefineInjectable({ token: HttpClientTestingBackend, factory: HttpClientTestingBackend.ɵfac });
    return HttpClientTestingBackend;
})();
export { HttpClientTestingBackend };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(HttpClientTestingBackend, [{
        type: Injectable
    }], null, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFja2VuZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9odHRwL3Rlc3Rpbmcvc3JjL2JhY2tlbmQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUF5QixhQUFhLEVBQWMsTUFBTSxzQkFBc0IsQ0FBQztBQUN4RixPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7QUFHdEM7Ozs7Ozs7Ozs7R0FVRztBQUNIO0lBQUEsTUFDYSx3QkFBd0I7UUFEckM7WUFFRTs7ZUFFRztZQUNLLFNBQUksR0FBa0IsRUFBRSxDQUFDO1NBK0hsQztRQTdIQzs7V0FFRztRQUNILE1BQU0sQ0FBQyxHQUFxQjtZQUMxQixPQUFPLElBQUksVUFBVSxDQUFDLENBQUMsUUFBdUIsRUFBRSxFQUFFO2dCQUNoRCxNQUFNLE9BQU8sR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDLENBQUM7Z0JBQy9DLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUN4QixRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUMsSUFBSSxFQUFFLGFBQWEsQ0FBQyxJQUFJLEVBQW1CLENBQUMsQ0FBQztnQkFDNUQsT0FBTyxHQUFHLEVBQUU7b0JBQ1YsT0FBTyxDQUFDLFVBQVUsR0FBRyxJQUFJLENBQUM7Z0JBQzVCLENBQUMsQ0FBQztZQUNKLENBQUMsQ0FBQyxDQUFDO1FBQ0wsQ0FBQztRQUVEOztXQUVHO1FBQ0ssTUFBTSxDQUFDLEtBQStEO1lBQzVFLElBQUksT0FBTyxLQUFLLEtBQUssUUFBUSxFQUFFO2dCQUM3QixPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMs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LFFBQVEsRUFBRTtnQkFDL0IsT0FBTyxjQUFjLE9BQU8sRUFBRSxDQUFDO2FBQ2hDO2lCQUFNLElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFO2dCQUN0QyxNQUFNLE1BQU0sR0FBRyxPQUFPLENBQUMsTUFBTSxJQUFJLE9BQU8sQ0FBQztnQkFDekMsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsSUFBSSxPQUFPLENBQUM7Z0JBQ25DLE9BQU8saUJBQWlCLE1BQU0sVUFBVSxHQUFHLEVBQUUsQ0FBQzthQUMvQztpQkFBTTtnQkFDTCxPQUFPLHNCQUFzQixPQUFPLENBQUMsSUFBSSxFQUFFLENBQUM7YUFDN0M7UUFDSCxDQUFDOztvR0FsSVUsd0JBQXdCO29FQUF4Qix3QkFBd0IsV0FBeEIsd0JBQXdCO21DQTVCckM7S0ErSkM7U0FuSVksd0JBQXdCO2tEQUF4Qix3QkFBd0I7Y0FEcEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwUmVxdWVzdH0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uL2h0dHAnO1xuaW1wb3J0IHtJbmplY3RhYmxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZSwgT2JzZXJ2ZXJ9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBUZXN0aW5nQ29udHJvbGxlciwgUmVxdWVzdE1hdGNofSBmcm9tICcuL2FwaSc7XG5pbXBvcnQge1Rlc3RSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuXG5cbi8qKlxuICogQSB0ZXN0aW5nIGJhY2tlbmQgZm9yIGBIdHRwQ2xpZW50YCB3aGljaCBib3RoIGFjdHMgYXMgYW4gYEh0dHBCYWNrZW5kYFxuICogYW5kIGFzIHRoZSBgSHR0cFRlc3RpbmdDb250cm9sbGVyYC5cbiAqXG4gKiBgSHR0cENsaWVudFRlc3RpbmdCYWNrZW5kYCB3b3JrcyBieSBrZWVwaW5nIGEgbGlzdCBvZiBhbGwgb3BlbiByZXF1ZXN0cy5cbiAqIEFzIHJlcXVlc3RzIGNvbWUgaW4sIHRoZXkncmUgYWRkZWQgdG8gdGhlIGxpc3QuIFVzZXJzIGNhbiBhc3NlcnQgdGhhdCBzcGVjaWZpY1xuICogcmVxdWVzdHMgd2VyZSBtYWRlIGFuZCB0aGVuIGZsdXNoIHRoZW0uIEluIHRoZSBlbmQsIGEgdmVyaWZ5KCkgbWV0aG9kIGFzc2VydHNcbiAqIHRoYXQgbm8gdW5leHBlY3RlZCByZXF1ZXN0cyB3ZXJlIG1hZGUuXG4gKlxuICpcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBDbGllbnRUZXN0aW5nQmFja2VuZCBpbXBsZW1lbnRzIEh0dHBCYWNrZW5kLCBIdHRwVGVzdGluZ0NvbnRyb2xsZXIge1xuICAvKipcbiAgICogTGlzdCBvZiBwZW5kaW5nIHJlcXVlc3RzIHdoaWNoIGhhdmUgbm90IHlldCBiZWVuIGV4cGVjdGVkLlxuICAgKi9cbiAgcHJpdmF0ZSBvcGVuOiBUZXN0UmVxdWVzdFtdID0gW107XG5cbiAgLyoqXG4gICAqIEhhbmRsZSBhbiBpbmNvbWluZyByZXF1ZXN0IGJ5IHF1ZXVlaW5nIGl0IGluIHRoZSBsaXN0IG9mIG9wZW4gcmVxdWVzdHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIHJldHVybiBuZXcgT2JzZXJ2YWJsZSgob2JzZXJ2ZXI6IE9ic2VydmVyPGFueT4pID0+IHtcbiAgICAgIGNvbnN0IHRlc3RSZXEgPSBuZXcgVGVzdFJlcXVlc3QocmVxLCBvYnNlcnZlcik7XG4gICAgICB0aGlzLm9wZW4ucHVzaCh0ZXN0UmVxKTtcbiAgICAgIG9ic2VydmVyLm5leHQoe3R5cGU6IEh0dHBFdmVudFR5cGUuU2VudH0gYXMgSHR0cEV2ZW50PGFueT4pO1xuICAgICAgcmV0dXJuICgpID0+IHtcbiAgICAgICAgdGVzdFJlcS5fY2FuY2VsbGVkID0gdHJ1ZTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvKipcbiAgICogSGVscGVyIGZ1bmN0aW9uIHRvIHNlYXJjaCBmb3IgcmVxdWVzdHMgaW4gdGhlIGxpc3Qgb2Ygb3BlbiByZXF1ZXN0cy5cbiAgICovXG4gIHByaXZhdGUgX21hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5vcGVuLmZpbHRlcih0ZXN0UmVxID0+IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaCk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgbWF0Y2ggPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKHRlc3RSZXEgPT4gbWF0Y2godGVzdFJlcS5yZXF1ZXN0KSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLm9wZW4uZmlsdGVyKFxuICAgICAgICAgIHRlc3RSZXEgPT4gKCFtYXRjaC5tZXRob2QgfHwgdGVzdFJlcS5yZXF1ZXN0Lm1ldGhvZCA9PT0gbWF0Y2gubWV0aG9kLnRvVXBwZXJDYXNlKCkpICYmXG4gICAgICAgICAgICAgICghbWF0Y2gudXJsIHx8IHRlc3RSZXEucmVxdWVzdC51cmxXaXRoUGFyYW1zID09PSBtYXRjaC51cmwpKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2VhcmNoIGZvciByZXF1ZXN0cyBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLCBhbmQgcmV0dXJuIGFsbCB0aGF0IG1hdGNoXG4gICAqIHdpdGhvdXQgYXNzZXJ0aW5nIGFueXRoaW5nIGFib3V0IHRoZSBudW1iZXIgb2YgbWF0Y2hlcy5cbiAgICovXG4gIG1hdGNoKG1hdGNoOiBzdHJpbmd8UmVxdWVzdE1hdGNofCgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IFRlc3RSZXF1ZXN0W10ge1xuICAgIGNvbnN0IHJlc3VsdHMgPSB0aGlzLl9tYXRjaChtYXRjaCk7XG4gICAgcmVzdWx0cy5mb3JFYWNoKHJlc3VsdCA9PiB7XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMub3Blbi5pbmRleE9mKHJlc3VsdCk7XG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgIHRoaXMub3Blbi5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9XG5cbiAgLyoqXG4gICAqIEV4cGVjdCB0aGF0IGEgc2luZ2xlIG91dHN0YW5kaW5nIHJlcXVlc3QgbWF0Y2hlcyB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHJldHVyblxuICAgKiBpdC5cbiAgICpcbiAgICogUmVxdWVzdHMgcmV0dXJuZWQgdGhyb3VnaCB0aGlzIEFQSSB3aWxsIG5vIGxvbmdlciBiZSBpbiB0aGUgbGlzdCBvZiBvcGVuIHJlcXVlc3RzLFxuICAgKiBhbmQgdGh1cyB3aWxsIG5vdCBtYXRjaCB0d2ljZS5cbiAgICovXG4gIGV4cGVjdE9uZShtYXRjaDogc3RyaW5nfFJlcXVlc3RNYXRjaHwoKHJlcTogSHR0cFJlcXVlc3Q8YW55PikgPT4gYm9vbGVhbiksIGRlc2NyaXB0aW9uPzogc3RyaW5nKTpcbiAgICAgIFRlc3RSZXF1ZXN0IHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgJHtcbiAgICAgICAgICBtYXRjaGVzLmxlbmd0aH0gcmVxdWVzdHMuYCk7XG4gICAgfVxuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgbGV0IG1lc3NhZ2UgPSBgRXhwZWN0ZWQgb25lIG1hdGNoaW5nIHJlcXVlc3QgZm9yIGNyaXRlcmlhIFwiJHtkZXNjcmlwdGlvbn1cIiwgZm91bmQgbm9uZS5gO1xuICAgICAgaWYgKHRoaXMub3Blbi5sZW5ndGggPiAwKSB7XG4gICAgICAgIC8vIFNob3cgdGhlIG1ldGhvZHMgYW5kIFVSTHMgb2Ygb3BlbiByZXF1ZXN0cyBpbiB0aGUgZXJyb3IsIGZvciBjb252ZW5pZW5jZS5cbiAgICAgICAgY29uc3QgcmVxdWVzdHMgPSB0aGlzLm9wZW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLm1hcCh0ZXN0UmVxID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcztcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBgJHttZXRob2R9ICR7dXJsfWA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgICBtZXNzYWdlICs9IGAgUmVxdWVzdHMgcmVjZWl2ZWQgYXJlOiAke3JlcXVlc3RzfS5gO1xuICAgICAgfVxuICAgICAgdGhyb3cgbmV3IEVycm9yKG1lc3NhZ2UpO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlc1swXTtcbiAgfVxuXG4gIC8qKlxuICAgKiBFeHBlY3QgdGhhdCBubyBvdXRzdGFuZGluZyByZXF1ZXN0cyBtYXRjaCB0aGUgZ2l2ZW4gbWF0Y2hlciwgYW5kIHRocm93IGFuIGVycm9yXG4gICAqIGlmIGFueSBkby5cbiAgICovXG4gIGV4cGVjdE5vbmUobWF0Y2g6IHN0cmluZ3xSZXF1ZXN0TWF0Y2h8KChyZXE6IEh0dHBSZXF1ZXN0PGFueT4pID0+IGJvb2xlYW4pLCBkZXNjcmlwdGlvbj86IHN0cmluZyk6XG4gICAgICB2b2lkIHtcbiAgICBkZXNjcmlwdGlvbiA9IGRlc2NyaXB0aW9uIHx8IHRoaXMuZGVzY3JpcHRpb25Gcm9tTWF0Y2hlcihtYXRjaCk7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHRoaXMubWF0Y2gobWF0Y2gpO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA+IDApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgRXhwZWN0ZWQgemVybyBtYXRjaGluZyByZXF1ZXN0cyBmb3IgY3JpdGVyaWEgXCIke2Rlc2NyaXB0aW9ufVwiLCBmb3VuZCAke1xuICAgICAgICAgIG1hdGNoZXMubGVuZ3RofS5gKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogVmFsaWRhdGUgdGhhdCB0aGVyZSBhcmUgbm8gb3V0c3RhbmRpbmcgcmVxdWVzdHMuXG4gICAqL1xuICB2ZXJpZnkob3B0czoge2lnbm9yZUNhbmNlbGxlZD86IGJvb2xlYW59ID0ge30pOiB2b2lkIHtcbiAgICBsZXQgb3BlbiA9IHRoaXMub3BlbjtcbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRoYXQgc29tZSByZXF1ZXN0cyBtYXkgYmUgY2FuY2VsbGVkLCBhbmQgdGhpcyBpcyBleHBlY3RlZC5cbiAgICAvLyBUaGUgdXNlciBjYW4gYXNrIHRvIGlnbm9yZSBvcGVuIHJlcXVlc3RzIHdoaWNoIGhhdmUgYmVlbiBjYW5jZWxsZWQuXG4gICAgaWYgKG9wdHMuaWdub3JlQ2FuY2VsbGVkKSB7XG4gICAgICBvcGVuID0gb3Blbi5maWx0ZXIodGVzdFJlcSA9PiAhdGVzdFJlcS5jYW5jZWxsZWQpO1xuICAgIH1cbiAgICBpZiAob3Blbi5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBTaG93IHRoZSBtZXRob2RzIGFuZCBVUkxzIG9mIG9wZW4gcmVxdWVzdHMgaW4gdGhlIGVycm9yLCBmb3IgY29udmVuaWVuY2UuXG4gICAgICBjb25zdCByZXF1ZXN0cyA9IG9wZW4ubWFwKHRlc3RSZXEgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCB1cmwgPSB0ZXN0UmVxLnJlcXVlc3QudXJsV2l0aFBhcmFtcy5zcGxpdCgnPycpWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBtZXRob2QgPSB0ZXN0UmVxLnJlcXVlc3QubWV0aG9kO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gYCR7bWV0aG9kfSAke3VybH1gO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5qb2luKCcsICcpO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBFeHBlY3RlZCBubyBvcGVuIHJlcXVlc3RzLCBmb3VuZCAke29wZW4ubGVuZ3RofTogJHtyZXF1ZXN0c31gKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGRlc2NyaXB0aW9uRnJvbU1hdGNoZXIobWF0Y2hlcjogc3RyaW5nfFJlcXVlc3RNYXRjaHxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICgocmVxOiBIdHRwUmVxdWVzdDxhbnk+KSA9PiBib29sZWFuKSk6IHN0cmluZyB7XG4gICAgaWYgKHR5cGVvZiBtYXRjaGVyID09PSAnc3RyaW5nJykge1xuICAgICAgcmV0dXJuIGBNYXRjaCBVUkw6ICR7bWF0Y2hlcn1gO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1hdGNoZXIgPT09ICdvYmplY3QnKSB7XG4gICAgICBjb25zdCBtZXRob2QgPSBtYXRjaGVyLm1ldGhvZCB8fCAnKGFueSknO1xuICAgICAgY29uc3QgdXJsID0gbWF0Y2hlci51cmwgfHwgJyhhbnkpJztcbiAgICAgIHJldHVybiBgTWF0Y2ggbWV0aG9kOiAke21ldGhvZH0sIFVSTDogJHt1cmx9YDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGBNYXRjaCBieSBmdW5jdGlvbjogJHttYXRjaGVyLm5hbWV9YDtcbiAgICB9XG4gIH1cbn1cbiJdfQ==