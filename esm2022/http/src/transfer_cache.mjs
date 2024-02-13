/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { APP_BOOTSTRAP_LISTENER, ApplicationRef, inject, InjectionToken, makeStateKey, TransferState, ɵformatRuntimeError as formatRuntimeError, ɵperformanceMarkFeature as performanceMarkFeature, ɵtruncateMiddle as truncateMiddle, ɵwhenStable as whenStable, } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { HttpHeaders } from './headers';
import { HTTP_ROOT_INTERCEPTOR_FNS } from './interceptor';
import { HttpResponse } from './response';
/**
 * Keys within cached response data structure.
 */
export const BODY = 'b';
export const HEADERS = 'h';
export const STATUS = 's';
export const STATUS_TEXT = 'st';
export const URL = 'u';
export const RESPONSE_TYPE = 'rt';
const CACHE_OPTIONS = new InjectionToken(ngDevMode ? 'HTTP_TRANSFER_STATE_CACHE_OPTIONS' : '');
/**
 * A list of allowed HTTP methods to cache.
 */
const ALLOWED_METHODS = ['GET', 'HEAD'];
export function transferCacheInterceptorFn(req, next) {
    const { isCacheActive, ...globalOptions } = inject(CACHE_OPTIONS);
    const { transferCache: requestOptions, method: requestMethod } = req;
    // In the following situations we do not want to cache the request
    if (!isCacheActive ||
        // POST requests are allowed either globally or at request level
        (requestMethod === 'POST' && !globalOptions.includePostRequests && !requestOptions) ||
        (requestMethod !== 'POST' && !ALLOWED_METHODS.includes(requestMethod)) ||
        requestOptions === false || //
        globalOptions.filter?.(req) === false) {
        return next(req);
    }
    const transferState = inject(TransferState);
    const storeKey = makeCacheKey(req);
    const response = transferState.get(storeKey, null);
    let headersToInclude = globalOptions.includeHeaders;
    if (typeof requestOptions === 'object' && requestOptions.includeHeaders) {
        // Request-specific config takes precedence over the global config.
        headersToInclude = requestOptions.includeHeaders;
    }
    if (response) {
        const { [BODY]: undecodedBody, [RESPONSE_TYPE]: responseType, [HEADERS]: httpHeaders, [STATUS]: status, [STATUS_TEXT]: statusText, [URL]: url, } = response;
        // Request found in cache. Respond using it.
        let body = undecodedBody;
        switch (responseType) {
            case 'arraybuffer':
                body = new TextEncoder().encode(undecodedBody).buffer;
                break;
            case 'blob':
                body = new Blob([undecodedBody]);
                break;
        }
        // We want to warn users accessing a header provided from the cache
        // That HttpTransferCache alters the headers
        // The warning will be logged a single time by HttpHeaders instance
        let headers = new HttpHeaders(httpHeaders);
        if (typeof ngDevMode === 'undefined' || ngDevMode) {
            // Append extra logic in dev mode to produce a warning when a header
            // that was not transferred to the client is accessed in the code via `get`
            // and `has` calls.
            headers = appendMissingHeadersDetection(req.url, headers, headersToInclude ?? []);
        }
        return of(new HttpResponse({
            body,
            headers,
            status,
            statusText,
            url,
        }));
    }
    // Request not found in cache. Make the request and cache it.
    return next(req).pipe(tap((event) => {
        if (event instanceof HttpResponse) {
            transferState.set(storeKey, {
                [BODY]: event.body,
                [HEADERS]: getFilteredHeaders(event.headers, headersToInclude),
                [STATUS]: event.status,
                [STATUS_TEXT]: event.statusText,
                [URL]: event.url || '',
                [RESPONSE_TYPE]: req.responseType,
            });
        }
    }));
}
function getFilteredHeaders(headers, includeHeaders) {
    if (!includeHeaders) {
        return {};
    }
    const headersMap = {};
    for (const key of includeHeaders) {
        const values = headers.getAll(key);
        if (values !== null) {
            headersMap[key] = values;
        }
    }
    return headersMap;
}
function makeCacheKey(request) {
    // make the params encoded same as a url so it's easy to identify
    const { params, method, responseType, url, body } = request;
    const encodedParams = params
        .keys()
        .sort()
        .map((k) => `${k}=${params.getAll(k)}`)
        .join('&');
    const strBody = typeof body === 'string' ? body : '';
    const key = [method, responseType, url, strBody, encodedParams].join('|');
    const hash = generateHash(key);
    return makeStateKey(hash);
}
/**
 * A method that returns a hash representation of a string using a variant of DJB2 hash
 * algorithm.
 *
 * This is the same hashing logic that is used to generate component ids.
 */
