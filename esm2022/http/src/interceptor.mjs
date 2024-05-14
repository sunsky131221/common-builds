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
    return (initialRequest, finalHandlerFn) => runInInjectionContext(injector, () => interceptorFn(initialRequest, (downstreamRequest) => chainTailFn(downstreamRequest, finalHandlerFn)));
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.0.0-rc.1+sha-4352598", ngImport: i0, type: HttpInterceptorHandler, deps: [{ token: i1.HttpBackend }, { token: i0.EnvironmentInjector }], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "18.0.0-rc.1+sha-4352598", ngImport: i0, type: HttpInterceptorHandler }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.0.0-rc.1+sha-4352598", ngImport: i0, type: HttpInterceptorHandler, decorators: [{
            type: Injectable
        }], ctorParameters: () => [{ type: i1.HttpBackend }, { type: i0.EnvironmentInjector }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUNMLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sVUFBVSxFQUNWLGNBQWMsRUFDZCxXQUFXLEVBQ1gscUJBQXFCLEVBQ3JCLFFBQVEsSUFBSSxPQUFPLEVBQ25CLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6QyxhQUFhLElBQUksWUFBWSxHQUM5QixNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsUUFBUSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFFeEMsT0FBTyxFQUFDLFdBQVcsRUFBRSxXQUFXLEVBQUMsTUFBTSxXQUFXLENBQUM7QUFFbkQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLFNBQVMsQ0FBQzs7O0FBZ0lyQyxTQUFTLHFCQUFxQixDQUM1QixHQUFxQixFQUNyQixjQUE2QjtJQUU3QixPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUM3QixDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyw2QkFBNkIsQ0FDcEMsV0FBc0MsRUFDdEMsV0FBNEI7SUFFNUIsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUN4QyxXQUFXLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRTtRQUNwQyxNQUFNLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQUMsV0FBVyxDQUFDLGlCQUFpQixFQUFFLGNBQWMsQ0FBQztLQUM5RSxDQUFDLENBQUM7QUFDUCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FDM0IsV0FBMEMsRUFDMUMsYUFBZ0MsRUFDaEMsUUFBNkI7SUFFN0IsT0FBTyxDQUFDLGNBQWMsRUFBRSxjQUFjLEVBQUUsRUFBRSxDQUN4QyxxQkFBcUIsQ0FBQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQ25DLGFBQWEsQ0FBQyxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQ2xELFdBQVcsQ0FBQyxpQkFBaUIsRUFBRSxjQUFjLENBQUMsQ0FDL0MsQ0FDRixDQUFDO0FBQ04sQ0FBQztBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxDQUFDLE1BQU0saUJBQWlCLEdBQUcsSUFBSSxjQUFjLENBQ2pELFNBQVMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDckMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sb0JBQW9CLEdBQUcsSUFBSSxjQUFjLENBQ3BELFNBQVMsQ0FBQyxDQUFDLENBQUMsc0JBQXNCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDeEMsQ0FBQztBQUVGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxjQUFjLENBQ3pELFNBQVMsQ0FBQyxDQUFDLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FDN0MsQ0FBQztBQUVGLHNHQUFzRztBQUN0RyxpR0FBaUc7QUFDakcsa0VBQWtFO0FBQ2xFLE1BQU0sQ0FBQyxNQUFNLGdDQUFnQyxHQUFHLElBQUksY0FBYyxDQUNoRSxTQUFTLENBQUMsQ0FBQyxDQUFDLGtDQUFrQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQ25ELEVBQUMsVUFBVSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBSSxFQUFDLENBQzFDLENBQUM7QUFFRjs7O0dBR0c7QUFDSCxNQUFNLFVBQVUsMEJBQTBCO0lBQ3hDLElBQUksS0FBSyxHQUFxQyxJQUFJLENBQUM7SUFFbkQsT0FBTyxDQUFDLEdBQUcsRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUN0QixJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUNuQixNQUFNLFlBQVksR0FBRyxNQUFNLENBQUMsaUJBQWlCLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDdkUsZ0ZBQWdGO1lBQ2hGLGlGQUFpRjtZQUNqRixzRkFBc0Y7WUFDdEYsT0FBTztZQUNQLEtBQUssR0FBRyxZQUFZLENBQUMsV0FBVyxDQUM5Qiw2QkFBNkIsRUFDN0IscUJBQWtELENBQ25ELENBQUM7UUFDSixDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQzFDLE1BQU0scUJBQXFCLEdBQUcsTUFBTSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFDdkUsSUFBSSxxQkFBcUIsRUFBRSxDQUFDO1lBQzFCLE1BQU0sTUFBTSxHQUFHLFlBQVksQ0FBQyxHQUFHLEVBQUUsQ0FBQztZQUNsQyxPQUFPLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxZQUFZLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRSxDQUFDO2FBQU0sQ0FBQztZQUNOLE9BQU8sS0FBSyxDQUFDLEdBQUcsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUM3QixDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELElBQUksNEJBQTRCLEdBQUcsS0FBSyxDQUFDO0FBRXpDLG1EQUFtRDtBQUNuRCxNQUFNLFVBQVUsNEJBQTRCO0lBQzFDLDRCQUE0QixHQUFHLEtBQUssQ0FBQztBQUN2QyxDQUFDO0FBR0QsTUFBTSxPQUFPLHNCQUF1QixTQUFRLFdBQVc7SUFLckQsWUFDVSxPQUFvQixFQUNwQixRQUE2QjtRQUVyQyxLQUFLLEVBQUUsQ0FBQztRQUhBLFlBQU8sR0FBUCxPQUFPLENBQWE7UUFDcEIsYUFBUSxHQUFSLFFBQVEsQ0FBcUI7UUFOL0IsVUFBSyxHQUF5QyxJQUFJLENBQUM7UUFDMUMsaUJBQVksR0FBRyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDcEMsMEJBQXFCLEdBQUcsTUFBTSxDQUFDLGdDQUFnQyxDQUFDLENBQUM7UUFRaEYsNEVBQTRFO1FBQzVFLDZFQUE2RTtRQUM3RSx1QkFBdUI7UUFDdkIsSUFBSSxDQUFDLE9BQU8sU0FBUyxLQUFLLFdBQVcsSUFBSSxTQUFTLENBQUMsSUFBSSxDQUFDLDRCQUE0QixFQUFFLENBQUM7WUFDckYsTUFBTSxRQUFRLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1lBQzdELElBQUksUUFBUSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxZQUFZLFlBQVksQ0FBQyxFQUFFLENBQUM7Z0JBQ3hELDRCQUE0QixHQUFHLElBQUksQ0FBQztnQkFDcEMsUUFBUTtxQkFDTCxHQUFHLENBQUMsT0FBTyxDQUFDO3FCQUNaLElBQUksQ0FDSCxrQkFBa0IsNkRBRWhCLHVEQUF1RDtvQkFDckQsb0RBQW9EO29CQUNwRCxpRUFBaUU7b0JBQ2pFLDRDQUE0QztvQkFDNUMsd0VBQXdFO29CQUN4RSxzQ0FBc0MsQ0FDekMsQ0FDRixDQUFDO1lBQ04sQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0lBRVEsTUFBTSxDQUFDLGNBQWdDO1FBQzlDLElBQUksSUFBSSxDQUFDLEtBQUssS0FBSyxJQUFJLEVBQUUsQ0FBQztZQUN4QixNQUFNLHFCQUFxQixHQUFHLEtBQUssQ0FBQyxJQUFJLENBQ3RDLElBQUksR0FBRyxDQUFDO2dCQUNOLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsb0JBQW9CLENBQUM7Z0JBQzFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMseUJBQXlCLEVBQUUsRUFBRSxDQUFDO2FBQ3BELENBQUMsQ0FDSCxDQUFDO1lBRUYsZ0ZBQWdGO1lBQ2hGLDBGQUEwRjtZQUMxRixzRkFBc0Y7WUFDdEYsT0FBTztZQUNQLElBQUksQ0FBQyxLQUFLLEdBQUcscUJBQXFCLENBQUMsV0FBVyxDQUM1QyxDQUFDLGVBQWUsRUFBRSxhQUFhLEVBQUUsRUFBRSxDQUNqQyxvQkFBb0IsQ0FBQyxlQUFlLEVBQUUsYUFBYSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsRUFDckUscUJBQXNELENBQ3ZELENBQUM7UUFDSixDQUFDO1FBRUQsSUFBSSxJQUFJLENBQUMscUJBQXFCLEVBQUUsQ0FBQztZQUMvQixNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLEdBQUcsRUFBRSxDQUFDO1lBQ3ZDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLENBQ3RELElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQ3ZDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDM0QsQ0FBQzthQUFNLENBQUM7WUFDTixPQUFPLElBQUksQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUMsaUJBQWlCLEVBQUUsRUFBRSxDQUN0RCxJQUFJLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxDQUN2QyxDQUFDO1FBQ0osQ0FBQztJQUNILENBQUM7eUhBakVVLHNCQUFzQjs2SEFBdEIsc0JBQXNCOztzR0FBdEIsc0JBQXNCO2tCQURsQyxVQUFVIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aXNQbGF0Zm9ybVNlcnZlcn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7XG4gIEVudmlyb25tZW50SW5qZWN0b3IsXG4gIGluamVjdCxcbiAgSW5qZWN0YWJsZSxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIFBMQVRGT1JNX0lELFxuICBydW5JbkluamVjdGlvbkNvbnRleHQsXG4gIMm1Q29uc29sZSBhcyBDb25zb2xlLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIMm1UGVuZGluZ1Rhc2tzIGFzIFBlbmRpbmdUYXNrcyxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGV9IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtmaW5hbGl6ZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG5pbXBvcnQge0h0dHBCYWNrZW5kLCBIdHRwSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtGZXRjaEJhY2tlbmR9IGZyb20gJy4vZmV0Y2gnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cEV2ZW50fSBmcm9tICcuL3Jlc3BvbnNlJztcblxuLyoqXG4gKiBJbnRlcmNlcHRzIGFuZCBoYW5kbGVzIGFuIGBIdHRwUmVxdWVzdGAgb3IgYEh0dHBSZXNwb25zZWAuXG4gKlxuICogTW9zdCBpbnRlcmNlcHRvcnMgdHJhbnNmb3JtIHRoZSBvdXRnb2luZyByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIGJ5IGNhbGxpbmcgYG5leHQuaGFuZGxlKHRyYW5zZm9ybWVkUmVxKWAuXG4gKiBBbiBpbnRlcmNlcHRvciBtYXkgdHJhbnNmb3JtIHRoZVxuICogcmVzcG9uc2UgZXZlbnQgc3RyZWFtIGFzIHdlbGwsIGJ5IGFwcGx5aW5nIGFkZGl0aW9uYWwgUnhKUyBvcGVyYXRvcnMgb24gdGhlIHN0cmVhbVxuICogcmV0dXJuZWQgYnkgYG5leHQuaGFuZGxlKClgLlxuICpcbiAqIE1vcmUgcmFyZWx5LCBhbiBpbnRlcmNlcHRvciBtYXkgaGFuZGxlIHRoZSByZXF1ZXN0IGVudGlyZWx5LFxuICogYW5kIGNvbXBvc2UgYSBuZXcgZXZlbnQgc3RyZWFtIGluc3RlYWQgb2YgaW52b2tpbmcgYG5leHQuaGFuZGxlKClgLiBUaGlzIGlzIGFuXG4gKiBhY2NlcHRhYmxlIGJlaGF2aW9yLCBidXQga2VlcCBpbiBtaW5kIHRoYXQgZnVydGhlciBpbnRlcmNlcHRvcnMgd2lsbCBiZSBza2lwcGVkIGVudGlyZWx5LlxuICpcbiAqIEl0IGlzIGFsc28gcmFyZSBidXQgdmFsaWQgZm9yIGFuIGludGVyY2VwdG9yIHRvIHJldHVybiBtdWx0aXBsZSByZXNwb25zZXMgb24gdGhlXG4gKiBldmVudCBzdHJlYW0gZm9yIGEgc2luZ2xlIHJlcXVlc3QuXG4gKlxuICogQHB1YmxpY0FwaVxuICpcbiAqIEBzZWUgW0hUVFAgR3VpZGVdKGd1aWRlL2h0dHAvaW50ZXJjZXB0b3JzKVxuICogQHNlZSB7QGxpbmsgSHR0cEludGVyY2VwdG9yRm59XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiBUbyB1c2UgdGhlIHNhbWUgaW5zdGFuY2Ugb2YgYEh0dHBJbnRlcmNlcHRvcnNgIGZvciB0aGUgZW50aXJlIGFwcCwgaW1wb3J0IHRoZSBgSHR0cENsaWVudE1vZHVsZWBcbiAqIG9ubHkgaW4geW91ciBgQXBwTW9kdWxlYCwgYW5kIGFkZCB0aGUgaW50ZXJjZXB0b3JzIHRvIHRoZSByb290IGFwcGxpY2F0aW9uIGluamVjdG9yLlxuICogSWYgeW91IGltcG9ydCBgSHR0cENsaWVudE1vZHVsZWAgbXVsdGlwbGUgdGltZXMgYWNyb3NzIGRpZmZlcmVudCBtb2R1bGVzIChmb3IgZXhhbXBsZSwgaW4gbGF6eVxuICogbG9hZGluZyBtb2R1bGVzKSwgZWFjaCBpbXBvcnQgY3JlYXRlcyBhIG5ldyBjb3B5IG9mIHRoZSBgSHR0cENsaWVudE1vZHVsZWAsIHdoaWNoIG92ZXJ3cml0ZXMgdGhlXG4gKiBpbnRlcmNlcHRvcnMgcHJvdmlkZWQgaW4gdGhlIHJvb3QgbW9kdWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEh0dHBJbnRlcmNlcHRvciB7XG4gIC8qKlxuICAgKiBJZGVudGlmaWVzIGFuZCBoYW5kbGVzIGEgZ2l2ZW4gSFRUUCByZXF1ZXN0LlxuICAgKiBAcGFyYW0gcmVxIFRoZSBvdXRnb2luZyByZXF1ZXN0IG9iamVjdCB0byBoYW5kbGUuXG4gICAqIEBwYXJhbSBuZXh0IFRoZSBuZXh0IGludGVyY2VwdG9yIGluIHRoZSBjaGFpbiwgb3IgdGhlIGJhY2tlbmRcbiAgICogaWYgbm8gaW50ZXJjZXB0b3JzIHJlbWFpbiBpbiB0aGUgY2hhaW4uXG4gICAqIEByZXR1cm5zIEFuIG9ic2VydmFibGUgb2YgdGhlIGV2ZW50IHN0cmVhbS5cbiAgICovXG4gIGludGVyY2VwdChyZXE6IEh0dHBSZXF1ZXN0PGFueT4sIG5leHQ6IEh0dHBIYW5kbGVyKTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj47XG59XG5cbi8qKlxuICogUmVwcmVzZW50cyB0aGUgbmV4dCBpbnRlcmNlcHRvciBpbiBhbiBpbnRlcmNlcHRvciBjaGFpbiwgb3IgdGhlIHJlYWwgYmFja2VuZCBpZiB0aGVyZSBhcmUgbm9cbiAqIGZ1cnRoZXIgaW50ZXJjZXB0b3JzLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgZGVsZWdhdGUgdG8gdGhpcyBmdW5jdGlvbiwgYW5kIGVpdGhlciBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgdGhlXG4gKiByZXNwb25zZSB3aGVuIGl0IGFycml2ZXMuIFdpdGhpbiB0aGUgc2NvcGUgb2YgdGhlIGN1cnJlbnQgcmVxdWVzdCwgaG93ZXZlciwgdGhpcyBmdW5jdGlvbiBtYXkgYmVcbiAqIGNhbGxlZCBhbnkgbnVtYmVyIG9mIHRpbWVzLCBmb3IgYW55IG51bWJlciBvZiBkb3duc3RyZWFtIHJlcXVlc3RzLiBTdWNoIGRvd25zdHJlYW0gcmVxdWVzdHMgbmVlZFxuICogbm90IGJlIHRvIHRoZSBzYW1lIFVSTCBvciBldmVuIHRoZSBzYW1lIG9yaWdpbiBhcyB0aGUgY3VycmVudCByZXF1ZXN0LiBJdCBpcyBhbHNvIHZhbGlkIHRvIG5vdFxuICogY2FsbCB0aGUgZG93bnN0cmVhbSBoYW5kbGVyIGF0IGFsbCwgYW5kIHByb2Nlc3MgdGhlIGN1cnJlbnQgcmVxdWVzdCBlbnRpcmVseSB3aXRoaW4gdGhlXG4gKiBpbnRlcmNlcHRvci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHNob3VsZCBvbmx5IGJlIGNhbGxlZCB3aXRoaW4gdGhlIHNjb3BlIG9mIHRoZSByZXF1ZXN0IHRoYXQncyBjdXJyZW50bHkgYmVpbmdcbiAqIGludGVyY2VwdGVkLiBPbmNlIHRoYXQgcmVxdWVzdCBpcyBjb21wbGV0ZSwgdGhpcyBkb3duc3RyZWFtIGhhbmRsZXIgZnVuY3Rpb24gc2hvdWxkIG5vdCBiZVxuICogY2FsbGVkLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwL2ludGVyY2VwdG9ycylcbiAqL1xuZXhwb3J0IHR5cGUgSHR0cEhhbmRsZXJGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogQW4gaW50ZXJjZXB0b3IgZm9yIEhUVFAgcmVxdWVzdHMgbWFkZSB2aWEgYEh0dHBDbGllbnRgLlxuICpcbiAqIGBIdHRwSW50ZXJjZXB0b3JGbmBzIGFyZSBtaWRkbGV3YXJlIGZ1bmN0aW9ucyB3aGljaCBgSHR0cENsaWVudGAgY2FsbHMgd2hlbiBhIHJlcXVlc3QgaXMgbWFkZS5cbiAqIFRoZXNlIGZ1bmN0aW9ucyBoYXZlIHRoZSBvcHBvcnR1bml0eSB0byBtb2RpZnkgdGhlIG91dGdvaW5nIHJlcXVlc3Qgb3IgYW55IHJlc3BvbnNlIHRoYXQgY29tZXNcbiAqIGJhY2ssIGFzIHdlbGwgYXMgYmxvY2ssIHJlZGlyZWN0LCBvciBvdGhlcndpc2UgY2hhbmdlIHRoZSByZXF1ZXN0IG9yIHJlc3BvbnNlIHNlbWFudGljcy5cbiAqXG4gKiBBbiBgSHR0cEhhbmRsZXJGbmAgcmVwcmVzZW50aW5nIHRoZSBuZXh0IGludGVyY2VwdG9yIChvciB0aGUgYmFja2VuZCB3aGljaCB3aWxsIG1ha2UgYSByZWFsIEhUVFBcbiAqIHJlcXVlc3QpIGlzIHByb3ZpZGVkLiBNb3N0IGludGVyY2VwdG9ycyB3aWxsIGRlbGVnYXRlIHRvIHRoaXMgZnVuY3Rpb24sIGJ1dCB0aGF0IGlzIG5vdCByZXF1aXJlZFxuICogKHNlZSBgSHR0cEhhbmRsZXJGbmAgZm9yIG1vcmUgZGV0YWlscykuXG4gKlxuICogYEh0dHBJbnRlcmNlcHRvckZuYHMgYXJlIGV4ZWN1dGVkIGluIGFuIFtpbmplY3Rpb24gY29udGV4dF0oZ3VpZGUvZGkvZGVwZW5kZW5jeS1pbmplY3Rpb24tY29udGV4dCkuXG4gKiBUaGV5IGhhdmUgYWNjZXNzIHRvIGBpbmplY3QoKWAgdmlhIHRoZSBgRW52aXJvbm1lbnRJbmplY3RvcmAgZnJvbSB3aGljaCB0aGV5IHdlcmUgY29uZmlndXJlZC5cbiAqXG4gKiBAc2VlIFtIVFRQIEd1aWRlXShndWlkZS9odHRwL2ludGVyY2VwdG9ycylcbiAqIEBzZWUge0BsaW5rIHdpdGhJbnRlcmNlcHRvcnN9XG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIEhlcmUgaXMgYSBub29wIGludGVyY2VwdG9yIHRoYXQgcGFzc2VzIHRoZSByZXF1ZXN0IHRocm91Z2ggd2l0aG91dCBtb2RpZnlpbmcgaXQ6XG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBleHBvcnQgY29uc3Qgbm9vcEludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3JGbiA9IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LCBuZXh0OlxuICogSHR0cEhhbmRsZXJGbikgPT4ge1xuICogICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKlxuICogSWYgeW91IHdhbnQgdG8gYWx0ZXIgYSByZXF1ZXN0LCBjbG9uZSBpdCBmaXJzdCBhbmQgbW9kaWZ5IHRoZSBjbG9uZSBiZWZvcmUgcGFzc2luZyBpdCB0byB0aGVcbiAqIGBuZXh0KClgIGhhbmRsZXIgZnVuY3Rpb24uXG4gKlxuICogSGVyZSBpcyBhIGJhc2ljIGludGVyY2VwdG9yIHRoYXQgYWRkcyBhIGJlYXJlciB0b2tlbiB0byB0aGUgaGVhZGVyc1xuICogYGBgdHlwZXNjcmlwdFxuICogZXhwb3J0IGNvbnN0IGF1dGhlbnRpY2F0aW9uSW50ZXJjZXB0b3I6IEh0dHBJbnRlcmNlcHRvckZuID0gKHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sIG5leHQ6XG4gKiBIdHRwSGFuZGxlckZuKSA9PiB7XG4gKiAgICBjb25zdCB1c2VyVG9rZW4gPSAnTVlfVE9LRU4nOyBjb25zdCBtb2RpZmllZFJlcSA9IHJlcS5jbG9uZSh7XG4gKiAgICAgIGhlYWRlcnM6IHJlcS5oZWFkZXJzLnNldCgnQXV0aG9yaXphdGlvbicsIGBCZWFyZXIgJHt1c2VyVG9rZW59YCksXG4gKiAgICB9KTtcbiAqXG4gKiAgICByZXR1cm4gbmV4dChtb2RpZmllZFJlcSk7XG4gKiB9O1xuICogYGBgXG4gKi9cbmV4cG9ydCB0eXBlIEh0dHBJbnRlcmNlcHRvckZuID0gKFxuICByZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+LFxuICBuZXh0OiBIdHRwSGFuZGxlckZuLFxuKSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj47XG5cbi8qKlxuICogRnVuY3Rpb24gd2hpY2ggaW52b2tlcyBhbiBIVFRQIGludGVyY2VwdG9yIGNoYWluLlxuICpcbiAqIEVhY2ggaW50ZXJjZXB0b3IgaW4gdGhlIGludGVyY2VwdG9yIGNoYWluIGlzIHR1cm5lZCBpbnRvIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCBjbG9zZXNcbiAqIG92ZXIgdGhlIHJlc3Qgb2YgdGhlIGNoYWluIChyZXByZXNlbnRlZCBieSBhbm90aGVyIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmApLiBUaGUgbGFzdCBzdWNoXG4gKiBmdW5jdGlvbiBpbiB0aGUgY2hhaW4gd2lsbCBpbnN0ZWFkIGRlbGVnYXRlIHRvIHRoZSBgZmluYWxIYW5kbGVyRm5gLCB3aGljaCBpcyBwYXNzZWQgZG93biB3aGVuXG4gKiB0aGUgY2hhaW4gaXMgaW52b2tlZC5cbiAqXG4gKiBUaGlzIHBhdHRlcm4gYWxsb3dzIGZvciBhIGNoYWluIG9mIG1hbnkgaW50ZXJjZXB0b3JzIHRvIGJlIGNvbXBvc2VkIGFuZCB3cmFwcGVkIGluIGEgc2luZ2xlXG4gKiBgSHR0cEludGVyY2VwdG9yRm5gLCB3aGljaCBpcyBhIHVzZWZ1bCBhYnN0cmFjdGlvbiBmb3IgaW5jbHVkaW5nIGRpZmZlcmVudCBraW5kcyBvZiBpbnRlcmNlcHRvcnNcbiAqIChlLmcuIGxlZ2FjeSBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMpIGluIHRoZSBzYW1lIGNoYWluLlxuICovXG50eXBlIENoYWluZWRJbnRlcmNlcHRvckZuPFJlcXVlc3RUPiA9IChcbiAgcmVxOiBIdHRwUmVxdWVzdDxSZXF1ZXN0VD4sXG4gIGZpbmFsSGFuZGxlckZuOiBIdHRwSGFuZGxlckZuLFxuKSA9PiBPYnNlcnZhYmxlPEh0dHBFdmVudDxSZXF1ZXN0VD4+O1xuXG5mdW5jdGlvbiBpbnRlcmNlcHRvckNoYWluRW5kRm4oXG4gIHJlcTogSHR0cFJlcXVlc3Q8YW55PixcbiAgZmluYWxIYW5kbGVyRm46IEh0dHBIYW5kbGVyRm4sXG4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gIHJldHVybiBmaW5hbEhhbmRsZXJGbihyZXEpO1xufVxuXG4vKipcbiAqIENvbnN0cnVjdHMgYSBgQ2hhaW5lZEludGVyY2VwdG9yRm5gIHdoaWNoIGFkYXB0cyBhIGxlZ2FjeSBgSHR0cEludGVyY2VwdG9yYCB0byB0aGVcbiAqIGBDaGFpbmVkSW50ZXJjZXB0b3JGbmAgaW50ZXJmYWNlLlxuICovXG5mdW5jdGlvbiBhZGFwdExlZ2FjeUludGVyY2VwdG9yVG9DaGFpbihcbiAgY2hhaW5UYWlsRm46IENoYWluZWRJbnRlcmNlcHRvckZuPGFueT4sXG4gIGludGVyY2VwdG9yOiBIdHRwSW50ZXJjZXB0b3IsXG4pOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHtcbiAgcmV0dXJuIChpbml0aWFsUmVxdWVzdCwgZmluYWxIYW5kbGVyRm4pID0+XG4gICAgaW50ZXJjZXB0b3IuaW50ZXJjZXB0KGluaXRpYWxSZXF1ZXN0LCB7XG4gICAgICBoYW5kbGU6IChkb3duc3RyZWFtUmVxdWVzdCkgPT4gY2hhaW5UYWlsRm4oZG93bnN0cmVhbVJlcXVlc3QsIGZpbmFsSGFuZGxlckZuKSxcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgYENoYWluZWRJbnRlcmNlcHRvckZuYCB3aGljaCB3cmFwcyBhbmQgaW52b2tlcyBhIGZ1bmN0aW9uYWwgaW50ZXJjZXB0b3IgaW4gdGhlIGdpdmVuXG4gKiBpbmplY3Rvci5cbiAqL1xuZnVuY3Rpb24gY2hhaW5lZEludGVyY2VwdG9yRm4oXG4gIGNoYWluVGFpbEZuOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjx1bmtub3duPixcbiAgaW50ZXJjZXB0b3JGbjogSHR0cEludGVyY2VwdG9yRm4sXG4gIGluamVjdG9yOiBFbnZpcm9ubWVudEluamVjdG9yLFxuKTogQ2hhaW5lZEludGVyY2VwdG9yRm48dW5rbm93bj4ge1xuICByZXR1cm4gKGluaXRpYWxSZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbikgPT5cbiAgICBydW5JbkluamVjdGlvbkNvbnRleHQoaW5qZWN0b3IsICgpID0+XG4gICAgICBpbnRlcmNlcHRvckZuKGluaXRpYWxSZXF1ZXN0LCAoZG93bnN0cmVhbVJlcXVlc3QpID0+XG4gICAgICAgIGNoYWluVGFpbEZuKGRvd25zdHJlYW1SZXF1ZXN0LCBmaW5hbEhhbmRsZXJGbiksXG4gICAgICApLFxuICAgICk7XG59XG5cbi8qKlxuICogQSBtdWx0aS1wcm92aWRlciB0b2tlbiB0aGF0IHJlcHJlc2VudHMgdGhlIGFycmF5IG9mIHJlZ2lzdGVyZWRcbiAqIGBIdHRwSW50ZXJjZXB0b3JgIG9iamVjdHMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSFRUUF9JTlRFUkNFUFRPUlMgPSBuZXcgSW5qZWN0aW9uVG9rZW48cmVhZG9ubHkgSHR0cEludGVyY2VwdG9yW10+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9JTlRFUkNFUFRPUlMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZWQgdG9rZW4gb2YgYEh0dHBJbnRlcmNlcHRvckZuYHMuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SX0ZOUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxyZWFkb25seSBIdHRwSW50ZXJjZXB0b3JGbltdPihcbiAgbmdEZXZNb2RlID8gJ0hUVFBfSU5URVJDRVBUT1JfRk5TJyA6ICcnLFxuKTtcblxuLyoqXG4gKiBBIG11bHRpLXByb3ZpZGVkIHRva2VuIG9mIGBIdHRwSW50ZXJjZXB0b3JGbmBzIHRoYXQgYXJlIG9ubHkgc2V0IGluIHJvb3QuXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TID0gbmV3IEluamVjdGlvblRva2VuPHJlYWRvbmx5IEh0dHBJbnRlcmNlcHRvckZuW10+KFxuICBuZ0Rldk1vZGUgPyAnSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUycgOiAnJyxcbik7XG5cbi8vIFRPRE8oYXRzY290dCk6IFdlIG5lZWQgYSBsYXJnZXIgZGlzY3Vzc2lvbiBhYm91dCBzdGFiaWxpdHkgYW5kIHdoYXQgc2hvdWxkIGNvbnRyaWJ1dGUgdG8gc3RhYmlsaXR5LlxuLy8gU2hvdWxkIHRoZSB3aG9sZSBpbnRlcmNlcHRvciBjaGFpbiBjb250cmlidXRlIHRvIHN0YWJpbGl0eSBvciBqdXN0IHRoZSBiYWNrZW5kIHJlcXVlc3QgIzU1MDc1P1xuLy8gU2hvdWxkIEh0dHBDbGllbnQgY29udHJpYnV0ZSB0byBzdGFiaWxpdHkgYXV0b21hdGljYWxseSBhdCBhbGw/XG5leHBvcnQgY29uc3QgUkVRVUVTVFNfQ09OVFJJQlVURV9UT19TVEFCSUxJVFkgPSBuZXcgSW5qZWN0aW9uVG9rZW48Ym9vbGVhbj4oXG4gIG5nRGV2TW9kZSA/ICdSRVFVRVNUU19DT05UUklCVVRFX1RPX1NUQUJJTElUWScgOiAnJyxcbiAge3Byb3ZpZGVkSW46ICdyb290JywgZmFjdG9yeTogKCkgPT4gdHJ1ZX0sXG4pO1xuXG4vKipcbiAqIENyZWF0ZXMgYW4gYEh0dHBJbnRlcmNlcHRvckZuYCB3aGljaCBsYXppbHkgaW5pdGlhbGl6ZXMgYW4gaW50ZXJjZXB0b3IgY2hhaW4gZnJvbSB0aGUgbGVnYWN5XG4gKiBjbGFzcy1iYXNlZCBpbnRlcmNlcHRvcnMgYW5kIHJ1bnMgdGhlIHJlcXVlc3QgdGhyb3VnaCBpdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlZ2FjeUludGVyY2VwdG9yRm5GYWN0b3J5KCk6IEh0dHBJbnRlcmNlcHRvckZuIHtcbiAgbGV0IGNoYWluOiBDaGFpbmVkSW50ZXJjZXB0b3JGbjxhbnk+IHwgbnVsbCA9IG51bGw7XG5cbiAgcmV0dXJuIChyZXEsIGhhbmRsZXIpID0+IHtcbiAgICBpZiAoY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGludGVyY2VwdG9ycyA9IGluamVjdChIVFRQX0lOVEVSQ0VQVE9SUywge29wdGlvbmFsOiB0cnVlfSkgPz8gW107XG4gICAgICAvLyBOb3RlOiBpbnRlcmNlcHRvcnMgYXJlIHdyYXBwZWQgcmlnaHQtdG8tbGVmdCBzbyB0aGF0IGZpbmFsIGV4ZWN1dGlvbiBvcmRlciBpc1xuICAgICAgLy8gbGVmdC10by1yaWdodC4gVGhhdCBpcywgaWYgYGludGVyY2VwdG9yc2AgaXMgdGhlIGFycmF5IGBbYSwgYiwgY11gLCB3ZSB3YW50IHRvXG4gICAgICAvLyBwcm9kdWNlIGEgY2hhaW4gdGhhdCBpcyBjb25jZXB0dWFsbHkgYGMoYihhKGVuZCkpKWAsIHdoaWNoIHdlIGJ1aWxkIGZyb20gdGhlIGluc2lkZVxuICAgICAgLy8gb3V0LlxuICAgICAgY2hhaW4gPSBpbnRlcmNlcHRvcnMucmVkdWNlUmlnaHQoXG4gICAgICAgIGFkYXB0TGVnYWN5SW50ZXJjZXB0b3JUb0NoYWluLFxuICAgICAgICBpbnRlcmNlcHRvckNoYWluRW5kRm4gYXMgQ2hhaW5lZEludGVyY2VwdG9yRm48YW55PixcbiAgICAgICk7XG4gICAgfVxuXG4gICAgY29uc3QgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG4gICAgY29uc3QgY29udHJpYnV0ZVRvU3RhYmlsaXR5ID0gaW5qZWN0KFJFUVVFU1RTX0NPTlRSSUJVVEVfVE9fU1RBQklMSVRZKTtcbiAgICBpZiAoY29udHJpYnV0ZVRvU3RhYmlsaXR5KSB7XG4gICAgICBjb25zdCB0YXNrSWQgPSBwZW5kaW5nVGFza3MuYWRkKCk7XG4gICAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKS5waXBlKGZpbmFsaXplKCgpID0+IHBlbmRpbmdUYXNrcy5yZW1vdmUodGFza0lkKSkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gY2hhaW4ocmVxLCBoYW5kbGVyKTtcbiAgICB9XG4gIH07XG59XG5cbmxldCBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gZmFsc2U7XG5cbi8qKiBJbnRlcm5hbCBmdW5jdGlvbiB0byByZXNldCB0aGUgZmxhZyBpbiB0ZXN0cyAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJlc2V0RmV0Y2hCYWNrZW5kV2FybmluZ0ZsYWcoKSB7XG4gIGZldGNoQmFja2VuZFdhcm5pbmdEaXNwbGF5ZWQgPSBmYWxzZTtcbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIEh0dHBJbnRlcmNlcHRvckhhbmRsZXIgZXh0ZW5kcyBIdHRwSGFuZGxlciB7XG4gIHByaXZhdGUgY2hhaW46IENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+IHwgbnVsbCA9IG51bGw7XG4gIHByaXZhdGUgcmVhZG9ubHkgcGVuZGluZ1Rhc2tzID0gaW5qZWN0KFBlbmRpbmdUYXNrcyk7XG4gIHByaXZhdGUgcmVhZG9ubHkgY29udHJpYnV0ZVRvU3RhYmlsaXR5ID0gaW5qZWN0KFJFUVVFU1RTX0NPTlRSSUJVVEVfVE9fU1RBQklMSVRZKTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBwcml2YXRlIGJhY2tlbmQ6IEh0dHBCYWNrZW5kLFxuICAgIHByaXZhdGUgaW5qZWN0b3I6IEVudmlyb25tZW50SW5qZWN0b3IsXG4gICkge1xuICAgIHN1cGVyKCk7XG5cbiAgICAvLyBXZSBzdHJvbmdseSByZWNvbW1lbmQgdXNpbmcgZmV0Y2ggYmFja2VuZCBmb3IgSFRUUCBjYWxscyB3aGVuIFNTUiBpcyB1c2VkXG4gICAgLy8gZm9yIGFuIGFwcGxpY2F0aW9uLiBUaGUgbG9naWMgYmVsb3cgY2hlY2tzIGlmIHRoYXQncyB0aGUgY2FzZSBhbmQgcHJvZHVjZXNcbiAgICAvLyBhIHdhcm5pbmcgb3RoZXJ3aXNlLlxuICAgIGlmICgodHlwZW9mIG5nRGV2TW9kZSA9PT0gJ3VuZGVmaW5lZCcgfHwgbmdEZXZNb2RlKSAmJiAhZmV0Y2hCYWNrZW5kV2FybmluZ0Rpc3BsYXllZCkge1xuICAgICAgY29uc3QgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdG9yLmdldChQTEFURk9STV9JRCkpO1xuICAgICAgaWYgKGlzU2VydmVyICYmICEodGhpcy5iYWNrZW5kIGluc3RhbmNlb2YgRmV0Y2hCYWNrZW5kKSkge1xuICAgICAgICBmZXRjaEJhY2tlbmRXYXJuaW5nRGlzcGxheWVkID0gdHJ1ZTtcbiAgICAgICAgaW5qZWN0b3JcbiAgICAgICAgICAuZ2V0KENvbnNvbGUpXG4gICAgICAgICAgLndhcm4oXG4gICAgICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTk9UX1VTSU5HX0ZFVENIX0JBQ0tFTkRfSU5fU1NSLFxuICAgICAgICAgICAgICAnQW5ndWxhciBkZXRlY3RlZCB0aGF0IGBIdHRwQ2xpZW50YCBpcyBub3QgY29uZmlndXJlZCAnICtcbiAgICAgICAgICAgICAgICBcInRvIHVzZSBgZmV0Y2hgIEFQSXMuIEl0J3Mgc3Ryb25nbHkgcmVjb21tZW5kZWQgdG8gXCIgK1xuICAgICAgICAgICAgICAgICdlbmFibGUgYGZldGNoYCBmb3IgYXBwbGljYXRpb25zIHRoYXQgdXNlIFNlcnZlci1TaWRlIFJlbmRlcmluZyAnICtcbiAgICAgICAgICAgICAgICAnZm9yIGJldHRlciBwZXJmb3JtYW5jZSBhbmQgY29tcGF0aWJpbGl0eS4gJyArXG4gICAgICAgICAgICAgICAgJ1RvIGVuYWJsZSBgZmV0Y2hgLCBhZGQgdGhlIGB3aXRoRmV0Y2goKWAgdG8gdGhlIGBwcm92aWRlSHR0cENsaWVudCgpYCAnICtcbiAgICAgICAgICAgICAgICAnY2FsbCBhdCB0aGUgcm9vdCBvZiB0aGUgYXBwbGljYXRpb24uJyxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBvdmVycmlkZSBoYW5kbGUoaW5pdGlhbFJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgaWYgKHRoaXMuY2hhaW4gPT09IG51bGwpIHtcbiAgICAgIGNvbnN0IGRlZHVwZWRJbnRlcmNlcHRvckZucyA9IEFycmF5LmZyb20oXG4gICAgICAgIG5ldyBTZXQoW1xuICAgICAgICAgIC4uLnRoaXMuaW5qZWN0b3IuZ2V0KEhUVFBfSU5URVJDRVBUT1JfRk5TKSxcbiAgICAgICAgICAuLi50aGlzLmluamVjdG9yLmdldChIVFRQX1JPT1RfSU5URVJDRVBUT1JfRk5TLCBbXSksXG4gICAgICAgIF0pLFxuICAgICAgKTtcblxuICAgICAgLy8gTm90ZTogaW50ZXJjZXB0b3JzIGFyZSB3cmFwcGVkIHJpZ2h0LXRvLWxlZnQgc28gdGhhdCBmaW5hbCBleGVjdXRpb24gb3JkZXIgaXNcbiAgICAgIC8vIGxlZnQtdG8tcmlnaHQuIFRoYXQgaXMsIGlmIGBkZWR1cGVkSW50ZXJjZXB0b3JGbnNgIGlzIHRoZSBhcnJheSBgW2EsIGIsIGNdYCwgd2Ugd2FudCB0b1xuICAgICAgLy8gcHJvZHVjZSBhIGNoYWluIHRoYXQgaXMgY29uY2VwdHVhbGx5IGBjKGIoYShlbmQpKSlgLCB3aGljaCB3ZSBidWlsZCBmcm9tIHRoZSBpbnNpZGVcbiAgICAgIC8vIG91dC5cbiAgICAgIHRoaXMuY2hhaW4gPSBkZWR1cGVkSW50ZXJjZXB0b3JGbnMucmVkdWNlUmlnaHQoXG4gICAgICAgIChuZXh0U2VxdWVuY2VkRm4sIGludGVyY2VwdG9yRm4pID0+XG4gICAgICAgICAgY2hhaW5lZEludGVyY2VwdG9yRm4obmV4dFNlcXVlbmNlZEZuLCBpbnRlcmNlcHRvckZuLCB0aGlzLmluamVjdG9yKSxcbiAgICAgICAgaW50ZXJjZXB0b3JDaGFpbkVuZEZuIGFzIENoYWluZWRJbnRlcmNlcHRvckZuPHVua25vd24+LFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5jb250cmlidXRlVG9TdGFiaWxpdHkpIHtcbiAgICAgIGNvbnN0IHRhc2tJZCA9IHRoaXMucGVuZGluZ1Rhc2tzLmFkZCgpO1xuICAgICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIChkb3duc3RyZWFtUmVxdWVzdCkgPT5cbiAgICAgICAgdGhpcy5iYWNrZW5kLmhhbmRsZShkb3duc3RyZWFtUmVxdWVzdCksXG4gICAgICApLnBpcGUoZmluYWxpemUoKCkgPT4gdGhpcy5wZW5kaW5nVGFza3MucmVtb3ZlKHRhc2tJZCkpKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuY2hhaW4oaW5pdGlhbFJlcXVlc3QsIChkb3duc3RyZWFtUmVxdWVzdCkgPT5cbiAgICAgICAgdGhpcy5iYWNrZW5kLmhhbmRsZShkb3duc3RyZWFtUmVxdWVzdCksXG4gICAgICApO1xuICAgIH1cbiAgfVxufVxuIl19