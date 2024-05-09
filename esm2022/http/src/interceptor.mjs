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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-rc.1+sha-72b107b", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-rc.1+sha-72b107b", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-rc.1+sha-72b107b", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQzs7O0FBZ0lyQyxTQUFTLHFCQUFxQixDQUM1QixHQUFxQixFQUNyQixjQUE2QjtJQUU3QixPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDcEMsV0FBc0MsRUFDdEMsV0FBNEI7SUFFNUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUN4QyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUNwQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsV0FBMEMsRUFDMUMsYUFBZ0MsRUFDaEMsUUFBNkI7SUFF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QUssR0FBRyxxQkFBcUIsQ0FBQyxXQUFXLENBQzVDLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQ2pDLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUNyRSxxQkFBc0QsQ0FDdkQsQ0FBQztRQUNKLENBQUM7UUFFRCxJQUFJLElBQUksQ0FBQyxxQkFBcUIsRUFBRSxDQUFDO1lBQy9CLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLEVBQUUsQ0FDdEQsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FDdkMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMzRCxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQ3ZDLENBQUM7UUFDSixDQUFDO0lBQ0gsQ0FBQzt5SEFqRVUsc0JBQXNCOzZIQUF0QixzQkFBc0I7O3NHQUF0QixzQkFBc0I7a0JBRGxDLFVBQVUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpc1BsYXRmb3JtU2VydmVyfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtcbiAgRW52aXJvbm1lbnRJbmplY3RvcixcbiAgaW5qZWN0LFxuICBJbmplY3RhYmxlLFxuICBJbmplY3Rpb25Ub2tlbixcbiAgUExBVEZPUk1fSUQsXG4gIHJ1bkluSW5qZWN0aW9uQ29udGV4dCxcbiAgybVDb25zb2xlIGFzIENvbnNvbGUsXG4gIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvcixcbiAgybVQZW5kaW5nVGFza3MgYXMgUGVuZGluZ1Rhc2tzLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuL2Vycm9ycyc7XG5pbXBvcnQge0ZldGNoQmFja2VuZH0gZnJvbSAnLi9mZXRjaCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vKipcbiAqIEludGVyY2VwdHMgYW5kIGhhbmRsZXMgYW4gYEh0dHBSZXF1ZXN0YCBvciBgSHR0cFJlc3BvbnNlYC5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB0cmFuc2Zvcm0gdGhlIG91dGdvaW5nIHJlcXVlc3QgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgYnkgY2FsbGluZyBgbmV4dC5oYW5kbGUodHJhbnNmb3JtZWRSZXEpYC5cbiAqIEFuIGludGVyY2VwdG9yIG1heSB0cmFuc2Zvcm0gdGhlXG4gKiByZXNwb25zZSBldmVudCBzdHJlYW0gYXMgd2VsbCwgYnkgYXBwbHlpbmcgYWRkaXRpb25hbCBSeEpTIG9wZXJhdG9ycyBvbiB0aGUgc3RyZWFtXG4gKiByZXR1cm5lZCBieSBgbmV4dC5oYW5kbGUoKWAuXG4gKlxuICogTW9yZSByYXJlbHksIGFuIGludGVyY2VwdG9yIG1heSBoYW5kbGUgdGhlIHJlcXVlc3QgZW50aXJlbHksXG4gKiBhbmQgY29tcG9zZSBhIG5ldyBldmVudCBzdHJlYW0gaW5zdGVhZCBvZiBpbnZva2luZyBgbmV4dC5oYW5kbGUoKWAuIFRoaXMgaXMgYW5cbiAqIGFjY2VwdGFibGUgYmVoYXZpb3IsIGJ1dCBrZWVwIGluIG1pbmQgdGhhdCBmdXJ0aGVyIGludGVyY2VwdG9ycyB3aWxsIGJlIHNraXBwZWQgZW50aXJlbHkuXG4gKlxuICogSXQgaXMgYWxzbyByYXJlIGJ1dCB2YWxpZCBmb3IgYW4gaW50ZXJjZXB0b3IgdG8gcmV0dXJuIG11bHRpcGxlIHJlc3BvbnNlcyBvbiB0aGVcbiAqIGV2ZW50IHN0cmVhbSBmb3IgYSBzaW5nbGUgcmVxdWVzdC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cC9pbnRlcmNlcHRvcnMpXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3JGbn1cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRvIHVzZSB0aGUgc2FtZSBpbnN0YW5jZSBvZiBgSHR0cEludGVyY2VwdG9yc2AgZm9yIHRoZSBlbnRpcmUgYXBwLCBpbXBvcnQgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYFxuICogb25seSBpbiB5b3VyIGBBcHBNb2R1bGVgLCBhbmQgYWRkIHRoZSBpbnRlcmNlcHRvcnMgdG8gdGhlIHJvb3QgYXBwbGljYXRpb24gaW5qZWN0b3IuXG4gKiBJZiB5b3UgaW1wb3J0IGBIdHRwQ2xpZW50TW9kdWxlYCBtdWx0aXBsZSB0aW1lcyBhY3Jvc3MgZGlmZmVyZW50IG1vZHVsZXMgKGZvciBleGFtcGxlLCBpbiBsYXp5XG4gKiBsb2FkaW5nIG1vZHVsZXMpLCBlYWNoIGltcG9ydCBjcmVhdGVzIGEgbmV3IGNvcHkgb2YgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYCwgd2hpY2ggb3ZlcndyaXRlcyB0aGVcbiAqIGludGVyY2VwdG9ycyBwcm92aWRlZCBpbiB0aGUgcm9vdCBtb2R1bGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXMgYW5kIGhhbmRsZXMgYSBnaXZlbiBIVFRQIHJlcXVlc3QuXG4gICAqIEBwYXJhbSByZXEgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBuZXh0IGludGVyY2VwdG9yIGluIGFuIGludGVyY2VwdG9yIGNoYWluLCBvciB0aGUgcmVhbCBiYWNrZW5kIGlmIHRoZXJlIGFyZSBub1xuICogZnVydGhlciBpbnRlcmNlcHRvcnMuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBhbmQgZWl0aGVyIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciB0aGVcbiAqIHJlc3BvbnNlIHdoZW4gaXQgYXJyaXZlcy4gV2l0aGluIHRoZSBzY29wZSBvZiB0aGUgY3VycmVudCByZXF1ZXN0LCBob3dldmVyLCB0aGlzIGZ1bmN0aW9uIG1heSBiZVxuICogY2FsbGVkIGFueSBudW1iZXIgb2YgdGltZXMsIGZvciBhbnkgbnVtYmVyIG9mIGRvd25zdHJlYW0gcmVxdWVzdHMuIFN1Y2ggZG93bnN0cmVhbSByZXF1ZXN0cyBuZWVkXG4gKiBub3QgYmUgdG8gdGhlIHNhbWUgVVJMIG9yIGV2ZW4gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IHJlcXVlc3QuIEl0IGlzIGFsc28gdmFsaWQgdG8gbm90XG4gKiBjYWxsIHRoZSBkb3duc3RyZWFtIGhhbmRsZXIgYXQgYWxsLCBhbmQgcHJvY2VzcyB0aGUgY3VycmVudCByZXF1ZXN0IGVudGlyZWx5IHdpdGhpbiB0aGVcbiAqIGludGVyY2VwdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIHJlcXVlc3QgdGhhdCdzIGN1cnJlbnRseSBiZWluZ1xuICogaW50ZXJjZXB0ZWQuIE9uY2UgdGhhdCByZXF1ZXN0IGlzIGNvbXBsZXRlLCB0aGlzIGRvd25zdHJlYW0gaGFuZGxlciBmdW5jdGlvbiBzaG91bGQgbm90IGJlXG4gKiBjYWxsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAvaW50ZXJjZXB0b3JzKVxuICovXG5leHBvcnQgdHlwZSBIdHRwSGFuZGxlckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBBbiBpbnRlcmNlcHRvciBmb3IgSFRUUCByZXF1ZXN0cyBtYWRlIHZpYSBgSHR0cENsaWVudGAuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIG1pZGRsZXdhcmUgZnVuY3Rpb25zIHdoaWNoIGBIdHRwQ2xpZW50YCBjYWxscyB3aGVuIGEgcmVxdWVzdCBpcyBtYWRlLlxuICogVGhlc2UgZnVuY3Rpb25zIGhhdmUgdGhlIG9wcG9ydHVuaXR5IHRvIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciBhbnkgcmVzcG9uc2UgdGhhdCBjb21lc1xuICogYmFjaywgYXMgd2VsbCBhcyBibG9jaywgcmVkaXJlY3QsIG9yIG90aGVyd2lzZSBjaGFuZ2UgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2Ugc2VtYW50aWNzLlxuICpcbiAqIEFuIGBIdHRwSGFuZGxlckZuYCByZXByZXNlbnRpbmcgdGhlIG5leHQgaW50ZXJjZXB0b3IgKG9yIHRoZSBiYWNrZW5kIHdoaWNoIHdpbGwgbWFrZSBhIHJlYWwgSFRUUFxuICogcmVxdWVzdCkgaXMgcHJvdmlkZWQuIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYnV0IHRoYXQgaXMgbm90IHJlcXVpcmVkXG4gKiAoc2VlIGBIdHRwSGFuZGxlckZuYCBmb3IgbW9yZSBkZXRhaWxzKS5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBhcmUgZXhlY3V0ZWQgaW4gYW4gW2luamVjdGlvbiBjb250ZXh0XShndWlkZS9kaS9kZXBlbmRlbmN5LWluamVjdGlvbi1jb250ZXh0KS5cbiAqIFRoZXkgaGF2ZSBhY2Nlc3MgdG8gYGluamVjdCgpYCB2aWEgdGhlIGBFbnZpcm9ubWVudEluamVjdG9yYCBmcm9tIHdoaWNoIHRoZXkgd2VyZSBjb25maWd1cmVkLlxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAvaW50ZXJjZXB0b3JzKVxuICogQHNlZSB7QGxpbmsgd2l0aEludGVyY2VwdG9yc31cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogSGVyZSBpcyBhIG5vb3AgaW50ZXJjZXB0b3IgdGhhdCBwYXNzZXMgdGhlIHJlcXVlc3QgdGhyb3VnaCB3aXRob3V0IG1vZGlmeWluZyBpdDpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBub29wSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgIHJldHVybiBuZXh0KG1vZGlmaWVkUmVxKTtcbiAqIH07XG4gKiBgYGBcbiAqXG4gKiBJZiB5b3Ugd2FudCB0byBhbHRlciBhIHJlcXVlc3QsIGNsb25lIGl0IGZpcnN0IGFuZCBtb2RpZnkgdGhlIGNsb25lIGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogYG5leHQoKWAgaGFuZGxlciBmdW5jdGlvbi5cbiAqXG4gKiBIZXJlIGlzIGEgYmFzaWMgaW50ZXJjZXB0b3IgdGhhdCBhZGRzIGEgYmVhcmVyIHRva2VuIHRvIHRoZSBoZWFkZXJzXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3QgYXV0aGVudGljYXRpb25JbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDpcbiAqIEh0dHBIYW5kbGVyRm4pID0+IHtcbiAqICAgIGNvbnN0IHVzZXJUb2tlbiA9ICdNWV9UT0tFTic7IGNvbnN0IG1vZGlmaWVkUmVxID0gcmVxLmNsb25lKHtcbiAqICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgYEJlYXJlciAke3VzZXJUb2tlbn1gKSxcbiAqICAgIH0pO1xuICpcbiAqICAgIHJldHVybiBuZXh0KG1vZGlmaWVkUmVxKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEludGVyY2VwdG9yRm4gPSAoXG4gIHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sXG4gIG5leHQ6IEh0dHBIYW5kbGVyRm4sXG4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBGdW5jdGlvbiB3aGljaCBpbnZva2VzIGFuIEhUVFAgaW50ZXJjZXB0b3IgY2hhaW4uXG4gKlxuICogRWFjaCBpbnRlcmNlcHRvciBpbiB0aGUgaW50ZXJjZXB0b3IgY2hhaW4gaXMgdHVybmVkIGludG8gYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGNsb3Nlc1xuICogb3ZlciB0aGUgcmVzdCBvZiB0aGUgY2hhaW4gKHJlcHJlc2VudGVkIGJ5IGFub3RoZXIgYENoYWluZWRJbnRlcmNlcHRvckZuYCkuIFRoZSBsYXN0IHN1Y2hcbiAqIGZ1bmN0aW9uIGluIHRoZSBjaGFpbiB3aWxsIGluc3RlYWQgZGVsZWdhdGUgdG8gdGhlIGBmaW5hbEhhbmRsZXJGbmAsIHdoaWNoIGlzIHBhc3NlZCBkb3duIHdoZW5cbiAqIHRoZSBjaGFpbiBpcyBpbnZva2VkLlxuICpcbiAqIFRoaXMgcGF0dGVybiBhbGxvd3MgZm9yIGEgY2hhaW4gb2YgbWFueSBpbnRlcmNlcHRvcnMgdG8gYmUgY29tcG9zZWQgYW5kIHdyYXBwZWQgaW4gYSBzaW5nbGVcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmAsIHdoaWNoIGlzIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBpbmNsdWRpbmcgZGlmZmVyZW50IGtpbmRzIG9mIGludGVyY2VwdG9yc1xuICogKGUuZy4gbGVnYWN5IGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycykgaW4gdGhlIHNhbWUgY2hhaW4uXG4gKi9cbnR5cGUgQ2hhaW5lZEludGVyY2VwdG9yRm48UmVxdWVzdFQ+ID0gKFxuICByZXE6IEh0dHBSZXF1ZXN0PFJlcXVlc3RUPixcbiAgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4sXG4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PFJlcXVlc3RUPj47XG5cbmZ1bmN0aW9uIGludGVyY2VwdG9yQ2hhaW5FbmRGbihcbiAgcmVxOiBIdHRwUmVxdWVzdDxhbnk+LFxuICBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbixcbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgcmV0dXJuIGZpbmFsSGFuZGxlckZuKHJlcSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggYWRhcHRzIGEgbGVnYWN5IGBIdHRwSW50ZXJjZXB0b3JgIHRvIHRoZVxuICogYENoYWluZWRJbnRlcmNlcHRvckZuYCBpbnRlcmZhY2UuXG4gKi9cbmZ1bmN0aW9uIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluKFxuICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgaW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvcixcbik6IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4ge1xuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT5cbiAgICBpbnRlcmNlcHRvci5pbnRlcmNlcHQoaW5pdGlhbFJlcXVlc3QsIHtcbiAgICAgIGhhbmRsZTogKGRvd25zdHJlYW1SZXF1ZXN0KSA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICAgIH0pO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIHdyYXBzIGFuZCBpbnZva2VzIGEgZnVuY3Rpb25hbCBpbnRlcmNlcHRvciBpbiB0aGUgZ2l2ZW5cbiAqIGluamVjdG9yLlxuICovXG5mdW5jdGlvbiBjaGFpbmVkSW50ZXJjZXB0b3JGbihcbiAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LFxuICBpbnRlcmNlcHRvckZuOiBIdHRwSW50ZXJjZXB0b3JGbixcbiAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4pOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiB7XG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+XG4gICAgcnVuSW5JbmplY3Rpb25Db250ZXh0KGluamVjdG9yLCAoKSA9PlxuICAgICAgaW50ZXJjZXB0b3JGbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgICBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICAgICAgKSxcbiAgICApO1xuICAvLyBjbGFuZy1mb3JtYXQgb25cbn1cblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVyIHRva2VuIHRoYXQgcmVwcmVzZW50cyB0aGUgYXJyYXkgb2YgcmVnaXN0ZXJlZFxuICogYEh0dHBJbnRlcmNlcHRvcmAgb2JqZWN0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JbXT4oXG4gIG5nRGV2TW9kZSA/ICdIVFRQX0lOVEVSQ0VQVE9SUycgOiAnJyxcbik7XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlZCB0b2tlbiBvZiBgSHR0cEludGVyY2VwdG9yRm5gcy5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfSU5URVJDRVBUT1JfRk5TID0gbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUl9GTlMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMgdGhhdCBhcmUgb25seSBzZXQgaW4gcm9vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yRm5bXT4oXG4gIG5nRGV2TW9kZSA/ICdIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TJyA6ICcnLFxuKTtcblxuLy8gVE9ETyhhdHNjb3R0KTogV2UgbmVlZCBhIGxhcmdlciBkaXNjdXNzaW9uIGFib3V0IHN0YWJpbGl0eSBhbmQgd2hhdCBzaG91bGQgY29udHJpYnV0ZSB0byBzdGFiaWxpdHkuXG4vLyBTaG91bGQgdGhlIHdob2xlIGludGVyY2VwdG9yIGNoYWluIGNvbnRyaWJ1dGUgdG8gc3RhYmlsaXR5IG9yIGp1c3QgdGhlIGJhY2tlbmQgcmVxdWVzdCAjNTUwNzU/XG4vLyBTaG91bGQgSHR0cENsaWVudCBjb250cmlidXRlIHRvIHN0YWJpbGl0eSBhdXRvbWF0aWNhbGx5IGF0IGFsbD9cbmV4cG9ydCBjb25zdCBSRVFVRVNUU19DT05UUklCVVRFX1RPX1NUQUJJTElUWSA9IG5ldyBJbmplY3Rpb25Ub2tlbjxib29sZWFuPihcbiAgbmdEZXZNb2RlID8gJ1JFUVVFU1RTX0NPTlRSSUJVVEVfVE9fU1RBQklMSVRZJyA6ICcnLFxuICB7cHJvdmlkZWRJbjogJ3Jvb3QnLCBmYWN0b3J5OiAoKSA9PiB0cnVlfSxcbik7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBgSHR0cEludGVyY2VwdG9yRm5gIHdoaWNoIGxhemlseSBpbml0aWFsaXplcyBhbiBpbnRlcmNlcHRvciBjaGFpbiBmcm9tIHRoZSBsZWdhY3lcbiAqIGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycyBhbmQgcnVucyB0aGUgcmVxdWVzdCB0aHJvdWdoIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVnYWN5SW50ZXJjZXB0b3JGbkZhY3RvcnkoKTogSHR0cEludGVyY2VwdG9yRm4ge1xuICBsZXQgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4gfCBudWxsID0gbnVsbDtcblxuICByZXR1cm4gKHJlcSwgaGFuZGxlcikgPT4ge1xuICAgIGlmIChjaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gaW5qZWN0KEhUVFBfSU5URVJDRVBUT1JTLCB7b3B0aW9uYWw6IHRydWV9KSA/PyBbXTtcbiAgICAgIC8vIE5vdGU6IGludGVyY2VwdG9ycyBhcmUgd3JhcHBlZCByaWdodC10by1sZWZ0IHNvIHRoYXQgZmluYWwgZXhlY3V0aW9uIG9yZGVyIGlzXG4gICAgICAvLyBsZWZ0LXRvLXJpZ2h0LiBUaGF0IGlzLCBpZiBgaW50ZXJjZXB0b3JzYCBpcyB0aGUgYXJyYXkgYFthLCBiLCBjXWAsIHdlIHdhbnQgdG9cbiAgICAgIC8vIHByb2R1Y2UgYSBjaGFpbiB0aGF0IGlzIGNvbmNlcHR1YWxseSBgYyhiKGEoZW5kKSkpYCwgd2hpY2ggd2UgYnVpbGQgZnJvbSB0aGUgaW5zaWRlXG4gICAgICAvLyBvdXQuXG4gICAgICBjaGFpbiA9IGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgICAgYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4sXG4gICAgICAgIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBjb25zdCBwZW5kaW5nVGFza3MgPSBpbmplY3QoUGVuZGluZ1Rhc2tzKTtcbiAgICBjb25zdCBjb250cmlidXRlVG9TdGFiaWxpdHkgPSBpbmplY3QoUkVRVUVTVFNfQ09OVFJJQlVURV9UT19TVEFCSUxJVFkpO1xuICAgIGlmIChjb250cmlidXRlVG9TdGFiaWxpdHkpIHtcbiAgICAgIGNvbnN0IHRhc2tJZCA9IHBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICAgIHJldHVybiBjaGFpbihyZXEsIGhhbmRsZXIpLnBpcGUoZmluYWxpemUoKCkgPT4gcGVuZGluZ1Rhc2tzLnJlbW92ZSh0YXNrSWQpKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBjaGFpbihyZXEsIGhhbmRsZXIpO1xuICAgIH1cbiAgfTtcbn1cblxubGV0IGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSBmYWxzZTtcblxuLyoqIEludGVybmFsIGZ1bmN0aW9uIHRvIHJlc2V0IHRoZSBmbGFnIGluIHRlc3RzICovXG5leHBvcnQgZnVuY3Rpb24gcmVzZXRGZXRjaEJhY2tlbmRXYXJuaW5nRmxhZygpIHtcbiAgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IGZhbHNlO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cEludGVyY2VwdG9ySGFuZGxlciBleHRlbmRzIEh0dHBIYW5kbGVyIHtcbiAgcHJpdmF0ZSBjaGFpbjogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4gfCBudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nVGFza3MgPSBpbmplY3QoUGVuZGluZ1Rhc2tzKTtcbiAgcHJpdmF0ZSByZWFkb25seSBjb250cmlidXRlVG9TdGFiaWxpdHkgPSBpbmplY3QoUkVRVUVTVFNfQ09OVFJJQlVURV9UT19TVEFCSUxJVFkpO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgIHByaXZhdGUgYmFja2VuZDogSHR0cEJhY2tlbmQsXG4gICAgcHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3RvcixcbiAgKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIFdlIHN0cm9uZ2x5IHJlY29tbWVuZCB1c2luZyBmZXRjaCBiYWNrZW5kIGZvciBIVFRQIGNhbGxzIHdoZW4gU1NSIGlzIHVzZWRcbiAgICAvLyBmb3IgYW4gYXBwbGljYXRpb24uIFRoZSBsb2dpYyBiZWxvdyBjaGVja3MgaWYgdGhhdCdzIHRoZSBjYXNlIGFuZCBwcm9kdWNlc1xuICAgIC8vIGEgd2FybmluZyBvdGhlcndpc2UuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICFmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkKSB7XG4gICAgICBjb25zdCBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lEKSk7XG4gICAgICBpZiAoaXNTZXJ2ZXIgJiYgISh0aGlzLmJhY2tlbmQgaW5zdGFuY2VvZiBGZXRjaEJhY2tlbmQpKSB7XG4gICAgICAgIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICBpbmplY3RvclxuICAgICAgICAgIC5nZXQoQ29uc29sZSlcbiAgICAgICAgICAud2FybihcbiAgICAgICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5OT1RfVVNJTkdfRkVUQ0hfQkFDS0VORF9JTl9TU1IsXG4gICAgICAgICAgICAgICdBbmd1bGFyIGRldGVjdGVkIHRoYXQgYEh0dHBDbGllbnRgIGlzIG5vdCBjb25maWd1cmVkICcgK1xuICAgICAgICAgICAgICAgIFwidG8gdXNlIGBmZXRjaGAgQVBJcy4gSXQncyBzdHJvbmdseSByZWNvbW1lbmRlZCB0byBcIiArXG4gICAgICAgICAgICAgICAgJ2VuYWJsZSBgZmV0Y2hgIGZvciBhcHBsaWNhdGlvbnMgdGhhdCB1c2UgU2VydmVyLVNpZGUgUmVuZGVyaW5nICcgK1xuICAgICAgICAgICAgICAgICdmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBjb21wYXRpYmlsaXR5LiAnICtcbiAgICAgICAgICAgICAgICAnVG8gZW5hYmxlIGBmZXRjaGAsIGFkZCB0aGUgYHdpdGhGZXRjaCgpYCB0byB0aGUgYHByb3ZpZGVIdHRwQ2xpZW50KClgICcgK1xuICAgICAgICAgICAgICAgICdjYWxsIGF0IHRoZSByb290IG9mIHRoZSBhcHBsaWNhdGlvbi4nLFxuICAgICAgICAgICAgKSxcbiAgICAgICAgICApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIG92ZXJyaWRlIGhhbmRsZShpbml0aWFsUmVxdWVzdDogSHR0cFJlcXVlc3Q8YW55Pik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICBpZiAodGhpcy5jaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgZGVkdXBlZEludGVyY2VwdG9yRm5zID0gQXJyYXkuZnJvbShcbiAgICAgICAgbmV3IFNldChbXG4gICAgICAgICAgLi4udGhpcy5pbmplY3Rvci5nZXQoSFRUUF9JTlRFUkNFUFRPUl9GTlMpLFxuICAgICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMsIFtdKSxcbiAgICAgICAgXSksXG4gICAgICApO1xuXG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGRlZHVwZWRJbnRlcmNlcHRvckZuc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgdGhpcy5jaGFpbiA9IGRlZHVwZWRJbnRlcmNlcHRvckZucy5yZWR1Y2VSaWdodChcbiAgICAgICAgKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbikgPT5cbiAgICAgICAgICBjaGFpbmVkSW50ZXJjZXB0b3JGbihuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4sIHRoaXMuaW5qZWN0b3IpLFxuICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4sXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmICh0aGlzLmNvbnRyaWJ1dGVUb1N0YWJpbGl0eSkge1xuICAgICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgICByZXR1cm4gdGhpcy5jaGFpbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgICB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSxcbiAgICAgICkucGlwZShmaW5hbGl6ZSgoKSA9PiB0aGlzLnBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5jaGFpbihpbml0aWFsUmVxdWVzdCwgKGRvd25zdHJlYW1SZXF1ZXN0KSA9PlxuICAgICAgICB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSxcbiAgICAgICk7XG4gICAgfVxuICB9XG59XG4iXX0=