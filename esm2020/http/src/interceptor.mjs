/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { EnvironmentInjector, inject, Injectable, InjectionToken } from '@angular/core';
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
export const HTTP_INTERCEPTORS = new InjectionToken('HTTP_INTERCEPTORS');
/**
 * A multi-provided token of `HttpInterceptorFn`s.
 */
export const HTTP_INTERCEPTOR_FNS = new InjectionToken('HTTP_INTERCEPTOR_FNS');
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
        return chain(req, handler);
    };
}
export class HttpInterceptorHandler extends HttpHandler {
    constructor(backend, injector) {
        super();
        this.backend = backend;
        this.injector = injector;
        this.chain = null;
    }
    handle(initialRequest) {
        if (this.chain === null) {
            const dedupedInterceptorFns = Array.from(new Set(this.injector.get(HTTP_INTERCEPTOR_FNS)));
            // Note: interceptors are wrapped right-to-left so that final execution order is
            // left-to-right. That is, if `dedupedInterceptorFns` is the array `[a, b, c]`, we want to
            // produce a chain that is conceptually `c(b(a(end)))`, which we build from the inside
            // out.
            this.chain = dedupedInterceptorFns.reduceRight((nextSequencedFn, interceptorFn) => chainedInterceptorFn(nextSequencedFn, interceptorFn, this.injector), interceptorChainEndFn);
        }
        return this.chain(initialRequest, downstreamRequest => this.backend.handle(downstreamRequest));
    }
}
HttpInterceptorHandler.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.1.0-next.2+sha-ff84c73", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable });
HttpInterceptorHandler.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.1.0-next.2+sha-ff84c73", ngImport: i0, type: HttpInterceptorHandler });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.1.0-next.2+sha-ff84c73", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3RGLE9BQU8sRUFBQyxXQUFXLEVBQUUsV0FBVyxFQUFDLE1BQU0sV0FBVyxDQUFDOzs7QUFnR25ELFNBQVMscUJBQXFCLENBQzFCLEdBQXFCLEVBQUUsY0FBNkI7SUFDdEQsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsNkJBQTZCLENBQ2xDLFdBQXNDLEVBQ3RDLFdBQTRCO0lBQzlCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUMvRSxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDekIsV0FBMEMsRUFBRSxhQUFnQyxFQUM1RSxRQUE2QjtJQUMvQixtQkFBbUI7SUFDbkIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxZQUFZLENBQUMsR0FBRyxFQUFFLENBQ3BFLGFBQWEsQ0FDWCxjQUFjLEVBQ2QsaUJBQWlCLENBQUMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FDcEUsQ0FDRixDQUFDO0lBQ0Ysa0JBQWtCO0FBQ3BCLENBQUM7QUFFRDs7Ozs7R0FLRztBQUNILE1BQU0sQ0FBQyxNQUFNLGlCQUFpQixHQUFHLElBQUksY0FBYyxDQUFvQixtQkFBbUIsQ0FBQyxDQUFDO0FBRTVGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxjQUFjLENBQXNCLHNCQUFzQixDQUFDLENBQUM7QUFFcEc7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLDBCQUEwQjtJQUN4QyxJQUFJLEtBQUssR0FBbUMsSUFBSSxDQUFDO0lBRWpELE9BQU8sQ0FBQyxHQUFHLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDdEIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ2xCLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2RSxnRkFBZ0Y7WUFDaEYsaUZBQWlGO1lBQ2pGLHNGQUFzRjtZQUN0RixPQUFPO1lBQ1AsS0FBSyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQzVCLDZCQUE2QixFQUFFLHFCQUFrRCxDQUFDLENBQUM7U0FDeEY7UUFFRCxPQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDN0IsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUdELE1BQU0sT0FBTyxzQkFBdUIsU0FBUSxXQUFXO0lBR3JELFlBQW9CLE9BQW9CLEVBQVUsUUFBNkI7UUFDN0UsS0FBSyxFQUFFLENBQUM7UUFEVSxZQUFPLEdBQVAsT0FBTyxDQUFhO1FBQVUsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7UUFGdkUsVUFBSyxHQUF1QyxJQUFJLENBQUM7SUFJekQsQ0FBQztJQUVRLE1BQU0sQ0FBQyxjQUFnQztRQUM5QyxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssSUFBSSxFQUFFO1lBQ3ZCLE1BQU0scUJBQXFCLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUUzRixnRkFBZ0Y7WUFDaEYsMEZBQTBGO1lBQzFGLHNGQUFzRjtZQUN0RixPQUFPO1lBQ1AsSUFBSSxDQUFDLEtBQUssR0FBRyxxQkFBcUIsQ0FBQyxXQUFXLENBQzFDLENBQUMsZUFBZSxFQUFFLGFBQWEsRUFBRSxFQUFFLENBQy9CLG9CQUFvQixDQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUN2RSxxQkFBc0QsQ0FBQyxDQUFDO1NBQzdEO1FBQ0QsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO0lBQ2pHLENBQUM7OzhIQXJCVSxzQkFBc0I7a0lBQXRCLHNCQUFzQjtzR0FBdEIsc0JBQXNCO2tCQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8qKlxuICogSW50ZXJjZXB0cyBhbmQgaGFuZGxlcyBhbiBgSHR0cFJlcXVlc3RgIG9yIGBIdHRwUmVzcG9uc2VgLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHRyYW5zZm9ybSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBieSBjYWxsaW5nIGBuZXh0LmhhbmRsZSh0cmFuc2Zvcm1lZFJlcSlgLlxuICogQW4gaW50ZXJjZXB0b3IgbWF5IHRyYW5zZm9ybSB0aGVcbiAqIHJlc3BvbnNlIGV2ZW50IHN0cmVhbSBhcyB3ZWxsLCBieSBhcHBseWluZyBhZGRpdGlvbmFsIFJ4SlMgb3BlcmF0b3JzIG9uIHRoZSBzdHJlYW1cbiAqIHJldHVybmVkIGJ5IGBuZXh0LmhhbmRsZSgpYC5cbiAqXG4gKiBNb3JlIHJhcmVseSwgYW4gaW50ZXJjZXB0b3IgbWF5IGhhbmRsZSB0aGUgcmVxdWVzdCBlbnRpcmVseSxcbiAqIGFuZCBjb21wb3NlIGEgbmV3IGV2ZW50IHN0cmVhbSBpbnN0ZWFkIG9mIGludm9raW5nIGBuZXh0LmhhbmRsZSgpYC4gVGhpcyBpcyBhblxuICogYWNjZXB0YWJsZSBiZWhhdmlvciwgYnV0IGtlZXAgaW4gbWluZCB0aGF0IGZ1cnRoZXIgaW50ZXJjZXB0b3JzIHdpbGwgYmUgc2tpcHBlZCBlbnRpcmVseS5cbiAqXG4gKiBJdCBpcyBhbHNvIHJhcmUgYnV0IHZhbGlkIGZvciBhbiBpbnRlcmNlcHRvciB0byByZXR1cm4gbXVsdGlwbGUgcmVzcG9uc2VzIG9uIHRoZVxuICogZXZlbnQgc3RyZWFtIGZvciBhIHNpbmdsZSByZXF1ZXN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwI2ludGVyY2VwdGluZy1yZXF1ZXN0cy1hbmQtcmVzcG9uc2VzKVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogVG8gdXNlIHRoZSBzYW1lIGluc3RhbmNlIG9mIGBIdHRwSW50ZXJjZXB0b3JzYCBmb3IgdGhlIGVudGlyZSBhcHAsIGltcG9ydCB0aGUgYEh0dHBDbGllbnRNb2R1bGVgXG4gKiBvbmx5IGluIHlvdXIgYEFwcE1vZHVsZWAsIGFuZCBhZGQgdGhlIGludGVyY2VwdG9ycyB0byB0aGUgcm9vdCBhcHBsaWNhdGlvbiBpbmplY3Rvci5cbiAqIElmIHlvdSBpbXBvcnQgYEh0dHBDbGllbnRNb2R1bGVgIG11bHRpcGxlIHRpbWVzIGFjcm9zcyBkaWZmZXJlbnQgbW9kdWxlcyAoZm9yIGV4YW1wbGUsIGluIGxhenlcbiAqIGxvYWRpbmcgbW9kdWxlcyksIGVhY2ggaW1wb3J0IGNyZWF0ZXMgYSBuZXcgY29weSBvZiB0aGUgYEh0dHBDbGllbnRNb2R1bGVgLCB3aGljaCBvdmVyd3JpdGVzIHRoZVxuICogaW50ZXJjZXB0b3JzIHByb3ZpZGVkIGluIHRoZSByb290IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBIdHRwSW50ZXJjZXB0b3Ige1xuICAvKipcbiAgICogSWRlbnRpZmllcyBhbmQgaGFuZGxlcyBhIGdpdmVuIEhUVFAgcmVxdWVzdC5cbiAgICogQHBhcmFtIHJlcSBUaGUgb3V0Z29pbmcgcmVxdWVzdCBvYmplY3QgdG8gaGFuZGxlLlxuICAgKiBAcGFyYW0gbmV4dCBUaGUgbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIG9yIHRoZSBiYWNrZW5kXG4gICAqIGlmIG5vIGludGVyY2VwdG9ycyByZW1haW4gaW4gdGhlIGNoYWluLlxuICAgKiBAcmV0dXJucyBBbiBvYnNlcnZhYmxlIG9mIHRoZSBldmVudCBzdHJlYW0uXG4gICAqL1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgdGhlIG5leHQgaW50ZXJjZXB0b3IgaW4gYW4gaW50ZXJjZXB0b3IgY2hhaW4sIG9yIHRoZSByZWFsIGJhY2tlbmQgaWYgdGhlcmUgYXJlIG5vXG4gKiBmdXJ0aGVyIGludGVyY2VwdG9ycy5cbiAqXG4gKiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGFuZCBlaXRoZXIgbW9kaWZ5IHRoZSBvdXRnb2luZyByZXF1ZXN0IG9yIHRoZVxuICogcmVzcG9uc2Ugd2hlbiBpdCBhcnJpdmVzLiBXaXRoaW4gdGhlIHNjb3BlIG9mIHRoZSBjdXJyZW50IHJlcXVlc3QsIGhvd2V2ZXIsIHRoaXMgZnVuY3Rpb24gbWF5IGJlXG4gKiBjYWxsZWQgYW55IG51bWJlciBvZiB0aW1lcywgZm9yIGFueSBudW1iZXIgb2YgZG93bnN0cmVhbSByZXF1ZXN0cy4gU3VjaCBkb3duc3RyZWFtIHJlcXVlc3RzIG5lZWRcbiAqIG5vdCBiZSB0byB0aGUgc2FtZSBVUkwgb3IgZXZlbiB0aGUgc2FtZSBvcmlnaW4gYXMgdGhlIGN1cnJlbnQgcmVxdWVzdC4gSXQgaXMgYWxzbyB2YWxpZCB0byBub3RcbiAqIGNhbGwgdGhlIGRvd25zdHJlYW0gaGFuZGxlciBhdCBhbGwsIGFuZCBwcm9jZXNzIHRoZSBjdXJyZW50IHJlcXVlc3QgZW50aXJlbHkgd2l0aGluIHRoZVxuICogaW50ZXJjZXB0b3IuXG4gKlxuICogVGhpcyBmdW5jdGlvbiBzaG91bGQgb25seSBiZSBjYWxsZWQgd2l0aGluIHRoZSBzY29wZSBvZiB0aGUgcmVxdWVzdCB0aGF0J3MgY3VycmVudGx5IGJlaW5nXG4gKiBpbnRlcmNlcHRlZC4gT25jZSB0aGF0IHJlcXVlc3QgaXMgY29tcGxldGUsIHRoaXMgZG93bnN0cmVhbSBoYW5kbGVyIGZ1bmN0aW9uIHNob3VsZCBub3QgYmVcbiAqIGNhbGxlZC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKlxuICogQHNlZSBbSFRUUCBHdWlkZV0oZ3VpZGUvaHR0cCNpbnRlcmNlcHRpbmctcmVxdWVzdHMtYW5kLXJlc3BvbnNlcylcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEhhbmRsZXJGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogQW4gaW50ZXJjZXB0b3IgZm9yIEhUVFAgcmVxdWVzdHMgbWFkZSB2aWEgYEh0dHBDbGllbnRgLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyB3aGljaCBgSHR0cENsaWVudGAgY2FsbHMgd2hlbiBhIHJlcXVlc3QgaXMgbWFkZS5cbiAqIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIHRoZSBvcHBvcnR1bml0eSB0byBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgYW55IHJlc3BvbnNlIHRoYXQgY29tZXNcbiAqIGJhY2ssIGFzIHdlbGwgYXMgYmxvY2ssIHJlZGlyZWN0LCBvciBvdGhlcndpc2UgY2hhbmdlIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlIHNlbWFudGljcy5cbiAqXG4gKiBBbiBgSHR0cEhhbmRsZXJGbmAgcmVwcmVzZW50aW5nIHRoZSBuZXh0IGludGVyY2VwdG9yIChvciB0aGUgYmFja2VuZCB3aGljaCB3aWxsIG1ha2UgYSByZWFsIEhUVFBcbiAqIHJlcXVlc3QpIGlzIHByb3ZpZGVkLiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGJ1dCB0aGF0IGlzIG5vdCByZXF1aXJlZFxuICogKHNlZSBgSHR0cEhhbmRsZXJGbmAgZm9yIG1vcmUgZGV0YWlscykuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgaGF2ZSBhY2Nlc3MgdG8gYGluamVjdCgpYCB2aWEgdGhlIGBFbnZpcm9ubWVudEluamVjdG9yYCBmcm9tIHdoaWNoIHRoZXkgd2VyZVxuICogY29uZmlndXJlZC5cbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDogSHR0cEhhbmRsZXJGbikgPT5cbiAgICBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaW52b2tlcyBhbiBIVFRQIGludGVyY2VwdG9yIGNoYWluLlxuICpcbiAqIEVhY2ggaW50ZXJjZXB0b3IgaW4gdGhlIGludGVyY2VwdG9yIGNoYWluIGlzIHR1cm5lZCBpbnRvIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBjbG9zZXNcbiAqIG92ZXIgdGhlIHJlc3Qgb2YgdGhlIGNoYWluIChyZXByZXNlbnRlZCBieSBhbm90aGVyIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmApLiBUaGUgbGFzdCBzdWNoXG4gKiBmdW5jdGlvbiBpbiB0aGUgY2hhaW4gd2lsbCBpbnN0ZWFkIGRlbGVnYXRlIHRvIHRoZSBgZmluYWxIYW5kbGVyRm5gLCB3aGljaCBpcyBwYXNzZWQgZG93biB3aGVuXG4gKiB0aGUgY2hhaW4gaXMgaW52b2tlZC5cbiAqXG4gKiBUaGlzIHBhdHRlcm4gYWxsb3dzIGZvciBhIGNoYWluIG9mIG1hbnkgaW50ZXJjZXB0b3JzIHRvIGJlIGNvbXBvc2VkIGFuZCB3cmFwcGVkIGluIGEgc2luZ2xlXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gLCB3aGljaCBpcyBhIHVzZWZ1bCBhYnN0cmFjdGlvbiBmb3IgaW5jbHVkaW5nIGRpZmZlcmVudCBraW5kcyBvZiBpbnRlcmNlcHRvcnNcbiAqIChlLmcuIGxlZ2FjeSBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMpIGluIHRoZSBzYW1lIGNoYWluLlxuICovXG50eXBlIENoYWluZWRJbnRlcmNlcHRvckZuPFJlcXVlc3RUPiA9IChyZXE6IEh0dHBSZXF1ZXN0PFJlcXVlc3RUPiwgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4pID0+XG4gICAgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8UmVxdWVzdFQ+PjtcblxuZnVuY3Rpb24gaW50ZXJjZXB0b3JDaGFpbkVuZEZuKFxuICAgIHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gIHJldHVybiBmaW5hbEhhbmRsZXJGbihyZXEpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGFkYXB0cyBhIGxlZ2FjeSBgSHR0cEludGVyY2VwdG9yYCB0byB0aGVcbiAqIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgaW50ZXJmYWNlLlxuICovXG5mdW5jdGlvbiBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbihcbiAgICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgICBpbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yKTogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PiB7XG4gIHJldHVybiAoaW5pdGlhbFJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSA9PiBpbnRlcmNlcHRvci5pbnRlcmNlcHQoaW5pdGlhbFJlcXVlc3QsIHtcbiAgICBoYW5kbGU6IChkb3duc3RyZWFtUmVxdWVzdCkgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSxcbiAgfSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggd3JhcHMgYW5kIGludm9rZXMgYSBmdW5jdGlvbmFsIGludGVyY2VwdG9yIGluIHRoZSBnaXZlblxuICogaW5qZWN0b3IuXG4gKi9cbmZ1bmN0aW9uIGNoYWluZWRJbnRlcmNlcHRvckZuKFxuICAgIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiwgaW50ZXJjZXB0b3JGbjogSHR0cEludGVyY2VwdG9yRm4sXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiB7XG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+IGluamVjdG9yLnJ1bkluQ29udGV4dCgoKSA9PlxuICAgIGludGVyY2VwdG9yRm4oXG4gICAgICBpbml0aWFsUmVxdWVzdCxcbiAgICAgIGRvd25zdHJlYW1SZXF1ZXN0ID0+IGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbilcbiAgICApXG4gICk7XG4gIC8vIGNsYW5nLWZvcm1hdCBvblxufVxuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZXIgdG9rZW4gdGhhdCByZXByZXNlbnRzIHRoZSBhcnJheSBvZiByZWdpc3RlcmVkXG4gKiBgSHR0cEludGVyY2VwdG9yYCBvYmplY3RzLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IEhUVFBfSU5URVJDRVBUT1JTID0gbmV3IEluamVjdGlvblRva2VuPEh0dHBJbnRlcmNlcHRvcltdPignSFRUUF9JTlRFUkNFUFRPUlMnKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzLlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUl9GTlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48SHR0cEludGVyY2VwdG9yRm5bXT4oJ0hUVFBfSU5URVJDRVBUT1JfRk5TJyk7XG5cbi8qKlxuICogQ3JlYXRlcyBhbiBgSHR0cEludGVyY2VwdG9yRm5gIHdoaWNoIGxhemlseSBpbml0aWFsaXplcyBhbiBpbnRlcmNlcHRvciBjaGFpbiBmcm9tIHRoZSBsZWdhY3lcbiAqIGNsYXNzLWJhc2VkIGludGVyY2VwdG9ycyBhbmQgcnVucyB0aGUgcmVxdWVzdCB0aHJvdWdoIGl0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVnYWN5SW50ZXJjZXB0b3JGbkZhY3RvcnkoKTogSHR0cEludGVyY2VwdG9yRm4ge1xuICBsZXQgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT58bnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIChyZXEsIGhhbmRsZXIpID0+IHtcbiAgICBpZiAoY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGluamVjdChIVFRQX0lOVEVSQ0VQVE9SUywge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGludGVyY2VwdG9yc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgYWRhcHRMZWdhY3lJbnRlcmNlcHRvclRvQ2hhaW4sIGludGVyY2VwdG9yQ2hhaW5FbmRGbiBhcyBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+KTtcbiAgICB9XG5cbiAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKTtcbiAgfTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIgZXh0ZW5kcyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+fG51bGwgPSBudWxsO1xuXG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgYmFja2VuZDogSHR0cEJhY2tlbmQsIHByaXZhdGUgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgb3ZlcnJpZGUgaGFuZGxlKGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBkZWR1cGVkSW50ZXJjZXB0b3JGbnMgPSBBcnJheS5mcm9tKG5ldyBTZXQodGhpcy5pbmplY3Rvci5nZXQoSFRUUF9JTlRFUkNFUFRPUl9GTlMpKSk7XG5cbiAgICAgIC8vIE5vdGU6IGludGVyY2VwdG9ycyBhcmUgd3JhcHBlZCByaWdodC10by1sZWZ0IHNvIHRoYXQgZmluYWwgZXhlY3V0aW9uIG9yZGVyIGlzXG4gICAgICAvLyBsZWZ0LXRvLXJpZ2h0LiBUaGF0IGlzLCBpZiBgZGVkdXBlZEludGVyY2VwdG9yRm5zYCBpcyB0aGUgYXJyYXkgYFthLCBiLCBjXWAsIHdlIHdhbnQgdG9cbiAgICAgIC8vIHByb2R1Y2UgYSBjaGFpbiB0aGF0IGlzIGNvbmNlcHR1YWxseSBgYyhiKGEoZW5kKSkpYCwgd2hpY2ggd2UgYnVpbGQgZnJvbSB0aGUgaW5zaWRlXG4gICAgICAvLyBvdXQuXG4gICAgICB0aGlzLmNoYWluID0gZGVkdXBlZEludGVyY2VwdG9yRm5zLnJlZHVjZVJpZ2h0KFxuICAgICAgICAgIChuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4pID0+XG4gICAgICAgICAgICAgIGNoYWluZWRJbnRlcmNlcHRvckZuKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbiwgdGhpcy5pbmplY3RvciksXG4gICAgICAgICAgaW50ZXJjZXB0b3JDaGFpbkVuZEZuIGFzIENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+KTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIGRvd25zdHJlYW1SZXF1ZXN0ID0+IHRoaXMuYmFja2VuZC5oYW5kbGUoZG93bnN0cmVhbVJlcXVlc3QpKTtcbiAgfVxufVxuIl19