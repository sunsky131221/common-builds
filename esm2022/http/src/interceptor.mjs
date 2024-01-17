/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformServer } from '@angular/common';
import { EnvironmentInjector, inject, Injectable, InjectionToken, PLATFORM_ID, runInInjectionContext, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵPendingTasks as PendingTasks } from '@angular/core';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.9+sha-23f19f8", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.9+sha-23f19f8", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.9+sha-23f19f8", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxRQUFRLElBQUksT0FBTyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFek4sT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRXhDLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBRW5ELE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxTQUFTLENBQUM7OztBQTRIckMsU0FBUyxxQkFBcUIsQ0FDMUIsR0FBcUIsRUFBRSxjQUE2QjtJQUN0RCxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDbEMsV0FBc0MsRUFDdEMsV0FBNEI7SUFDOUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsY0FBYyxFQUFFO1FBQy9FLE1BQU0sRUFBRSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUsY0FBYyxDQUFDO0tBQzlFLENBQUMsQ0FBQztBQUNMLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLG9CQUFvQixDQUN6QixXQUEwQyxFQUFFLGFBQWdDLEVBQzVFLFFBQTZCO0lBQy9CLG1CQUFt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QVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3pGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7eUhBcERVLHNCQUFzQjs2SEFBdEIsc0JBQXNCOztzR0FBdEIsc0JBQXNCO2tCQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUQsIHJ1bkluSW5qZWN0aW9uQ29udGV4dCwgybVDb25zb2xlIGFzIENvbnNvbGUsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVQZW5kaW5nVGFza3MgYXMgUGVuZGluZ1Rhc2tzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0ZldGNoQmFja2VuZH0gZnJvbSAnLi9mZXRjaCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vKipcbiAqIEludGVyY2VwdHMgYW5kIGhhbmRsZXMgYW4gYEh0dHBSZXF1ZXN0YCBvciBgSHR0cFJlc3BvbnNlYC5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB0cmFuc2Zvcm0gdGhlIG91dGdvaW5nIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgYnkgY2FsbGluZyBgbmV4dC5oYW5kbGUodHJhbnNmb3JtZWRSZXEpYC5cbiAqIEFuIGludGVyY2VwdG9yIG1heSB0cmFuc2Zvcm0gdGhlXG4gKiByZXNwb25zZSBldmVudCBzdHJlYW0gYXMgd2VsbCwgYnkgYXBwbHlpbmcgYWRkaXRpb25hbCBSeEpTIG9wZXJhdG9ycyBvbiB0aGUgc3RyZWFtXG4gKiByZXR1cm5lZCBieSBgbmV4dC5oYW5kbGUoKWAuXG4gKlxuICogTW9yZSByYXJlbHksIGFuIGludGVyY2VwdG9yIG1heSBoYW5kbGUgdGhlIHJlcXVlc3QgZW50aXJlbHksXG4gKiBhbmQgY29tcG9zZSBhIG5ldyBldmVudCBzdHJlYW0gaW5zdGVhZCBvZiBpbnZva2luZyBgbmV4dC5oYW5kbGUoKWAuIFRoaXMgaXMgYW5cbiAqIGFjY2VwdGFibGUgYmVoYXZpb3IsIGJ1dCBrZWVwIGluIG1pbmQgdGhhdCBmdXJ0aGVyIGludGVyY2VwdG9ycyB3aWxsIGJlIHNraXBwZWQgZW50aXJlbHkuXG4gKlxuICogSXQgaXMgYWxzbyByYXJlIGJ1dCB2YWxpZCBmb3IgYW4gaW50ZXJjZXB0b3IgdG8gcmV0dXJuIG11bHRpcGxlIHJlc3BvbnNlcyBvbiB0aGVcbiAqIGV2ZW50IHN0cmVhbSBmb3IgYSBzaW5nbGUgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqIEBzZWUge0BsaW5rIEh0dHBJbnRlcmNlcHRvckZufVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGBIdHRwSW50ZXJjZXB0b3JzYCBmb3IgdGhlIGVudGlyZSBhcHAsIGltcG9ydCB0aGUgYEh0dHBDbGllbnRNb2R1bGVgXG4gKiBvbmx5IGluIHlvdXIgYEFwcE1vZHVsZWAsIGFuZCBhZGQgdGhlIGludGVyY2VwdG9ycyB0byB0aGUgcm9vdCBhcHBsaWNhdGlvbiBpbmplY3Rvci5cbiAqIElmIHlvdSBpbXBvcnQgYEh0dHBDbGllbnRNb2R1bGVgIG11bHRpcGxlIHRpbWVzIGFjcm9zcyBkaWZmZXJlbnQgbW9kdWxlcyAoZm9yIGV4YW1wbGUsIGluIGxhenlcbiAqIGxvYWRpbmcgbW9kdWxlcyksIGVhY2ggaW1wb3J0IGNyZWF0ZXMgYSBuZXcgY29weSBvZiB0aGUgYEh0dHBDbGllbnRNb2R1bGVgLCB3aGljaCBvdmVyd3JpdGVzIHRoZVxuICogaW50ZXJjZXB0b3JzIHByb3ZpZGVkIGluIHRoZSByb290IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEhUVFAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gYW4gaW50ZXJjZXB0b3IgY2hhaW4sIG9yIHRoZSByZWFsIGJhY2tlbmQgaWYgdGhlcmUgYXJlIG5vXG4gKiBmdXJ0aGVyIGludGVyY2VwdG9ycy5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGFuZCBlaXRoZXIgbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIHRoZVxuICogcmVzcG9uc2Ugd2hlbiBpdCBhcnJpdmVzLiBXaXRoaW4gdGhlIHNjb3BlIG9mIHRoZSBjdXJyZW50IHJlcXVlc3QsIGhvd2V2ZXIsIHRoaXMgZnVuY3Rpb24gbWF5IGJlXG4gKiBjYWxsZWQgYW55IG51bWJlciBvZiB0aW1lcywgZm9yIGFueSBudW1iZXIgb2YgZG93bnN0cmVhbSByZXF1ZXN0cy4gU3VjaCBkb3duc3RyZWFtIHJlcXVlc3RzIG5lZWRcbiAqIG5vdCBiZSB0byB0aGUgc2FtZSBVUkwgb3IgZXZlbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgcmVxdWVzdC4gSXQgaXMgYWxzbyB2YWxpZCB0byBub3RcbiAqIGNhbGwgdGhlIGRvd25zdHJlYW0gaGFuZGxlciBhdCBhbGwsIGFuZCBwcm9jZXNzIHRoZSBjdXJyZW50IHJlcXVlc3QgZW50aXJlbHkgd2l0aGluIHRoZVxuICogaW50ZXJjZXB0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aGluIHRoZSBzY29wZSBvZiB0aGUgcmVxdWVzdCB0aGF0J3MgY3VycmVudGx5IGJlaW5nXG4gKiBpbnRlcmNlcHRlZC4gT25jZSB0aGF0IHJlcXVlc3QgaXMgY29tcGxldGUsIHRoaXMgZG93bnN0cmVhbSBoYW5kbGVyIGZ1bmN0aW9uIHNob3VsZCBub3QgYmVcbiAqIGNhbGxlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEhhbmRsZXJGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogQW4gaW50ZXJjZXB0b3IgZm9yIEhUVFAgcmVxdWVzdHMgbWFkZSB2aWEgYEh0dHBDbGllbnRgLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyB3aGljaCBgSHR0cENsaWVudGAgY2FsbHMgd2hlbiBhIHJlcXVlc3QgaXMgbWFkZS5cbiAqIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIHRoZSBvcHBvcnR1bml0eSB0byBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgYW55IHJlc3BvbnNlIHRoYXQgY29tZXNcbiAqIGJhY2ssIGFzIHdlbGwgYXMgYmxvY2ssIHJlZGlyZWN0LCBvciBvdGhlcndpc2UgY2hhbmdlIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlIHNlbWFudGljcy5cbiAqXG4gKiBBbiBgSHR0cEhhbmRsZXJGbmAgcmVwcmVzZW50aW5nIHRoZSBuZXh0IGludGVyY2VwdG9yIChvciB0aGUgYmFja2VuZCB3aGljaCB3aWxsIG1ha2UgYSByZWFsIEhUVFBcbiAqIHJlcXVlc3QpIGlzIHByb3ZpZGVkLiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGJ1dCB0aGF0IGlzIG5vdCByZXF1aXJlZFxuICogKHNlZSBgSHR0cEhhbmRsZXJGbmAgZm9yIG1vcmUgZGV0YWlscykuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIGV4ZWN1dGVkIGluIGFuIFtpbmplY3Rpb24gY29udGV4dF0oL2d1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uLWNvbnRleHQpLlxuICogVGhleSBoYXZlIGFjY2VzcyB0byBgaW5qZWN0KClgIHZpYSB0aGUgYEVudmlyb25tZW50SW5qZWN0b3JgIGZyb20gd2hpY2ggdGhleSB3ZXJlIGNvbmZpZ3VyZWQuXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqIEBzZWUge0BsaW5rIHdpdGhJbnRlcmNlcHRvcnN9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEhlcmUgaXMgYSBub29wIGludGVyY2VwdG9yIHRoYXQgcGFzc2VzIHRoZSByZXF1ZXN0IHRocm91Z2ggd2l0aG91dCBtb2RpZnlpbmcgaXQ6XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3Qgbm9vcEludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKlxuICogSWYgeW91IHdhbnQgdG8gYWx0ZXIgYSByZXF1ZXN0LCBjbG9uZSBpdCBmaXJzdCBhbmQgbW9kaWZ5IHRoZSBjbG9uZSBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIGBuZXh0KClgIGhhbmRsZXIgZnVuY3Rpb24uXG4gKlxuICogSGVyZSBpcyBhIGJhc2ljIGludGVyY2VwdG9yIHRoYXQgYWRkcyBhIGJlYXJlciB0b2tlbiB0byB0aGUgaGVhZGVyc1xuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IGF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgICBjb25zdCB1c2VyVG9rZW4gPSAnTVlfVE9LRU4nOyBjb25zdCBtb2RpZmllZFJlcSA9IHJlcS5jbG9uZSh7XG4gKiAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyVG9rZW59YCksXG4gKiAgICB9KTtcbiAqXG4gKiAgICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6IEh0dHBIYW5kbGVyRm4pID0+XG4gICAgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHdoaWNoIGludm9rZXMgYW4gSFRUUCBpbnRlcmNlcHRvciBjaGFpbi5cbiAqXG4gKiBFYWNoIGludGVyY2VwdG9yIGluIHRoZSBpbnRlcmNlcHRvciBjaGFpbiBpcyB0dXJuZWQgaW50byBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggY2xvc2VzXG4gKiBvdmVyIHRoZSByZXN0IG9mIHRoZSBjaGFpbiAocmVwcmVzZW50ZWQgYnkgYW5vdGhlciBgQ2hhaW5lZEludGVyY2VwdG9yRm5gKS4gVGhlIGxhc3Qgc3VjaFxuICogZnVuY3Rpb24gaW4gdGhlIGNoYWluIHdpbGwgaW5zdGVhZCBkZWxlZ2F0ZSB0byB0aGUgYGZpbmFsSGFuZGxlckZuYCwgd2hpY2ggaXMgcGFzc2VkIGRvd24gd2hlblxuICogdGhlIGNoYWluIGlzIGludm9rZWQuXG4gKlxuICogVGhpcyBwYXR0ZXJuIGFsbG93cyBmb3IgYSBjaGFpbiBvZiBtYW55IGludGVyY2VwdG9ycyB0byBiZSBjb21wb3NlZCBhbmQgd3JhcHBlZCBpbiBhIHNpbmdsZVxuICogYEh0dHBJbnRlcmNlcHRvckZuYCwgd2hpY2ggaXMgYSB1c2VmdWwgYWJzdHJhY3Rpb24gZm9yIGluY2x1ZGluZyBkaWZmZXJlbnQga2luZHMgb2YgaW50ZXJjZXB0b3JzXG4gKiAoZS5nLiBsZWdhY3kgY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzKSBpbiB0aGUgc2FtZSBjaGFpbi5cbiAqL1xudHlwZSBDaGFpbmVkSW50ZXJjZXB0b3JGbjxSZXF1ZXN0VD4gPSAocmVxOiBIdHRwUmVxdWVzdDxSZXF1ZXN0VD4sIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuKSA9PlxuICAgIE9ic2VydmFibGU8SHR0cEV2ZW50PFJlcXVlc3RUPj47XG5cbmZ1bmN0aW9uIGludGVyY2VwdG9yQ2hhaW5FbmRGbihcbiAgICByZXE6IEh0dHBSZXF1ZXN0PGFueT4sIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICByZXR1cm4gZmluYWxIYW5kbGVyRm4ocmVxKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBhZGFwdHMgYSBsZWdhY3kgYEh0dHBJbnRlcmNlcHRvcmAgdG8gdGhlXG4gKiBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIGludGVyZmFjZS5cbiAqL1xuZnVuY3Rpb24gYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4oXG4gICAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4sXG4gICAgaW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvcik6IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4ge1xuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT4gaW50ZXJjZXB0b3IuaW50ZXJjZXB0KGluaXRpYWxSZXF1ZXN0LCB7XG4gICAgaGFuZGxlOiAoZG93bnN0cmVhbVJlcXVlc3QpID0+IGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbiksXG4gIH0pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIHdyYXBzIGFuZCBpbnZva2VzIGEgZnVuY3Rpb25hbCBpbnRlcmNlcHRvciBpbiB0aGUgZ2l2ZW5cbiAqIGluamVjdG9yLlxuICovXG5mdW5jdGlvbiBjaGFpbmVkSW50ZXJjZXB0b3JGbihcbiAgICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4sIGludGVyY2VwdG9yRm46IEh0dHBJbnRlcmNlcHRvckZuLFxuICAgIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKTogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4ge1xuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHJldHVybiAoaW5pdGlhbFJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSA9PiBydW5JbkluamVjdGlvbkNvbnRleHQoaW5qZWN0b3IsICgpID0+XG4gICAgaW50ZXJjZXB0b3JGbihcbiAgICAgIGluaXRpYWxSZXF1ZXN0LFxuICAgICAgZG93bnN0cmVhbVJlcXVlc3QgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKVxuICAgIClcbiAgKTtcbiAgLy8gY2xhbmctZm9ybWF0IG9uXG59XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlciB0b2tlbiB0aGF0IHJlcHJlc2VudHMgdGhlIGFycmF5IG9mIHJlZ2lzdGVyZWRcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIG9iamVjdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JbXT4obmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JTJyA6ICcnKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzLlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUl9GTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUl9GTlMnIDogJycpO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMgdGhhdCBhcmUgb25seSBzZXQgaW4gcm9vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihuZ0Rldk1vZGUgPyAnSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyk7XG5cbi8qKlxuICogQSBwcm92aWRlciB0byBzZXQgYSBnbG9iYWwgcHJpbWFyeSBodHRwIGJhY2tlbmQuIElmIHNldCwgaXQgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvbmVcbiAqL1xuZXhwb3J0IGNvbnN0IFBSSU1BUllfSFRUUF9CQUNLRU5EID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48SHR0cEJhY2tlbmQ+KG5nRGV2TW9kZSA/ICdQUklNQVJZX0hUVFBfQkFDS0VORCcgOiAnJyk7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGBIdHRwSW50ZXJjZXB0b3JGbmAgd2hpY2ggbGF6aWx5IGluaXRpYWxpemVzIGFuIGludGVyY2VwdG9yIGNoYWluIGZyb20gdGhlIGxlZ2FjeVxuICogY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzIGFuZCBydW5zIHRoZSByZXF1ZXN0IHRocm91Z2ggaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZWdhY3lJbnRlcmNlcHRvckZuRmFjdG9yeSgpOiBIdHRwSW50ZXJjZXB0b3JGbiB7XG4gIGxldCBjaGFpbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PnxudWxsID0gbnVsbDtcblxuICByZXR1cm4gKHJlcSwgaGFuZGxlcikgPT4ge1xuICAgIGlmIChjaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gaW5qZWN0KEhUVFBfSU5URVJDRVBUT1JTLCB7b3B0aW9uYWw6IHRydWV9KSA/PyBbXTtcbiAgICAgIC8vIE5vdGU6IGludGVyY2VwdG9ycyBhcmUgd3JhcHBlZCByaWdodC10by1sZWZ0IHNvIHRoYXQgZmluYWwgZXhlY3V0aW9uIG9yZGVyIGlzXG4gICAgICAvLyBsZWZ0LXRvLXJpZ2h0LiBUaGF0IGlzLCBpZiBgaW50ZXJjZXB0b3JzYCBpcyB0aGUgYXJyYXkgYFthLCBiLCBjXWAsIHdlIHdhbnQgdG9cbiAgICAgIC8vIHByb2R1Y2UgYSBjaGFpbiB0aGF0IGlzIGNvbmNlcHR1YWxseSBgYyhiKGEoZW5kKSkpYCwgd2hpY2ggd2UgYnVpbGQgZnJvbSB0aGUgaW5zaWRlXG4gICAgICAvLyBvdXQuXG4gICAgICBjaGFpbiA9IGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgICAgICBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbiwgaW50ZXJjZXB0b3JDaGFpbkVuZEZuIGFzIENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4pO1xuICAgIH1cblxuICAgIGNvbnN0IHBlbmRpbmdUYXNrcyA9IGluamVjdChQZW5kaW5nVGFza3MpO1xuICAgIGNvbnN0IHRhc2tJZCA9IHBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKS5waXBlKGZpbmFsaXplKCgpID0+IHBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9O1xufVxuXG5sZXQgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IGZhbHNlO1xuXG4vKiogSW50ZXJuYWwgZnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZsYWcgaW4gdGVzdHMgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEZldGNoQmFja2VuZFdhcm5pbmdGbGFnKCkge1xuICBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyIGV4dGVuZHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nVGFza3MgPSBpbmplY3QoUGVuZGluZ1Rhc2tzKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBwcml2YXRlIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcHJlZmVycmVkIEhUVFAgYmFja2VuZCBjb25maWd1cmVkIGFuZCB1c2UgaXQgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGVuYWJsZSBgRmV0Y2hCYWNrZW5kYCBnbG9iYWxseSBmb3IgYWxsIEh0dHBDbGllbnQncyB3aGVuIGB3aXRoRmV0Y2hgXG4gICAgLy8gaXMgdXNlZC5cbiAgICBjb25zdCBwcmltYXJ5SHR0cEJhY2tlbmQgPSBpbmplY3QoUFJJTUFSWV9IVFRQX0JBQ0tFTkQsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIHRoaXMuYmFja2VuZCA9IHByaW1hcnlIdHRwQmFja2VuZCA/PyBiYWNrZW5kO1xuXG4gICAgLy8gV2Ugc3Ryb25nbHkgcmVjb21tZW5kIHVzaW5nIGZldGNoIGJhY2tlbmQgZm9yIEhUVFAgY2FsbHMgd2hlbiBTU1IgaXMgdXNlZFxuICAgIC8vIGZvciBhbiBhcHBsaWNhdGlvbi4gVGhlIGxvZ2ljIGJlbG93IGNoZWNrcyBpZiB0aGF0J3MgdGhlIGNhc2UgYW5kIHByb2R1Y2VzXG4gICAgLy8gYSB3YXJuaW5nIG90aGVyd2lzZS5cbiAgICBpZiAoKHR5cGVvZiBuZ0Rldk1vZGUgPT09ICd1bmRlZmluZWQnIHx8IG5nRGV2TW9kZSkgJiYgIWZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQpIHtcbiAgICAgIGNvbnN0IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3Rvci5nZXQoUExBVEZPUk1fSUQpKTtcbiAgICAgIGlmIChpc1NlcnZlciAmJiAhKHRoaXMuYmFja2VuZCBpbnN0YW5jZW9mIEZldGNoQmFja2VuZCkpIHtcbiAgICAgICAgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IHRydWU7XG4gICAgICAgIGluamVjdG9yLmdldChDb25zb2xlKS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTk9UX1VTSU5HX0ZFVENIX0JBQ0tFTkRfSU5fU1NSLFxuICAgICAgICAgICAgJ0FuZ3VsYXIgZGV0ZWN0ZWQgdGhhdCBgSHR0cENsaWVudGAgaXMgbm90IGNvbmZpZ3VyZWQgJyArXG4gICAgICAgICAgICAgICAgJ3RvIHVzZSBgZmV0Y2hgIEFQSXMuIEl0XFwncyBzdHJvbmdseSByZWNvbW1lbmRlZCB0byAnICtcbiAgICAgICAgICAgICAgICAnZW5hYmxlIGBmZXRjaGAgZm9yIGFwcGxpY2F0aW9ucyB0aGF0IHVzZSBTZXJ2ZXItU2lkZSBSZW5kZXJpbmcgJyArXG4gICAgICAgICAgICAgICAgJ2ZvciBiZXR0ZXIgcGVyZm9ybWFuY2UgYW5kIGNvbXBhdGliaWxpdHkuICcgK1xuICAgICAgICAgICAgICAgICdUbyBlbmFibGUgYGZldGNoYCwgYWRkIHRoZSBgd2l0aEZldGNoKClgIHRvIHRoZSBgcHJvdmlkZUh0dHBDbGllbnQoKWAgJyArXG4gICAgICAgICAgICAgICAgJ2NhbGwgYXQgdGhlIHJvb3Qgb2YgdGhlIGFwcGxpY2F0aW9uLicpKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBoYW5kbGUoaW5pdGlhbFJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGRlZHVwZWRJbnRlcmNlcHRvckZucyA9IEFycmF5LmZyb20obmV3IFNldChbXG4gICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JfRk5TKSxcbiAgICAgICAgLi4udGhpcy5pbmplY3Rvci5nZXQoSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUywgW10pLFxuICAgICAgXSkpO1xuXG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGRlZHVwZWRJbnRlcmNlcHRvckZuc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgdGhpcy5jaGFpbiA9IGRlZHVwZWRJbnRlcmNlcHRvckZucy5yZWR1Y2VSaWdodChcbiAgICAgICAgICAobmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuKSA9PlxuICAgICAgICAgICAgICBjaGFpbmVkSW50ZXJjZXB0b3JGbihuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4sIHRoaXMuaW5qZWN0b3IpLFxuICAgICAgICAgIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPik7XG4gICAgfVxuXG4gICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIGRvd25zdHJlYW1SZXF1ZXN0ID0+IHRoaXMuYmFja2VuZC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpKVxuICAgICAgICAucGlwZShmaW5hbGl6ZSgoKSA9PiB0aGlzLnBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9XG59XG4iXX0=