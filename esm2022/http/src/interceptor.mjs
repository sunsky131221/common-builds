/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformServer } from '@angular/common';
import { EnvironmentInjector, inject, Injectable, InjectionToken, PLATFORM_ID, runInInjectionContext, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵPendingTasks as PendingTasks, } from '@angular/core';
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
    return (initialRequest, finalHandlerFn) => runInInjectionContext(injector, () => interceptorFn(initialRequest, (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn)));
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
        const pendingTasks = inject(PendingTasks);
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
        this.pendingTasks = inject(PendingTasks);
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
                injector
                    .get(Console)
                    .warn(formatRuntimeError(2801 /* RuntimeErrorCode.NOT_USING_FETCH_BACKEND_IN_SSR */, 'Angular detected that `HttpClient` is not configured ' +
                    "to use `fetch` APIs. It's strongly recommended to " +
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
        return this.chain(initialRequest, (downstreamRequest) => this.backend.handle(downstreamRequest)).pipe(finalize(() => this.pendingTasks.remove(taskId)));
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.3+sha-bd236cc", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.3+sha-bd236cc", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.3+sha-bd236cc", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQzs7O0FBZ0lyQyxTQUFTLHFCQUFxQixDQUM1QixHQUFxQixFQUNyQixjQUE2QjtJQUU3QixPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDcEMsV0FBc0MsRUFDdEMsV0FBNEI7SUFFNUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUN4QyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUNwQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsV0FBMEMsRUFDMUMsYUFBZ0MsRUFDaEMsUUFBNkI7SUFF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c0QsQ0FDdkQsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQ3ZDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQzt5SEFoRVUsc0JBQXNCOzZIQUF0QixzQkFBc0I7O3NHQUF0QixzQkFBc0I7a0JBRGxDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgRW52aXJvbm1lbnRJbmplY3RvcixcbiAgaW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgUExBVEZPUk1fSUQsXG4gIHJ1bkluSW5qZWN0aW9uQ29udGV4dCxcbiAgybVDb25zb2xlIGFzIENvbnNvbGUsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVQZW5kaW5nVGFza3MgYXMgUGVuZGluZ1Rhc2tzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0ZldGNoQmFja2VuZH0gZnJvbSAnLi9mZXRjaCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vKipcbiAqIEludGVyY2VwdHMgYW5kIGhhbmRsZXMgYW4gYEh0dHBSZXF1ZXN0YCBvciBgSHR0cFJlc3BvbnNlYC5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB0cmFuc2Zvcm0gdGhlIG91dGdvaW5nIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgYnkgY2FsbGluZyBgbmV4dC5oYW5kbGUodHJhbnNmb3JtZWRSZXEpYC5cbiAqIEFuIGludGVyY2VwdG9yIG1heSB0cmFuc2Zvcm0gdGhlXG4gKiByZXNwb25zZSBldmVudCBzdHJlYW0gYXMgd2VsbCwgYnkgYXBwbHlpbmcgYWRkaXRpb25hbCBSeEpTIG9wZXJhdG9ycyBvbiB0aGUgc3RyZWFtXG4gKiByZXR1cm5lZCBieSBgbmV4dC5oYW5kbGUoKWAuXG4gKlxuICogTW9yZSByYXJlbHksIGFuIGludGVyY2VwdG9yIG1heSBoYW5kbGUgdGhlIHJlcXVlc3QgZW50aXJlbHksXG4gKiBhbmQgY29tcG9zZSBhIG5ldyBldmVudCBzdHJlYW0gaW5zdGVhZCBvZiBpbnZva2luZyBgbmV4dC5oYW5kbGUoKWAuIFRoaXMgaXMgYW5cbiAqIGFjY2VwdGFibGUgYmVoYXZpb3IsIGJ1dCBrZWVwIGluIG1pbmQgdGhhdCBmdXJ0aGVyIGludGVyY2VwdG9ycyB3aWxsIGJlIHNraXBwZWQgZW50aXJlbHkuXG4gKlxuICogSXQgaXMgYWxzbyByYXJlIGJ1dCB2YWxpZCBmb3IgYW4gaW50ZXJjZXB0b3IgdG8gcmV0dXJuIG11bHRpcGxlIHJlc3BvbnNlcyBvbiB0aGVcbiAqIGV2ZW50IHN0cmVhbSBmb3IgYSBzaW5nbGUgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC9pbnRlcmNlcHRvcnMpXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3JGbn1cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRvIHVzZSB0aGUgc2FtZSBpbnN0YW5jZSBvZiBgSHR0cEludGVyY2VwdG9yc2AgZm9yIHRoZSBlbnRpcmUgYXBwLCBpbXBvcnQgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYFxuICogb25seSBpbiB5b3VyIGBBcHBNb2R1bGVgLCBhbmQgYWRkIHRoZSBpbnRlcmNlcHRvcnMgdG8gdGhlIHJvb3QgYXBwbGljYXRpb24gaW5qZWN0b3IuXG4gKiBJZiB5b3UgaW1wb3J0IGBIdHRwQ2xpZW50TW9kdWxlYCBtdWx0aXBsZSB0aW1lcyBhY3Jvc3MgZGlmZmVyZW50IG1vZHVsZXMgKGZvciBleGFtcGxlLCBpbiBsYXp5XG4gKiBsb2FkaW5nIG1vZHVsZXMpLCBlYWNoIGltcG9ydCBjcmVhdGVzIGEgbmV3IGNvcHkgb2YgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYCwgd2hpY2ggb3ZlcndyaXRlcyB0aGVcbiAqIGludGVyY2VwdG9ycyBwcm92aWRlZCBpbiB0aGUgcm9vdCBtb2R1bGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXMgYW5kIGhhbmRsZXMgYSBnaXZlbiBIVFRQIHJlcXVlc3QuXG4gICAqIEBwYXJhbSByZXEgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBuZXh0IGludGVyY2VwdG9yIGluIGFuIGludGVyY2VwdG9yIGNoYWluLCBvciB0aGUgcmVhbCBiYWNrZW5kIGlmIHRoZXJlIGFyZSBub1xuICogZnVydGhlciBpbnRlcmNlcHRvcnMuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBhbmQgZWl0aGVyIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciB0aGVcbiAqIHJlc3BvbnNlIHdoZW4gaXQgYXJyaXZlcy4gV2l0aGluIHRoZSBzY29wZSBvZiB0aGUgY3VycmVudCByZXF1ZXN0LCBob3dldmVyLCB0aGlzIGZ1bmN0aW9uIG1heSBiZVxuICogY2FsbGVkIGFueSBudW1iZXIgb2YgdGltZXMsIGZvciBhbnkgbnVtYmVyIG9mIGRvd25zdHJlYW0gcmVxdWVzdHMuIFN1Y2ggZG93bnN0cmVhbSByZXF1ZXN0cyBuZWVkXG4gKiBub3QgYmUgdG8gdGhlIHNhbWUgVVJMIG9yIGV2ZW4gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IHJlcXVlc3QuIEl0IGlzIGFsc28gdmFsaWQgdG8gbm90XG4gKiBjYWxsIHRoZSBkb3duc3RyZWFtIGhhbmRsZXIgYXQgYWxsLCBhbmQgcHJvY2VzcyB0aGUgY3VycmVudCByZXF1ZXN0IGVudGlyZWx5IHdpdGhpbiB0aGVcbiAqIGludGVyY2VwdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIHJlcXVlc3QgdGhhdCdzIGN1cnJlbnRseSBiZWluZ1xuICogaW50ZXJjZXB0ZWQuIE9uY2UgdGhhdCByZXF1ZXN0IGlzIGNvbXBsZXRlLCB0aGlzIGRvd25zdHJlYW0gaGFuZGxlciBmdW5jdGlvbiBzaG91bGQgbm90IGJlXG4gKiBjYWxsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAvaW50ZXJjZXB0b3JzKVxuICovXG5leHBvcnQgdHlwZSBIdHRwSGFuZGxlckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBBbiBpbnRlcmNlcHRvciBmb3IgSFRUUCByZXF1ZXN0cyBtYWRlIHZpYSBgSHR0cENsaWVudGAuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIG1pZGRsZXdhcmUgZnVuY3Rpb25zIHdoaWNoIGBIdHRwQ2xpZW50YCBjYWxscyB3aGVuIGEgcmVxdWVzdCBpcyBtYWRlLlxuICogVGhlc2UgZnVuY3Rpb25zIGhhdmUgdGhlIG9wcG9ydHVuaXR5IHRvIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciBhbnkgcmVzcG9uc2UgdGhhdCBjb21lc1xuICogYmFjaywgYXMgd2VsbCBhcyBibG9jaywgcmVkaXJlY3QsIG9yIG90aGVyd2lzZSBjaGFuZ2UgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2Ugc2VtYW50aWNzLlxuICpcbiAqIEFuIGBIdHRwSGFuZGxlckZuYCByZXByZXNlbnRpbmcgdGhlIG5leHQgaW50ZXJjZXB0b3IgKG9yIHRoZSBiYWNrZW5kIHdoaWNoIHdpbGwgbWFrZSBhIHJlYWwgSFRUUFxuICogcmVxdWVzdCkgaXMgcHJvdmlkZWQuIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYnV0IHRoYXQgaXMgbm90IHJlcXVpcmVkXG4gKiAoc2VlIGBIdHRwSGFuZGxlckZuYCBmb3IgbW9yZSBkZXRhaWxzKS5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBhcmUgZXhlY3V0ZWQgaW4gYW4gW2luamVjdGlvbiBjb250ZXh0XShndWlkZS9kaS9kZXBlbmRlbmN5LWluamVjdGlvbi1jb250ZXh0KS5cbiAqIFRoZXkgaGF2ZSBhY2Nlc3MgdG8gYGluamVjdCgpYCB2aWEgdGhlIGBFbnZpcm9ubWVudEluamVjdG9yYCBmcm9tIHdoaWNoIHRoZXkgd2VyZSBjb25maWd1cmVkLlxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAvaW50ZXJjZXB0b3JzKVxuICogQHNlZSB7QGxpbmsgd2l0aEludGVyY2VwdG9yc31cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogSGVyZSBpcyBhIG5vb3AgaW50ZXJjZXB0b3IgdGhhdCBwYXNzZXMgdGhlIHJlcXVlc3QgdGhyb3VnaCB3aXRob3V0IG1vZGlmeWluZyBpdDpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBub29wSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgIHJldHVybiBuZXh0KG1vZGlmaWVkUmVxKTtcbiAqIH07XG4gKiBgYGBcbiAqXG4gKiBJZiB5b3Ugd2FudCB0byBhbHRlciBhIHJlcXVlc3QsIGNsb25lIGl0IGZpcnN0IGFuZCBtb2RpZnkgdGhlIGNsb25lIGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogYG5leHQoKWAgaGFuZGxlciBmdW5jdGlvbi5cbiAqXG4gKiBIZXJlIGlzIGEgYmFzaWMgaW50ZXJjZXB0b3IgdGhhdCBhZGRzIGEgYmVhcmVyIHRva2VuIHRvIHRoZSBoZWFkZXJzXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3QgYXV0aGVudGljYXRpb25JbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDpcbiAqIEh0dHBIYW5kbGVyRm4pID0+IHtcbiAqICAgIGNvbnN0IHVzZXJUb2tlbiA9ICdNWV9UT0tFTic7IGNvbnN0IG1vZGlmaWVkUmVxID0gcmVxLmNsb25lKHtcbiAqICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgYEJlYXJlciAke3VzZXJUb2tlbn1gKSxcbiAqICAgIH0pO1xuICpcbiAqICAgIHJldHVybiBuZXh0KG1vZGlmaWVkUmVxKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEludGVyY2VwdG9yRm4gPSAoXG4gIHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sXG4gIG5leHQ6IEh0dHBIYW5kbGVyRm4sXG4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBGdW5jdGlvbiB3aGljaCBpbnZva2VzIGFuIEhUVFAgaW50ZXJjZXB0b3IgY2hhaW4uXG4gKlxuICogRWFjaCBpbnRlcmNlcHRvciBpbiB0aGUgaW50ZXJjZXB0b3IgY2hhaW4gaXMgdHVybmVkIGludG8gYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGNsb3Nlc1xuICogb3ZlciB0aGUgcmVzdCBvZiB0aGUgY2hhaW4gKHJlcHJlc2VudGVkIGJ5IGFub3RoZXIgYENoYWluZWRJbnRlcmNlcHRvckZuYCkuIFRoZSBsYXN0IHN1Y2hcbiAqIGZ1bmN0aW9uIGluIHRoZSBjaGFpbiB3aWxsIGluc3RlYWQgZGVsZWdhdGUgdG8gdGhlIGBmaW5hbEhhbmRsZXJGbmAsIHdoaWNoIGlzIHBhc3NlZCBkb3duIHdoZW5cbiAqIHRoZSBjaGFpbiBpcyBpbnZva2VkLlxuICpcbiAqIFRoaXMgcGF0dGVybiBhbGxvd3MgZm9yIGEgY2hhaW4gb2YgbWFueSBpbnRlcmNlcHRvcnMgdG8gYmUgY29tcG9zZWQgYW5kIHdyYXBwZWQgaW4gYSBzaW5nbGVcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmAsIHdoaWNoIGlzIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBpbmNsdWRpbmcgZGlmZmVyZW50IGtpbmRzIG9mIGludGVyY2VwdG9yc1xuICogKGUuZy4gbGVnYWN5IGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycykgaW4gdGhlIHNhbWUgY2hhaW4uXG4gKi9cbnR5cGUgQ2hhaW5lZEludGVyY2VwdG9yRm48UmVxdWVzdFQ+ID0gKFxuICByZXE6IEh0dHBSZXF1ZXN0PFJlcXVlc3RUPixcbiAgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4sXG4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PFJlcXVlc3RUPj47XG5cbmZ1bmN0aW9uIGludGVyY2VwdG9yQ2hhaW5FbmRGbihcbiAgcmVxOiBIdHRwUmVxdWVzdDxhbnk+LFxuICBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbixcbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgcmV0dXJuIGZpbmFsSGFuZGxlckZuKHJlcSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggYWRhcHRzIGEgbGVnYWN5IGBIdHRwSW50ZXJjZXB0b3JgIHRvIHRoZVxuICogYENoYWluZWRJbnRlcmNlcHRvckZuYCBpbnRlcmZhY2UuXG4gKi9cbmZ1bmN0aW9uIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluKFxuICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgaW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvcixcbik6IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4ge1xuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT5cbiAgICBpbnRlcmNlcHRvci5pbnRlcmNlcHQoaW5pdGlhbFJlcXVlc3QsIHtcbiAgICAgIGhhbmRsZTogKGRvd25zdHJlYW1SZXF1ZXN0KSA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIHdyYXBzIGFuZCBpbnZva2VzIGEgZnVuY3Rpb25hbCBpbnRlcmNlcHRvciBpbiB0aGUgZ2l2ZW5cbiAqIGluamVjdG9yLlxuICovXG5mdW5jdGlvbiBjaGFpbmVkSW50ZXJjZXB0b3JGbihcbiAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LFxuICBpbnRlcmNlcHRvckZuOiBIdHRwSW50ZXJjZXB0b3JGbixcbiAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4pOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiB7XG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+XG4gICAgcnVuSW5JbmplY3Rpb25Db250ZXh0KGluamVjdG9yLCAoKSA9PlxuICAgICAgaW50ZXJjZXB0b3JGbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgICBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICAgICAgKSxcbiAgICApO1xuICAvLyBjbGFuZy1mb3JtYXQgb25cbn1cblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVyIHRva2VuIHRoYXQgcmVwcmVzZW50cyB0aGUgYXJyYXkgb2YgcmVnaXN0ZXJlZFxuICogYEh0dHBJbnRlcmNlcHRvcmAgb2JqZWN0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JbXT4oXG4gIG5nRGV2TW9kZSA/ICdIVFRQX0lOVEVSQ0VQVE9SUycgOiAnJyxcbik7XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlZCB0b2tlbiBvZiBgSHR0cEludGVyY2VwdG9yRm5gcy5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfSU5URVJDRVBUT1JfRk5TID0gbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUl9GTlMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMgdGhhdCBhcmUgb25seSBzZXQgaW4gcm9vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yRm5bXT4oXG4gIG5nRGV2TW9kZSA/ICdIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBBIHByb3ZpZGVyIHRvIHNldCBhIGdsb2JhbCBwcmltYXJ5IGh0dHAgYmFja2VuZC4gSWYgc2V0LCBpdCB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9uZVxuICovXG5leHBvcnQgY29uc3QgUFJJTUFSWV9IVFRQX0JBQ0tFTkQgPSBuZXcgSW5qZWN0aW9uVG9rZW48SHR0cEJhY2tlbmQ+KFxuICBuZ0Rldk1vZGUgPyAnUFJJTUFSWV9IVFRQX0JBQ0tFTkQnIDogJycsXG4pO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYEh0dHBJbnRlcmNlcHRvckZuYCB3aGljaCBsYXppbHkgaW5pdGlhbGl6ZXMgYW4gaW50ZXJjZXB0b3IgY2hhaW4gZnJvbSB0aGUgbGVnYWN5XG4gKiBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMgYW5kIHJ1bnMgdGhlIHJlcXVlc3QgdGhyb3VnaCBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5KCk6IEh0dHBJbnRlcmNlcHRvckZuIHtcbiAgbGV0IGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIChyZXEsIGhhbmRsZXIpID0+IHtcbiAgICBpZiAoY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGluamVjdChIVFRQX0lOVEVSQ0VQVE9SUywge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGludGVyY2VwdG9yc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluLFxuICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG4gICAgY29uc3QgdGFza0lkID0gcGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgIHJldHVybiBjaGFpbihyZXEsIGhhbmRsZXIpLnBpcGUoZmluYWxpemUoKCkgPT4gcGVuZGluZ1Rhc2tzLnJlbW92ZSh0YXNrSWQpKSk7XG4gIH07XG59XG5cbmxldCBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG5cbi8qKiBJbnRlcm5hbCBmdW5jdGlvbiB0byByZXNldCB0aGUgZmxhZyBpbiB0ZXN0cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RmV0Y2hCYWNrZW5kV2FybmluZ0ZsYWcoKSB7XG4gIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSBmYWxzZTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIgZXh0ZW5kcyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBiYWNrZW5kOiBIdHRwQmFja2VuZCxcbiAgICBwcml2YXRlIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuICApIHtcbiAgICBzdXBlcigpO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBwcmVmZXJyZWQgSFRUUCBiYWNrZW5kIGNvbmZpZ3VyZWQgYW5kIHVzZSBpdCBpZiB0aGF0J3MgdGhlIGNhc2UuXG4gICAgLy8gVGhpcyBpcyBuZWVkZWQgdG8gZW5hYmxlIGBGZXRjaEJhY2tlbmRgIGdsb2JhbGx5IGZvciBhbGwgSHR0cENsaWVudCdzIHdoZW4gYHdpdGhGZXRjaGBcbiAgICAvLyBpcyB1c2VkLlxuICAgIGNvbnN0IHByaW1hcnlIdHRwQmFja2VuZCA9IGluamVjdChQUklNQVJZX0hUVFBfQkFDS0VORCwge29wdGlvbmFsOiB0cnVlfSk7XG4gICAgdGhpcy5iYWNrZW5kID0gcHJpbWFyeUh0dHBCYWNrZW5kID8/IGJhY2tlbmQ7XG5cbiAgICAvLyBXZSBzdHJvbmdseSByZWNvbW1lbmQgdXNpbmcgZmV0Y2ggYmFja2VuZCBmb3IgSFRUUCBjYWxscyB3aGVuIFNTUiBpcyB1c2VkXG4gICAgLy8gZm9yIGFuIGFwcGxpY2F0aW9uLiBUaGUgbG9naWMgYmVsb3cgY2hlY2tzIGlmIHRoYXQncyB0aGUgY2FzZSBhbmQgcHJvZHVjZXNcbiAgICAvLyBhIHdhcm5pbmcgb3RoZXJ3aXNlLlxuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiAhZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCkge1xuICAgICAgY29uc3QgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdG9yLmdldChQTEFURk9STV9JRCkpO1xuICAgICAgaWYgKGlzU2VydmVyICYmICEodGhpcy5iYWNrZW5kIGluc3RhbmNlb2YgRmV0Y2hCYWNrZW5kKSkge1xuICAgICAgICBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgaW5qZWN0b3JcbiAgICAgICAgICAuZ2V0KENvbnNvbGUpXG4gICAgICAgICAgLndhcm4oXG4gICAgICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTk9UX1VTSU5HX0ZFVENIX0JBQ0tFTkRfSU5fU1NSLFxuICAgICAgICAgICAgICAnQW5ndWxhciBkZXRlY3RlZCB0aGF0IGBIdHRwQ2xpZW50YCBpcyBub3QgY29uZmlndXJlZCAnICtcbiAgICAgICAgICAgICAgICBcInRvIHVzZSBgZmV0Y2hgIEFQSXMuIEl0J3Mgc3Ryb25nbHkgcmVjb21tZW5kZWQgdG8gXCIgK1xuICAgICAgICAgICAgICAgICdlbmFibGUgYGZldGNoYCBmb3IgYXBwbGljYXRpb25zIHRoYXQgdXNlIFNlcnZlci1TaWRlIFJlbmRlcmluZyAnICtcbiAgICAgICAgICAgICAgICAnZm9yIGJldHRlciBwZXJmb3JtYW5jZSBhbmQgY29tcGF0aWJpbGl0eS4gJyArXG4gICAgICAgICAgICAgICAgJ1RvIGVuYWJsZSBgZmV0Y2hgLCBhZGQgdGhlIGB3aXRoRmV0Y2goKWAgdG8gdGhlIGBwcm92aWRlSHR0cENsaWVudCgpYCAnICtcbiAgICAgICAgICAgICAgICAnY2FsbCBhdCB0aGUgcm9vdCBvZiB0aGUgYXBwbGljYXRpb24uJyxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBoYW5kbGUoaW5pdGlhbFJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGRlZHVwZWRJbnRlcmNlcHRvckZucyA9IEFycmF5LmZyb20oXG4gICAgICAgIG5ldyBTZXQoW1xuICAgICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JfRk5TKSxcbiAgICAgICAgICAuLi50aGlzLmluamVjdG9yLmdldChIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TLCBbXSksXG4gICAgICAgIF0pLFxuICAgICAgKTtcblxuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBkZWR1cGVkSW50ZXJjZXB0b3JGbnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIHRoaXMuY2hhaW4gPSBkZWR1cGVkSW50ZXJjZXB0b3JGbnMucmVkdWNlUmlnaHQoXG4gICAgICAgIChuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4pID0+XG4gICAgICAgICAgY2hhaW5lZEludGVyY2VwdG9yRm4obmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuLCB0aGlzLmluamVjdG9yKSxcbiAgICAgICAgaW50ZXJjZXB0b3JDaGFpbkVuZEZuIGFzIENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCB0YXNrSWQgPSB0aGlzLnBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICByZXR1cm4gdGhpcy5jaGFpbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgdGhpcy5iYWNrZW5kLmhhbmRsZShkb3duc3RyZWFtUmVxdWVzdCksXG4gICAgKS5waXBlKGZpbmFsaXplKCgpID0+IHRoaXMucGVuZGluZ1Rhc2tzLnJlbW92ZSh0YXNrSWQpKSk7XG4gIH1cbn1cbiJdfQ==