function generateHash(value) {
    let hash = 0;
    for (const char of value) {
        hash = (Math.imul(31, hash) + char.charCodeAt(0)) << 0;
    }
    // Force positive number hash.
    // 2147483647 = equivalent of Integer.MAX_VALUE.
    hash += 2147483647 + 1;
    return hash.toString();
}
/**
 * Returns the DI providers needed to enable HTTP transfer cache.
 *
 * By default, when using server rendering, requests are performed twice: once on the server and
 * other one on the browser.
 *
 * When these providers are added, requests performed on the server are cached and reused during the
 * bootstrapping of the application in the browser thus avoiding duplicate requests and reducing
 * load time.
 *
 */
export function withHttpTransferCache(cacheOptions) {
    return [
        {
            provide: CACHE_OPTIONS,
            useFactory: () => {
                performanceMarkFeature('NgHttpTransferCache');
                return { isCacheActive: true, ...cacheOptions };
            },
        },
        {
            provide: HTTP_ROOT_INTERCEPTOR_FNS,
            useValue: transferCacheInterceptorFn,
            multi: true,
            deps: [TransferState, CACHE_OPTIONS],
        },
        {
            provide: APP_BOOTSTRAP_LISTENER,
            multi: true,
            useFactory: () => {
                const appRef = inject(ApplicationRef);
                const cacheState = inject(CACHE_OPTIONS);
                return () => {
                    whenStable(appRef).then(() => {
                        cacheState.isCacheActive = false;
                    });
                };
            },
        },
    ];
}
/**
 * This function will add a proxy to an HttpHeader to intercept calls to get/has
 * and log a warning if the header entry requested has been removed
 */
