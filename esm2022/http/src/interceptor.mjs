/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformServer } from '@angular/common';
import { EnvironmentInjector, inject, Injectable, InjectionToken, PLATFORM_ID, runInInjectionContext, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵInitialRenderPendingTasks as InitialRenderPendingTasks } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { HttpBackend, HttpHandler } from './backend';
import { FetchBackend } from './fetch';
import * as i0 from "@angular/core";
import * as i1 from "./backend";
function interceptorChainEndFn(req, finalHandlerFn) {
    return finalHandlerFn(req);
}
/**
 * Constructs a `ChainedInterceptorFn` which adapts a legacy `HttpInterceptor` to the
 * `ChainedInterceptorFn` interface.
 */
function adaptLegacyInterceptorToChain(chainTailFn, interceptor) {
    return (initialRequest, finalHandlerFn) => interceptor.intercept(initialRequest, {
        handle: (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn),
    });
}
/**
 * Constructs a `ChainedInterceptorFn` which wraps and invokes a functional interceptor in the given
 * injector.
 */
function chainedInterceptorFn(chainTailFn, interceptorFn, injector) {
    // clang-format off
    return (initialRequest, finalHandlerFn) => runInInjectionContext(injector, () => interceptorFn(initialRequest, downstreamRequest => chainTailFn(downstreamRequest, finalHandlerFn)));
    // clang-format on
}
/**
 * A multi-provider token that represents the array of registered
 * `HttpInterceptor` objects.
 *
 * @publicApi
 */
export const HTTP_INTERCEPTORS = new InjectionToken(ngDevMode ? 'HTTP_INTERCEPTORS' : '');
/**
 * A multi-provided token of `HttpInterceptorFn`s.
 */
export const HTTP_INTERCEPTOR_FNS = new InjectionToken(ngDevMode ? 'HTTP_INTERCEPTOR_FNS' : '');
/**
 * A multi-provided token of `HttpInterceptorFn`s that are only set in root.
 */
export const HTTP_ROOT_INTERCEPTOR_FNS = new InjectionToken(ngDevMode ? 'HTTP_ROOT_INTERCEPTOR_FNS' : '');
/**
 * A provider to set a global primary http backend. If set, it will override the default one
 */
export const PRIMARY_HTTP_BACKEND = new InjectionToken(ngDevMode ? 'PRIMARY_HTTP_BACKEND' : '');
/**
 * Creates an `HttpInterceptorFn` which lazily initializes an interceptor chain from the legacy
 * class-based interceptors and runs the request through it.
 */
