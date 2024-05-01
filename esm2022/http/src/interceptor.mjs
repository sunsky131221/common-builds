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
// TODO(atscott): We need a larger discussion about stability and what should contribute to stability.
// Should the whole interceptor chain contribute to stability or just the backend request #55075?
// Should HttpClient contribute to stability automatically at all?
export const REQUESTS_CONTRIBUTE_TO_STABILITY = new InjectionToken(ngDevMode ? 'REQUESTS_CONTRIBUTE_TO_STABILITY' : '', { providedIn: 'root', factory: () => true });
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
        const contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);
        if (contributeToStability) {
            const taskId = pendingTasks.add();
            return chain(req, handler).pipe(finalize(() => pendingTasks.remove(taskId)));
        }
        else {
            return chain(req, handler);
        }
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
        this.contributeToStability = inject(REQUESTS_CONTRIBUTE_TO_STABILITY);
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
        if (this.contributeToStability) {
            const taskId = this.pendingTasks.add();
            return this.chain(initialRequest, (downstreamRequest) => this.backend.handle(downstreamRequest)).pipe(finalize(() => this.pendingTasks.remove(taskId)));
        }
        else {
            return this.chain(initialRequest, (downstreamRequest) => this.backend.handle(downstreamRequest));
        }
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-next.6+sha-78e4af0", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-next.6+sha-78e4af0", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-next.6+sha-78e4af0", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQzs7O0FBZ0lyQyxTQUFTLHFCQUFxQixDQUM1QixHQUFxQixFQUNyQixjQUE2QjtJQUU3QixPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDcEMsV0FBc0MsRUFDdEMsV0FBNEI7SUFFNUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUN4QyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUNwQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsV0FBMEMsRUFDMUMsYUFBZ0MsRUFDaEMsUUFBNkI7SUFF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O3lIQXZFVSxzQkFBc0I7NkhBQXRCLHNCQUFzQjs7c0dBQXRCLHNCQUFzQjtrQkFEbEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG5pbXBvcnQge1xuICBFbnZpcm9ubWVudEluamVjdG9yLFxuICBpbmplY3QsXG4gIEluamVjdGFibGUsXG4gIEluamVjdGlvblRva2VuLFxuICBQTEFURk9STV9JRCxcbiAgcnVuSW5JbmplY3Rpb25Db250ZXh0LFxuICDJtUNvbnNvbGUgYXMgQ29uc29sZSxcbiAgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLFxuICDJtVBlbmRpbmdUYXNrcyBhcyBQZW5kaW5nVGFza3MsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmluYWxpemV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7RmV0Y2hCYWNrZW5kfSBmcm9tICcuL2ZldGNoJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8qKlxuICogSW50ZXJjZXB0cyBhbmQgaGFuZGxlcyBhbiBgSHR0cFJlcXVlc3RgIG9yIGBIdHRwUmVzcG9uc2VgLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHRyYW5zZm9ybSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBieSBjYWxsaW5nIGBuZXh0LmhhbmRsZSh0cmFuc2Zvcm1lZFJlcSlgLlxuICogQW4gaW50ZXJjZXB0b3IgbWF5IHRyYW5zZm9ybSB0aGVcbiAqIHJlc3BvbnNlIGV2ZW50IHN0cmVhbSBhcyB3ZWxsLCBieSBhcHBseWluZyBhZGRpdGlvbmFsIFJ4SlMgb3BlcmF0b3JzIG9uIHRoZSBzdHJlYW1cbiAqIHJldHVybmVkIGJ5IGBuZXh0LmhhbmRsZSgpYC5cbiAqXG4gKiBNb3JlIHJhcmVseSwgYW4gaW50ZXJjZXB0b3IgbWF5IGhhbmRsZSB0aGUgcmVxdWVzdCBlbnRpcmVseSxcbiAqIGFuZCBjb21wb3NlIGEgbmV3IGV2ZW50IHN0cmVhbSBpbnN0ZWFkIG9mIGludm9raW5nIGBuZXh0LmhhbmRsZSgpYC4gVGhpcyBpcyBhblxuICogYWNjZXB0YWJsZSBiZWhhdmlvciwgYnV0IGtlZXAgaW4gbWluZCB0aGF0IGZ1cnRoZXIgaW50ZXJjZXB0b3JzIHdpbGwgYmUgc2tpcHBlZCBlbnRpcmVseS5cbiAqXG4gKiBJdCBpcyBhbHNvIHJhcmUgYnV0IHZhbGlkIGZvciBhbiBpbnRlcmNlcHRvciB0byByZXR1cm4gbXVsdGlwbGUgcmVzcG9uc2VzIG9uIHRoZVxuICogZXZlbnQgc3RyZWFtIGZvciBhIHNpbmdsZSByZXF1ZXN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwL2ludGVyY2VwdG9ycylcbiAqIEBzZWUge0BsaW5rIEh0dHBJbnRlcmNlcHRvckZufVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGBIdHRwSW50ZXJjZXB0b3JzYCBmb3IgdGhlIGVudGlyZSBhcHAsIGltcG9ydCB0aGUgYEh0dHBDbGllbnRNb2R1bGVgXG4gKiBvbmx5IGluIHlvdXIgYEFwcE1vZHVsZWAsIGFuZCBhZGQgdGhlIGludGVyY2VwdG9ycyB0byB0aGUgcm9vdCBhcHBsaWNhdGlvbiBpbmplY3Rvci5cbiAqIElmIHlvdSBpbXBvcnQgYEh0dHBDbGllbnRNb2R1bGVgIG11bHRpcGxlIHRpbWVzIGFjcm9zcyBkaWZmZXJlbnQgbW9kdWxlcyAoZm9yIGV4YW1wbGUsIGluIGxhenlcbiAqIGxvYWRpbmcgbW9kdWxlcyksIGVhY2ggaW1wb3J0IGNyZWF0ZXMgYSBuZXcgY29weSBvZiB0aGUgYEh0dHBDbGllbnRNb2R1bGVgLCB3aGljaCBvdmVyd3JpdGVzIHRoZVxuICogaW50ZXJjZXB0b3JzIHByb3ZpZGVkIGluIHRoZSByb290IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEhUVFAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gYW4gaW50ZXJjZXB0b3IgY2hhaW4sIG9yIHRoZSByZWFsIGJhY2tlbmQgaWYgdGhlcmUgYXJlIG5vXG4gKiBmdXJ0aGVyIGludGVyY2VwdG9ycy5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGFuZCBlaXRoZXIgbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIHRoZVxuICogcmVzcG9uc2Ugd2hlbiBpdCBhcnJpdmVzLiBXaXRoaW4gdGhlIHNjb3BlIG9mIHRoZSBjdXJyZW50IHJlcXVlc3QsIGhvd2V2ZXIsIHRoaXMgZnVuY3Rpb24gbWF5IGJlXG4gKiBjYWxsZWQgYW55IG51bWJlciBvZiB0aW1lcywgZm9yIGFueSBudW1iZXIgb2YgZG93bnN0cmVhbSByZXF1ZXN0cy4gU3VjaCBkb3duc3RyZWFtIHJlcXVlc3RzIG5lZWRcbiAqIG5vdCBiZSB0byB0aGUgc2FtZSBVUkwgb3IgZXZlbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgcmVxdWVzdC4gSXQgaXMgYWxzbyB2YWxpZCB0byBub3RcbiAqIGNhbGwgdGhlIGRvd25zdHJlYW0gaGFuZGxlciBhdCBhbGwsIGFuZCBwcm9jZXNzIHRoZSBjdXJyZW50IHJlcXVlc3QgZW50aXJlbHkgd2l0aGluIHRoZVxuICogaW50ZXJjZXB0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aGluIHRoZSBzY29wZSBvZiB0aGUgcmVxdWVzdCB0aGF0J3MgY3VycmVudGx5IGJlaW5nXG4gKiBpbnRlcmNlcHRlZC4gT25jZSB0aGF0IHJlcXVlc3QgaXMgY29tcGxldGUsIHRoaXMgZG93bnN0cmVhbSBoYW5kbGVyIGZ1bmN0aW9uIHNob3VsZCBub3QgYmVcbiAqIGNhbGxlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC9pbnRlcmNlcHRvcnMpXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBIYW5kbGVyRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPikgPT4gT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+O1xuXG4vKipcbiAqIEFuIGludGVyY2VwdG9yIGZvciBIVFRQIHJlcXVlc3RzIG1hZGUgdmlhIGBIdHRwQ2xpZW50YC5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBhcmUgbWlkZGxld2FyZSBmdW5jdGlvbnMgd2hpY2ggYEh0dHBDbGllbnRgIGNhbGxzIHdoZW4gYSByZXF1ZXN0IGlzIG1hZGUuXG4gKiBUaGVzZSBmdW5jdGlvbnMgaGF2ZSB0aGUgb3Bwb3J0dW5pdHkgdG8gbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIGFueSByZXNwb25zZSB0aGF0IGNvbWVzXG4gKiBiYWNrLCBhcyB3ZWxsIGFzIGJsb2NrLCByZWRpcmVjdCwgb3Igb3RoZXJ3aXNlIGNoYW5nZSB0aGUgcmVxdWVzdCBvciByZXNwb25zZSBzZW1hbnRpY3MuXG4gKlxuICogQW4gYEh0dHBIYW5kbGVyRm5gIHJlcHJlc2VudGluZyB0aGUgbmV4dCBpbnRlcmNlcHRvciAob3IgdGhlIGJhY2tlbmQgd2hpY2ggd2lsbCBtYWtlIGEgcmVhbCBIVFRQXG4gKiByZXF1ZXN0KSBpcyBwcm92aWRlZC4gTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBidXQgdGhhdCBpcyBub3QgcmVxdWlyZWRcbiAqIChzZWUgYEh0dHBIYW5kbGVyRm5gIGZvciBtb3JlIGRldGFpbHMpLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBleGVjdXRlZCBpbiBhbiBbaW5qZWN0aW9uIGNvbnRleHRdKGd1aWRlL2RpL2RlcGVuZGVuY3ktaW5qZWN0aW9uLWNvbnRleHQpLlxuICogVGhleSBoYXZlIGFjY2VzcyB0byBgaW5qZWN0KClgIHZpYSB0aGUgYEVudmlyb25tZW50SW5qZWN0b3JgIGZyb20gd2hpY2ggdGhleSB3ZXJlIGNvbmZpZ3VyZWQuXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC9pbnRlcmNlcHRvcnMpXG4gKiBAc2VlIHtAbGluayB3aXRoSW50ZXJjZXB0b3JzfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBIZXJlIGlzIGEgbm9vcCBpbnRlcmNlcHRvciB0aGF0IHBhc3NlcyB0aGUgcmVxdWVzdCB0aHJvdWdoIHdpdGhvdXQgbW9kaWZ5aW5nIGl0OlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IG5vb3BJbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDpcbiAqIEh0dHBIYW5kbGVyRm4pID0+IHtcbiAqICAgcmV0dXJuIG5leHQobW9kaWZpZWRSZXEpO1xuICogfTtcbiAqIGBgYFxuICpcbiAqIElmIHlvdSB3YW50IHRvIGFsdGVyIGEgcmVxdWVzdCwgY2xvbmUgaXQgZmlyc3QgYW5kIG1vZGlmeSB0aGUgY2xvbmUgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBgbmV4dCgpYCBoYW5kbGVyIGZ1bmN0aW9uLlxuICpcbiAqIEhlcmUgaXMgYSBiYXNpYyBpbnRlcmNlcHRvciB0aGF0IGFkZHMgYSBiZWFyZXIgdG9rZW4gdG8gdGhlIGhlYWRlcnNcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBhdXRoZW50aWNhdGlvbkludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICAgY29uc3QgdXNlclRva2VuID0gJ01ZX1RPS0VOJzsgY29uc3QgbW9kaWZpZWRSZXEgPSByZXEuY2xvbmUoe1xuICogICAgICBoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQoJ0F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dXNlclRva2VufWApLFxuICogICAgfSk7XG4gKlxuICogICAgcmV0dXJuIG5leHQobW9kaWZpZWRSZXEpO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBIdHRwSW50ZXJjZXB0b3JGbiA9IChcbiAgcmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPixcbiAgbmV4dDogSHR0cEhhbmRsZXJGbixcbikgPT4gT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHdoaWNoIGludm9rZXMgYW4gSFRUUCBpbnRlcmNlcHRvciBjaGFpbi5cbiAqXG4gKiBFYWNoIGludGVyY2VwdG9yIGluIHRoZSBpbnRlcmNlcHRvciBjaGFpbiBpcyB0dXJuZWQgaW50byBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggY2xvc2VzXG4gKiBvdmVyIHRoZSByZXN0IG9mIHRoZSBjaGFpbiAocmVwcmVzZW50ZWQgYnkgYW5vdGhlciBgQ2hhaW5lZEludGVyY2VwdG9yRm5gKS4gVGhlIGxhc3Qgc3VjaFxuICogZnVuY3Rpb24gaW4gdGhlIGNoYWluIHdpbGwgaW5zdGVhZCBkZWxlZ2F0ZSB0byB0aGUgYGZpbmFsSGFuZGxlckZuYCwgd2hpY2ggaXMgcGFzc2VkIGRvd24gd2hlblxuICogdGhlIGNoYWluIGlzIGludm9rZWQuXG4gKlxuICogVGhpcyBwYXR0ZXJuIGFsbG93cyBmb3IgYSBjaGFpbiBvZiBtYW55IGludGVyY2VwdG9ycyB0byBiZSBjb21wb3NlZCBhbmQgd3JhcHBlZCBpbiBhIHNpbmdsZVxuICogYEh0dHBJbnRlcmNlcHRvckZuYCwgd2hpY2ggaXMgYSB1c2VmdWwgYWJzdHJhY3Rpb24gZm9yIGluY2x1ZGluZyBkaWZmZXJlbnQga2luZHMgb2YgaW50ZXJjZXB0b3JzXG4gKiAoZS5nLiBsZWdhY3kgY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzKSBpbiB0aGUgc2FtZSBjaGFpbi5cbiAqL1xudHlwZSBDaGFpbmVkSW50ZXJjZXB0b3JGbjxSZXF1ZXN0VD4gPSAoXG4gIHJlcTogSHR0cFJlcXVlc3Q8UmVxdWVzdFQ+LFxuICBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbixcbikgPT4gT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8UmVxdWVzdFQ+PjtcblxuZnVuY3Rpb24gaW50ZXJjZXB0b3JDaGFpbkVuZEZuKFxuICByZXE6IEh0dHBSZXF1ZXN0PGFueT4sXG4gIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuLFxuKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICByZXR1cm4gZmluYWxIYW5kbGVyRm4ocmVxKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBhZGFwdHMgYSBsZWdhY3kgYEh0dHBJbnRlcmNlcHRvcmAgdG8gdGhlXG4gKiBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIGludGVyZmFjZS5cbiAqL1xuZnVuY3Rpb24gYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4oXG4gIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+LFxuICBpbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yLFxuKTogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PiB7XG4gIHJldHVybiAoaW5pdGlhbFJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSA9PlxuICAgIGludGVyY2VwdG9yLmludGVyY2VwdChpbml0aWFsUmVxdWVzdCwge1xuICAgICAgaGFuZGxlOiAoZG93bnN0cmVhbVJlcXVlc3QpID0+IGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbiksXG4gICAgfSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggd3JhcHMgYW5kIGludm9rZXMgYSBmdW5jdGlvbmFsIGludGVyY2VwdG9yIGluIHRoZSBnaXZlblxuICogaW5qZWN0b3IuXG4gKi9cbmZ1bmN0aW9uIGNoYWluZWRJbnRlcmNlcHRvckZuKFxuICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4sXG4gIGludGVyY2VwdG9yRm46IEh0dHBJbnRlcmNlcHRvckZuLFxuICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcixcbik6IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHtcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT5cbiAgICBydW5JbkluamVjdGlvbkNvbnRleHQoaW5qZWN0b3IsICgpID0+XG4gICAgICBpbnRlcmNlcHRvckZuKGluaXRpYWxSZXF1ZXN0LCAoZG93bnN0cmVhbVJlcXVlc3QpID0+XG4gICAgICAgIGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbiksXG4gICAgICApLFxuICAgICk7XG4gIC8vIGNsYW5nLWZvcm1hdCBvblxufVxuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZXIgdG9rZW4gdGhhdCByZXByZXNlbnRzIHRoZSBhcnJheSBvZiByZWdpc3RlcmVkXG4gKiBgSHR0cEludGVyY2VwdG9yYCBvYmplY3RzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfSU5URVJDRVBUT1JTID0gbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvcltdPihcbiAgbmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JTJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzLlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUl9GTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yRm5bXT4oXG4gIG5nRGV2TW9kZSA/ICdIVFRQX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyxcbik7XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlZCB0b2tlbiBvZiBgSHR0cEludGVyY2VwdG9yRm5gcyB0aGF0IGFyZSBvbmx5IHNldCBpbiByb290LlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihcbiAgbmdEZXZNb2RlID8gJ0hUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgcHJvdmlkZXIgdG8gc2V0IGEgZ2xvYmFsIHByaW1hcnkgaHR0cCBiYWNrZW5kLiBJZiBzZXQsIGl0IHdpbGwgb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb25lXG4gKi9cbmV4cG9ydCBjb25zdCBQUklNQVJZX0hUVFBfQkFDS0VORCA9IG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwQmFja2VuZD4oXG4gIG5nRGV2TW9kZSA/ICdQUklNQVJZX0hUVFBfQkFDS0VORCcgOiAnJyxcbik7XG5cbi8vIFRPRE8oYXRzY290dCk6IFdlIG5lZWQgYSBsYXJnZXIgZGlzY3Vzc2lvbiBhYm91dCBzdGFiaWxpdHkgYW5kIHdoYXQgc2hvdWxkIGNvbnRyaWJ1dGUgdG8gc3RhYmlsaXR5LlxuLy8gU2hvdWxkIHRoZSB3aG9sZSBpbnRlcmNlcHRvciBjaGFpbiBjb250cmlidXRlIHRvIHN0YWJpbGl0eSBvciBqdXN0IHRoZSBiYWNrZW5kIHJlcXVlc3QgIzU1MDc1P1xuLy8gU2hvdWxkIEh0dHBDbGllbnQgY29udHJpYnV0ZSB0byBzdGFiaWxpdHkgYXV0b21hdGljYWxseSBhdCBhbGw/XG5leHBvcnQgY29uc3QgUkVRVUVTVFNfQ09OVFJJQlVURV9UT19TVEFCSUxJVFkgPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oXG4gIG5nRGV2TW9kZSA/ICdSRVFVRVNUU19DT05UUklCVVRFX1RPX1NUQUJJTElUWScgOiAnJyxcbiAge3Byb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogKCkgPT4gdHJ1ZX0sXG4pO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYEh0dHBJbnRlcmNlcHRvckZuYCB3aGljaCBsYXppbHkgaW5pdGlhbGl6ZXMgYW4gaW50ZXJjZXB0b3IgY2hhaW4gZnJvbSB0aGUgbGVnYWN5XG4gKiBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMgYW5kIHJ1bnMgdGhlIHJlcXVlc3QgdGhyb3VnaCBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5KCk6IEh0dHBJbnRlcmNlcHRvckZuIHtcbiAgbGV0IGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIChyZXEsIGhhbmRsZXIpID0+IHtcbiAgICBpZiAoY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGluamVjdChIVFRQX0lOVEVSQ0VQVE9SUywge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGludGVyY2VwdG9yc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluLFxuICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG4gICAgY29uc3QgY29udHJpYnV0ZVRvU3RhYmlsaXR5ID0gaW5qZWN0KFJFUVVFU1RTX0NPTlRSSUJVVEVfVE9fU1RBQklMSVRZKTtcbiAgICBpZiAoY29udHJpYnV0ZVRvU3RhYmlsaXR5KSB7XG4gICAgICBjb25zdCB0YXNrSWQgPSBwZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKS5waXBlKGZpbmFsaXplKCgpID0+IHBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKTtcbiAgICB9XG4gIH07XG59XG5cbmxldCBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG5cbi8qKiBJbnRlcm5hbCBmdW5jdGlvbiB0byByZXNldCB0aGUgZmxhZyBpbiB0ZXN0cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RmV0Y2hCYWNrZW5kV2FybmluZ0ZsYWcoKSB7XG4gIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSBmYWxzZTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIgZXh0ZW5kcyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29udHJpYnV0ZVRvU3RhYmlsaXR5ID0gaW5qZWN0KFJFUVVFU1RTX0NPTlRSSUJVVEVfVE9fU1RBQklMSVRZKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLFxuICAgIHByaXZhdGUgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHByZWZlcnJlZCBIVFRQIGJhY2tlbmQgY29uZmlndXJlZCBhbmQgdXNlIGl0IGlmIHRoYXQncyB0aGUgY2FzZS5cbiAgICAvLyBUaGlzIGlzIG5lZWRlZCB0byBlbmFibGUgYEZldGNoQmFja2VuZGAgZ2xvYmFsbHkgZm9yIGFsbCBIdHRwQ2xpZW50J3Mgd2hlbiBgd2l0aEZldGNoYFxuICAgIC8vIGlzIHVzZWQuXG4gICAgY29uc3QgcHJpbWFyeUh0dHBCYWNrZW5kID0gaW5qZWN0KFBSSU1BUllfSFRUUF9CQUNLRU5ELCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICB0aGlzLmJhY2tlbmQgPSBwcmltYXJ5SHR0cEJhY2tlbmQgPz8gYmFja2VuZDtcblxuICAgIC8vIFdlIHN0cm9uZ2x5IHJlY29tbWVuZCB1c2luZyBmZXRjaCBiYWNrZW5kIGZvciBIVFRQIGNhbGxzIHdoZW4gU1NSIGlzIHVzZWRcbiAgICAvLyBmb3IgYW4gYXBwbGljYXRpb24uIFRoZSBsb2dpYyBiZWxvdyBjaGVja3MgaWYgdGhhdCdzIHRoZSBjYXNlIGFuZCBwcm9kdWNlc1xuICAgIC8vIGEgd2FybmluZyBvdGhlcndpc2UuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICFmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkKSB7XG4gICAgICBjb25zdCBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lEKSk7XG4gICAgICBpZiAoaXNTZXJ2ZXIgJiYgISh0aGlzLmJhY2tlbmQgaW5zdGFuY2VvZiBGZXRjaEJhY2tlbmQpKSB7XG4gICAgICAgIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICBpbmplY3RvclxuICAgICAgICAgIC5nZXQoQ29uc29sZSlcbiAgICAgICAgICAud2FybihcbiAgICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5OT1RfVVNJTkdfRkVUQ0hfQkFDS0VORF9JTl9TU1IsXG4gICAgICAgICAgICAgICdBbmd1bGFyIGRldGVjdGVkIHRoYXQgYEh0dHBDbGllbnRgIGlzIG5vdCBjb25maWd1cmVkICcgK1xuICAgICAgICAgICAgICAgIFwidG8gdXNlIGBmZXRjaGAgQVBJcy4gSXQncyBzdHJvbmdseSByZWNvbW1lbmRlZCB0byBcIiArXG4gICAgICAgICAgICAgICAgJ2VuYWJsZSBgZmV0Y2hgIGZvciBhcHBsaWNhdGlvbnMgdGhhdCB1c2UgU2VydmVyLVNpZGUgUmVuZGVyaW5nICcgK1xuICAgICAgICAgICAgICAgICdmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBjb21wYXRpYmlsaXR5LiAnICtcbiAgICAgICAgICAgICAgICAnVG8gZW5hYmxlIGBmZXRjaGAsIGFkZCB0aGUgYHdpdGhGZXRjaCgpYCB0byB0aGUgYHByb3ZpZGVIdHRwQ2xpZW50KClgICcgK1xuICAgICAgICAgICAgICAgICdjYWxsIGF0IHRoZSByb290IG9mIHRoZSBhcHBsaWNhdGlvbi4nLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGhhbmRsZShpbml0aWFsUmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5jaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgZGVkdXBlZEludGVyY2VwdG9yRm5zID0gQXJyYXkuZnJvbShcbiAgICAgICAgbmV3IFNldChbXG4gICAgICAgICAgLi4udGhpcy5pbmplY3Rvci5nZXQoSFRUUF9JTlRFUkNFUFRPUl9GTlMpLFxuICAgICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMsIFtdKSxcbiAgICAgICAgXSksXG4gICAgICApO1xuXG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGRlZHVwZWRJbnRlcmNlcHRvckZuc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgdGhpcy5jaGFpbiA9IGRlZHVwZWRJbnRlcmNlcHRvckZucy5yZWR1Y2VSaWdodChcbiAgICAgICAgKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbikgPT5cbiAgICAgICAgICBjaGFpbmVkSW50ZXJjZXB0b3JGbihuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4sIHRoaXMuaW5qZWN0b3IpLFxuICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4sXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNvbnRyaWJ1dGVUb1N0YWJpbGl0eSkge1xuICAgICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFpbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgICB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSxcbiAgICAgICkucGlwZShmaW5hbGl6ZSgoKSA9PiB0aGlzLnBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFpbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgICB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=