function appendMissingHeadersDetection(url, headers, headersToInclude) {
    const warningProduced = new Set();
    return new Proxy(headers, {
        get(target, prop) {
            const value = Reflect.get(target, prop);
            const methods = new Set(['get', 'has', 'getAll']);
            if (typeof value !== 'function' || !methods.has(prop)) {
                return value;
            }
            return (headerName) => {
                // We log when the key has been removed and a warning hasn't been produced for the header
                const key = (prop + ':' + headerName).toLowerCase(); // e.g. `get:cache-control`
                if (!headersToInclude.includes(headerName) && !warningProduced.has(key)) {
                    warningProduced.add(key);
                    const truncatedUrl = truncateMiddle(url);
                    // TODO: create Error guide for this warning
                    console.warn(formatRuntimeError(2802 /* RuntimeErrorCode.HEADERS_ALTERED_BY_TRANSFER_CACHE */, `Angular detected that the \`${headerName}\` header is accessed, but the value of the header ` +
                        `was not transferred from the server to the client by the HttpTransferCache. ` +
                        `To include the value of the \`${headerName}\` header for the \`${truncatedUrl}\` request, ` +
                        `use the \`includeHeaders\` list. The \`includeHeaders\` can be defined either ` +
                        `on a request level by adding the \`transferCache\` parameter, or on an application ` +
                        `level by adding the \`httpCacheTransfer.includeHeaders\` argument to the ` +
                        `\`provideClientHydration()\` call. `));
                }
                // invoking the original method
                return value.apply(target, [headerName]);
            };
        },
    });
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHJhbnNmZXJfY2FjaGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvdHJhbnNmZXJfY2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLHNCQUFzQixFQUN0QixjQUFjLEVBQ2QsTUFBTSxFQUNOLGNBQWMsRUFDZCxZQUFZLEVBR1osYUFBYSxFQUNiLG1CQUFtQixJQUFJLGtCQUFrQixFQUN6Qyx1QkFBdUIsSUFBSSxzQkFBc0IsRUFDakQsZUFBZSxJQUFJLGNBQWMsRUFDakMsV0FBVyxJQUFJLFVBQVUsR0FDMUIsTUFBTSxlQUFlLENBQUM7QUFDdkIsT0FBTyxFQUFhLEVBQUUsRUFBQyxNQUFNLE1BQU0sQ0FBQztBQUNwQyxPQUFPLEVBQUMsR0FBRyxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFHbkMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUN0QyxPQUFPLEVBQUMseUJBQXlCLEVBQWdCLE1BQU0sZUFBZSxDQUFDO0FBRXZFLE9BQU8sRUFBWSxZQUFZLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFxQm5EOztHQUVHO0FBRUgsTUFBTSxDQUFDLE1BQU0sSUFBSSxHQUFHLEdBQUcsQ0FBQztBQUN4QixNQUFNLENBQUMsTUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDO0FBQzNCLE1BQU0sQ0FBQyxNQUFNLE1BQU0sR0FBRyxHQUFHLENBQUM7QUFDMUIsTUFBTSxDQUFDLE1BQU0sV0FBVyxHQUFHLElBQUksQ0FBQztBQUNoQyxNQUFNLENBQUMsTUFBTSxHQUFHLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLE1BQU0sQ0FBQyxNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUM7QUFxQmxDLE1BQU0sYUFBYSxHQUFHLElBQUksY0FBYyxDQUN0QyxTQUFTLENBQUMsQ0FBQyxDQUFDLG1DQUFtQyxDQUFDLENBQUMs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QUNMLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQVBQX0JPT1RTVFJBUF9MSVNURU5FUixcbiAgQXBwbGljYXRpb25SZWYsXG4gIGluamVjdCxcbiAgSW5qZWN0aW9uVG9rZW4sXG4gIG1ha2VTdGF0ZUtleSxcbiAgUHJvdmlkZXIsXG4gIFN0YXRlS2V5LFxuICBUcmFuc2ZlclN0YXRlLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIMm1cGVyZm9ybWFuY2VNYXJrRmVhdHVyZSBhcyBwZXJmb3JtYW5jZU1hcmtGZWF0dXJlLFxuICDJtXRydW5jYXRlTWlkZGxlIGFzIHRydW5jYXRlTWlkZGxlLFxuICDJtXdoZW5TdGFibGUgYXMgd2hlblN0YWJsZSxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIG9mfSBmcm9tICdyeGpzJztcbmltcG9ydCB7dGFwfSBmcm9tICdyeGpzL29wZXJhdG9ycyc7XG5cbmltcG9ydCB7UnVudGltZUVycm9yQ29kZX0gZnJvbSAnLi9lcnJvcnMnO1xuaW1wb3J0IHtIdHRwSGVhZGVyc30gZnJvbSAnLi9oZWFkZXJzJztcbmltcG9ydCB7SFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUywgSHR0cEhhbmRsZXJGbn0gZnJvbSAnLi9pbnRlcmNlcHRvcic7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRXZlbnQsIEh0dHBSZXNwb25zZX0gZnJvbSAnLi9yZXNwb25zZSc7XG5cbi8qKlxuICogT3B0aW9ucyB0byBjb25maWd1cmUgaG93IFRyYW5zZmVyQ2FjaGUgc2hvdWxkIGJlIHVzZWQgdG8gY2FjaGUgcmVxdWVzdHMgbWFkZSB2aWEgSHR0cENsaWVudC5cbiAqXG4gKiBAcGFyYW0gaW5jbHVkZUhlYWRlcnMgU3BlY2lmaWVzIHdoaWNoIGhlYWRlcnMgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gY2FjaGVkIHJlc3BvbnNlcy4gTm9cbiAqICAgICBoZWFkZXJzIGFyZSBpbmNsdWRlZCBieSBkZWZhdWx0LlxuICogQHBhcmFtIGZpbHRlciBBIGZ1bmN0aW9uIHRoYXQgcmVjZWl2ZXMgYSByZXF1ZXN0IGFzIGFuIGFyZ3VtZW50IGFuZCByZXR1cm5zIGEgYm9vbGVhbiB0byBpbmRpY2F0ZVxuICogICAgIHdoZXRoZXIgYSByZXF1ZXN0IHNob3VsZCBiZSBpbmNsdWRlZCBpbnRvIHRoZSBjYWNoZS5cbiAqIEBwYXJhbSBpbmNsdWRlUG9zdFJlcXVlc3RzIEVuYWJsZXMgY2FjaGluZyBmb3IgUE9TVCByZXF1ZXN0cy4gQnkgZGVmYXVsdCwgb25seSBHRVQgYW5kIEhFQURcbiAqICAgICByZXF1ZXN0cyBhcmUgY2FjaGVkLiBUaGlzIG9wdGlvbiBjYW4gYmUgZW5hYmxlZCBpZiBQT1NUIHJlcXVlc3RzIGFyZSB1c2VkIHRvIHJldHJpZXZlIGRhdGFcbiAqICAgICAoZm9yIGV4YW1wbGUgdXNpbmcgR3JhcGhRTCkuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgdHlwZSBIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMgPSB7XG4gIGluY2x1ZGVIZWFkZXJzPzogc3RyaW5nW107XG4gIGZpbHRlcj86IChyZXE6IEh0dHBSZXF1ZXN0PHVua25vd24+KSA9PiBib29sZWFuO1xuICBpbmNsdWRlUG9zdFJlcXVlc3RzPzogYm9vbGVhbjtcbn07XG5cbi8qKlxuICogS2V5cyB3aXRoaW4gY2FjaGVkIHJlc3BvbnNlIGRhdGEgc3RydWN0dXJlLlxuICovXG5cbmV4cG9ydCBjb25zdCBCT0RZID0gJ2InO1xuZXhwb3J0IGNvbnN0IEhFQURFUlMgPSAnaCc7XG5leHBvcnQgY29uc3QgU1RBVFVTID0gJ3MnO1xuZXhwb3J0IGNvbnN0IFNUQVRVU19URVhUID0gJ3N0JztcbmV4cG9ydCBjb25zdCBVUkwgPSAndSc7XG5leHBvcnQgY29uc3QgUkVTUE9OU0VfVFlQRSA9ICdydCc7XG5cbmludGVyZmFjZSBUcmFuc2Zlckh0dHBSZXNwb25zZSB7XG4gIC8qKiBib2R5ICovXG4gIFtCT0RZXTogYW55O1xuICAvKiogaGVhZGVycyAqL1xuICBbSEVBREVSU106IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPjtcbiAgLyoqIHN0YXR1cyAqL1xuICBbU1RBVFVTXT86IG51bWJlcjtcbiAgLyoqIHN0YXR1c1RleHQgKi9cbiAgW1NUQVRVU19URVhUXT86IHN0cmluZztcbiAgLyoqIHVybCAqL1xuICBbVVJMXT86IHN0cmluZztcbiAgLyoqIHJlc3BvbnNlVHlwZSAqL1xuICBbUkVTUE9OU0VfVFlQRV0/OiBIdHRwUmVxdWVzdDx1bmtub3duPlsncmVzcG9uc2VUeXBlJ107XG59XG5cbmludGVyZmFjZSBDYWNoZU9wdGlvbnMgZXh0ZW5kcyBIdHRwVHJhbnNmZXJDYWNoZU9wdGlvbnMge1xuICBpc0NhY2hlQWN0aXZlOiBib29sZWFuO1xufVxuXG5jb25zdCBDQUNIRV9PUFRJT05TID0gbmV3IEluamVjdGlvblRva2VuPENhY2hlT3B0aW9ucz4oXG4gIG5nRGV2TW9kZSA/ICdIVFRQX1RSQU5TRkVSX1NUQVRFX0NBQ0hFX09QVElPTlMnIDogJycsXG4pO1xuXG4vKipcbiAqIEEgbGlzdCBvZiBhbGxvd2VkIEhUVFAgbWV0aG9kcyB0byBjYWNoZS5cbiAqL1xuY29uc3QgQUxMT1dFRF9NRVRIT0RTID0gWydHRVQnLCAnSEVBRCddO1xuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmZXJDYWNoZUludGVyY2VwdG9yRm4oXG4gIHJlcTogSHR0cFJlcXVlc3Q8dW5rbm93bj4sXG4gIG5leHQ6IEh0dHBIYW5kbGVyRm4sXG4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDx1bmtub3duPj4ge1xuICBjb25zdCB7aXNDYWNoZUFjdGl2ZSwgLi4uZ2xvYmFsT3B0aW9uc30gPSBpbmplY3QoQ0FDSEVfT1BUSU9OUyk7XG4gIGNvbnN0IHt0cmFuc2ZlckNhY2hlOiByZXF1ZXN0T3B0aW9ucywgbWV0aG9kOiByZXF1ZXN0TWV0aG9kfSA9IHJlcTtcblxuICAvLyBJbiB0aGUgZm9sbG93aW5nIHNpdHVhdGlvbnMgd2UgZG8gbm90IHdhbnQgdG8gY2FjaGUgdGhlIHJlcXVlc3RcbiAgaWYgKFxuICAgICFpc0NhY2hlQWN0aXZlIHx8XG4gICAgLy8gUE9TVCByZXF1ZXN0cyBhcmUgYWxsb3dlZCBlaXRoZXIgZ2xvYmFsbHkgb3IgYXQgcmVxdWVzdCBsZXZlbFxuICAgIChyZXF1ZXN0TWV0aG9kID09PSAnUE9TVCcgJiYgIWdsb2JhbE9wdGlvbnMuaW5jbHVkZVBvc3RSZXF1ZXN0cyAmJiAhcmVxdWVzdE9wdGlvbnMpIHx8XG4gICAgKHJlcXVlc3RNZXRob2QgIT09ICdQT1NUJyAmJiAhQUxMT1dFRF9NRVRIT0RTLmluY2x1ZGVzKHJlcXVlc3RNZXRob2QpKSB8fFxuICAgIHJlcXVlc3RPcHRpb25zID09PSBmYWxzZSB8fCAvL1xuICAgIGdsb2JhbE9wdGlvbnMuZmlsdGVyPy4ocmVxKSA9PT0gZmFsc2VcbiAgKSB7XG4gICAgcmV0dXJuIG5leHQocmVxKTtcbiAgfVxuXG4gIGNvbnN0IHRyYW5zZmVyU3RhdGUgPSBpbmplY3QoVHJhbnNmZXJTdGF0ZSk7XG4gIGNvbnN0IHN0b3JlS2V5ID0gbWFrZUNhY2hlS2V5KHJlcSk7XG4gIGNvbnN0IHJlc3BvbnNlID0gdHJhbnNmZXJTdGF0ZS5nZXQoc3RvcmVLZXksIG51bGwpO1xuXG4gIGxldCBoZWFkZXJzVG9JbmNsdWRlID0gZ2xvYmFsT3B0aW9ucy5pbmNsdWRlSGVhZGVycztcbiAgaWYgKHR5cGVvZiByZXF1ZXN0T3B0aW9ucyA9PT0gJ29iamVjdCcgJiYgcmVxdWVzdE9wdGlvbnMuaW5jbHVkZUhlYWRlcnMpIHtcbiAgICAvLyBSZXF1ZXN0LXNwZWNpZmljIGNvbmZpZyB0YWtlcyBwcmVjZWRlbmNlIG92ZXIgdGhlIGdsb2JhbCBjb25maWcuXG4gICAgaGVhZGVyc1RvSW5jbHVkZSA9IHJlcXVlc3RPcHRpb25zLmluY2x1ZGVIZWFkZXJzO1xuICB9XG5cbiAgaWYgKHJlc3BvbnNlKSB7XG4gICAgY29uc3Qge1xuICAgICAgW0JPRFldOiB1bmRlY29kZWRCb2R5LFxuICAgICAgW1JFU1BPTlNFX1RZUEVdOiByZXNwb25zZVR5cGUsXG4gICAgICBbSEVBREVSU106IGh0dHBIZWFkZXJzLFxuICAgICAgW1NUQVRVU106IHN0YXR1cyxcbiAgICAgIFtTVEFUVVNfVEVYVF06IHN0YXR1c1RleHQsXG4gICAgICBbVVJMXTogdXJsLFxuICAgIH0gPSByZXNwb25zZTtcbiAgICAvLyBSZXF1ZXN0IGZvdW5kIGluIGNhY2hlLiBSZXNwb25kIHVzaW5nIGl0LlxuICAgIGxldCBib2R5OiBBcnJheUJ1ZmZlciB8IEJsb2IgfCBzdHJpbmcgfCB1bmRlZmluZWQgPSB1bmRlY29kZWRCb2R5O1xuXG4gICAgc3dpdGNoIChyZXNwb25zZVR5cGUpIHtcbiAgICAgIGNhc2UgJ2FycmF5YnVmZmVyJzpcbiAgICAgICAgYm9keSA9IG5ldyBUZXh0RW5jb2RlcigpLmVuY29kZSh1bmRlY29kZWRCb2R5KS5idWZmZXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnYmxvYic6XG4gICAgICAgIGJvZHkgPSBuZXcgQmxvYihbdW5kZWNvZGVkQm9keV0pO1xuICAgICAgICBicmVhaztcbiAgICB9XG5cbiAgICAvLyBXZSB3YW50IHRvIHdhcm4gdXNlcnMgYWNjZXNzaW5nIGEgaGVhZGVyIHByb3ZpZGVkIGZyb20gdGhlIGNhY2hlXG4gICAgLy8gVGhhdCBIdHRwVHJhbnNmZXJDYWNoZSBhbHRlcnMgdGhlIGhlYWRlcnNcbiAgICAvLyBUaGUgd2FybmluZyB3aWxsIGJlIGxvZ2dlZCBhIHNpbmdsZSB0aW1lIGJ5IEh0dHBIZWFkZXJzIGluc3RhbmNlXG4gICAgbGV0IGhlYWRlcnMgPSBuZXcgSHR0cEhlYWRlcnMoaHR0cEhlYWRlcnMpO1xuICAgIGlmICh0eXBlb2YgbmdEZXZNb2RlID09PSAndW5kZWZpbmVkJyB8fCBuZ0Rldk1vZGUpIHtcbiAgICAgIC8vIEFwcGVuZCBleHRyYSBsb2dpYyBpbiBkZXYgbW9kZSB0byBwcm9kdWNlIGEgd2FybmluZyB3aGVuIGEgaGVhZGVyXG4gICAgICAvLyB0aGF0IHdhcyBub3QgdHJhbnNmZXJyZWQgdG8gdGhlIGNsaWVudCBpcyBhY2Nlc3NlZCBpbiB0aGUgY29kZSB2aWEgYGdldGBcbiAgICAgIC8vIGFuZCBgaGFzYCBjYWxscy5cbiAgICAgIGhlYWRlcnMgPSBhcHBlbmRNaXNzaW5nSGVhZGVyc0RldGVjdGlvbihyZXEudXJsLCBoZWFkZXJzLCBoZWFkZXJzVG9JbmNsdWRlID8/IFtdKTtcbiAgICB9XG5cbiAgICByZXR1cm4gb2YoXG4gICAgICBuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgYm9keSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICB1cmwsXG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgLy8gUmVxdWVzdCBub3QgZm91bmQgaW4gY2FjaGUuIE1ha2UgdGhlIHJlcXVlc3QgYW5kIGNhY2hlIGl0LlxuICByZXR1cm4gbmV4dChyZXEpLnBpcGUoXG4gICAgdGFwKChldmVudDogSHR0cEV2ZW50PHVua25vd24+KSA9PiB7XG4gICAgICBpZiAoZXZlbnQgaW5zdGFuY2VvZiBIdHRwUmVzcG9uc2UpIHtcbiAgICAgICAgdHJhbnNmZXJTdGF0ZS5zZXQ8VHJhbnNmZXJIdHRwUmVzcG9uc2U+KHN0b3JlS2V5LCB7XG4gICAgICAgICAgW0JPRFldOiBldmVudC5ib2R5LFxuICAgICAgICAgIFtIRUFERVJTXTogZ2V0RmlsdGVyZWRIZWFkZXJzKGV2ZW50LmhlYWRlcnMsIGhlYWRlcnNUb0luY2x1ZGUpLFxuICAgICAgICAgIFtTVEFUVVNdOiBldmVudC5zdGF0dXMsXG4gICAgICAgICAgW1NUQVRVU19URVhUXTogZXZlbnQuc3RhdHVzVGV4dCxcbiAgICAgICAgICBbVVJMXTogZXZlbnQudXJsIHx8ICcnLFxuICAgICAgICAgIFtSRVNQT05TRV9UWVBFXTogcmVxLnJlc3BvbnNlVHlwZSxcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSksXG4gICk7XG59XG5cbmZ1bmN0aW9uIGdldEZpbHRlcmVkSGVhZGVycyhcbiAgaGVhZGVyczogSHR0cEhlYWRlcnMsXG4gIGluY2x1ZGVIZWFkZXJzOiBzdHJpbmdbXSB8IHVuZGVmaW5lZCxcbik6IFJlY29yZDxzdHJpbmcsIHN0cmluZ1tdPiB7XG4gIGlmICghaW5jbHVkZUhlYWRlcnMpIHtcbiAgICByZXR1cm4ge307XG4gIH1cblxuICBjb25zdCBoZWFkZXJzTWFwOiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmdbXT4gPSB7fTtcbiAgZm9yIChjb25zdCBrZXkgb2YgaW5jbHVkZUhlYWRlcnMpIHtcbiAgICBjb25zdCB2YWx1ZXMgPSBoZWFkZXJzLmdldEFsbChrZXkpO1xuICAgIGlmICh2YWx1ZXMgIT09IG51bGwpIHtcbiAgICAgIGhlYWRlcnNNYXBba2V5XSA9IHZhbHVlcztcbiAgICB9XG4gIH1cblxuICByZXR1cm4gaGVhZGVyc01hcDtcbn1cblxuZnVuY3Rpb24gbWFrZUNhY2hlS2V5KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBTdGF0ZUtleTxUcmFuc2Zlckh0dHBSZXNwb25zZT4ge1xuICAvLyBtYWtlIHRoZSBwYXJhbXMgZW5jb2RlZCBzYW1lIGFzIGEgdXJsIHNvIGl0J3MgZWFzeSB0byBpZGVudGlmeVxuICBjb25zdCB7cGFyYW1zLCBtZXRob2QsIHJlc3BvbnNlVHlwZSwgdXJsLCBib2R5fSA9IHJlcXVlc3Q7XG4gIGNvbnN0IGVuY29kZWRQYXJhbXMgPSBwYXJhbXNcbiAgICAua2V5cygpXG4gICAgLnNvcnQoKVxuICAgIC5tYXAoKGspID0+IGAke2t9PSR7cGFyYW1zLmdldEFsbChrKX1gKVxuICAgIC5qb2luKCcmJyk7XG4gIGNvbnN0IHN0ckJvZHkgPSB0eXBlb2YgYm9keSA9PT0gJ3N0cmluZycgPyBib2R5IDogJyc7XG4gIGNvbnN0IGtleSA9IFttZXRob2QsIHJlc3BvbnNlVHlwZSwgdXJsLCBzdHJCb2R5LCBlbmNvZGVkUGFyYW1zXS5qb2luKCd8Jyk7XG5cbiAgY29uc3QgaGFzaCA9IGdlbmVyYXRlSGFzaChrZXkpO1xuXG4gIHJldHVybiBtYWtlU3RhdGVLZXkoaGFzaCk7XG59XG5cbi8qKlxuICogQSBtZXRob2QgdGhhdCByZXR1cm5zIGEgaGFzaCByZXByZXNlbnRhdGlvbiBvZiBhIHN0cmluZyB1c2luZyBhIHZhcmlhbnQgb2YgREpCMiBoYXNoXG4gKiBhbGdvcml0aG0uXG4gKlxuICogVGhpcyBpcyB0aGUgc2FtZSBoYXNoaW5nIGxvZ2ljIHRoYXQgaXMgdXNlZCB0byBnZW5lcmF0ZSBjb21wb25lbnQgaWRzLlxuICovXG5mdW5jdGlvbiBnZW5lcmF0ZUhhc2godmFsdWU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGxldCBoYXNoID0gMDtcblxuICBmb3IgKGNvbnN0IGNoYXIgb2YgdmFsdWUpIHtcbiAgICBoYXNoID0gKE1hdGguaW11bCgzMSwgaGFzaCkgKyBjaGFyLmNoYXJDb2RlQXQoMCkpIDw8IDA7XG4gIH1cblxuICAvLyBGb3JjZSBwb3NpdGl2ZSBudW1iZXIgaGFzaC5cbiAgLy8gMjE0NzQ4MzY0NyA9IGVxdWl2YWxlbnQgb2YgSW50ZWdlci5NQVhfVkFMVUUuXG4gIGhhc2ggKz0gMjE0NzQ4MzY0NyArIDE7XG5cbiAgcmV0dXJuIGhhc2gudG9TdHJpbmcoKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBESSBwcm92aWRlcnMgbmVlZGVkIHRvIGVuYWJsZSBIVFRQIHRyYW5zZmVyIGNhY2hlLlxuICpcbiAqIEJ5IGRlZmF1bHQsIHdoZW4gdXNpbmcgc2VydmVyIHJlbmRlcmluZywgcmVxdWVzdHMgYXJlIHBlcmZvcm1lZCB0d2ljZTogb25jZSBvbiB0aGUgc2VydmVyIGFuZFxuICogb3RoZXIgb25lIG9uIHRoZSBicm93c2VyLlxuICpcbiAqIFdoZW4gdGhlc2UgcHJvdmlkZXJzIGFyZSBhZGRlZCwgcmVxdWVzdHMgcGVyZm9ybWVkIG9uIHRoZSBzZXJ2ZXIgYXJlIGNhY2hlZCBhbmQgcmV1c2VkIGR1cmluZyB0aGVcbiAqIGJvb3RzdHJhcHBpbmcgb2YgdGhlIGFwcGxpY2F0aW9uIGluIHRoZSBicm93c2VyIHRodXMgYXZvaWRpbmcgZHVwbGljYXRlIHJlcXVlc3RzIGFuZCByZWR1Y2luZ1xuICogbG9hZCB0aW1lLlxuICpcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHdpdGhIdHRwVHJhbnNmZXJDYWNoZShjYWNoZU9wdGlvbnM6IEh0dHBUcmFuc2ZlckNhY2hlT3B0aW9ucyk6IFByb3ZpZGVyW10ge1xuICByZXR1cm4gW1xuICAgIHtcbiAgICAgIHByb3ZpZGU6IENBQ0hFX09QVElPTlMsXG4gICAgICB1c2VGYWN0b3J5OiAoKTogQ2FjaGVPcHRpb25zID0+IHtcbiAgICAgICAgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSgnTmdIdHRwVHJhbnNmZXJDYWNoZScpO1xuICAgICAgICByZXR1cm4ge2lzQ2FjaGVBY3RpdmU6IHRydWUsIC4uLmNhY2hlT3B0aW9uc307XG4gICAgICB9LFxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogSFRUUF9ST09UX0lOVEVSQ0VQVE9SX0ZOUyxcbiAgICAgIHVzZVZhbHVlOiB0cmFuc2ZlckNhY2hlSW50ZXJjZXB0b3JGbixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgZGVwczogW1RyYW5zZmVyU3RhdGUsIENBQ0hFX09QVElPTlNdLFxuICAgIH0sXG4gICAge1xuICAgICAgcHJvdmlkZTogQVBQX0JPT1RTVFJBUF9MSVNURU5FUixcbiAgICAgIG11bHRpOiB0cnVlLFxuICAgICAgdXNlRmFjdG9yeTogKCkgPT4ge1xuICAgICAgICBjb25zdCBhcHBSZWYgPSBpbmplY3QoQXBwbGljYXRpb25SZWYpO1xuICAgICAgICBjb25zdCBjYWNoZVN0YXRlID0gaW5qZWN0KENBQ0hFX09QVElPTlMpO1xuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgd2hlblN0YWJsZShhcHBSZWYpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgY2FjaGVTdGF0ZS5pc0NhY2hlQWN0aXZlID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgIH0sXG4gIF07XG59XG5cbi8qKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIGFkZCBhIHByb3h5IHRvIGFuIEh0dHBIZWFkZXIgdG8gaW50ZXJjZXB0IGNhbGxzIHRvIGdldC9oYXNcbiAqIGFuZCBsb2cgYSB3YXJuaW5nIGlmIHRoZSBoZWFkZXIgZW50cnkgcmVxdWVzdGVkIGhhcyBiZWVuIHJlbW92ZWRcbiAqL1xuZnVuY3Rpb24gYXBwZW5kTWlzc2luZ0hlYWRlcnNEZXRlY3Rpb24oXG4gIHVybDogc3RyaW5nLFxuICBoZWFkZXJzOiBIdHRwSGVhZGVycyxcbiAgaGVhZGVyc1RvSW5jbHVkZTogc3RyaW5nW10sXG4pOiBIdHRwSGVhZGVycyB7XG4gIGNvbnN0IHdhcm5pbmdQcm9kdWNlZCA9IG5ldyBTZXQoKTtcbiAgcmV0dXJuIG5ldyBQcm94eTxIdHRwSGVhZGVycz4oaGVhZGVycywge1xuICAgIGdldCh0YXJnZXQ6IEh0dHBIZWFkZXJzLCBwcm9wOiBrZXlvZiBIdHRwSGVhZGVycyk6IHVua25vd24ge1xuICAgICAgY29uc3QgdmFsdWUgPSBSZWZsZWN0LmdldCh0YXJnZXQsIHByb3ApO1xuICAgICAgY29uc3QgbWV0aG9kczogU2V0PGtleW9mIEh0dHBIZWFkZXJzPiA9IG5ldyBTZXQoWydnZXQnLCAnaGFzJywgJ2dldEFsbCddKTtcblxuICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ2Z1bmN0aW9uJyB8fCAhbWV0aG9kcy5oYXMocHJvcCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gKGhlYWRlck5hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICAvLyBXZSBsb2cgd2hlbiB0aGUga2V5IGhhcyBiZWVuIHJlbW92ZWQgYW5kIGEgd2FybmluZyBoYXNuJ3QgYmVlbiBwcm9kdWNlZCBmb3IgdGhlIGhlYWRlclxuICAgICAgICBjb25zdCBrZXkgPSAocHJvcCArICc6JyArIGhlYWRlck5hbWUpLnRvTG93ZXJDYXNlKCk7IC8vIGUuZy4gYGdldDpjYWNoZS1jb250cm9sYFxuICAgICAgICBpZiAoIWhlYWRlcnNUb0luY2x1ZGUuaW5jbHVkZXMoaGVhZGVyTmFtZSkgJiYgIXdhcm5pbmdQcm9kdWNlZC5oYXMoa2V5KSkge1xuICAgICAgICAgIHdhcm5pbmdQcm9kdWNlZC5hZGQoa2V5KTtcbiAgICAgICAgICBjb25zdCB0cnVuY2F0ZWRVcmwgPSB0cnVuY2F0ZU1pZGRsZSh1cmwpO1xuXG4gICAgICAgICAgLy8gVE9ETzogY3JlYXRlIEVycm9yIGd1aWRlIGZvciB0aGlzIHdhcm5pbmdcbiAgICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSEVBREVSU19BTFRFUkVEX0JZX1RSQU5TRkVSX0NBQ0hFLFxuICAgICAgICAgICAgICBgQW5ndWxhciBkZXRlY3RlZCB0aGF0IHRoZSBcXGAke2hlYWRlck5hbWV9XFxgIGhlYWRlciBpcyBhY2Nlc3NlZCwgYnV0IHRoZSB2YWx1ZSBvZiB0aGUgaGVhZGVyIGAgK1xuICAgICAgICAgICAgICAgIGB3YXMgbm90IHRyYW5zZmVycmVkIGZyb20gdGhlIHNlcnZlciB0byB0aGUgY2xpZW50IGJ5IHRoZSBIdHRwVHJhbnNmZXJDYWNoZS4gYCArXG4gICAgICAgICAgICAgICAgYFRvIGluY2x1ZGUgdGhlIHZhbHVlIG9mIHRoZSBcXGAke2hlYWRlck5hbWV9XFxgIGhlYWRlciBmb3IgdGhlIFxcYCR7dHJ1bmNhdGVkVXJsfVxcYCByZXF1ZXN0LCBgICtcbiAgICAgICAgICAgICAgICBgdXNlIHRoZSBcXGBpbmNsdWRlSGVhZGVyc1xcYCBsaXN0LiBUaGUgXFxgaW5jbHVkZUhlYWRlcnNcXGAgY2FuIGJlIGRlZmluZWQgZWl0aGVyIGAgK1xuICAgICAgICAgICAgICAgIGBvbiBhIHJlcXVlc3QgbGV2ZWwgYnkgYWRkaW5nIHRoZSBcXGB0cmFuc2ZlckNhY2hlXFxgIHBhcmFtZXRlciwgb3Igb24gYW4gYXBwbGljYXRpb24gYCArXG4gICAgICAgICAgICAgICAgYGxldmVsIGJ5IGFkZGluZyB0aGUgXFxgaHR0cENhY2hlVHJhbnNmZXIuaW5jbHVkZUhlYWRlcnNcXGAgYXJndW1lbnQgdG8gdGhlIGAgK1xuICAgICAgICAgICAgICAgIGBcXGBwcm92aWRlQ2xpZW50SHlkcmF0aW9uKClcXGAgY2FsbC4gYCxcbiAgICAgICAgICAgICksXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGludm9raW5nIHRoZSBvcmlnaW5hbCBtZXRob2RcbiAgICAgICAgcmV0dXJuICh2YWx1ZSBhcyBGdW5jdGlvbikuYXBwbHkodGFyZ2V0LCBbaGVhZGVyTmFtZV0pO1xuICAgICAgfTtcbiAgICB9LFxuICB9KTtcbn1cbiJdfQ==