export function legacyInterceptorFnFactory() {
    let chain = null;
    return (req, handler) => {
        if (chain === null) {
            const interceptors = inject(HTTP_INTERCEPTORS, { optional: true }) ?? [];
            // Note: interceptors are wrapped right-to-left so that final execution order is
            // left-to-right. That is, if `interceptors` is the array `[a, b, c]`, we want to
            // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
            // out.
            chain = interceptors.reduceRight(adaptLegacyInterceptorToChain, interceptorChainEndFn);
        }
        const pendingTasks = inject(InitialRenderPendingTasks);
        const taskId = pendingTasks.add();
        return chain(req, handler).pipe(finalize(() => pendingTasks.remove(taskId)));
    };
}
let fetchBackendWarningDisplayed = false;
/** Internal function to reset the flag in tests */
export function resetFetchBackendWarningFlag() {
    fetchBackendWarningDisplayed = false;
}
export class HttpInterceptorHandler extends HttpHandler {
    constructor(backend, injector) {
        super();
        this.backend = backend;
        this.injector = injector;
        this.chain = null;
        this.pendingTasks = inject(InitialRenderPendingTasks);
        // Check if there is a preferred HTTP backend configured and use it if that's the case.
        // This is needed to enable `FetchBackend` globally for all HttpClient's when `withFetch`
        // is used.
        const primaryHttpBackend = inject(PRIMARY_HTTP_BACKEND, { optional: true });
        this.backend = primaryHttpBackend ?? backend;
        // We strongly recommend using fetch backend for HTTP calls when SSR is used
        // for an application. The logic below checks if that's the case and produces
        // a warning otherwise.
        if ((typeof ngDevMode === 'undefined' || ngDevMode) && !fetchBackendWarningDisplayed) {
            const isServer = isPlatformServer(injector.get(PLATFORM_ID));
            if (isServer && !(this.backend instanceof FetchBackend)) {
                fetchBackendWarningDisplayed = true;
                injector.get(Console).warn(formatRuntimeError(2801 /* RuntimeErrorCode.NOT_USING_FETCH_BACKEND_IN_SSR */, 'Angular detected that `HttpClient` is not configured ' +
                    'to use `fetch` APIs. It\'s strongly recommended to ' +
                    'enable `fetch` for applications that use Server-Side Rendering ' +
                    'for better performance and compatibility. ' +
                    'To enable `fetch`, add the `withFetch()` to the `provideHttpClient()` ' +
                    'call at the root of the application.'));
            }
        }
    }
    handle(initialRequest) {
        if (this.chain === null) {
            const dedupedInterceptorFns = Array.from(new Set([
                ...this.injector.get(HTTP_INTERCEPTOR_FNS),
                ...this.injector.get(HTTP_ROOT_INTERCEPTOR_FNS, []),
            ]));
            // Note: interceptors are wrapped right-to-left so that final execution order is
            // left-to-right. That is, if `dedupedInterceptorFns` is the array `[a, b, c]`, we want to
            // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
            // out.
            this.chain = dedupedInterceptorFns.reduceRight((nextSequencedFn, interceptorFn) => chainedInterceptorFn(nextSequencedFn, interceptorFn, this.injector), interceptorChainEndFn);
        }
        const taskId = this.pendingTasks.add();
        return this.chain(initialRequest, downstreamRequest => this.backend.handle(downstreamRequest))
            .pipe(finalize(() => this.pendingTasks.remove(taskId)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.4+sha-b2e3b3e", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.4+sha-b2e3b3e", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.4+sha-b2e3b3e", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxRQUFRLElBQUksT0FBTyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLDBCQUEwQixJQUFJLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRW5QLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVuRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDOzs7QUE0SHJDLFNBQVMscUJBQXFCLENBQzFCLEdBQXFCLEVBQUUsY0FBNkI7SUFDdEQsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsNkJBQTZCLENBQ2xDLFdBQXNDLEVBQ3RDLFdBQTRCO0lBQzlCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUMvRSxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDekIsV0FBMEMsRUFBRSxhQUFnQyxFQUM1RSxRQUE2QjtJQUMvQixt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LENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsaUJBQWlCLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7YUFDekYsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDOUQsQ0FBQzt5SEFwRFUsc0JBQXNCOzZIQUF0QixzQkFBc0I7O3NHQUF0QixzQkFBc0I7a0JBRGxDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtFbnZpcm9ubWVudEluamVjdG9yLCBpbmplY3QsIEluamVjdGFibGUsIEluamVjdGlvblRva2VuLCBQTEFURk9STV9JRCwgcnVuSW5JbmplY3Rpb25Db250ZXh0LCDJtUNvbnNvbGUgYXMgQ29uc29sZSwgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtUluaXRpYWxSZW5kZXJQZW5kaW5nVGFza3MgYXMgSW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrc30gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaW5hbGl6ZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtGZXRjaEJhY2tlbmR9IGZyb20gJy4vZmV0Y2gnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuLyoqXG4gKiBJbnRlcmNlcHRzIGFuZCBoYW5kbGVzIGFuIGBIdHRwUmVxdWVzdGAgb3IgYEh0dHBSZXNwb25zZWAuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgdHJhbnNmb3JtIHRoZSBvdXRnb2luZyByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIGJ5IGNhbGxpbmcgYG5leHQuaGFuZGxlKHRyYW5zZm9ybWVkUmVxKWAuXG4gKiBBbiBpbnRlcmNlcHRvciBtYXkgdHJhbnNmb3JtIHRoZVxuICogcmVzcG9uc2UgZXZlbnQgc3RyZWFtIGFzIHdlbGwsIGJ5IGFwcGx5aW5nIGFkZGl0aW9uYWwgUnhKUyBvcGVyYXRvcnMgb24gdGhlIHN0cmVhbVxuICogcmV0dXJuZWQgYnkgYG5leHQuaGFuZGxlKClgLlxuICpcbiAqIE1vcmUgcmFyZWx5LCBhbiBpbnRlcmNlcHRvciBtYXkgaGFuZGxlIHRoZSByZXF1ZXN0IGVudGlyZWx5LFxuICogYW5kIGNvbXBvc2UgYSBuZXcgZXZlbnQgc3RyZWFtIGluc3RlYWQgb2YgaW52b2tpbmcgYG5leHQuaGFuZGxlKClgLiBUaGlzIGlzIGFuXG4gKiBhY2NlcHRhYmxlIGJlaGF2aW9yLCBidXQga2VlcCBpbiBtaW5kIHRoYXQgZnVydGhlciBpbnRlcmNlcHRvcnMgd2lsbCBiZSBza2lwcGVkIGVudGlyZWx5LlxuICpcbiAqIEl0IGlzIGFsc28gcmFyZSBidXQgdmFsaWQgZm9yIGFuIGludGVyY2VwdG9yIHRvIHJldHVybiBtdWx0aXBsZSByZXNwb25zZXMgb24gdGhlXG4gKiBldmVudCBzdHJlYW0gZm9yIGEgc2luZ2xlIHJlcXVlc3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAtaW50ZXJjZXB0LXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3JGbn1cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRvIHVzZSB0aGUgc2FtZSBpbnN0YW5jZSBvZiBgSHR0cEludGVyY2VwdG9yc2AgZm9yIHRoZSBlbnRpcmUgYXBwLCBpbXBvcnQgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYFxuICogb25seSBpbiB5b3VyIGBBcHBNb2R1bGVgLCBhbmQgYWRkIHRoZSBpbnRlcmNlcHRvcnMgdG8gdGhlIHJvb3QgYXBwbGljYXRpb24gaW5qZWN0b3IuXG4gKiBJZiB5b3UgaW1wb3J0IGBIdHRwQ2xpZW50TW9kdWxlYCBtdWx0aXBsZSB0aW1lcyBhY3Jvc3MgZGlmZmVyZW50IG1vZHVsZXMgKGZvciBleGFtcGxlLCBpbiBsYXp5XG4gKiBsb2FkaW5nIG1vZHVsZXMpLCBlYWNoIGltcG9ydCBjcmVhdGVzIGEgbmV3IGNvcHkgb2YgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYCwgd2hpY2ggb3ZlcndyaXRlcyB0aGVcbiAqIGludGVyY2VwdG9ycyBwcm92aWRlZCBpbiB0aGUgcm9vdCBtb2R1bGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXMgYW5kIGhhbmRsZXMgYSBnaXZlbiBIVFRQIHJlcXVlc3QuXG4gICAqIEBwYXJhbSByZXEgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBuZXh0IGludGVyY2VwdG9yIGluIGFuIGludGVyY2VwdG9yIGNoYWluLCBvciB0aGUgcmVhbCBiYWNrZW5kIGlmIHRoZXJlIGFyZSBub1xuICogZnVydGhlciBpbnRlcmNlcHRvcnMuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBhbmQgZWl0aGVyIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciB0aGVcbiAqIHJlc3BvbnNlIHdoZW4gaXQgYXJyaXZlcy4gV2l0aGluIHRoZSBzY29wZSBvZiB0aGUgY3VycmVudCByZXF1ZXN0LCBob3dldmVyLCB0aGlzIGZ1bmN0aW9uIG1heSBiZVxuICogY2FsbGVkIGFueSBudW1iZXIgb2YgdGltZXMsIGZvciBhbnkgbnVtYmVyIG9mIGRvd25zdHJlYW0gcmVxdWVzdHMuIFN1Y2ggZG93bnN0cmVhbSByZXF1ZXN0cyBuZWVkXG4gKiBub3QgYmUgdG8gdGhlIHNhbWUgVVJMIG9yIGV2ZW4gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IHJlcXVlc3QuIEl0IGlzIGFsc28gdmFsaWQgdG8gbm90XG4gKiBjYWxsIHRoZSBkb3duc3RyZWFtIGhhbmRsZXIgYXQgYWxsLCBhbmQgcHJvY2VzcyB0aGUgY3VycmVudCByZXF1ZXN0IGVudGlyZWx5IHdpdGhpbiB0aGVcbiAqIGludGVyY2VwdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIHJlcXVlc3QgdGhhdCdzIGN1cnJlbnRseSBiZWluZ1xuICogaW50ZXJjZXB0ZWQuIE9uY2UgdGhhdCByZXF1ZXN0IGlzIGNvbXBsZXRlLCB0aGlzIGRvd25zdHJlYW0gaGFuZGxlciBmdW5jdGlvbiBzaG91bGQgbm90IGJlXG4gKiBjYWxsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAtaW50ZXJjZXB0LXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBIYW5kbGVyRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPikgPT4gT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+O1xuXG4vKipcbiAqIEFuIGludGVyY2VwdG9yIGZvciBIVFRQIHJlcXVlc3RzIG1hZGUgdmlhIGBIdHRwQ2xpZW50YC5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBhcmUgbWlkZGxld2FyZSBmdW5jdGlvbnMgd2hpY2ggYEh0dHBDbGllbnRgIGNhbGxzIHdoZW4gYSByZXF1ZXN0IGlzIG1hZGUuXG4gKiBUaGVzZSBmdW5jdGlvbnMgaGF2ZSB0aGUgb3Bwb3J0dW5pdHkgdG8gbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIGFueSByZXNwb25zZSB0aGF0IGNvbWVzXG4gKiBiYWNrLCBhcyB3ZWxsIGFzIGJsb2NrLCByZWRpcmVjdCwgb3Igb3RoZXJ3aXNlIGNoYW5nZSB0aGUgcmVxdWVzdCBvciByZXNwb25zZSBzZW1hbnRpY3MuXG4gKlxuICogQW4gYEh0dHBIYW5kbGVyRm5gIHJlcHJlc2VudGluZyB0aGUgbmV4dCBpbnRlcmNlcHRvciAob3IgdGhlIGJhY2tlbmQgd2hpY2ggd2lsbCBtYWtlIGEgcmVhbCBIVFRQXG4gKiByZXF1ZXN0KSBpcyBwcm92aWRlZC4gTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBidXQgdGhhdCBpcyBub3QgcmVxdWlyZWRcbiAqIChzZWUgYEh0dHBIYW5kbGVyRm5gIGZvciBtb3JlIGRldGFpbHMpLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBleGVjdXRlZCBpbiBhbiBbaW5qZWN0aW9uIGNvbnRleHRdKC9ndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbi1jb250ZXh0KS5cbiAqIFRoZXkgaGF2ZSBhY2Nlc3MgdG8gYGluamVjdCgpYCB2aWEgdGhlIGBFbnZpcm9ubWVudEluamVjdG9yYCBmcm9tIHdoaWNoIHRoZXkgd2VyZSBjb25maWd1cmVkLlxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAtaW50ZXJjZXB0LXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKiBAc2VlIHtAbGluayB3aXRoSW50ZXJjZXB0b3JzfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBIZXJlIGlzIGEgbm9vcCBpbnRlcmNlcHRvciB0aGF0IHBhc3NlcyB0aGUgcmVxdWVzdCB0aHJvdWdoIHdpdGhvdXQgbW9kaWZ5aW5nIGl0OlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IG5vb3BJbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDpcbiAqIEh0dHBIYW5kbGVyRm4pID0+IHtcbiAqICAgcmV0dXJuIG5leHQobW9kaWZpZWRSZXEpO1xuICogfTtcbiAqIGBgYFxuICpcbiAqIElmIHlvdSB3YW50IHRvIGFsdGVyIGEgcmVxdWVzdCwgY2xvbmUgaXQgZmlyc3QgYW5kIG1vZGlmeSB0aGUgY2xvbmUgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBgbmV4dCgpYCBoYW5kbGVyIGZ1bmN0aW9uLlxuICpcbiAqIEhlcmUgaXMgYSBiYXNpYyBpbnRlcmNlcHRvciB0aGF0IGFkZHMgYSBiZWFyZXIgdG9rZW4gdG8gdGhlIGhlYWRlcnNcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBhdXRoZW50aWNhdGlvbkludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICAgY29uc3QgdXNlclRva2VuID0gJ01ZX1RPS0VOJzsgY29uc3QgbW9kaWZpZWRSZXEgPSByZXEuY2xvbmUoe1xuICogICAgICBoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQoJ0F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dXNlclRva2VufWApLFxuICogICAgfSk7XG4gKlxuICogICAgcmV0dXJuIG5leHQobW9kaWZpZWRSZXEpO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OiBIdHRwSGFuZGxlckZuKSA9PlxuICAgIE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBGdW5jdGlvbiB3aGljaCBpbnZva2VzIGFuIEhUVFAgaW50ZXJjZXB0b3IgY2hhaW4uXG4gKlxuICogRWFjaCBpbnRlcmNlcHRvciBpbiB0aGUgaW50ZXJjZXB0b3IgY2hhaW4gaXMgdHVybmVkIGludG8gYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGNsb3Nlc1xuICogb3ZlciB0aGUgcmVzdCBvZiB0aGUgY2hhaW4gKHJlcHJlc2VudGVkIGJ5IGFub3RoZXIgYENoYWluZWRJbnRlcmNlcHRvckZuYCkuIFRoZSBsYXN0IHN1Y2hcbiAqIGZ1bmN0aW9uIGluIHRoZSBjaGFpbiB3aWxsIGluc3RlYWQgZGVsZWdhdGUgdG8gdGhlIGBmaW5hbEhhbmRsZXJGbmAsIHdoaWNoIGlzIHBhc3NlZCBkb3duIHdoZW5cbiAqIHRoZSBjaGFpbiBpcyBpbnZva2VkLlxuICpcbiAqIFRoaXMgcGF0dGVybiBhbGxvd3MgZm9yIGEgY2hhaW4gb2YgbWFueSBpbnRlcmNlcHRvcnMgdG8gYmUgY29tcG9zZWQgYW5kIHdyYXBwZWQgaW4gYSBzaW5nbGVcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmAsIHdoaWNoIGlzIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBpbmNsdWRpbmcgZGlmZmVyZW50IGtpbmRzIG9mIGludGVyY2VwdG9yc1xuICogKGUuZy4gbGVnYWN5IGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycykgaW4gdGhlIHNhbWUgY2hhaW4uXG4gKi9cbnR5cGUgQ2hhaW5lZEludGVyY2VwdG9yRm48UmVxdWVzdFQ+ID0gKHJlcTogSHR0cFJlcXVlc3Q8UmVxdWVzdFQ+LCBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbikgPT5cbiAgICBPYnNlcnZhYmxlPEh0dHBFdmVudDxSZXF1ZXN0VD4+O1xuXG5mdW5jdGlvbiBpbnRlcmNlcHRvckNoYWluRW5kRm4oXG4gICAgcmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgcmV0dXJuIGZpbmFsSGFuZGxlckZuKHJlcSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggYWRhcHRzIGEgbGVnYWN5IGBIdHRwSW50ZXJjZXB0b3JgIHRvIHRoZVxuICogYENoYWluZWRJbnRlcmNlcHRvckZuYCBpbnRlcmZhY2UuXG4gKi9cbmZ1bmN0aW9uIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluKFxuICAgIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+LFxuICAgIGludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3IpOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHtcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+IGludGVyY2VwdG9yLmludGVyY2VwdChpbml0aWFsUmVxdWVzdCwge1xuICAgIGhhbmRsZTogKGRvd25zdHJlYW1SZXF1ZXN0KSA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICB9KTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCB3cmFwcyBhbmQgaW52b2tlcyBhIGZ1bmN0aW9uYWwgaW50ZXJjZXB0b3IgaW4gdGhlIGdpdmVuXG4gKiBpbmplY3Rvci5cbiAqL1xuZnVuY3Rpb24gY2hhaW5lZEludGVyY2VwdG9yRm4oXG4gICAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LCBpbnRlcmNlcHRvckZuOiBIdHRwSW50ZXJjZXB0b3JGbixcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcik6IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHtcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT4gcnVuSW5JbmplY3Rpb25Db250ZXh0KGluamVjdG9yLCAoKSA9PlxuICAgIGludGVyY2VwdG9yRm4oXG4gICAgICBpbml0aWFsUmVxdWVzdCxcbiAgICAgIGRvd25zdHJlYW1SZXF1ZXN0ID0+IGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbilcbiAgICApXG4gICk7XG4gIC8vIGNsYW5nLWZvcm1hdCBvblxufVxuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZXIgdG9rZW4gdGhhdCByZXByZXNlbnRzIHRoZSBhcnJheSBvZiByZWdpc3RlcmVkXG4gKiBgSHR0cEludGVyY2VwdG9yYCBvYmplY3RzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfSU5URVJDRVBUT1JTID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yW10+KG5nRGV2TW9kZSA/ICdIVFRQX0lOVEVSQ0VQVE9SUycgOiAnJyk7XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlZCB0b2tlbiBvZiBgSHR0cEludGVyY2VwdG9yRm5gcy5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfSU5URVJDRVBUT1JfRk5TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yRm5bXT4obmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JfRk5TJyA6ICcnKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzIHRoYXQgYXJlIG9ubHkgc2V0IGluIHJvb3QuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yRm5bXT4obmdEZXZNb2RlID8gJ0hUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMnIDogJycpO1xuXG4vKipcbiAqIEEgcHJvdmlkZXIgdG8gc2V0IGEgZ2xvYmFsIHByaW1hcnkgaHR0cCBiYWNrZW5kLiBJZiBzZXQsIGl0IHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb25lXG4gKi9cbmV4cG9ydCBjb25zdCBQUklNQVJZX0hUVFBfQkFDS0VORCA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPEh0dHBCYWNrZW5kPihuZ0Rldk1vZGUgPyAnUFJJTUFSWV9IVFRQX0JBQ0tFTkQnIDogJycpO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhbiBgSHR0cEludGVyY2VwdG9yRm5gIHdoaWNoIGxhemlseSBpbml0aWFsaXplcyBhbiBpbnRlcmNlcHRvciBjaGFpbiBmcm9tIHRoZSBsZWdhY3lcbiAqIGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycyBhbmQgcnVucyB0aGUgcmVxdWVzdCB0aHJvdWdoIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVnYWN5SW50ZXJjZXB0b3JGbkZhY3RvcnkoKTogSHR0cEludGVyY2VwdG9yRm4ge1xuICBsZXQgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT58bnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIChyZXEsIGhhbmRsZXIpID0+IHtcbiAgICBpZiAoY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGluamVjdChIVFRQX0lOVEVSQ0VQVE9SUywge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGludGVyY2VwdG9yc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4sIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+KTtcbiAgICB9XG5cbiAgICBjb25zdCBwZW5kaW5nVGFza3MgPSBpbmplY3QoSW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyk7XG4gICAgY29uc3QgdGFza0lkID0gcGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgIHJldHVybiBjaGFpbihyZXEsIGhhbmRsZXIpLnBpcGUoZmluYWxpemUoKCkgPT4gcGVuZGluZ1Rhc2tzLnJlbW92ZSh0YXNrSWQpKSk7XG4gIH07XG59XG5cbmxldCBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG5cbi8qKiBJbnRlcm5hbCBmdW5jdGlvbiB0byByZXNldCB0aGUgZmxhZyBpbiB0ZXN0cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RmV0Y2hCYWNrZW5kV2FybmluZ0ZsYWcoKSB7XG4gIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSBmYWxzZTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIgZXh0ZW5kcyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbmRpbmdUYXNrcyA9IGluamVjdChJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBwcml2YXRlIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcHJlZmVycmVkIEhUVFAgYmFja2VuZCBjb25maWd1cmVkIGFuZCB1c2UgaXQgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGVuYWJsZSBgRmV0Y2hCYWNrZW5kYCBnbG9iYWxseSBmb3IgYWxsIEh0dHBDbGllbnQncyB3aGVuIGB3aXRoRmV0Y2hgXG4gICAgLy8gaXMgdXNlZC5cbiAgICBjb25zdCBwcmltYXJ5SHR0cEJhY2tlbmQgPSBpbmplY3QoUFJJTUFSWV9IVFRQX0JBQ0tFTkQsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIHRoaXMuYmFja2VuZCA9IHByaW1hcnlIdHRwQmFja2VuZCA/PyBiYWNrZW5kO1xuXG4gICAgLy8gV2Ugc3Ryb25nbHkgcmVjb21tZW5kIHVzaW5nIGZldGNoIGJhY2tlbmQgZm9yIEhUVFAgY2FsbHMgd2hlbiBTU1IgaXMgdXNlZFxuICAgIC8vIGZvciBhbiBhcHBsaWNhdGlvbi4gVGhlIGxvZ2ljIGJlbG93IGNoZWNrcyBpZiB0aGF0J3MgdGhlIGNhc2UgYW5kIHByb2R1Y2VzXG4gICAgLy8gYSB3YXJuaW5nIG90aGVyd2lzZS5cbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgIWZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQpIHtcbiAgICAgIGNvbnN0IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3Rvci5nZXQoUExBVEZPUk1fSUQpKTtcbiAgICAgIGlmIChpc1NlcnZlciAmJiAhKHRoaXMuYmFja2VuZCBpbnN0YW5jZW9mIEZldGNoQmFja2VuZCkpIHtcbiAgICAgICAgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIGluamVjdG9yLmdldChDb25zb2xlKS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTk9UX1VTSU5HX0ZFVENIX0JBQ0tFTkRfSU5fU1NSLFxuICAgICAgICAgICAgJ0FuZ3VsYXIgZGV0ZWN0ZWQgdGhhdCBgSHR0cENsaWVudGAgaXMgbm90IGNvbmZpZ3VyZWQgJyArXG4gICAgICAgICAgICAgICAgJ3RvIHVzZSBgZmV0Y2hgIEFQSXMuIEl0XFwncyBzdHJvbmdseSByZWNvbW1lbmRlZCB0byAnICtcbiAgICAgICAgICAgICAgICAnZW5hYmxlIGBmZXRjaGAgZm9yIGFwcGxpY2F0aW9ucyB0aGF0IHVzZSBTZXJ2ZXItU2lkZSBSZW5kZXJpbmcgJyArXG4gICAgICAgICAgICAgICAgJ2ZvciBiZXR0ZXIgcGVyZm9ybWFuY2UgYW5kIGNvbXBhdGliaWxpdHkuICcgK1xuICAgICAgICAgICAgICAgICdUbyBlbmFibGUgYGZldGNoYCwgYWRkIHRoZSBgd2l0aEZldGNoKClgIHRvIHRoZSBgcHJvdmlkZUh0dHBDbGllbnQoKWAgJyArXG4gICAgICAgICAgICAgICAgJ2NhbGwgYXQgdGhlIHJvb3Qgb2YgdGhlIGFwcGxpY2F0aW9uLicpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBoYW5kbGUoaW5pdGlhbFJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGRlZHVwZWRJbnRlcmNlcHRvckZucyA9IEFycmF5LmZyb20obmV3IFNldChbXG4gICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JfRk5TKSxcbiAgICAgICAgLi4udGhpcy5pbmplY3Rvci5nZXQoSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUywgW10pLFxuICAgICAgXSkpO1xuXG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGRlZHVwZWRJbnRlcmNlcHRvckZuc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgdGhpcy5jaGFpbiA9IGRlZHVwZWRJbnRlcmNlcHRvckZucy5yZWR1Y2VSaWdodChcbiAgICAgICAgICAobmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuKSA9PlxuICAgICAgICAgICAgICBjaGFpbmVkSW50ZXJjZXB0b3JGbihuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4sIHRoaXMuaW5qZWN0b3IpLFxuICAgICAgICAgIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPik7XG4gICAgfVxuXG4gICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIGRvd25zdHJlYW1SZXF1ZXN0ID0+IHRoaXMuYmFja2VuZC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpKVxuICAgICAgICAucGlwZShmaW5hbGl6ZSgoKSA9PiB0aGlzLnBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9XG59XG4iXX0=