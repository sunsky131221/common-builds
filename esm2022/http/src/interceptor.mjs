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
class HttpInterceptorHandler extends HttpHandler {
    constructor(backend, injector) {
        super();
        this.backend = backend;
        this.injector = injector;
        this.chain = null;
        this.pendingTasks = inject(InitialRenderPendingTasks);
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.2+sha-7e468df", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.1.0-next.2+sha-7e468df", ngImport: i0, type: HttpInterceptorHandler }); }
}
export { HttpInterceptorHandler };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.2+sha-7e468df", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLDBCQUEwQixJQUFJLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRS9JLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQzs7O0FBZ0duRCxTQUFTLHFCQUFxQixDQUMxQixHQUFxQixFQUFFLGNBQTZCO0lBQ3RELE9BQU8sY0FBYyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0FBQzdCLENBQUM7QUFFRDs7O0dBR0c7QUFDSCxTQUFTLDZCQUE2QixDQUNsQyxXQUFzQyxFQUN0QyxXQUE0QjtJQUM5QixPQUFPLENBQUMsY0FBYyxFQUFFLGNBQWMsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxjQUFjLEVBQUU7UUFDL0UsTUFBTSxFQUFFLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUM7S0FDOUUsQ0FBQyxDQUFDO0FBQ0wsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsb0JBQW9CLENBQ3pCLFdBQTBDLEVBQUUsYUFBZ0MsRUFDNUUsUUFBNkI7SUFDL0IsbUJBQW1CO0lBQ25CLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUNwRSxhQUFhLENBQ1gsY0FBYyxFQUNkLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxXQUFXLENBQUMsaUJBQWlCLEVBQUUs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QUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3pGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7eUhBNUJVLHNCQUFzQjs2SEFBdEIsc0JBQXNCOztTQUF0QixzQkFBc0I7c0dBQXRCLHNCQUFzQjtrQkFEbEMsVUFBVSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Vudmlyb25tZW50SW5qZWN0b3IsIGluamVjdCwgSW5qZWN0YWJsZSwgSW5qZWN0aW9uVG9rZW4sIMm1SW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyBhcyBJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5pbXBvcnQge2ZpbmFsaXplfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmQsIEh0dHBIYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuLyoqXG4gKiBJbnRlcmNlcHRzIGFuZCBoYW5kbGVzIGFuIGBIdHRwUmVxdWVzdGAgb3IgYEh0dHBSZXNwb25zZWAuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgdHJhbnNmb3JtIHRoZSBvdXRnb2luZyByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIGJ5IGNhbGxpbmcgYG5leHQuaGFuZGxlKHRyYW5zZm9ybWVkUmVxKWAuXG4gKiBBbiBpbnRlcmNlcHRvciBtYXkgdHJhbnNmb3JtIHRoZVxuICogcmVzcG9uc2UgZXZlbnQgc3RyZWFtIGFzIHdlbGwsIGJ5IGFwcGx5aW5nIGFkZGl0aW9uYWwgUnhKUyBvcGVyYXRvcnMgb24gdGhlIHN0cmVhbVxuICogcmV0dXJuZWQgYnkgYG5leHQuaGFuZGxlKClgLlxuICpcbiAqIE1vcmUgcmFyZWx5LCBhbiBpbnRlcmNlcHRvciBtYXkgaGFuZGxlIHRoZSByZXF1ZXN0IGVudGlyZWx5LFxuICogYW5kIGNvbXBvc2UgYSBuZXcgZXZlbnQgc3RyZWFtIGluc3RlYWQgb2YgaW52b2tpbmcgYG5leHQuaGFuZGxlKClgLiBUaGlzIGlzIGFuXG4gKiBhY2NlcHRhYmxlIGJlaGF2aW9yLCBidXQga2VlcCBpbiBtaW5kIHRoYXQgZnVydGhlciBpbnRlcmNlcHRvcnMgd2lsbCBiZSBza2lwcGVkIGVudGlyZWx5LlxuICpcbiAqIEl0IGlzIGFsc28gcmFyZSBidXQgdmFsaWQgZm9yIGFuIGludGVyY2VwdG9yIHRvIHJldHVybiBtdWx0aXBsZSByZXNwb25zZXMgb24gdGhlXG4gKiBldmVudCBzdHJlYW0gZm9yIGEgc2luZ2xlIHJlcXVlc3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAjaW50ZXJjZXB0aW5nLXJlcXVlc3RzLWFuZC1yZXNwb25zZXMpXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUbyB1c2UgdGhlIHNhbWUgaW5zdGFuY2Ugb2YgYEh0dHBJbnRlcmNlcHRvcnNgIGZvciB0aGUgZW50aXJlIGFwcCwgaW1wb3J0IHRoZSBgSHR0cENsaWVudE1vZHVsZWBcbiAqIG9ubHkgaW4geW91ciBgQXBwTW9kdWxlYCwgYW5kIGFkZCB0aGUgaW50ZXJjZXB0b3JzIHRvIHRoZSByb290IGFwcGxpY2F0aW9uIGluamVjdG9yLlxuICogSWYgeW91IGltcG9ydCBgSHR0cENsaWVudE1vZHVsZWAgbXVsdGlwbGUgdGltZXMgYWNyb3NzIGRpZmZlcmVudCBtb2R1bGVzIChmb3IgZXhhbXBsZSwgaW4gbGF6eVxuICogbG9hZGluZyBtb2R1bGVzKSwgZWFjaCBpbXBvcnQgY3JlYXRlcyBhIG5ldyBjb3B5IG9mIHRoZSBgSHR0cENsaWVudE1vZHVsZWAsIHdoaWNoIG92ZXJ3cml0ZXMgdGhlXG4gKiBpbnRlcmNlcHRvcnMgcHJvdmlkZWQgaW4gdGhlIHJvb3QgbW9kdWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGFuZCBoYW5kbGVzIGEgZ2l2ZW4gSFRUUCByZXF1ZXN0LlxuICAgKiBAcGFyYW0gcmVxIFRoZSBvdXRnb2luZyByZXF1ZXN0IG9iamVjdCB0byBoYW5kbGUuXG4gICAqIEBwYXJhbSBuZXh0IFRoZSBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgb3IgdGhlIGJhY2tlbmRcbiAgICogaWYgbm8gaW50ZXJjZXB0b3JzIHJlbWFpbiBpbiB0aGUgY2hhaW4uXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIGV2ZW50IHN0cmVhbS5cbiAgICovXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj47XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgbmV4dCBpbnRlcmNlcHRvciBpbiBhbiBpbnRlcmNlcHRvciBjaGFpbiwgb3IgdGhlIHJlYWwgYmFja2VuZCBpZiB0aGVyZSBhcmUgbm9cbiAqIGZ1cnRoZXIgaW50ZXJjZXB0b3JzLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYW5kIGVpdGhlciBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgdGhlXG4gKiByZXNwb25zZSB3aGVuIGl0IGFycml2ZXMuIFdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIGN1cnJlbnQgcmVxdWVzdCwgaG93ZXZlciwgdGhpcyBmdW5jdGlvbiBtYXkgYmVcbiAqIGNhbGxlZCBhbnkgbnVtYmVyIG9mIHRpbWVzLCBmb3IgYW55IG51bWJlciBvZiBkb3duc3RyZWFtIHJlcXVlc3RzLiBTdWNoIGRvd25zdHJlYW0gcmVxdWVzdHMgbmVlZFxuICogbm90IGJlIHRvIHRoZSBzYW1lIFVSTCBvciBldmVuIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCByZXF1ZXN0LiBJdCBpcyBhbHNvIHZhbGlkIHRvIG5vdFxuICogY2FsbCB0aGUgZG93bnN0cmVhbSBoYW5kbGVyIGF0IGFsbCwgYW5kIHByb2Nlc3MgdGhlIGN1cnJlbnQgcmVxdWVzdCBlbnRpcmVseSB3aXRoaW4gdGhlXG4gKiBpbnRlcmNlcHRvci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoZSByZXF1ZXN0IHRoYXQncyBjdXJyZW50bHkgYmVpbmdcbiAqIGludGVyY2VwdGVkLiBPbmNlIHRoYXQgcmVxdWVzdCBpcyBjb21wbGV0ZSwgdGhpcyBkb3duc3RyZWFtIGhhbmRsZXIgZnVuY3Rpb24gc2hvdWxkIG5vdCBiZVxuICogY2FsbGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwI2ludGVyY2VwdGluZy1yZXF1ZXN0cy1hbmQtcmVzcG9uc2VzKVxuICovXG5leHBvcnQgdHlwZSBIdHRwSGFuZGxlckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBBbiBpbnRlcmNlcHRvciBmb3IgSFRUUCByZXF1ZXN0cyBtYWRlIHZpYSBgSHR0cENsaWVudGAuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIG1pZGRsZXdhcmUgZnVuY3Rpb25zIHdoaWNoIGBIdHRwQ2xpZW50YCBjYWxscyB3aGVuIGEgcmVxdWVzdCBpcyBtYWRlLlxuICogVGhlc2UgZnVuY3Rpb25zIGhhdmUgdGhlIG9wcG9ydHVuaXR5IHRvIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciBhbnkgcmVzcG9uc2UgdGhhdCBjb21lc1xuICogYmFjaywgYXMgd2VsbCBhcyBibG9jaywgcmVkaXJlY3QsIG9yIG90aGVyd2lzZSBjaGFuZ2UgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2Ugc2VtYW50aWNzLlxuICpcbiAqIEFuIGBIdHRwSGFuZGxlckZuYCByZXByZXNlbnRpbmcgdGhlIG5leHQgaW50ZXJjZXB0b3IgKG9yIHRoZSBiYWNrZW5kIHdoaWNoIHdpbGwgbWFrZSBhIHJlYWwgSFRUUFxuICogcmVxdWVzdCkgaXMgcHJvdmlkZWQuIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYnV0IHRoYXQgaXMgbm90IHJlcXVpcmVkXG4gKiAoc2VlIGBIdHRwSGFuZGxlckZuYCBmb3IgbW9yZSBkZXRhaWxzKS5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBoYXZlIGFjY2VzcyB0byBgaW5qZWN0KClgIHZpYSB0aGUgYEVudmlyb25tZW50SW5qZWN0b3JgIGZyb20gd2hpY2ggdGhleSB3ZXJlXG4gKiBjb25maWd1cmVkLlxuICovXG5leHBvcnQgdHlwZSBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OiBIdHRwSGFuZGxlckZuKSA9PlxuICAgIE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBGdW5jdGlvbiB3aGljaCBpbnZva2VzIGFuIEhUVFAgaW50ZXJjZXB0b3IgY2hhaW4uXG4gKlxuICogRWFjaCBpbnRlcmNlcHRvciBpbiB0aGUgaW50ZXJjZXB0b3IgY2hhaW4gaXMgdHVybmVkIGludG8gYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGNsb3Nlc1xuICogb3ZlciB0aGUgcmVzdCBvZiB0aGUgY2hhaW4gKHJlcHJlc2VudGVkIGJ5IGFub3RoZXIgYENoYWluZWRJbnRlcmNlcHRvckZuYCkuIFRoZSBsYXN0IHN1Y2hcbiAqIGZ1bmN0aW9uIGluIHRoZSBjaGFpbiB3aWxsIGluc3RlYWQgZGVsZWdhdGUgdG8gdGhlIGBmaW5hbEhhbmRsZXJGbmAsIHdoaWNoIGlzIHBhc3NlZCBkb3duIHdoZW5cbiAqIHRoZSBjaGFpbiBpcyBpbnZva2VkLlxuICpcbiAqIFRoaXMgcGF0dGVybiBhbGxvd3MgZm9yIGEgY2hhaW4gb2YgbWFueSBpbnRlcmNlcHRvcnMgdG8gYmUgY29tcG9zZWQgYW5kIHdyYXBwZWQgaW4gYSBzaW5nbGVcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmAsIHdoaWNoIGlzIGEgdXNlZnVsIGFic3RyYWN0aW9uIGZvciBpbmNsdWRpbmcgZGlmZmVyZW50IGtpbmRzIG9mIGludGVyY2VwdG9yc1xuICogKGUuZy4gbGVnYWN5IGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycykgaW4gdGhlIHNhbWUgY2hhaW4uXG4gKi9cbnR5cGUgQ2hhaW5lZEludGVyY2VwdG9yRm48UmVxdWVzdFQ+ID0gKHJlcTogSHR0cFJlcXVlc3Q8UmVxdWVzdFQ+LCBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbikgPT5cbiAgICBPYnNlcnZhYmxlPEh0dHBFdmVudDxSZXF1ZXN0VD4+O1xuXG5mdW5jdGlvbiBpbnRlcmNlcHRvckNoYWluRW5kRm4oXG4gICAgcmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBmaW5hbEhhbmRsZXJGbjogSHR0cEhhbmRsZXJGbik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgcmV0dXJuIGZpbmFsSGFuZGxlckZuKHJlcSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggYWRhcHRzIGEgbGVnYWN5IGBIdHRwSW50ZXJjZXB0b3JgIHRvIHRoZVxuICogYENoYWluZWRJbnRlcmNlcHRvckZuYCBpbnRlcmZhY2UuXG4gKi9cbmZ1bmN0aW9uIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluKFxuICAgIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+LFxuICAgIGludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3IpOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHtcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+IGludGVyY2VwdG9yLmludGVyY2VwdChpbml0aWFsUmVxdWVzdCwge1xuICAgIGhhbmRsZTogKGRvd25zdHJlYW1SZXF1ZXN0KSA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pLFxuICB9KTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCB3cmFwcyBhbmQgaW52b2tlcyBhIGZ1bmN0aW9uYWwgaW50ZXJjZXB0b3IgaW4gdGhlIGdpdmVuXG4gKiBpbmplY3Rvci5cbiAqL1xuZnVuY3Rpb24gY2hhaW5lZEludGVyY2VwdG9yRm4oXG4gICAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LCBpbnRlcmNlcHRvckZuOiBIdHRwSW50ZXJjZXB0b3JGbixcbiAgICBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcik6IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHtcbiAgLy8gY2xhbmctZm9ybWF0IG9mZlxuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT4gaW5qZWN0b3IucnVuSW5Db250ZXh0KCgpID0+XG4gICAgaW50ZXJjZXB0b3JGbihcbiAgICAgIGluaXRpYWxSZXF1ZXN0LFxuICAgICAgZG93bnN0cmVhbVJlcXVlc3QgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKVxuICAgIClcbiAgKTtcbiAgLy8gY2xhbmctZm9ybWF0IG9uXG59XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlciB0b2tlbiB0aGF0IHJlcHJlc2VudHMgdGhlIGFycmF5IG9mIHJlZ2lzdGVyZWRcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIG9iamVjdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwSW50ZXJjZXB0b3JbXT4obmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JTJyA6ICcnKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzLlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUl9GTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwSW50ZXJjZXB0b3JGbltdPihuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUl9GTlMnIDogJycpO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMgdGhhdCBhcmUgb25seSBzZXQgaW4gcm9vdC5cbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwSW50ZXJjZXB0b3JGbltdPihuZ0Rldk1vZGUgPyAnSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBgSHR0cEludGVyY2VwdG9yRm5gIHdoaWNoIGxhemlseSBpbml0aWFsaXplcyBhbiBpbnRlcmNlcHRvciBjaGFpbiBmcm9tIHRoZSBsZWdhY3lcbiAqIGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycyBhbmQgcnVucyB0aGUgcmVxdWVzdCB0aHJvdWdoIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVnYWN5SW50ZXJjZXB0b3JGbkZhY3RvcnkoKTogSHR0cEludGVyY2VwdG9yRm4ge1xuICBsZXQgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT58bnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIChyZXEsIGhhbmRsZXIpID0+IHtcbiAgICBpZiAoY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGluamVjdChIVFRQX0lOVEVSQ0VQVE9SUywge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGludGVyY2VwdG9yc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4sIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+KTtcbiAgICB9XG5cbiAgICBjb25zdCBwZW5kaW5nVGFza3MgPSBpbmplY3QoSW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyk7XG4gICAgY29uc3QgdGFza0lkID0gcGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgIHJldHVybiBjaGFpbihyZXEsIGhhbmRsZXIpLnBpcGUoZmluYWxpemUoKCkgPT4gcGVuZGluZ1Rhc2tzLnJlbW92ZSh0YXNrSWQpKSk7XG4gIH07XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyIGV4dGVuZHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nVGFza3MgPSBpbmplY3QoSW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiYWNrZW5kOiBIdHRwQmFja2VuZCwgcHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG4gIH1cblxuICBvdmVycmlkZSBoYW5kbGUoaW5pdGlhbFJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGRlZHVwZWRJbnRlcmNlcHRvckZucyA9IEFycmF5LmZyb20obmV3IFNldChbXG4gICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JfRk5TKSxcbiAgICAgICAgLi4udGhpcy5pbmplY3Rvci5nZXQoSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUywgW10pLFxuICAgICAgXSkpO1xuXG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGRlZHVwZWRJbnRlcmNlcHRvckZuc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgdGhpcy5jaGFpbiA9IGRlZHVwZWRJbnRlcmNlcHRvckZucy5yZWR1Y2VSaWdodChcbiAgICAgICAgICAobmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuKSA9PlxuICAgICAgICAgICAgICBjaGFpbmVkSW50ZXJjZXB0b3JGbihuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4sIHRoaXMuaW5qZWN0b3IpLFxuICAgICAgICAgIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPik7XG4gICAgfVxuXG4gICAgY29uc3QgdGFza0lkID0gdGhpcy5wZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIGRvd25zdHJlYW1SZXF1ZXN0ID0+IHRoaXMuYmFja2VuZC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpKVxuICAgICAgICAucGlwZShmaW5hbGl6ZSgoKSA9PiB0aGlzLnBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9XG59XG4iXX0=