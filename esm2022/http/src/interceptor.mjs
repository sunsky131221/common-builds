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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.2+sha-05f9c7b", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.2+sha-05f9c7b", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.2+sha-05f9c7b", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsY0FBYyxFQUFFLFdBQVcsRUFBRSxxQkFBcUIsRUFBRSxRQUFRLElBQUksT0FBTyxFQUFFLG1CQUFtQixJQUFJLGtCQUFrQixFQUFFLDBCQUEwQixJQUFJLHlCQUF5QixFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRW5QLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUV4QyxPQUFPLEVBQUMsV0FBVyxFQUFFLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUVuRCxPQUFPLEVBQUMsWUFBWSxFQUFDLE1BQU0sU0FBUyxDQUFDOzs7QUE0SHJDLFNBQVMscUJBQXFCLENBQzFCLEdBQXFCLEVBQUUsY0FBNkI7SUFDdEQsT0FBTyxjQUFjLENBQUMsR0FBRyxDQUFDLENBQUM7QUFDN0IsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsNkJBQTZCLENBQ2xDLFdBQXNDLEVBQ3RDLFdBQTRCO0lBQzlCLE9BQU8sQ0FBQyxjQUFjLEVBQUUsY0FBYyxFQUFFLEVBQUUsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUMvRSxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDekIsV0FBMEMsRUFBRSxhQUFnQyxFQUM1RSxRQUE2QjtJQUMvQixtQkFBbUI7SUFDbkIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUFDLHFCQUFxQixDQUFDLFFBQVEsRUFBRSxHQUFHLEVBQUUsQ0FDOUUsYUFBYSxDQUNYLGNBQWMsRUFDZCxpQkFBaUIsQ0FBQyxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQyxDQUNwRSxDQUNGLENBQUM7SUFDRixrQkFBa0I7QUFDcEIsQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQzFCLElBQUksY0FBYyxDQUE2QixTQUFTLENBQUMsQ0FBQyxDQUFDLG1CQUFtQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztBQUV6Rjs7R0FFRztBQUNILE1BQU0sQ0FBQyxNQUFNLG9CQUFvQixHQUM3QixJQUFJLGNBQWMsQ0FBK0IsU0FBUyxDQUFDLENBQUMsQ0FBQyxzQkFBc0IsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUY7O0dBRUc7QUFDSCxNQUFNLENBQUMsTUFBTSx5QkFBeUIsR0FDbEMsSUFBSSxjQUFjLENBQStCLFNBQVMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRW5HOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQzdCLElBQUksY0FBYyxDQUFjLFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRzdFOzs7R0FHRztBQUNILE1BQU0sVUFBVSwwQkFBMEI7SUFDeEMsSUFBSSxLQUFLLEdBQW1DLElBQUksQ0FBQztJQUVqRCxPQUFPLENBQUMsR0FBRyxFQUFFLE9BQU8sRUFBRSxFQUFFO1FBQ3RCLElBQUksS0FBSyxLQUFLLElBQUksRUFBRSxDQUFDO1lBQ25CLE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyxpQkFBaUIsRUFBRSxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2RSxnRkFBZ0Y7WUFDaEYsaUZBQWlGO1lBQ2pGLHNGQUFzRjtZQUN0RixPQUFPO1lBQ1AsS0FBSyxHQUFHLFlBQVksQ0FBQyxXQUFXLENBQzVCLDZCQUE2QixFQUFFLHFCQUFrRCxDQUFDLENBQUM7UUFDekYsQ0FBQztRQUVELE1BQU0sWUFBWSxHQUFHLE1BQU0sQ0FBQyx5QkFBeUIsQ0FBQyxDQUFDO1FBQ3ZELE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUNsQyxPQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUMvRSxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsSUFBSSw0QkFBNEIsR0FBRyxLQUFLLENBQUM7QUFFekMsbURBQW1EO0FBQ25ELE1BQU0sVUFBVSw0QkFBNEI7SUFDMUMsNEJBQTRCLEdBQUcsS0FBSyxDQUFDO0FBQ3ZDLENBQUM7QUFHRCxNQUFNLE9BQU8sc0JBQXVCLFNBQVEsV0FBVztJQUlyRCxZQUFvQixPQUFvQixFQUFVLFFBQTZCO1FBQzdFLEtBQUssRUFBRSxDQUFDO1FBRFUsWUFBTyxHQUFQLE9BQU8sQ0FBYTtRQUFVLGFBQVEsR0FBUixRQUFRLENBQXFCO1FBSHZFLFVBQUssR0FBdUMsSUFBSSxDQUFDO1FBQ3hDLGlCQUFZLEdBQUcsTUFBTSxDQUFDLHlCQUF5QixDQUFDLENBQUM7UUFLaEUsdUZBQXVGO1FBQ3ZGLHlGQUF5RjtRQUN6RixXQUFXO1FBQ1gsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUMsb0JBQW9CLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsQ0FBQztRQUMxRSxJQUFJLENBQUMsT0FBTyxHQUFHLGtCQUFrQixJQUFJLE9BQU8sQ0FBQztRQUU3Qyw0RUFBNEU7UUFDNUUsNkVBQTZFO1FBQzdFLHVCQUF1QjtRQUN2QixJQUFJLENBQUMsT0FBTyxTQUFTLEtBQUssV0FBVyxJQUFJLFNBQVMsQ0FBQyxJQUFJLENBQUMsNEJBQTRCLEVBQUUsQ0FBQztZQUNyRixNQUFNLFFBQVEsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7WUFDN0QsSUFBSSxRQUFRLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLFlBQVksWUFBWSxDQUFDLEVBQUUsQ0FBQztnQkFDeEQsNEJBQTRCLEdBQUcsSUFBSSxDQUFDO2dCQUNwQyxRQUFRLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsNkRBRXpDLHVEQUF1RDtvQkFDbkQscURBQXFEO29CQUNyRCxpRUFBaUU7b0JBQ2pFLDRDQUE0QztvQkFDNUMsd0VBQXdFO29CQUN4RSxzQ0FBc0MsQ0FBQyxDQUFDLENBQUM7WUFDbkQsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRVEsTUFBTSxDQUFDLGNBQWdDO1FBQzlDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN4QixNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUM7Z0JBQy9DLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7Z0JBQzFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDO2FBQ3BELENBQUMsQ0FBQyxDQUFDO1lBRUosZ0ZBQWdGO1lBQ2hGLDBGQUEwRjtZQUMxRixzRkFBc0Y7WUFDdEYsT0FBTztZQUNQLElBQUksQ0FBQyxLQUFLLEdBQUcscUJBQXFCLENBQUMsV0FBVyxDQUMxQyxDQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUMvQixvQkFBb0IsQ0FBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDdkUscUJBQXNELENBQUMsQ0FBQztRQUM5RCxDQUFDO1FBRUQsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztRQUN2QyxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO2FBQ3pGLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzlELENBQUM7eUhBcERVLHNCQUFzQjs2SEFBdEIsc0JBQXNCOztzR0FBdEIsc0JBQXNCO2tCQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7RW52aXJvbm1lbnRJbmplY3RvciwgaW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgUExBVEZPUk1fSUQsIHJ1bkluSW5qZWN0aW9uQ29udGV4dCwgybVDb25zb2xlIGFzIENvbnNvbGUsIMm1Zm9ybWF0UnVudGltZUVycm9yIGFzIGZvcm1hdFJ1bnRpbWVFcnJvciwgybVJbml0aWFsUmVuZGVyUGVuZGluZ1Rhc2tzIGFzIEluaXRpYWxSZW5kZXJQZW5kaW5nVGFza3N9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlfSBmcm9tICdyeGpzJztcbmltcG9ydCB7ZmluYWxpemV9IGZyb20gJ3J4anMvb3BlcmF0b3JzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZCwgSHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4vZXJyb3JzJztcbmltcG9ydCB7RmV0Y2hCYWNrZW5kfSBmcm9tICcuL2ZldGNoJztcbmltcG9ydCB7SHR0cFJlcXVlc3R9IGZyb20gJy4vcmVxdWVzdCc7XG5pbXBvcnQge0h0dHBFdmVudH0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8qKlxuICogSW50ZXJjZXB0cyBhbmQgaGFuZGxlcyBhbiBgSHR0cFJlcXVlc3RgIG9yIGBIdHRwUmVzcG9uc2VgLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHRyYW5zZm9ybSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIG5leHQgaW50ZXJjZXB0b3IgaW4gdGhlIGNoYWluLCBieSBjYWxsaW5nIGBuZXh0LmhhbmRsZSh0cmFuc2Zvcm1lZFJlcSlgLlxuICogQW4gaW50ZXJjZXB0b3IgbWF5IHRyYW5zZm9ybSB0aGVcbiAqIHJlc3BvbnNlIGV2ZW50IHN0cmVhbSBhcyB3ZWxsLCBieSBhcHBseWluZyBhZGRpdGlvbmFsIFJ4SlMgb3BlcmF0b3JzIG9uIHRoZSBzdHJlYW1cbiAqIHJldHVybmVkIGJ5IGBuZXh0LmhhbmRsZSgpYC5cbiAqXG4gKiBNb3JlIHJhcmVseSwgYW4gaW50ZXJjZXB0b3IgbWF5IGhhbmRsZSB0aGUgcmVxdWVzdCBlbnRpcmVseSxcbiAqIGFuZCBjb21wb3NlIGEgbmV3IGV2ZW50IHN0cmVhbSBpbnN0ZWFkIG9mIGludm9raW5nIGBuZXh0LmhhbmRsZSgpYC4gVGhpcyBpcyBhblxuICogYWNjZXB0YWJsZSBiZWhhdmlvciwgYnV0IGtlZXAgaW4gbWluZCB0aGF0IGZ1cnRoZXIgaW50ZXJjZXB0b3JzIHdpbGwgYmUgc2tpcHBlZCBlbnRpcmVseS5cbiAqXG4gKiBJdCBpcyBhbHNvIHJhcmUgYnV0IHZhbGlkIGZvciBhbiBpbnRlcmNlcHRvciB0byByZXR1cm4gbXVsdGlwbGUgcmVzcG9uc2VzIG9uIHRoZVxuICogZXZlbnQgc3RyZWFtIGZvciBhIHNpbmdsZSByZXF1ZXN0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwLWludGVyY2VwdC1yZXF1ZXN0cy1hbmQtcmVzcG9uc2VzKVxuICogQHNlZSB7QGxpbmsgSHR0cEludGVyY2VwdG9yRm59XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUbyB1c2UgdGhlIHNhbWUgaW5zdGFuY2Ugb2YgYEh0dHBJbnRlcmNlcHRvcnNgIGZvciB0aGUgZW50aXJlIGFwcCwgaW1wb3J0IHRoZSBgSHR0cENsaWVudE1vZHVsZWBcbiAqIG9ubHkgaW4geW91ciBgQXBwTW9kdWxlYCwgYW5kIGFkZCB0aGUgaW50ZXJjZXB0b3JzIHRvIHRoZSByb290IGFwcGxpY2F0aW9uIGluamVjdG9yLlxuICogSWYgeW91IGltcG9ydCBgSHR0cENsaWVudE1vZHVsZWAgbXVsdGlwbGUgdGltZXMgYWNyb3NzIGRpZmZlcmVudCBtb2R1bGVzIChmb3IgZXhhbXBsZSwgaW4gbGF6eVxuICogbG9hZGluZyBtb2R1bGVzKSwgZWFjaCBpbXBvcnQgY3JlYXRlcyBhIG5ldyBjb3B5IG9mIHRoZSBgSHR0cENsaWVudE1vZHVsZWAsIHdoaWNoIG92ZXJ3cml0ZXMgdGhlXG4gKiBpbnRlcmNlcHRvcnMgcHJvdmlkZWQgaW4gdGhlIHJvb3QgbW9kdWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGFuZCBoYW5kbGVzIGEgZ2l2ZW4gSFRUUCByZXF1ZXN0LlxuICAgKiBAcGFyYW0gcmVxIFRoZSBvdXRnb2luZyByZXF1ZXN0IG9iamVjdCB0byBoYW5kbGUuXG4gICAqIEBwYXJhbSBuZXh0IFRoZSBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgb3IgdGhlIGJhY2tlbmRcbiAgICogaWYgbm8gaW50ZXJjZXB0b3JzIHJlbWFpbiBpbiB0aGUgY2hhaW4uXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIGV2ZW50IHN0cmVhbS5cbiAgICovXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj47XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgbmV4dCBpbnRlcmNlcHRvciBpbiBhbiBpbnRlcmNlcHRvciBjaGFpbiwgb3IgdGhlIHJlYWwgYmFja2VuZCBpZiB0aGVyZSBhcmUgbm9cbiAqIGZ1cnRoZXIgaW50ZXJjZXB0b3JzLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYW5kIGVpdGhlciBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgdGhlXG4gKiByZXNwb25zZSB3aGVuIGl0IGFycml2ZXMuIFdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIGN1cnJlbnQgcmVxdWVzdCwgaG93ZXZlciwgdGhpcyBmdW5jdGlvbiBtYXkgYmVcbiAqIGNhbGxlZCBhbnkgbnVtYmVyIG9mIHRpbWVzLCBmb3IgYW55IG51bWJlciBvZiBkb3duc3RyZWFtIHJlcXVlc3RzLiBTdWNoIGRvd25zdHJlYW0gcmVxdWVzdHMgbmVlZFxuICogbm90IGJlIHRvIHRoZSBzYW1lIFVSTCBvciBldmVuIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCByZXF1ZXN0LiBJdCBpcyBhbHNvIHZhbGlkIHRvIG5vdFxuICogY2FsbCB0aGUgZG93bnN0cmVhbSBoYW5kbGVyIGF0IGFsbCwgYW5kIHByb2Nlc3MgdGhlIGN1cnJlbnQgcmVxdWVzdCBlbnRpcmVseSB3aXRoaW4gdGhlXG4gKiBpbnRlcmNlcHRvci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoZSByZXF1ZXN0IHRoYXQncyBjdXJyZW50bHkgYmVpbmdcbiAqIGludGVyY2VwdGVkLiBPbmNlIHRoYXQgcmVxdWVzdCBpcyBjb21wbGV0ZSwgdGhpcyBkb3duc3RyZWFtIGhhbmRsZXIgZnVuY3Rpb24gc2hvdWxkIG5vdCBiZVxuICogY2FsbGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwLWludGVyY2VwdC1yZXF1ZXN0cy1hbmQtcmVzcG9uc2VzKVxuICovXG5leHBvcnQgdHlwZSBIdHRwSGFuZGxlckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4pID0+IE9ic2VydmFibGU8SHR0cEV2ZW50PHVua25vd24+PjtcblxuLyoqXG4gKiBBbiBpbnRlcmNlcHRvciBmb3IgSFRUUCByZXF1ZXN0cyBtYWRlIHZpYSBgSHR0cENsaWVudGAuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIG1pZGRsZXdhcmUgZnVuY3Rpb25zIHdoaWNoIGBIdHRwQ2xpZW50YCBjYWxscyB3aGVuIGEgcmVxdWVzdCBpcyBtYWRlLlxuICogVGhlc2UgZnVuY3Rpb25zIGhhdmUgdGhlIG9wcG9ydHVuaXR5IHRvIG1vZGlmeSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBvciBhbnkgcmVzcG9uc2UgdGhhdCBjb21lc1xuICogYmFjaywgYXMgd2VsbCBhcyBibG9jaywgcmVkaXJlY3QsIG9yIG90aGVyd2lzZSBjaGFuZ2UgdGhlIHJlcXVlc3Qgb3IgcmVzcG9uc2Ugc2VtYW50aWNzLlxuICpcbiAqIEFuIGBIdHRwSGFuZGxlckZuYCByZXByZXNlbnRpbmcgdGhlIG5leHQgaW50ZXJjZXB0b3IgKG9yIHRoZSBiYWNrZW5kIHdoaWNoIHdpbGwgbWFrZSBhIHJlYWwgSFRUUFxuICogcmVxdWVzdCkgaXMgcHJvdmlkZWQuIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYnV0IHRoYXQgaXMgbm90IHJlcXVpcmVkXG4gKiAoc2VlIGBIdHRwSGFuZGxlckZuYCBmb3IgbW9yZSBkZXRhaWxzKS5cbiAqXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gcyBhcmUgZXhlY3V0ZWQgaW4gYW4gW2luamVjdGlvbiBjb250ZXh0XSgvZ3VpZGUvZGVwZW5kZW5jeS1pbmplY3Rpb24tY29udGV4dCkuXG4gKiBUaGV5IGhhdmUgYWNjZXNzIHRvIGBpbmplY3QoKWAgdmlhIHRoZSBgRW52aXJvbm1lbnRJbmplY3RvcmAgZnJvbSB3aGljaCB0aGV5IHdlcmUgY29uZmlndXJlZC5cbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwLWludGVyY2VwdC1yZXF1ZXN0cy1hbmQtcmVzcG9uc2VzKVxuICogQHNlZSB7QGxpbmsgd2l0aEludGVyY2VwdG9yc31cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICogSGVyZSBpcyBhIG5vb3AgaW50ZXJjZXB0b3IgdGhhdCBwYXNzZXMgdGhlIHJlcXVlc3QgdGhyb3VnaCB3aXRob3V0IG1vZGlmeWluZyBpdDpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGV4cG9ydCBjb25zdCBub29wSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgIHJldHVybiBuZXh0KG1vZGlmaWVkUmVxKTtcbiAqIH07XG4gKiBgYGBcbiAqXG4gKiBJZiB5b3Ugd2FudCB0byBhbHRlciBhIHJlcXVlc3QsIGNsb25lIGl0IGZpcnN0IGFuZCBtb2RpZnkgdGhlIGNsb25lIGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogYG5leHQoKWAgaGFuZGxlciBmdW5jdGlvbi5cbiAqXG4gKiBIZXJlIGlzIGEgYmFzaWMgaW50ZXJjZXB0b3IgdGhhdCBhZGRzIGEgYmVhcmVyIHRva2VuIHRvIHRoZSBoZWFkZXJzXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3QgYXV0aGVudGljYXRpb25JbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDpcbiAqIEh0dHBIYW5kbGVyRm4pID0+IHtcbiAqICAgIGNvbnN0IHVzZXJUb2tlbiA9ICdNWV9UT0tFTic7IGNvbnN0IG1vZGlmaWVkUmVxID0gcmVxLmNsb25lKHtcbiAqICAgICAgaGVhZGVyczogcmVxLmhlYWRlcnMuc2V0KCdBdXRob3JpemF0aW9uJywgYEJlYXJlciAke3VzZXJUb2tlbn1gKSxcbiAqICAgIH0pO1xuICpcbiAqICAgIHJldHVybiBuZXh0KG1vZGlmaWVkUmVxKTtcbiAqIH07XG4gKiBgYGBcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEludGVyY2VwdG9yRm4gPSAocmVxOiBIdHRwUmVxdWVzdDx1bmtub3duPiwgbmV4dDogSHR0cEhhbmRsZXJGbikgPT5cbiAgICBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaW52b2tlcyBhbiBIVFRQIGludGVyY2VwdG9yIGNoYWluLlxuICpcbiAqIEVhY2ggaW50ZXJjZXB0b3IgaW4gdGhlIGludGVyY2VwdG9yIGNoYWluIGlzIHR1cm5lZCBpbnRvIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBjbG9zZXNcbiAqIG92ZXIgdGhlIHJlc3Qgb2YgdGhlIGNoYWluIChyZXByZXNlbnRlZCBieSBhbm90aGVyIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmApLiBUaGUgbGFzdCBzdWNoXG4gKiBmdW5jdGlvbiBpbiB0aGUgY2hhaW4gd2lsbCBpbnN0ZWFkIGRlbGVnYXRlIHRvIHRoZSBgZmluYWxIYW5kbGVyRm5gLCB3aGljaCBpcyBwYXNzZWQgZG93biB3aGVuXG4gKiB0aGUgY2hhaW4gaXMgaW52b2tlZC5cbiAqXG4gKiBUaGlzIHBhdHRlcm4gYWxsb3dzIGZvciBhIGNoYWluIG9mIG1hbnkgaW50ZXJjZXB0b3JzIHRvIGJlIGNvbXBvc2VkIGFuZCB3cmFwcGVkIGluIGEgc2luZ2xlXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gLCB3aGljaCBpcyBhIHVzZWZ1bCBhYnN0cmFjdGlvbiBmb3IgaW5jbHVkaW5nIGRpZmZlcmVudCBraW5kcyBvZiBpbnRlcmNlcHRvcnNcbiAqIChlLmcuIGxlZ2FjeSBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMpIGluIHRoZSBzYW1lIGNoYWluLlxuICovXG50eXBlIENoYWluZWRJbnRlcmNlcHRvckZuPFJlcXVlc3RUPiA9IChyZXE6IEh0dHBSZXF1ZXN0PFJlcXVlc3RUPiwgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4pID0+XG4gICAgT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8UmVxdWVzdFQ+PjtcblxuZnVuY3Rpb24gaW50ZXJjZXB0b3JDaGFpbkVuZEZuKFxuICAgIHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gIHJldHVybiBmaW5hbEhhbmRsZXJGbihyZXEpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGFkYXB0cyBhIGxlZ2FjeSBgSHR0cEludGVyY2VwdG9yYCB0byB0aGVcbiAqIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgaW50ZXJmYWNlLlxuICovXG5mdW5jdGlvbiBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbihcbiAgICBjaGFpblRhaWxGbjogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgICBpbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yKTogQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PiB7XG4gIHJldHVybiAoaW5pdGlhbFJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSA9PiBpbnRlcmNlcHRvci5pbnRlcmNlcHQoaW5pdGlhbFJlcXVlc3QsIHtcbiAgICBoYW5kbGU6IChkb3duc3RyZWFtUmVxdWVzdCkgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSxcbiAgfSk7XG59XG5cbi8qKlxuICogQ29uc3RydWN0cyBhIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgd2hpY2ggd3JhcHMgYW5kIGludm9rZXMgYSBmdW5jdGlvbmFsIGludGVyY2VwdG9yIGluIHRoZSBnaXZlblxuICogaW5qZWN0b3IuXG4gKi9cbmZ1bmN0aW9uIGNoYWluZWRJbnRlcmNlcHRvckZuKFxuICAgIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiwgaW50ZXJjZXB0b3JGbjogSHR0cEludGVyY2VwdG9yRm4sXG4gICAgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IpOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPiB7XG4gIC8vIGNsYW5nLWZvcm1hdCBvZmZcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+IHJ1bkluSW5qZWN0aW9uQ29udGV4dChpbmplY3RvciwgKCkgPT5cbiAgICBpbnRlcmNlcHRvckZuKFxuICAgICAgaW5pdGlhbFJlcXVlc3QsXG4gICAgICBkb3duc3RyZWFtUmVxdWVzdCA9PiBjaGFpblRhaWxGbihkb3duc3RyZWFtUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pXG4gICAgKVxuICApO1xuICAvLyBjbGFuZy1mb3JtYXQgb25cbn1cblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVyIHRva2VuIHRoYXQgcmVwcmVzZW50cyB0aGUgYXJyYXkgb2YgcmVnaXN0ZXJlZFxuICogYEh0dHBJbnRlcmNlcHRvcmAgb2JqZWN0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvcltdPihuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUlMnIDogJycpO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KG5nRGV2TW9kZSA/ICdIVFRQX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyk7XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlZCB0b2tlbiBvZiBgSHR0cEludGVyY2VwdG9yRm5gcyB0aGF0IGFyZSBvbmx5IHNldCBpbiByb290LlxuICovXG5leHBvcnQgY29uc3QgSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUyA9XG4gICAgbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KG5nRGV2TW9kZSA/ICdIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TJyA6ICcnKTtcblxuLyoqXG4gKiBBIHByb3ZpZGVyIHRvIHNldCBhIGdsb2JhbCBwcmltYXJ5IGh0dHAgYmFja2VuZC4gSWYgc2V0LCBpdCB3aWxsIG92ZXJyaWRlIHRoZSBkZWZhdWx0IG9uZVxuICovXG5leHBvcnQgY29uc3QgUFJJTUFSWV9IVFRQX0JBQ0tFTkQgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwQmFja2VuZD4obmdEZXZNb2RlID8gJ1BSSU1BUllfSFRUUF9CQUNLRU5EJyA6ICcnKTtcblxuXG4vKipcbiAqIENyZWF0ZXMgYW4gYEh0dHBJbnRlcmNlcHRvckZuYCB3aGljaCBsYXppbHkgaW5pdGlhbGl6ZXMgYW4gaW50ZXJjZXB0b3IgY2hhaW4gZnJvbSB0aGUgbGVnYWN5XG4gKiBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMgYW5kIHJ1bnMgdGhlIHJlcXVlc3QgdGhyb3VnaCBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5KCk6IEh0dHBJbnRlcmNlcHRvckZuIHtcbiAgbGV0IGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+fG51bGwgPSBudWxsO1xuXG4gIHJldHVybiAocmVxLCBoYW5kbGVyKSA9PiB7XG4gICAgaWYgKGNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBpbnRlcmNlcHRvcnMgPSBpbmplY3QoSFRUUF9JTlRFUkNFUFRPUlMsIHtvcHRpb25hbDogdHJ1ZX0pID8/IFtdO1xuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBpbnRlcmNlcHRvcnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIGNoYWluID0gaW50ZXJjZXB0b3JzLnJlZHVjZVJpZ2h0KFxuICAgICAgICAgIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluLCBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48YW55Pik7XG4gICAgfVxuXG4gICAgY29uc3QgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KEluaXRpYWxSZW5kZXJQZW5kaW5nVGFza3MpO1xuICAgIGNvbnN0IHRhc2tJZCA9IHBlbmRpbmdUYXNrcy5hZGQoKTtcbiAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKS5waXBlKGZpbmFsaXplKCgpID0+IHBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICB9O1xufVxuXG5sZXQgZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCA9IGZhbHNlO1xuXG4vKiogSW50ZXJuYWwgZnVuY3Rpb24gdG8gcmVzZXQgdGhlIGZsYWcgaW4gdGVzdHMgKi9cbmV4cG9ydCBmdW5jdGlvbiByZXNldEZldGNoQmFja2VuZFdhcm5pbmdGbGFnKCkge1xuICBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG59XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBIdHRwSW50ZXJjZXB0b3JIYW5kbGVyIGV4dGVuZHMgSHR0cEhhbmRsZXIge1xuICBwcml2YXRlIGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPnxudWxsID0gbnVsbDtcbiAgcHJpdmF0ZSByZWFkb25seSBwZW5kaW5nVGFza3MgPSBpbmplY3QoSW5pdGlhbFJlbmRlclBlbmRpbmdUYXNrcyk7XG5cbiAgY29uc3RydWN0b3IocHJpdmF0ZSBiYWNrZW5kOiBIdHRwQmFja2VuZCwgcHJpdmF0ZSBpbmplY3RvcjogRW52aXJvbm1lbnRJbmplY3Rvcikge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHByZWZlcnJlZCBIVFRQIGJhY2tlbmQgY29uZmlndXJlZCBhbmQgdXNlIGl0IGlmIHRoYXQncyB0aGUgY2FzZS5cbiAgICAvLyBUaGlzIGlzIG5lZWRlZCB0byBlbmFibGUgYEZldGNoQmFja2VuZGAgZ2xvYmFsbHkgZm9yIGFsbCBIdHRwQ2xpZW50J3Mgd2hlbiBgd2l0aEZldGNoYFxuICAgIC8vIGlzIHVzZWQuXG4gICAgY29uc3QgcHJpbWFyeUh0dHBCYWNrZW5kID0gaW5qZWN0KFBSSU1BUllfSFRUUF9CQUNLRU5ELCB7b3B0aW9uYWw6IHRydWV9KTtcbiAgICB0aGlzLmJhY2tlbmQgPSBwcmltYXJ5SHR0cEJhY2tlbmQgPz8gYmFja2VuZDtcblxuICAgIC8vIFdlIHN0cm9uZ2x5IHJlY29tbWVuZCB1c2luZyBmZXRjaCBiYWNrZW5kIGZvciBIVFRQIGNhbGxzIHdoZW4gU1NSIGlzIHVzZWRcbiAgICAvLyBmb3IgYW4gYXBwbGljYXRpb24uIFRoZSBsb2dpYyBiZWxvdyBjaGVja3MgaWYgdGhhdCdzIHRoZSBjYXNlIGFuZCBwcm9kdWNlc1xuICAgIC8vIGEgd2FybmluZyBvdGhlcndpc2UuXG4gICAgaWYgKCh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpICYmICFmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkKSB7XG4gICAgICBjb25zdCBpc1NlcnZlciA9IGlzUGxhdGZvcm1TZXJ2ZXIoaW5qZWN0b3IuZ2V0KFBMQVRGT1JNX0lEKSk7XG4gICAgICBpZiAoaXNTZXJ2ZXIgJiYgISh0aGlzLmJhY2tlbmQgaW5zdGFuY2VvZiBGZXRjaEJhY2tlbmQpKSB7XG4gICAgICAgIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSB0cnVlO1xuICAgICAgICBpbmplY3Rvci5nZXQoQ29uc29sZSkud2Fybihmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk5PVF9VU0lOR19GRVRDSF9CQUNLRU5EX0lOX1NTUixcbiAgICAgICAgICAgICdBbmd1bGFyIGRldGVjdGVkIHRoYXQgYEh0dHBDbGllbnRgIGlzIG5vdCBjb25maWd1cmVkICcgK1xuICAgICAgICAgICAgICAgICd0byB1c2UgYGZldGNoYCBBUElzLiBJdFxcJ3Mgc3Ryb25nbHkgcmVjb21tZW5kZWQgdG8gJyArXG4gICAgICAgICAgICAgICAgJ2VuYWJsZSBgZmV0Y2hgIGZvciBhcHBsaWNhdGlvbnMgdGhhdCB1c2UgU2VydmVyLVNpZGUgUmVuZGVyaW5nICcgK1xuICAgICAgICAgICAgICAgICdmb3IgYmV0dGVyIHBlcmZvcm1hbmNlIGFuZCBjb21wYXRpYmlsaXR5LiAnICtcbiAgICAgICAgICAgICAgICAnVG8gZW5hYmxlIGBmZXRjaGAsIGFkZCB0aGUgYHdpdGhGZXRjaCgpYCB0byB0aGUgYHByb3ZpZGVIdHRwQ2xpZW50KClgICcgK1xuICAgICAgICAgICAgICAgICdjYWxsIGF0IHRoZSByb290IG9mIHRoZSBhcHBsaWNhdGlvbi4nKSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgb3ZlcnJpZGUgaGFuZGxlKGluaXRpYWxSZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIGlmICh0aGlzLmNoYWluID09PSBudWxsKSB7XG4gICAgICBjb25zdCBkZWR1cGVkSW50ZXJjZXB0b3JGbnMgPSBBcnJheS5mcm9tKG5ldyBTZXQoW1xuICAgICAgICAuLi50aGlzLmluamVjdG9yLmdldChIVFRQX0lOVEVSQ0VQVE9SX0ZOUyksXG4gICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfUk9PVF9JTlRFUkNFUFRPUl9GTlMsIFtdKSxcbiAgICAgIF0pKTtcblxuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBkZWR1cGVkSW50ZXJjZXB0b3JGbnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIHRoaXMuY2hhaW4gPSBkZWR1cGVkSW50ZXJjZXB0b3JGbnMucmVkdWNlUmlnaHQoXG4gICAgICAgICAgKG5leHRTZXF1ZW5jZWRGbiwgaW50ZXJjZXB0b3JGbikgPT5cbiAgICAgICAgICAgICAgY2hhaW5lZEludGVyY2VwdG9yRm4obmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuLCB0aGlzLmluamVjdG9yKSxcbiAgICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4pO1xuICAgIH1cblxuICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMucGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgIHJldHVybiB0aGlzLmNoYWluKGluaXRpYWxSZXF1ZXN0LCBkb3duc3RyZWFtUmVxdWVzdCA9PiB0aGlzLmJhY2tlbmQuaGFuZGxlKGRvd25zdHJlYW1SZXF1ZXN0KSlcbiAgICAgICAgLnBpcGUoZmluYWxpemUoKCkgPT4gdGhpcy5wZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCkpKTtcbiAgfVxufVxuIl19