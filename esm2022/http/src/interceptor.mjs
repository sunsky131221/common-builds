/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { isPlatformServer } from '@angular/common';
import { EnvironmentInjector, inject, Injectable, InjectionToken, PLATFORM_ID, ɵConsole as Console, ɵformatRuntimeError as formatRuntimeError, ɵInitialRenderPendingTasks as InitialRenderPendingTasks } from '@angular/core';
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
    return (initialRequest, finalHandlerFn) => injector.runInContext(() => interceptorFn(initialRequest, downstreamRequest => chainTailFn(downstreamRequest, finalHandlerFn)));
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-rc.2+sha-2c3daeb", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.0-rc.2+sha-2c3daeb", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-rc.2+sha-2c3daeb", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxRQUFRLElBQUksT0FBTyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLDBCQUEwQixJQUFJLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRTVOLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVuRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDOzs7QUE0SHJDLFNBQVMscUJBQXFCLENBQzFCLEdBQXFCLEVBQUUsY0FBNkI7SUFDdEQsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsNkJBQTZCLENBQ2xDLFdBQXNDLEVBQ3RDLFdBQTRCO0lBQzlCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUMvRSxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDekIsV0FBMEMsRUFBRSxhQUFnQyxFQUM1RSxRQUE2QjtJQUMvQixtQkFBbUI7SUFDbkIs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QyxHQUFHLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3pGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7eUhBcERVLHNCQUFzQjs2SEFBdEIsc0JBQXNCOztzR0FBdEIsc0JBQXNCO2tCQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUQsIMm1Q29uc29sZSBhcyBDb25zb2xlLCDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsIMm1SW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyBhcyBJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0ZldGNoQmFja2VuZH0gZnJvbSAnLi9mZXRjaCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vKipcbiAqIEludGVyY2VwdHMgYW5kIGhhbmRsZXMgYW4gYEh0dHBSZXF1ZXN0YCBvciBgSHR0cFJlc3BvbnNlYC5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB0cmFuc2Zvcm0gdGhlIG91dGdvaW5nIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgYnkgY2FsbGluZyBgbmV4dC5oYW5kbGUodHJhbnNmb3JtZWRSZXEpYC5cbiAqIEFuIGludGVyY2VwdG9yIG1heSB0cmFuc2Zvcm0gdGhlXG4gKiByZXNwb25zZSBldmVudCBzdHJlYW0gYXMgd2VsbCwgYnkgYXBwbHlpbmcgYWRkaXRpb25hbCBSeEpTIG9wZXJhdG9ycyBvbiB0aGUgc3RyZWFtXG4gKiByZXR1cm5lZCBieSBgbmV4dC5oYW5kbGUoKWAuXG4gKlxuICogTW9yZSByYXJlbHksIGFuIGludGVyY2VwdG9yIG1heSBoYW5kbGUgdGhlIHJlcXVlc3QgZW50aXJlbHksXG4gKiBhbmQgY29tcG9zZSBhIG5ldyBldmVudCBzdHJlYW0gaW5zdGVhZCBvZiBpbnZva2luZyBgbmV4dC5oYW5kbGUoKWAuIFRoaXMgaXMgYW5cbiAqIGFjY2VwdGFibGUgYmVoYXZpb3IsIGJ1dCBrZWVwIGluIG1pbmQgdGhhdCBmdXJ0aGVyIGludGVyY2VwdG9ycyB3aWxsIGJlIHNraXBwZWQgZW50aXJlbHkuXG4gKlxuICogSXQgaXMgYWxzbyByYXJlIGJ1dCB2YWxpZCBmb3IgYW4gaW50ZXJjZXB0b3IgdG8gcmV0dXJuIG11bHRpcGxlIHJlc3BvbnNlcyBvbiB0aGVcbiAqIGV2ZW50IHN0cmVhbSBmb3IgYSBzaW5nbGUgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqIEBzZWUge0BsaW5rIEh0dHBJbnRlcmNlcHRvckZufVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGBIdHRwSW50ZXJjZXB0b3JzYCBmb3IgdGhlIGVudGlyZSBhcHAsIGltcG9ydCB0aGUgYEh0dHBDbGllbnRNb2R1bGVgXG4gKiBvbmx5IGluIHlvdXIgYEFwcE1vZHVsZWAsIGFuZCBhZGQgdGhlIGludGVyY2VwdG9ycyB0byB0aGUgcm9vdCBhcHBsaWNhdGlvbiBpbmplY3Rvci5cbiAqIElmIHlvdSBpbXBvcnQgYEh0dHBDbGllbnRNb2R1bGVgIG11bHRpcGxlIHRpbWVzIGFjcm9zcyBkaWZmZXJlbnQgbW9kdWxlcyAoZm9yIGV4YW1wbGUsIGluIGxhenlcbiAqIGxvYWRpbmcgbW9kdWxlcyksIGVhY2ggaW1wb3J0IGNyZWF0ZXMgYSBuZXcgY29weSBvZiB0aGUgYEh0dHBDbGllbnRNb2R1bGVgLCB3aGljaCBvdmVyd3JpdGVzIHRoZVxuICogaW50ZXJjZXB0b3JzIHByb3ZpZGVkIGluIHRoZSByb290IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEhUVFAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gYW4gaW50ZXJjZXB0b3IgY2hhaW4sIG9yIHRoZSByZWFsIGJhY2tlbmQgaWYgdGhlcmUgYXJlIG5vXG4gKiBmdXJ0aGVyIGludGVyY2VwdG9ycy5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGFuZCBlaXRoZXIgbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIHRoZVxuICogcmVzcG9uc2Ugd2hlbiBpdCBhcnJpdmVzLiBXaXRoaW4gdGhlIHNjb3BlIG9mIHRoZSBjdXJyZW50IHJlcXVlc3QsIGhvd2V2ZXIsIHRoaXMgZnVuY3Rpb24gbWF5IGJlXG4gKiBjYWxsZWQgYW55IG51bWJlciBvZiB0aW1lcywgZm9yIGFueSBudW1iZXIgb2YgZG93bnN0cmVhbSByZXF1ZXN0cy4gU3VjaCBkb3duc3RyZWFtIHJlcXVlc3RzIG5lZWRcbiAqIG5vdCBiZSB0byB0aGUgc2FtZSBVUkwgb3IgZXZlbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgcmVxdWVzdC4gSXQgaXMgYWxzbyB2YWxpZCB0byBub3RcbiAqIGNhbGwgdGhlIGRvd25zdHJlYW0gaGFuZGxlciBhdCBhbGwsIGFuZCBwcm9jZXNzIHRoZSBjdXJyZW50IHJlcXVlc3QgZW50aXJlbHkgd2l0aGluIHRoZVxuICogaW50ZXJjZXB0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aGluIHRoZSBzY29wZSBvZiB0aGUgcmVxdWVzdCB0aGF0J3MgY3VycmVudGx5IGJlaW5nXG4gKiBpbnRlcmNlcHRlZC4gT25jZSB0aGF0IHJlcXVlc3QgaXMgY29tcGxldGUsIHRoaXMgZG93bnN0cmVhbSBoYW5kbGVyIGZ1bmN0aW9uIHNob3VsZCBub3QgYmVcbiAqIGNhbGxlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEhhbmRsZXJGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogQW4gaW50ZXJjZXB0b3IgZm9yIEhUVFAgcmVxdWVzdHMgbWFkZSB2aWEgYEh0dHBDbGllbnRgLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyB3aGljaCBgSHR0cENsaWVudGAgY2FsbHMgd2hlbiBhIHJlcXVlc3QgaXMgbWFkZS5cbiAqIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIHRoZSBvcHBvcnR1bml0eSB0byBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgYW55IHJlc3BvbnNlIHRoYXQgY29tZXNcbiAqIGJhY2ssIGFzIHdlbGwgYXMgYmxvY2ssIHJlZGlyZWN0LCBvciBvdGhlcndpc2UgY2hhbmdlIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlIHNlbWFudGljcy5cbiAqXG4gKiBBbiBgSHR0cEhhbmRsZXJGbmAgcmVwcmVzZW50aW5nIHRoZSBuZXh0IGludGVyY2VwdG9yIChvciB0aGUgYmFja2VuZCB3aGljaCB3aWxsIG1ha2UgYSByZWFsIEhUVFBcbiAqIHJlcXVlc3QpIGlzIHByb3ZpZGVkLiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGJ1dCB0aGF0IGlzIG5vdCByZXF1aXJlZFxuICogKHNlZSBgSHR0cEhhbmRsZXJGbmAgZm9yIG1vcmUgZGV0YWlscykuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIGV4ZWN1dGVkIGluIGFuIFtpbmplY3Rpb24gY29udGV4dF0oL2d1aWRlL2RlcGVuZGVuY3ktaW5qZWN0aW9uLWNvbnRleHQpLlxuICogVGhleSBoYXZlIGFjY2VzcyB0byBgaW5qZWN0KClgIHZpYSB0aGUgYEVudmlyb25tZW50SW5qZWN0b3JgIGZyb20gd2hpY2ggdGhleSB3ZXJlIGNvbmZpZ3VyZWQuXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC1pbnRlcmNlcHQtcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqIEBzZWUge0BsaW5rIHdpdGhJbnRlcmNlcHRvcnN9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEhlcmUgaXMgYSBub29wIGludGVyY2VwdG9yIHRoYXQgcGFzc2VzIHRoZSByZXF1ZXN0IHRocm91Z2ggd2l0aG91dCBtb2RpZnlpbmcgaXQ6XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3Qgbm9vcEludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKlxuICogSWYgeW91IHdhbnQgdG8gYWx0ZXIgYSByZXF1ZXN0LCBjbG9uZSBpdCBmaXJzdCBhbmQgbW9kaWZ5IHRoZSBjbG9uZSBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIGBuZXh0KClgIGhhbmRsZXIgZnVuY3Rpb24uXG4gKlxuICogSGVyZSBpcyBhIGJhc2ljIGludGVyY2VwdG9yIHRoYXQgYWRkcyBhIGJlYXJlciB0b2tlbiB0byB0aGUgaGVhZGVyc1xuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IGF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgICBjb25zdCB1c2VyVG9rZW4gPSAnTVlfVE9LRU4nOyBjb25zdCBtb2RpZmllZFJlcSA9IHJlcS5jbG9uZSh7XG4gKiAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyVG9rZW59YCksXG4gKiAgICB9KTtcbiAqXG4gKiAgICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6IEh0dHBIYW5kbGVyRm4pID0+XG4gICAgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+O1xuXG4vKipcbiAqIEZ1bmN0aW9uIHdoaWNoIGludm9rZXMgYW4gSFRUUCBpbnRlcmNlcHRvciBjaGFpbi5cbiAqXG4gKiBFYWNoIGludGVyY2VwdG9yIGluIHRoZSBpbnRlcmNlcHRvciBjaGFpbiBpcyB0dXJuZWQgaW50byBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggY2xvc2VzXG4gKiBvdmVyIHRoZSByZXN0IG9mIHRoZSBjaGFpbiAocmVwcmVzZW50ZWQgYnkgYW5vdGhlciBgQ2hhaW5lZEludGVyY2VwdG9yRm5gKS4gVGhlIGxhc3Qgc3VjaFxuICogZnVuY3Rpb24gaW4gdGhlIGNoYWluIHdpbGwgaW5zdGVhZCBkZWxlZ2F0ZSB0byB0aGUgYGZpbmFsSGFuZGxlckZuYCwgd2hpY2ggaXMgcGFzc2VkIGRvd24gd2hlblxuICogdGhlIGNoYWluIGlzIGludm9rZWQuXG4gKlxuICogVGhpcyBwYXR0ZXJuIGFsbG93cyBmb3IgYSBjaGFpbiBvZiBtYW55IGludGVyY2VwdG9ycyB0byBiZSBjb21wb3NlZCBhbmQgd3JhcHBlZCBpbiBhIHNpbmdsZVxuICogYEh0dHBJbnRlcmNlcHRvckZuYCwgd2hpY2ggaXMgYSB1c2VmdWwgYWJzdHJhY3Rpb24gZm9yIGluY2x1ZGluZyBkaWZmZXJlbnQga2luZHMgb2YgaW50ZXJjZXB0b3JzXG4gKiAoZS5nLiBsZWdhY3kgY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzKSBpbiB0aGUgc2FtZSBjaGFpbi5cbiAqL1xudHlwZSBDaGFpbmVkSW50ZXJjZXB0b3JGbjxSZXF1ZXN0VD4gPSAocmVxOiBIdHRwUmVxdWVzdDxSZXF1ZXN0VD4sIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuKSA9PlxuICAgIE9ic2VydmFibGU8SHR0cEV2ZW50PFJlcXVlc3RUPj47XG5cbmZ1bmN0aW9uIGludGVyY2VwdG9yQ2hhaW5FbmRGbihcbiAgICByZXE6IEh0dHBSZXF1ZXN0PGFueT4sIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICByZXR1cm4gZmluYWxIYW5kbGVyRm4ocmVxKTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBhZGFwdHMgYSBsZWdhY3kgYEh0dHBJbnRlcmNlcHRvcmAgdG8gdGhlXG4gKiBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIGludGVyZmFjZS5cbiAqL1xuZnVuY3Rpb24gYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4oXG4gICAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4sXG4gICAgaW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvcik6IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4ge1xuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT4gaW50ZXJjZXB0b3IuaW50ZXJjZXB0KGluaXRpYWxSZXF1ZXN0LCB7XG4gICAgaGFuZGxlOiAoZG93bnN0cmVhbVJlcXVlc3QpID0+IGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbiksXG4gIH0pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIHdyYXBzIGFuZCBpbnZva2VzIGEgZnVuY3Rpb25hbCBpbnRlcmNlcHRvciBpbiB0aGUgZ2l2ZW5cbiAqIGluamVjdG9yLlxuICovXG5mdW5jdGlvbiBjaGFpbmVkSW50ZXJjZXB0b3JGbihcbiAgICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4sIGludGVyY2VwdG9yRm46IEh0dHBJbnRlcmNlcHRvckZuLFxuICAgIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKTogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4ge1xuICAvLyBjbGFuZy1mb3JtYXQgb2ZmXG4gIHJldHVybiAoaW5pdGlhbFJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSA9PiBpbmplY3Rvci5ydW5JbkNvbnRleHQoKCkgPT5cbiAgICBpbnRlcmNlcHRvckZuKFxuICAgICAgaW5pdGlhbFJlcXVlc3QsXG4gICAgICBkb3duc3RyZWFtUmVxdWVzdCA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pXG4gICAgKVxuICApO1xuICAvLyBjbGFuZy1mb3JtYXQgb25cbn1cblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVyIHRva2VuIHRoYXQgcmVwcmVzZW50cyB0aGUgYXJyYXkgb2YgcmVnaXN0ZXJlZFxuICogYEh0dHBJbnRlcmNlcHRvcmAgb2JqZWN0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvcltdPihuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUlMnIDogJycpO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KG5nRGV2TW9kZSA/ICdIVFRQX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyk7XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlZCB0b2tlbiBvZiBgSHR0cEludGVyY2VwdG9yRm5gcyB0aGF0IGFyZSBvbmx5IHNldCBpbiByb290LlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KG5nRGV2TW9kZSA/ICdIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TJyA6ICcnKTtcblxuLyoqXG4gKiBBIHByb3ZpZGVyIHRvIHNldCBhIGdsb2JhbCBwcmltYXJ5IGh0dHAgYmFja2VuZC4gSWYgc2V0LCBpdCB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9uZVxuICovXG5leHBvcnQgY29uc3QgUFJJTUFSWV9IVFRQX0JBQ0tFTkQgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwQmFja2VuZD4obmdEZXZNb2RlID8gJ1BSSU1BUllfSFRUUF9CQUNLRU5EJyA6ICcnKTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYEh0dHBJbnRlcmNlcHRvckZuYCB3aGljaCBsYXppbHkgaW5pdGlhbGl6ZXMgYW4gaW50ZXJjZXB0b3IgY2hhaW4gZnJvbSB0aGUgbGVnYWN5XG4gKiBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMgYW5kIHJ1bnMgdGhlIHJlcXVlc3QgdGhyb3VnaCBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5KCk6IEh0dHBJbnRlcmNlcHRvckZuIHtcbiAgbGV0IGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIHJldHVybiAocmVxLCBoYW5kbGVyKSA9PiB7XG4gICAgaWYgKGNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBpbmplY3QoSFRUUF9JTlRFUkNFUFRPUlMsIHtvcHRpb25hbDogdHJ1ZX0pID8/IFtdO1xuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBpbnRlcmNlcHRvcnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIGNoYWluID0gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgICAgIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluLCBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48YW55Pik7XG4gICAgfVxuXG4gICAgY29uc3QgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KEluaXRpYWxSZW5kZXJQZW5kaW5nVGFza3MpO1xuICAgIGNvbnN0IHRhc2tJZCA9IHBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKS5waXBlKGZpbmFsaXplKCgpID0+IHBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9O1xufVxuXG5sZXQgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IGZhbHNlO1xuXG4vKiogSW50ZXJuYWwgZnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZsYWcgaW4gdGVzdHMgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEZldGNoQmFja2VuZFdhcm5pbmdGbGFnKCkge1xuICBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyIGV4dGVuZHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nVGFza3MgPSBpbmplY3QoSW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiYWNrZW5kOiBIdHRwQmFja2VuZCwgcHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHByZWZlcnJlZCBIVFRQIGJhY2tlbmQgY29uZmlndXJlZCBhbmQgdXNlIGl0IGlmIHRoYXQncyB0aGUgY2FzZS5cbiAgICAvLyBUaGlzIGlzIG5lZWRlZCB0byBlbmFibGUgYEZldGNoQmFja2VuZGAgZ2xvYmFsbHkgZm9yIGFsbCBIdHRwQ2xpZW50J3Mgd2hlbiBgd2l0aEZldGNoYFxuICAgIC8vIGlzIHVzZWQuXG4gICAgY29uc3QgcHJpbWFyeUh0dHBCYWNrZW5kID0gaW5qZWN0KFBSSU1BUllfSFRUUF9CQUNLRU5ELCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICB0aGlzLmJhY2tlbmQgPSBwcmltYXJ5SHR0cEJhY2tlbmQgPz8gYmFja2VuZDtcblxuICAgIC8vIFdlIHN0cm9uZ2x5IHJlY29tbWVuZCB1c2luZyBmZXRjaCBiYWNrZW5kIGZvciBIVFRQIGNhbGxzIHdoZW4gU1NSIGlzIHVzZWRcbiAgICAvLyBmb3IgYW4gYXBwbGljYXRpb24uIFRoZSBsb2dpYyBiZWxvdyBjaGVja3MgaWYgdGhhdCdzIHRoZSBjYXNlIGFuZCBwcm9kdWNlc1xuICAgIC8vIGEgd2FybmluZyBvdGhlcndpc2UuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICFmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkKSB7XG4gICAgICBjb25zdCBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lEKSk7XG4gICAgICBpZiAoaXNTZXJ2ZXIgJiYgISh0aGlzLmJhY2tlbmQgaW5zdGFuY2VvZiBGZXRjaEJhY2tlbmQpKSB7XG4gICAgICAgIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICBpbmplY3Rvci5nZXQoQ29uc29sZSkud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk5PVF9VU0lOR19GRVRDSF9CQUNLRU5EX0lOX1NTUixcbiAgICAgICAgICAgICdBbmd1bGFyIGRldGVjdGVkIHRoYXQgYEh0dHBDbGllbnRgIGlzIG5vdCBjb25maWd1cmVkICcgK1xuICAgICAgICAgICAgICAgICd0byB1c2UgYGZldGNoYCBBUElzLiBJdFxcJ3Mgc3Ryb25nbHkgcmVjb21tZW5kZWQgdG8gJyArXG4gICAgICAgICAgICAgICAgJ2VuYWJsZSBgZmV0Y2hgIGZvciBhcHBsaWNhdGlvbnMgdGhhdCB1c2UgU2VydmVyLVNpZGUgUmVuZGVyaW5nICcgK1xuICAgICAgICAgICAgICAgICdmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBjb21wYXRpYmlsaXR5LiAnICtcbiAgICAgICAgICAgICAgICAnVG8gZW5hYmxlIGBmZXRjaGAsIGFkZCB0aGUgYHdpdGhGZXRjaCgpYCB0byB0aGUgYHByb3ZpZGVIdHRwQ2xpZW50KClgICcgK1xuICAgICAgICAgICAgICAgICdjYWxsIGF0IHRoZSByb290IG9mIHRoZSBhcHBsaWNhdGlvbi4nKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgaGFuZGxlKGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBkZWR1cGVkSW50ZXJjZXB0b3JGbnMgPSBBcnJheS5mcm9tKG5ldyBTZXQoW1xuICAgICAgICAuLi50aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SX0ZOUyksXG4gICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMsIFtdKSxcbiAgICAgIF0pKTtcblxuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBkZWR1cGVkSW50ZXJjZXB0b3JGbnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIHRoaXMuY2hhaW4gPSBkZWR1cGVkSW50ZXJjZXB0b3JGbnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbikgPT5cbiAgICAgICAgICAgICAgY2hhaW5lZEludGVyY2VwdG9yRm4obmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuLCB0aGlzLmluamVjdG9yKSxcbiAgICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4pO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMucGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgIHJldHVybiB0aGlzLmNoYWluKGluaXRpYWxSZXF1ZXN0LCBkb3duc3RyZWFtUmVxdWVzdCA9PiB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSlcbiAgICAgICAgLnBpcGUoZmluYWxpemUoKCkgPT4gdGhpcy5wZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCkpKTtcbiAgfVxufVxuIl19