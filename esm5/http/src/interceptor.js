/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable, InjectionToken } from '@angular/core';
/**
 * `HttpHandler` which applies an `HttpInterceptor` to an `HttpRequest`.
 *
 *
 */
var /**
 * `HttpHandler` which applies an `HttpInterceptor` to an `HttpRequest`.
 *
 *
 */
HttpInterceptorHandler = /** @class */ (function () {
    function HttpInterceptorHandler(next, interceptor) {
        this.next = next;
        this.interceptor = interceptor;
    }
    HttpInterceptorHandler.prototype.handle = function (req) {
        return this.interceptor.intercept(req, this.next);
    };
    return HttpInterceptorHandler;
}());
/**
 * `HttpHandler` which applies an `HttpInterceptor` to an `HttpRequest`.
 *
 *
 */
export { HttpInterceptorHandler };
/**
 * A multi-provider token which represents the array of `HttpInterceptor`s that
 * are registered.
 *
 *
 */
export var HTTP_INTERCEPTORS = new InjectionToken('HTTP_INTERCEPTORS');
var NoopInterceptor = /** @class */ (function () {
    function NoopInterceptor() {
    }
    NoopInterceptor.prototype.intercept = function (req, next) {
        return next.handle(req);
    };
    NoopInterceptor.decorators = [
        { type: Injectable }
    ];
    return NoopInterceptor;
}());
export { NoopInterceptor };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJjZXB0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvaW50ZXJjZXB0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQVFBLE9BQU8sRUFBQyxVQUFVLEVBQUUsY0FBYyxFQUFDLE1BQU0sZUFBZSxDQUFDOzs7Ozs7QUEyQ3pEOzs7OztBQUFBO0lBQ0UsZ0NBQW9CLElBQWlCLEVBQVUsV0FBNEI7UUFBdkQsU0FBSSxHQUFKLElBQUksQ0FBYTtRQUFVLGdCQUFXLEdBQVgsV0FBVyxDQUFpQjtLQUFJO0lBRS9FLHVDQUFNLEdBQU4sVUFBTyxHQUFxQjtRQUMxQixNQUFNLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQztLQUNuRDtpQ0F4REg7SUF5REMsQ0FBQTs7Ozs7O0FBTkQsa0NBTUM7Ozs7Ozs7QUFRRCxNQUFNLENBQUMsSUFBTSxpQkFBaUIsR0FBRyxJQUFJLGNBQWMsQ0FBb0IsbUJBQW1CLENBQUMsQ0FBQzs7OztJQUkxRixtQ0FBUyxHQUFULFVBQVUsR0FBcUIsRUFBRSxJQUFpQjtRQUNoRCxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN6Qjs7Z0JBSkYsVUFBVTs7MEJBbkVYOztTQW9FYSxlQUFlIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGUsIEluamVjdGlvblRva2VufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7T2JzZXJ2YWJsZX0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEhhbmRsZXJ9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG4vKipcbiAqIEludGVyY2VwdHMgYEh0dHBSZXF1ZXN0YCBhbmQgaGFuZGxlcyB0aGVtLlxuICpcbiAqIE1vc3QgaW50ZXJjZXB0b3JzIHdpbGwgdHJhbnNmb3JtIHRoZSBvdXRnb2luZyByZXF1ZXN0IGJlZm9yZSBwYXNzaW5nIGl0IHRvIHRoZVxuICogbmV4dCBpbnRlcmNlcHRvciBpbiB0aGUgY2hhaW4sIGJ5IGNhbGxpbmcgYG5leHQuaGFuZGxlKHRyYW5zZm9ybWVkUmVxKWAuXG4gKlxuICogSW4gcmFyZSBjYXNlcywgaW50ZXJjZXB0b3JzIG1heSB3aXNoIHRvIGNvbXBsZXRlbHkgaGFuZGxlIGEgcmVxdWVzdCB0aGVtc2VsdmVzLFxuICogYW5kIG5vdCBkZWxlZ2F0ZSB0byB0aGUgcmVtYWluZGVyIG9mIHRoZSBjaGFpbi4gVGhpcyBiZWhhdmlvciBpcyBhbGxvd2VkLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSHR0cEludGVyY2VwdG9yIHtcbiAgLyoqXG4gICAqIEludGVyY2VwdCBhbiBvdXRnb2luZyBgSHR0cFJlcXVlc3RgIGFuZCBvcHRpb25hbGx5IHRyYW5zZm9ybSBpdCBvciB0aGVcbiAgICogcmVzcG9uc2UuXG4gICAqXG4gICAqIFR5cGljYWxseSBhbiBpbnRlcmNlcHRvciB3aWxsIHRyYW5zZm9ybSB0aGUgb3V0Z29pbmcgcmVxdWVzdCBiZWZvcmUgcmV0dXJuaW5nXG4gICAqIGBuZXh0LmhhbmRsZSh0cmFuc2Zvcm1lZFJlcSlgLiBBbiBpbnRlcmNlcHRvciBtYXkgY2hvb3NlIHRvIHRyYW5zZm9ybSB0aGVcbiAgICogcmVzcG9uc2UgZXZlbnQgc3RyZWFtIGFzIHdlbGwsIGJ5IGFwcGx5aW5nIGFkZGl0aW9uYWwgUnggb3BlcmF0b3JzIG9uIHRoZSBzdHJlYW1cbiAgICogcmV0dXJuZWQgYnkgYG5leHQuaGFuZGxlKClgLlxuICAgKlxuICAgKiBNb3JlIHJhcmVseSwgYW4gaW50ZXJjZXB0b3IgbWF5IGNob29zZSB0byBjb21wbGV0ZWx5IGhhbmRsZSB0aGUgcmVxdWVzdCBpdHNlbGYsXG4gICAqIGFuZCBjb21wb3NlIGEgbmV3IGV2ZW50IHN0cmVhbSBpbnN0ZWFkIG9mIGludm9raW5nIGBuZXh0LmhhbmRsZSgpYC4gVGhpcyBpc1xuICAgKiBhY2NlcHRhYmxlIGJlaGF2aW9yLCBidXQga2VlcCBpbiBtaW5kIGZ1cnRoZXIgaW50ZXJjZXB0b3JzIHdpbGwgYmUgc2tpcHBlZCBlbnRpcmVseS5cbiAgICpcbiAgICogSXQgaXMgYWxzbyByYXJlIGJ1dCB2YWxpZCBmb3IgYW4gaW50ZXJjZXB0b3IgdG8gcmV0dXJuIG11bHRpcGxlIHJlc3BvbnNlcyBvbiB0aGVcbiAgICogZXZlbnQgc3RyZWFtIGZvciBhIHNpbmdsZSByZXF1ZXN0LlxuICAgKi9cbiAgaW50ZXJjZXB0KHJlcTogSHR0cFJlcXVlc3Q8YW55PiwgbmV4dDogSHR0cEhhbmRsZXIpOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+Pjtcbn1cblxuLyoqXG4gKiBgSHR0cEhhbmRsZXJgIHdoaWNoIGFwcGxpZXMgYW4gYEh0dHBJbnRlcmNlcHRvcmAgdG8gYW4gYEh0dHBSZXF1ZXN0YC5cbiAqXG4gKlxuICovXG5leHBvcnQgY2xhc3MgSHR0cEludGVyY2VwdG9ySGFuZGxlciBpbXBsZW1lbnRzIEh0dHBIYW5kbGVyIHtcbiAgY29uc3RydWN0b3IocHJpdmF0ZSBuZXh0OiBIdHRwSGFuZGxlciwgcHJpdmF0ZSBpbnRlcmNlcHRvcjogSHR0cEludGVyY2VwdG9yKSB7fVxuXG4gIGhhbmRsZShyZXE6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIHRoaXMuaW50ZXJjZXB0b3IuaW50ZXJjZXB0KHJlcSwgdGhpcy5uZXh0KTtcbiAgfVxufVxuXG4vKipcbiAqIEEgbXVsdGktcHJvdmlkZXIgdG9rZW4gd2hpY2ggcmVwcmVzZW50cyB0aGUgYXJyYXkgb2YgYEh0dHBJbnRlcmNlcHRvcmBzIHRoYXRcbiAqIGFyZSByZWdpc3RlcmVkLlxuICpcbiAqXG4gKi9cbmV4cG9ydCBjb25zdCBIVFRQX0lOVEVSQ0VQVE9SUyA9IG5ldyBJbmplY3Rpb25Ub2tlbjxIdHRwSW50ZXJjZXB0b3JbXT4oJ0hUVFBfSU5URVJDRVBUT1JTJyk7XG5cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBOb29wSW50ZXJjZXB0b3IgaW1wbGVtZW50cyBIdHRwSW50ZXJjZXB0b3Ige1xuICBpbnRlcmNlcHQocmVxOiBIdHRwUmVxdWVzdDxhbnk+LCBuZXh0OiBIdHRwSGFuZGxlcik6IE9ic2VydmFibGU8SHR0cEV2ZW50PGFueT4+IHtcbiAgICByZXR1cm4gbmV4dC5oYW5kbGUocmVxKTtcbiAgfVxufVxuIl19