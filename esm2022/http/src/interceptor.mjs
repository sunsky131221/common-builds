/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EnvironmentInjector, inject, Injectable, InjectionToken, ɵInitialRenderPendingTasks as InitialRenderPendingTasks } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { HttpBackend, HttpHandler } from './backend';
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.0.0-next.6+sha-4611b70", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.0.0-next.6+sha-4611b70", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.0.0-next.6+sha-4611b70", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixJQUFJLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRS9JLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7O0FBNEhuRCxTQUFTLHFCQUFxQixDQUMxQixHQUFxQixFQUFFLGNBQTZCO0lBQ3RELE9BQU8sY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLDZCQUE2QixDQUNsQyxXQUFzQyxFQUN0QyxXQUE0QjtJQUM5QixPQUFPLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUU7UUFDL0UsTUFBTSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUM7S0FDOUUsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsb0JBQW9CLENBQ3pCLFdBQTBDLEVBQUUsYUFBZ0MsRUFDNUUsUUFBNkI7SUFDL0IsbUJBQW1CO0lBQ25CLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUNwRSxhQUFhLENBQ1gsY0FBYyxFQUNkLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUs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TztZQUNQLElBQUksQ0FBQyxLQUFLLEdBQUcscUJBQXFCLENBQUMsV0FBVyxDQUMxQyxDQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUMvQixvQkFBb0IsQ0FBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDdkUscUJBQXNELENBQUMsQ0FBQztTQUM3RDtRQUVELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDdkMsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQzthQUN6RixJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM5RCxDQUFDO3lIQWxDVSxzQkFBc0I7NkhBQXRCLHNCQUFzQjs7c0dBQXRCLHNCQUFzQjtrQkFEbEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Vudmlyb25tZW50SW5qZWN0b3IsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIMm1SW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyBhcyBJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuLyoqXG4gKiBJbnRlcmNlcHRzIGFuZCBoYW5kbGVzIGFuIGBIdHRwUmVxdWVzdGAgb3IgYEh0dHBSZXNwb25zZWAuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgdHJhbnNmb3JtIHRoZSBvdXRnb2luZyByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIGJ5IGNhbGxpbmcgYG5leHQuaGFuZGxlKHRyYW5zZm9ybWVkUmVxKWAuXG4gKiBBbiBpbnRlcmNlcHRvciBtYXkgdHJhbnNmb3JtIHRoZVxuICogcmVzcG9uc2UgZXZlbnQgc3RyZWFtIGFzIHdlbGwsIGJ5IGFwcGx5aW5nIGFkZGl0aW9uYWwgUnhKUyBvcGVyYXRvcnMgb24gdGhlIHN0cmVhbVxuICogcmV0dXJuZWQgYnkgYG5leHQuaGFuZGxlKClgLlxuICpcbiAqIE1vcmUgcmFyZWx5LCBhbiBpbnRlcmNlcHRvciBtYXkgaGFuZGxlIHRoZSByZXF1ZXN0IGVudGlyZWx5LFxuICogYW5kIGNvbXBvc2UgYSBuZXcgZXZlbnQgc3RyZWFtIGluc3RlYWQgb2YgaW52b2tpbmcgYG5leHQuaGFuZGxlKClgLiBUaGlzIGlzIGFuXG4gKiBhY2NlcHRhYmxlIGJlaGF2aW9yLCBidXQga2VlcCBpbiBtaW5kIHRoYXQgZnVydGhlciBpbnRlcmNlcHRvcnMgd2lsbCBiZSBza2lwcGVkIGVudGlyZWx5LlxuICpcbiAqIEl0IGlzIGFsc28gcmFyZSBidXQgdmFsaWQgZm9yIGFuIGludGVyY2VwdG9yIHRvIHJldHVybiBtdWx0aXBsZSByZXNwb25zZXMgb24gdGhlXG4gKiBldmVudCBzdHJlYW0gZm9yIGEgc2luZ2xlIHJlcXVlc3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAtaW50ZXJjZXB0LXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKiBAc2VlIHtAbGluayBIdHRwSW50ZXJjZXB0b3JGbn1cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqIFRvIHVzZSB0aGUgc2FtZSBpbnN0YW5jZSBvZiBgSHR0cEludGVyY2VwdG9yc2AgZm9yIHRoZSBlbnRpcmUgYXBwLCBpbXBvcnQgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYFxuICogb25seSBpbiB5b3VyIGBBcHBNb2R1bGVgLCBhbmQgYWRkIHRoZSBpbnRlcmNlcHRvcnMgdG8gdGhlIHJvb3QgYXBwbGljYXRpb24gaW5qZWN0b3IuXG4gKiBJZiB5b3UgaW1wb3J0IGBIdHRwQ2xpZW50TW9kdWxlYCBtdWx0aXBsZSB0aW1lcyBhY3Jvc3MgZGlmZmVyZW50IG1vZHVsZXMgKGZvciBleGFtcGxlLCBpbiBsYXp5XG4gKiBsb2FkaW5nIG1vZHVsZXMpLCBlYWNoIGltcG9ydCBjcmVhdGVzIGEgbmV3IGNvcHkgb2YgdGhlIGBIdHRwQ2xpZW50TW9kdWxlYCwgd2hpY2ggb3ZlcndyaXRlcyB0aGVcbiAqIGludGVyY2VwdG9ycyBwcm92aWRlZCBpbiB0aGUgcm9vdCBtb2R1bGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIElkZW50aWZpZXMgYW5kIGhhbmRsZXMgYSBnaXZlbiBIVFRQIHJlcXVlc3QuXG4gICAqIEBwYXJhbSByZXEgVGhlIG91dGdvaW5nIHJlcXVlc3Qgb2JqZWN0IHRvIGhhbmRsZS5cbiAgICogQHBhcmFtIG5leHQgVGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBvciB0aGUgYmFja2VuZFxuICAgKiBpZiBubyBpbnRlcmNlcHRvcnMgcmVtYWluIGluIHRoZSBjaGFpbi5cbiAgICogQHJldHVybnMgQW4gb2JzZXJ2YWJsZSBvZiB0aGUgZXZlbnQgc3RyZWFtLlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIHRoZSBuZXh0IGludGVyY2VwdG9yIGluIGFuIGludGVyY2VwdG9yIGNoYWluLCBvciB0aGUgcmVhbCBiYWNrZW5kIGlmIHRoZXJlIGFyZSBub1xuICogZnVydGhlciBpbnRlcmNlcHRvcnMuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBhbmQgZWl0aGVyIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciB0aGVcbiAqIHJlc3BvbnNlIHdoZW4gaXQgYXJyaXZlcy4gV2l0aGluIHRoZSBzY29wZSBvZiB0aGUgY3VycmVudCByZXF1ZXN0LCBob3dldmVyLCB0aGlzIGZ1bmN0aW9uIG1heSBiZVxuICogY2FsbGVkIGFueSBudW1iZXIgb2YgdGltZXMsIGZvciBhbnkgbnVtYmVyIG9mIGRvd25zdHJlYW0gcmVxdWVzdHMuIFN1Y2ggZG93bnN0cmVhbSByZXF1ZXN0cyBuZWVkXG4gKiBub3QgYmUgdG8gdGhlIHNhbWUgVVJMIG9yIGV2ZW4gdGhlIHNhbWUgb3JpZ2luIGFzIHRoZSBjdXJyZW50IHJlcXVlc3QuIEl0IGlzIGFsc28gdmFsaWQgdG8gbm90XG4gKiBjYWxsIHRoZSBkb3duc3RyZWFtIGhhbmRsZXIgYXQgYWxsLCBhbmQgcHJvY2VzcyB0aGUgY3VycmVudCByZXF1ZXN0IGVudGlyZWx5IHdpdGhpbiB0aGVcbiAqIGludGVyY2VwdG9yLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gc2hvdWxkIG9ubHkgYmUgY2FsbGVkIHdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIHJlcXVlc3QgdGhhdCdzIGN1cnJlbnRseSBiZWluZ1xuICogaW50ZXJjZXB0ZWQuIE9uY2UgdGhhdCByZXF1ZXN0IGlzIGNvbXBsZXRlLCB0aGlzIGRvd25zdHJlYW0gaGFuZGxlciBmdW5jdGlvbiBzaG91bGQgbm90IGJlXG4gKiBjYWxsZWQuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAtaW50ZXJjZXB0LXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBIYW5kbGVyRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPikgPT4gT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8dW5rbm93bj4+O1xuXG4vKipcbiAqIEFuIGludGVyY2VwdG9yIGZvciBIVFRQIHJlcXVlc3RzIG1hZGUgdmlhIGBIdHRwQ2xpZW50YC5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBhcmUgbWlkZGxld2FyZSBmdW5jdGlvbnMgd2hpY2ggYEh0dHBDbGllbnRgIGNhbGxzIHdoZW4gYSByZXF1ZXN0IGlzIG1hZGUuXG4gKiBUaGVzZSBmdW5jdGlvbnMgaGF2ZSB0aGUgb3Bwb3J0dW5pdHkgdG8gbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIGFueSByZXNwb25zZSB0aGF0IGNvbWVzXG4gKiBiYWNrLCBhcyB3ZWxsIGFzIGJsb2NrLCByZWRpcmVjdCwgb3Igb3RoZXJ3aXNlIGNoYW5nZSB0aGUgcmVxdWVzdCBvciByZXNwb25zZSBzZW1hbnRpY3MuXG4gKlxuICogQW4gYEh0dHBIYW5kbGVyRm5gIHJlcHJlc2VudGluZyB0aGUgbmV4dCBpbnRlcmNlcHRvciAob3IgdGhlIGJhY2tlbmQgd2hpY2ggd2lsbCBtYWtlIGEgcmVhbCBIVFRQXG4gKiByZXF1ZXN0KSBpcyBwcm92aWRlZC4gTW9zdCBpbnRlcmNlcHRvcnMgd2lsbCBkZWxlZ2F0ZSB0byB0aGlzIGZ1bmN0aW9uLCBidXQgdGhhdCBpcyBub3QgcmVxdWlyZWRcbiAqIChzZWUgYEh0dHBIYW5kbGVyRm5gIGZvciBtb3JlIGRldGFpbHMpLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBleGVjdXRlZCBpbiBhbiBbaW5qZWN0aW9uIGNvbnRleHRdKC9ndWlkZS9kZXBlbmRlbmN5LWluamVjdGlvbi1jb250ZXh0KS5cbiAqIFRoZXkgaGF2ZSBhY2Nlc3MgdG8gYGluamVjdCgpYCB2aWEgdGhlIGBFbnZpcm9ubWVudEluamVjdG9yYCBmcm9tIHdoaWNoIHRoZXkgd2VyZSBjb25maWd1cmVkLlxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAtaW50ZXJjZXB0LXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKiBAc2VlIHtAbGluayB3aXRoSW50ZXJjZXB0b3JzfVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBIZXJlIGlzIGEgbm9vcCBpbnRlcmNlcHRvciB0aGF0IHBhc3NlcyB0aGUgcmVxdWVzdCB0aHJvdWdoIHdpdGhvdXQgbW9kaWZ5aW5nIGl0OlxuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IG5vb3BJbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDpcbiAqIEh0dHBIYW5kbGVyRm4pID0+IHtcbiAqICAgcmV0dXJuIG5leHQobW9kaWZpZWRSZXEpO1xuICogfTtcbiAqIGBgYFxuICpcbiAqIElmIHlvdSB3YW50IHRvIGFsdGVyIGEgcmVxdWVzdCwgY2xvbmUgaXQgZmlyc3QgYW5kIG1vZGlmeSB0aGUgY2xvbmUgYmVmb3JlIHBhc3NpbmcgaXQgdG8gdGhlXG4gKiBgbmV4dCgpYCBoYW5kbGVyIGZ1bmN0aW9uLlxuICpcbiAqIEhlcmUgaXMgYSBiYXNpYyBpbnRlcmNlcHRvciB0aGF0IGFkZHMgYSBiZWFyZXIgdG9rZW4gdG8gdGhlIGhlYWRlcnNcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBhdXRoZW50aWNhdGlvbkludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICAgY29uc3QgdXNlclRva2VuID0gJ01ZX1RPS0VOJzsgY29uc3QgbW9kaWZpZWRSZXEgPSByZXEuY2xvbmUoe1xuICogICAgICBoZWFkZXJzOiByZXEuaGVhZGVycy5zZXQoJ0F1dGhvcml6YXRpb24nLCBgQmVhcmVyICR7dXNlclRva2VufWApLFxuICogICAgfSk7XG4gKlxuICogICAgcmV0dXJuIG5leHQobW9kaWZpZWRSZXEpO1xuICogfTtcbiAqIGBgYFxuICovXG5leHBvcnQgdHlwZSBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OiBIdHRwSGFuZGxlckZuKSA9PlxuICAgIE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBGdW5jdGlvbiB3aGljaCBpbnZva2VzIGFuIEhUVFAgaW50ZXJjZXB0b3IgY2hhaW4uXG4gKlxuICogRWFjaCBpbnRlcmNlcHRvciBpbiB0aGUgaW50ZXJjZXB0b3IgY2hhaW4gaXMgdHVybmVkIGludG8gYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGNsb3Nlc1xuICogb3ZlciB0aGUgcmVzdCBvZiB0aGUgY2hhaW4gKHJlcHJlc2VudGVkIGJ5IGFub3RoZXIgYENoYWluZWRJbnRlcmNlcHRvckZuYCkuIFRoZSBsYXN0IHN1Y2hcbiAqIGZ1bmN0aW9uIGluIHRoZSBjaGFpbiB3aWxsIGluc3RlYWQgZGVsZWdhdGUgdG8gdGhlIGBmaW5hbEhhbmRsZXJGbmAsIHdoaWNoIGlzIHBhc3NlZCBkb3duIHdoZW5cbiAqIHRoZSBjaGFpbiBpcyBpbnZva2VkLlxuICpcbiAqIFRoaXMgcGF0dGVybiBhbGxvd3MgZm9yIGEgY2hhaW4gb2YgbWFueSBpbnRlcmNlcHRvcnMgdG8gYmUgY29tcG9zZWQgYW5kIHdyYXBwZWQgaW4gYSBzaW5nbGVcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmAsIHdoaWNoIGlzIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBpbmNsdWRpbmcgZGlmZmVyZW50IGtpbmRzIG9mIGludGVyY2VwdG9yc1xuICogKGUuZy4gbGVnYWN5IGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycykgaW4gdGhlIHNhbWUgY2hhaW4uXG4gKi9cbnR5cGUgQ2hhaW5lZEludGVyY2VwdG9yRm48UmVxdWVzdFQ+ID0gKHJlcTogSHR0cFJlcXVlc3Q8UmVxdWVzdFQ+LCBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbikgPT5cbiAgICBPYnNlcnZhYmxlPEh0dHBFdmVudDxSZXF1ZXN0VD4+O1xuXG5mdW5jdGlvbiBpbnRlcmNlcHRvckNoYWluRW5kRm4oXG4gICAgcmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgcmV0dXJuIGZpbmFsSGFuZGxlckZuKHJlcSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggYWRhcHRzIGEgbGVnYWN5IGBIdHRwSW50ZXJjZXB0b3JgIHRvIHRoZVxuICogYENoYWluZWRJbnRlcmNlcHRvckZuYCBpbnRlcmZhY2UuXG4gKi9cbmZ1bmN0aW9uIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluKFxuICAgIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+LFxuICAgIGludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3IpOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHtcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+IGludGVyY2VwdG9yLmludGVyY2VwdChpbml0aWFsUmVxdWVzdCwge1xuICAgIGhhbmRsZTogKGRvd25zdHJlYW1SZXF1ZXN0KSA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICB9KTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCB3cmFwcyBhbmQgaW52b2tlcyBhIGZ1bmN0aW9uYWwgaW50ZXJjZXB0b3IgaW4gdGhlIGdpdmVuXG4gKiBpbmplY3Rvci5cbiAqL1xuZnVuY3Rpb24gY2hhaW5lZEludGVyY2VwdG9yRm4oXG4gICAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LCBpbnRlcmNlcHRvckZuOiBIdHRwSW50ZXJjZXB0b3JGbixcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcik6IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHtcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT4gaW5qZWN0b3IucnVuSW5Db250ZXh0KCgpID0+XG4gICAgaW50ZXJjZXB0b3JGbihcbiAgICAgIGluaXRpYWxSZXF1ZXN0LFxuICAgICAgZG93bnN0cmVhbVJlcXVlc3QgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKVxuICAgIClcbiAgKTtcbiAgLy8gY2xhbmctZm9ybWF0IG9uXG59XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlciB0b2tlbiB0aGF0IHJlcHJlc2VudHMgdGhlIGFycmF5IG9mIHJlZ2lzdGVyZWRcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIG9iamVjdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JbXT4obmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JTJyA6ICcnKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzLlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUl9GTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUl9GTlMnIDogJycpO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMgdGhhdCBhcmUgb25seSBzZXQgaW4gcm9vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihuZ0Rldk1vZGUgPyAnSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyk7XG5cbi8qKlxuICogQSBwcm92aWRlciB0byBzZXQgYSBnbG9iYWwgcHJpbWFyeSBodHRwIGJhY2tlbmQuIElmIHNldCwgaXQgd2lsbCBvdmVycmlkZSB0aGUgZGVmYXVsdCBvbmVcbiAqL1xuZXhwb3J0IGNvbnN0IFBSSU1BUllfSFRUUF9CQUNLRU5EID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48SHR0cEJhY2tlbmQ+KG5nRGV2TW9kZSA/ICdQUklNQVJZX0hUVFBfQkFDS0VORCcgOiAnJyk7XG5cblxuLyoqXG4gKiBDcmVhdGVzIGFuIGBIdHRwSW50ZXJjZXB0b3JGbmAgd2hpY2ggbGF6aWx5IGluaXRpYWxpemVzIGFuIGludGVyY2VwdG9yIGNoYWluIGZyb20gdGhlIGxlZ2FjeVxuICogY2xhc3MtYmFzZWQgaW50ZXJjZXB0b3JzIGFuZCBydW5zIHRoZSByZXF1ZXN0IHRocm91Z2ggaXQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZWdhY3lJbnRlcmNlcHRvckZuRmFjdG9yeSgpOiBIdHRwSW50ZXJjZXB0b3JGbiB7XG4gIGxldCBjaGFpbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PnxudWxsID0gbnVsbDtcblxuICByZXR1cm4gKHJlcSwgaGFuZGxlcikgPT4ge1xuICAgIGlmIChjaGFpbiA9PT0gbnVsbCkge1xuICAgICAgY29uc3QgaW50ZXJjZXB0b3JzID0gaW5qZWN0KEhUVFBfSU5URVJDRVBUT1JTLCB7b3B0aW9uYWw6IHRydWV9KSA/PyBbXTtcbiAgICAgIC8vIE5vdGU6IGludGVyY2VwdG9ycyBhcmUgd3JhcHBlZCByaWdodC10by1sZWZ0IHNvIHRoYXQgZmluYWwgZXhlY3V0aW9uIG9yZGVyIGlzXG4gICAgICAvLyBsZWZ0LXRvLXJpZ2h0LiBUaGF0IGlzLCBpZiBgaW50ZXJjZXB0b3JzYCBpcyB0aGUgYXJyYXkgYFthLCBiLCBjXWAsIHdlIHdhbnQgdG9cbiAgICAgIC8vIHByb2R1Y2UgYSBjaGFpbiB0aGF0IGlzIGNvbmNlcHR1YWxseSBgYyhiKGEoZW5kKSkpYCwgd2hpY2ggd2UgYnVpbGQgZnJvbSB0aGUgaW5zaWRlXG4gICAgICAvLyBvdXQuXG4gICAgICBjaGFpbiA9IGludGVyY2VwdG9ycy5yZWR1Y2VSaWdodChcbiAgICAgICAgICBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbiwgaW50ZXJjZXB0b3JDaGFpbkVuZEZuIGFzIENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4pO1xuICAgIH1cblxuICAgIGNvbnN0IHBlbmRpbmdUYXNrcyA9IGluamVjdChJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzKTtcbiAgICBjb25zdCB0YXNrSWQgPSBwZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgcmV0dXJuIGNoYWluKHJlcSwgaGFuZGxlcikucGlwZShmaW5hbGl6ZSgoKSA9PiBwZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCkpKTtcbiAgfTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIgZXh0ZW5kcyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+fG51bGwgPSBudWxsO1xuICBwcml2YXRlIHJlYWRvbmx5IHBlbmRpbmdUYXNrcyA9IGluamVjdChJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzKTtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLCBwcml2YXRlIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yKSB7XG4gICAgc3VwZXIoKTtcblxuICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcHJlZmVycmVkIEhUVFAgYmFja2VuZCBjb25maWd1cmVkIGFuZCB1c2UgaXQgaWYgdGhhdCdzIHRoZSBjYXNlLlxuICAgIC8vIFRoaXMgaXMgbmVlZGVkIHRvIGVuYWJsZSBgRmV0Y2hCYWNrZW5kYCBnbG9iYWxseSBmb3IgYWxsIEh0dHBDbGllbnQncyB3aGVuIGB3aXRoRmV0Y2hgXG4gICAgLy8gaXMgdXNlZC5cbiAgICBjb25zdCBwcmltYXJ5SHR0cEJhY2tlbmQgPSBpbmplY3QoUFJJTUFSWV9IVFRQX0JBQ0tFTkQsIHtvcHRpb25hbDogdHJ1ZX0pO1xuICAgIHRoaXMuYmFja2VuZCA9IHByaW1hcnlIdHRwQmFja2VuZCA/PyBiYWNrZW5kO1xuICB9XG5cbiAgb3ZlcnJpZGUgaGFuZGxlKGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBkZWR1cGVkSW50ZXJjZXB0b3JGbnMgPSBBcnJheS5mcm9tKG5ldyBTZXQoW1xuICAgICAgICAuLi50aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SX0ZOUyksXG4gICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMsIFtdKSxcbiAgICAgIF0pKTtcblxuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBkZWR1cGVkSW50ZXJjZXB0b3JGbnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIHRoaXMuY2hhaW4gPSBkZWR1cGVkSW50ZXJjZXB0b3JGbnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbikgPT5cbiAgICAgICAgICAgICAgY2hhaW5lZEludGVyY2VwdG9yRm4obmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuLCB0aGlzLmluamVjdG9yKSxcbiAgICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4pO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMucGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgIHJldHVybiB0aGlzLmNoYWluKGluaXRpYWxSZXF1ZXN0LCBkb3duc3RyZWFtUmVxdWVzdCA9PiB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSlcbiAgICAgICAgLnBpcGUoZmluYWxpemUoKCkgPT4gdGhpcy5wZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCkpKTtcbiAgfVxufVxuIl19