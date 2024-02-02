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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f600f0f", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f600f0f", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.2.0-next.1+sha-f600f0f", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQzs7O0FBZ0lyQyxTQUFTLHFCQUFxQixDQUM1QixHQUFxQixFQUNyQixjQUE2QjtJQUU3QixPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDcEMsV0FBc0MsRUFDdEMsV0FBNEI7SUFFNUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUN4QyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUNwQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsV0FBMEMsRUFDMUMsYUFBZ0MsRUFDaEMsUUFBNkI7SUFF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c0QsQ0FDdkQsQ0FBQztRQUNKLENBQUM7UUFFRCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ3ZDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQ3ZDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDM0QsQ0FBQzt5SEFoRVUsc0JBQXNCOzZIQUF0QixzQkFBc0I7O3NHQUF0QixzQkFBc0I7a0JBRGxDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgRW52aXJvbm1lbnRJbmplY3RvcixcbiAgaW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgUExBVEZPUk1fSUQsXG4gIHJ1bkluSW5qZWN0aW9uQ29udGV4dCxcbiAgybVDb25zb2xlIGFzIENvbnNvbGUsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVQZW5kaW5nVGFza3MgYXMgUGVuZGluZ1Rhc2tzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0ZldGNoQmFja2VuZH0gZnJvbSAnLi9mZXRjaCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vKipcbiAqIEludGVyY2VwdHMgYW5kIGhhbmRsZXMgYW4gYEh0dHBSZXF1ZXN0YCBvciBgSHR0cFJlc3BvbnNlYC5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB0cmFuc2Zvcm0gdGhlIG91dGdvaW5nIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgYnkgY2FsbGluZyBgbmV4dC5oYW5kbGUodHJhbnNmb3JtZWRSZXEpYC5cbiAqIEFuIGludGVyY2VwdG9yIG1heSB0cmFuc2Zvcm0gdGhlXG4gKiByZXNwb25zZSBldmVudCBzdHJlYW0gYXMgd2VsbCwgYnkgYXBwbHlpbmcgYWRkaXRpb25hbCBSeEpTIG9wZXJhdG9ycyBvbiB0aGUgc3RyZWFtXG4gKiByZXR1cm5lZCBieSBgbmV4dC5oYW5kbGUoKWAuXG4gKlxuICogTW9yZSByYXJlbHksIGFuIGludGVyY2VwdG9yIG1heSBoYW5kbGUgdGhlIHJlcXVlc3QgZW50aXJlbHksXG4gKiBhbmQgY29tcG9zZSBhIG5ldyBldmVudCBzdHJlYW0gaW5zdGVhZCBvZiBpbnZva2luZyBgbmV4dC5oYW5kbGUoKWAuIFRoaXMgaXMgYW5cbiAqIGFjY2VwdGFibGUgYmVoYXZpb3IsIGJ1dCBrZWVwIGluIG1pbmQgdGhhdCBmdXJ0aGVyIGludGVyY2VwdG9ycyB3aWxsIGJlIHNraXBwZWQgZW50aXJlbHkuXG4gKlxuICogSXQgaXMgYWxzbyByYXJlIGJ1dCB2YWxpZCBmb3IgYW4gaW50ZXJjZXB0b3IgdG8gcmV0dXJuIG11bHRpcGxlIHJlc3BvbnNlcyBvbiB0aGVcbiAqIGV2ZW50IHN0cmVhbSBmb3IgYSBzaW5nbGUgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqIEBzZWUge0BsaW5rIEh0dHBJbnRlcmNlcHRvckZufVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGBIdHRwSW50ZXJjZXB0b3JzYCBmb3IgdGhlIGVudGlyZSBhcHAsIGltcG9ydCB0aGUgYEh0dHBDbGllbnRNb2R1bGVgXG4gKiBvbmx5IGluIHlvdXIgYEFwcE1vZHVsZWAsIGFuZCBhZGQgdGhlIGludGVyY2VwdG9ycyB0byB0aGUgcm9vdCBhcHBsaWNhdGlvbiBpbmplY3Rvci5cbiAqIElmIHlvdSBpbXBvcnQgYEh0dHBDbGllbnRNb2R1bGVgIG11bHRpcGxlIHRpbWVzIGFjcm9zcyBkaWZmZXJlbnQgbW9kdWxlcyAoZm9yIGV4YW1wbGUsIGluIGxhenlcbiAqIGxvYWRpbmcgbW9kdWxlcyksIGVhY2ggaW1wb3J0IGNyZWF0ZXMgYSBuZXcgY29weSBvZiB0aGUgYEh0dHBDbGllbnRNb2R1bGVgLCB3aGljaCBvdmVyd3JpdGVzIHRoZVxuICogaW50ZXJjZXB0b3JzIHByb3ZpZGVkIGluIHRoZSByb290IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEhUVFAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gYW4gaW50ZXJjZXB0b3IgY2hhaW4sIG9yIHRoZSByZWFsIGJhY2tlbmQgaWYgdGhlcmUgYXJlIG5vXG4gKiBmdXJ0aGVyIGludGVyY2VwdG9ycy5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGFuZCBlaXRoZXIgbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIHRoZVxuICogcmVzcG9uc2Ugd2hlbiBpdCBhcnJpdmVzLiBXaXRoaW4gdGhlIHNjb3BlIG9mIHRoZSBjdXJyZW50IHJlcXVlc3QsIGhvd2V2ZXIsIHRoaXMgZnVuY3Rpb24gbWF5IGJlXG4gKiBjYWxsZWQgYW55IG51bWJlciBvZiB0aW1lcywgZm9yIGFueSBudW1iZXIgb2YgZG93bnN0cmVhbSByZXF1ZXN0cy4gU3VjaCBkb3duc3RyZWFtIHJlcXVlc3RzIG5lZWRcbiAqIG5vdCBiZSB0byB0aGUgc2FtZSBVUkwgb3IgZXZlbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgcmVxdWVzdC4gSXQgaXMgYWxzbyB2YWxpZCB0byBub3RcbiAqIGNhbGwgdGhlIGRvd25zdHJlYW0gaGFuZGxlciBhdCBhbGwsIGFuZCBwcm9jZXNzIHRoZSBjdXJyZW50IHJlcXVlc3QgZW50aXJlbHkgd2l0aGluIHRoZVxuICogaW50ZXJjZXB0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aGluIHRoZSBzY29wZSBvZiB0aGUgcmVxdWVzdCB0aGF0J3MgY3VycmVudGx5IGJlaW5nXG4gKiBpbnRlcmNlcHRlZC4gT25jZSB0aGF0IHJlcXVlc3QgaXMgY29tcGxldGUsIHRoaXMgZG93bnN0cmVhbSBoYW5kbGVyIGZ1bmN0aW9uIHNob3VsZCBub3QgYmVcbiAqIGNhbGxlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEhhbmRsZXJGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogQW4gaW50ZXJjZXB0b3IgZm9yIEhUVFAgcmVxdWVzdHMgbWFkZSB2aWEgYEh0dHBDbGllbnRgLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyB3aGljaCBgSHR0cENsaWVudGAgY2FsbHMgd2hlbiBhIHJlcXVlc3QgaXMgbWFkZS5cbiAqIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIHRoZSBvcHBvcnR1bml0eSB0byBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgYW55IHJlc3BvbnNlIHRoYXQgY29tZXNcbiAqIGJhY2ssIGFzIHdlbGwgYXMgYmxvY2ssIHJlZGlyZWN0LCBvciBvdGhlcndpc2UgY2hhbmdlIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlIHNlbWFudGljcy5cbiAqXG4gKiBBbiBgSHR0cEhhbmRsZXJGbmAgcmVwcmVzZW50aW5nIHRoZSBuZXh0IGludGVyY2VwdG9yIChvciB0aGUgYmFja2VuZCB3aGljaCB3aWxsIG1ha2UgYSByZWFsIEhUVFBcbiAqIHJlcXVlc3QpIGlzIHByb3ZpZGVkLiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGJ1dCB0aGF0IGlzIG5vdCByZXF1aXJlZFxuICogKHNlZSBgSHR0cEhhbmRsZXJGbmAgZm9yIG1vcmUgZGV0YWlscykuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIGV4ZWN1dGVkIGluIGFuIFtpbmplY3Rpb24gY29udGV4dF0oL2d1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uLWNvbnRleHQpLlxuICogVGhleSBoYXZlIGFjY2VzcyB0byBgaW5qZWN0KClgIHZpYSB0aGUgYEVudmlyb25tZW50SW5qZWN0b3JgIGZyb20gd2hpY2ggdGhleSB3ZXJlIGNvbmZpZ3VyZWQuXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqIEBzZWUge0BsaW5rIHdpdGhJbnRlcmNlcHRvcnN9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEhlcmUgaXMgYSBub29wIGludGVyY2VwdG9yIHRoYXQgcGFzc2VzIHRoZSByZXF1ZXN0IHRocm91Z2ggd2l0aG91dCBtb2RpZnlpbmcgaXQ6XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3Qgbm9vcEludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKlxuICogSWYgeW91IHdhbnQgdG8gYWx0ZXIgYSByZXF1ZXN0LCBjbG9uZSBpdCBmaXJzdCBhbmQgbW9kaWZ5IHRoZSBjbG9uZSBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIGBuZXh0KClgIGhhbmRsZXIgZnVuY3Rpb24uXG4gKlxuICogSGVyZSBpcyBhIGJhc2ljIGludGVyY2VwdG9yIHRoYXQgYWRkcyBhIGJlYXJlciB0b2tlbiB0byB0aGUgaGVhZGVyc1xuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IGF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgICBjb25zdCB1c2VyVG9rZW4gPSAnTVlfVE9LRU4nOyBjb25zdCBtb2RpZmllZFJlcSA9IHJlcS5jbG9uZSh7XG4gKiAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyVG9rZW59YCksXG4gKiAgICB9KTtcbiAqXG4gKiAgICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBJbnRlcmNlcHRvckZuID0gKFxuICByZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LFxuICBuZXh0OiBIdHRwSGFuZGxlckZuLFxuKSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaW52b2tlcyBhbiBIVFRQIGludGVyY2VwdG9yIGNoYWluLlxuICpcbiAqIEVhY2ggaW50ZXJjZXB0b3IgaW4gdGhlIGludGVyY2VwdG9yIGNoYWluIGlzIHR1cm5lZCBpbnRvIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBjbG9zZXNcbiAqIG92ZXIgdGhlIHJlc3Qgb2YgdGhlIGNoYWluIChyZXByZXNlbnRlZCBieSBhbm90aGVyIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmApLiBUaGUgbGFzdCBzdWNoXG4gKiBmdW5jdGlvbiBpbiB0aGUgY2hhaW4gd2lsbCBpbnN0ZWFkIGRlbGVnYXRlIHRvIHRoZSBgZmluYWxIYW5kbGVyRm5gLCB3aGljaCBpcyBwYXNzZWQgZG93biB3aGVuXG4gKiB0aGUgY2hhaW4gaXMgaW52b2tlZC5cbiAqXG4gKiBUaGlzIHBhdHRlcm4gYWxsb3dzIGZvciBhIGNoYWluIG9mIG1hbnkgaW50ZXJjZXB0b3JzIHRvIGJlIGNvbXBvc2VkIGFuZCB3cmFwcGVkIGluIGEgc2luZ2xlXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gLCB3aGljaCBpcyBhIHVzZWZ1bCBhYnN0cmFjdGlvbiBmb3IgaW5jbHVkaW5nIGRpZmZlcmVudCBraW5kcyBvZiBpbnRlcmNlcHRvcnNcbiAqIChlLmcuIGxlZ2FjeSBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMpIGluIHRoZSBzYW1lIGNoYWluLlxuICovXG50eXBlIENoYWluZWRJbnRlcmNlcHRvckZuPFJlcXVlc3RUPiA9IChcbiAgcmVxOiBIdHRwUmVxdWVzdDxSZXF1ZXN0VD4sXG4gIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuLFxuKSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDxSZXF1ZXN0VD4+O1xuXG5mdW5jdGlvbiBpbnRlcmNlcHRvckNoYWluRW5kRm4oXG4gIHJlcTogSHR0cFJlcXVlc3Q8YW55PixcbiAgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4sXG4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gIHJldHVybiBmaW5hbEhhbmRsZXJGbihyZXEpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGFkYXB0cyBhIGxlZ2FjeSBgSHR0cEludGVyY2VwdG9yYCB0byB0aGVcbiAqIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgaW50ZXJmYWNlLlxuICovXG5mdW5jdGlvbiBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbihcbiAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4sXG4gIGludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3IsXG4pOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHtcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+XG4gICAgaW50ZXJjZXB0b3IuaW50ZXJjZXB0KGluaXRpYWxSZXF1ZXN0LCB7XG4gICAgICBoYW5kbGU6IChkb3duc3RyZWFtUmVxdWVzdCkgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCB3cmFwcyBhbmQgaW52b2tlcyBhIGZ1bmN0aW9uYWwgaW50ZXJjZXB0b3IgaW4gdGhlIGdpdmVuXG4gKiBpbmplY3Rvci5cbiAqL1xuZnVuY3Rpb24gY2hhaW5lZEludGVyY2VwdG9yRm4oXG4gIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPixcbiAgaW50ZXJjZXB0b3JGbjogSHR0cEludGVyY2VwdG9yRm4sXG4gIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuKTogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4ge1xuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHJldHVybiAoaW5pdGlhbFJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSA9PlxuICAgIHJ1bkluSW5qZWN0aW9uQ29udGV4dChpbmplY3RvciwgKCkgPT5cbiAgICAgIGludGVyY2VwdG9yRm4oaW5pdGlhbFJlcXVlc3QsIChkb3duc3RyZWFtUmVxdWVzdCkgPT5cbiAgICAgICAgY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSxcbiAgICAgICksXG4gICAgKTtcbiAgLy8gY2xhbmctZm9ybWF0IG9uXG59XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlciB0b2tlbiB0aGF0IHJlcHJlc2VudHMgdGhlIGFycmF5IG9mIHJlZ2lzdGVyZWRcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIG9iamVjdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yW10+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUlMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihcbiAgbmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JfRk5TJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzIHRoYXQgYXJlIG9ubHkgc2V0IGluIHJvb3QuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TID0gbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyxcbik7XG5cbi8qKlxuICogQSBwcm92aWRlciB0byBzZXQgYSBnbG9iYWwgcHJpbWFyeSBodHRwIGJhY2tlbmQuIElmIHNldCwgaXQgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvbmVcbiAqL1xuZXhwb3J0IGNvbnN0IFBSSU1BUllfSFRUUF9CQUNLRU5EID0gbmV3IEluamVjdGlvblRva2VuPEh0dHBCYWNrZW5kPihcbiAgbmdEZXZNb2RlID8gJ1BSSU1BUllfSFRUUF9CQUNLRU5EJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuIGBIdHRwSW50ZXJjZXB0b3JGbmAgd2hpY2ggbGF6aWx5IGluaXRpYWxpemVzIGFuIGludGVyY2VwdG9yIGNoYWluIGZyb20gdGhlIGxlZ2FjeVxuICogY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzIGFuZCBydW5zIHRoZSByZXF1ZXN0IHRocm91Z2ggaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZWdhY3lJbnRlcmNlcHRvckZuRmFjdG9yeSgpOiBIdHRwSW50ZXJjZXB0b3JGbiB7XG4gIGxldCBjaGFpbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PiB8IG51bGwgPSBudWxsO1xuXG4gIHJldHVybiAocmVxLCBoYW5kbGVyKSA9PiB7XG4gICAgaWYgKGNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBpbmplY3QoSFRUUF9JTlRFUkNFUFRPUlMsIHtvcHRpb25hbDogdHJ1ZX0pID8/IFtdO1xuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBpbnRlcmNlcHRvcnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIGNoYWluID0gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgICBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbixcbiAgICAgICAgaW50ZXJjZXB0b3JDaGFpbkVuZEZuIGFzIENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4sXG4gICAgICApO1xuICAgIH1cblxuICAgIGNvbnN0IHBlbmRpbmdUYXNrcyA9IGluamVjdChQZW5kaW5nVGFza3MpO1xuICAgIGNvbnN0IHRhc2tJZCA9IHBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKS5waXBlKGZpbmFsaXplKCgpID0+IHBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9O1xufVxuXG5sZXQgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IGZhbHNlO1xuXG4vKiogSW50ZXJuYWwgZnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZsYWcgaW4gdGVzdHMgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEZldGNoQmFja2VuZFdhcm5pbmdGbGFnKCkge1xuICBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyIGV4dGVuZHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiB8IG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbmRpbmdUYXNrcyA9IGluamVjdChQZW5kaW5nVGFza3MpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYmFja2VuZDogSHR0cEJhY2tlbmQsXG4gICAgcHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcHJlZmVycmVkIEhUVFAgYmFja2VuZCBjb25maWd1cmVkIGFuZCB1c2UgaXQgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGVuYWJsZSBgRmV0Y2hCYWNrZW5kYCBnbG9iYWxseSBmb3IgYWxsIEh0dHBDbGllbnQncyB3aGVuIGB3aXRoRmV0Y2hgXG4gICAgLy8gaXMgdXNlZC5cbiAgICBjb25zdCBwcmltYXJ5SHR0cEJhY2tlbmQgPSBpbmplY3QoUFJJTUFSWV9IVFRQX0JBQ0tFTkQsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIHRoaXMuYmFja2VuZCA9IHByaW1hcnlIdHRwQmFja2VuZCA/PyBiYWNrZW5kO1xuXG4gICAgLy8gV2Ugc3Ryb25nbHkgcmVjb21tZW5kIHVzaW5nIGZldGNoIGJhY2tlbmQgZm9yIEhUVFAgY2FsbHMgd2hlbiBTU1IgaXMgdXNlZFxuICAgIC8vIGZvciBhbiBhcHBsaWNhdGlvbi4gVGhlIGxvZ2ljIGJlbG93IGNoZWNrcyBpZiB0aGF0J3MgdGhlIGNhc2UgYW5kIHByb2R1Y2VzXG4gICAgLy8gYSB3YXJuaW5nIG90aGVyd2lzZS5cbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgIWZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQpIHtcbiAgICAgIGNvbnN0IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3Rvci5nZXQoUExBVEZPUk1fSUQpKTtcbiAgICAgIGlmIChpc1NlcnZlciAmJiAhKHRoaXMuYmFja2VuZCBpbnN0YW5jZW9mIEZldGNoQmFja2VuZCkpIHtcbiAgICAgICAgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIGluamVjdG9yXG4gICAgICAgICAgLmdldChDb25zb2xlKVxuICAgICAgICAgIC53YXJuKFxuICAgICAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk5PVF9VU0lOR19GRVRDSF9CQUNLRU5EX0lOX1NTUixcbiAgICAgICAgICAgICAgJ0FuZ3VsYXIgZGV0ZWN0ZWQgdGhhdCBgSHR0cENsaWVudGAgaXMgbm90IGNvbmZpZ3VyZWQgJyArXG4gICAgICAgICAgICAgICAgXCJ0byB1c2UgYGZldGNoYCBBUElzLiBJdCdzIHN0cm9uZ2x5IHJlY29tbWVuZGVkIHRvIFwiICtcbiAgICAgICAgICAgICAgICAnZW5hYmxlIGBmZXRjaGAgZm9yIGFwcGxpY2F0aW9ucyB0aGF0IHVzZSBTZXJ2ZXItU2lkZSBSZW5kZXJpbmcgJyArXG4gICAgICAgICAgICAgICAgJ2ZvciBiZXR0ZXIgcGVyZm9ybWFuY2UgYW5kIGNvbXBhdGliaWxpdHkuICcgK1xuICAgICAgICAgICAgICAgICdUbyBlbmFibGUgYGZldGNoYCwgYWRkIHRoZSBgd2l0aEZldGNoKClgIHRvIHRoZSBgcHJvdmlkZUh0dHBDbGllbnQoKWAgJyArXG4gICAgICAgICAgICAgICAgJ2NhbGwgYXQgdGhlIHJvb3Qgb2YgdGhlIGFwcGxpY2F0aW9uLicsXG4gICAgICAgICAgICApLFxuICAgICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgaGFuZGxlKGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBkZWR1cGVkSW50ZXJjZXB0b3JGbnMgPSBBcnJheS5mcm9tKFxuICAgICAgICBuZXcgU2V0KFtcbiAgICAgICAgICAuLi50aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SX0ZOUyksXG4gICAgICAgICAgLi4udGhpcy5pbmplY3Rvci5nZXQoSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUywgW10pLFxuICAgICAgICBdKSxcbiAgICAgICk7XG5cbiAgICAgIC8vIE5vdGU6IGludGVyY2VwdG9ycyBhcmUgd3JhcHBlZCByaWdodC10by1sZWZ0IHNvIHRoYXQgZmluYWwgZXhlY3V0aW9uIG9yZGVyIGlzXG4gICAgICAvLyBsZWZ0LXRvLXJpZ2h0LiBUaGF0IGlzLCBpZiBgZGVkdXBlZEludGVyY2VwdG9yRm5zYCBpcyB0aGUgYXJyYXkgYFthLCBiLCBjXWAsIHdlIHdhbnQgdG9cbiAgICAgIC8vIHByb2R1Y2UgYSBjaGFpbiB0aGF0IGlzIGNvbmNlcHR1YWxseSBgYyhiKGEoZW5kKSkpYCwgd2hpY2ggd2UgYnVpbGQgZnJvbSB0aGUgaW5zaWRlXG4gICAgICAvLyBvdXQuXG4gICAgICB0aGlzLmNoYWluID0gZGVkdXBlZEludGVyY2VwdG9yRm5zLnJlZHVjZVJpZ2h0KFxuICAgICAgICAobmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuKSA9PlxuICAgICAgICAgIGNoYWluZWRJbnRlcmNlcHRvckZuKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbiwgdGhpcy5pbmplY3RvciksXG4gICAgICAgIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIChkb3duc3RyZWFtUmVxdWVzdCkgPT5cbiAgICAgIHRoaXMuYmFja2VuZC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpLFxuICAgICkucGlwZShmaW5hbGl6ZSgoKSA9PiB0aGlzLnBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9XG59XG4iXX0=