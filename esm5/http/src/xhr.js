/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse } from './response';
var XSSI_PREFIX = /^\)\]\}',?\n/;
/**
 * Determine an appropriate URL for the response, by checking either
 * XMLHttpRequest.responseURL or the X-Request-URL header.
 */
function getResponseUrl(xhr) {
    if ('responseURL' in xhr && xhr.responseURL) {
        return xhr.responseURL;
    }
    if (/^X-Request-URL:/m.test(xhr.getAllResponseHeaders())) {
        return xhr.getResponseHeader('X-Request-URL');
    }
    return null;
}
/**
 * A wrapper around the `XMLHttpRequest` constructor.
 *
 *
 */
var XhrFactory = /** @class */ (function () {
    function XhrFactory() {
    }
    return XhrFactory;
}());
export { XhrFactory };
/**
 * A factory for @{link HttpXhrBackend} that uses the `XMLHttpRequest` browser API.
 *
 *
 */
var BrowserXhr = /** @class */ (function () {
    function BrowserXhr() {
    }
    BrowserXhr.prototype.build = function () { return (new XMLHttpRequest()); };
    BrowserXhr.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    BrowserXhr.ctorParameters = function () { return []; };
    return BrowserXhr;
}());
export { BrowserXhr };
/**
 * An `HttpBackend` which uses the XMLHttpRequest API to send
 * requests to a backend server.
 *
 *
 */
var HttpXhrBackend = /** @class */ (function () {
    function HttpXhrBackend(xhrFactory) {
        this.xhrFactory = xhrFactory;
    }
    /**
     * Process a request and return a stream of response events.
     */
    HttpXhrBackend.prototype.handle = function (req) {
        var _this = this;
        // Quick check to give a better error message when a user attempts to use
        // HttpClient.jsonp() without installing the JsonpClientModule
        if (req.method === 'JSONP') {
            throw new Error("Attempted to construct Jsonp request without JsonpClientModule installed.");
        }
        // Everything happens on Observable subscription.
        return new Observable(function (observer) {
            // Start by setting up the XHR object with request method, URL, and withCredentials flag.
            var xhr = _this.xhrFactory.build();
            xhr.open(req.method, req.urlWithParams);
            if (!!req.withCredentials) {
                xhr.withCredentials = true;
            }
            // Add all the requested headers.
            req.headers.forEach(function (name, values) { return xhr.setRequestHeader(name, values.join(',')); });
            // Add an Accept header if one isn't present already.
            if (!req.headers.has('Accept')) {
                xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
            }
            // Auto-detect the Content-Type header if one isn't present already.
            if (!req.headers.has('Content-Type')) {
                var detectedType = req.detectContentTypeHeader();
                // Sometimes Content-Type detection fails.
                if (detectedType !== null) {
                    xhr.setRequestHeader('Content-Type', detectedType);
                }
            }
            // Set the responseType if one was requested.
            if (req.responseType) {
                var responseType = req.responseType.toLowerCase();
                // JSON responses need to be processed as text. This is because if the server
                // returns an XSSI-prefixed JSON response, the browser will fail to parse it,
                // xhr.response will be null, and xhr.responseText cannot be accessed to
                // retrieve the prefixed JSON data in order to strip the prefix. Thus, all JSON
                // is parsed by first requesting text and then applying JSON.parse.
                xhr.responseType = ((responseType !== 'json') ? responseType : 'text');
            }
            // Serialize the request body if one is present. If not, this will be set to null.
            var reqBody = req.serializeBody();
            // If progress events are enabled, response headers will be delivered
            // in two events - the HttpHeaderResponse event and the full HttpResponse
            // event. However, since response headers don't change in between these
            // two events, it doesn't make sense to parse them twice. So headerResponse
            // caches the data extracted from the response whenever it's first parsed,
            // to ensure parsing isn't duplicated.
            var headerResponse = null;
            // partialFromXhr extracts the HttpHeaderResponse from the current XMLHttpRequest
            // state, and memoizes it into headerResponse.
            var partialFromXhr = function () {
                if (headerResponse !== null) {
                    return headerResponse;
                }
                // Read status and normalize an IE9 bug (http://bugs.jquery.com/ticket/1450).
                var status = xhr.status === 1223 ? 204 : xhr.status;
                var statusText = xhr.statusText || 'OK';
                // Parse headers from XMLHttpRequest - this step is lazy.
                var headers = new HttpHeaders(xhr.getAllResponseHeaders());
                // Read the response URL from the XMLHttpResponse instance and fall back on the
                // request URL.
                var url = getResponseUrl(xhr) || req.url;
                // Construct the HttpHeaderResponse and memoize it.
                headerResponse = new HttpHeaderResponse({ headers: headers, status: status, statusText: statusText, url: url });
                return headerResponse;
            };
            // Next, a few closures are defined for the various events which XMLHttpRequest can
            // emit. This allows them to be unregistered as event listeners later.
            // First up is the load event, which represents a response being fully available.
            var onLoad = function () {
                // Read response state from the memoized partial data.
                var _a = partialFromXhr(), headers = _a.headers, status = _a.status, statusText = _a.statusText, url = _a.url;
                // The body will be read out if present.
                var body = null;
                if (status !== 204) {
                    // Use XMLHttpRequest.response if set, responseText otherwise.
                    body = (typeof xhr.response === 'undefined') ? xhr.responseText : xhr.response;
                }
                // Normalize another potential bug (this one comes from CORS).
                if (status === 0) {
                    status = !!body ? 200 : 0;
                }
                // ok determines whether the response will be transmitted on the event or
                // error channel. Unsuccessful status codes (not 2xx) will always be errors,
                // but a successful status code can still result in an error if the user
                // asked for JSON data and the body cannot be parsed as such.
                var ok = status >= 200 && status < 300;
                // Check whether the body needs to be parsed as JSON (in many cases the browser
                // will have done that already).
                if (req.responseType === 'json' && typeof body === 'string') {
                    // Save the original body, before attempting XSSI prefix stripping.
                    var originalBody = body;
                    body = body.replace(XSSI_PREFIX, '');
                    try {
                        // Attempt the parse. If it fails, a parse error should be delivered to the user.
                        body = body !== '' ? JSON.parse(body) : null;
                    }
                    catch (error) {
                        // Since the JSON.parse failed, it's reasonable to assume this might not have been a
                        // JSON response. Restore the original body (including any XSSI prefix) to deliver
                        // a better error response.
                        body = originalBody;
                        // If this was an error request to begin with, leave it as a string, it probably
                        // just isn't JSON. Otherwise, deliver the parsing error to the user.
                        if (ok) {
                            // Even though the response status was 2xx, this is still an error.
                            ok = false;
                            // The parse error contains the text of the body that failed to parse.
                            body = { error: error, text: body };
                        }
                    }
                }
                if (ok) {
                    // A successful response is delivered on the event stream.
                    observer.next(new HttpResponse({
                        body: body,
                        headers: headers,
                        status: status,
                        statusText: statusText,
                        url: url || undefined,
                    }));
                    // The full body has been received and delivered, no further events
                    // are possible. This request is complete.
                    observer.complete();
                }
                else {
                    // An unsuccessful request is delivered on the error channel.
                    observer.error(new HttpErrorResponse({
                        // The error in this case is the response body (error from the server).
                        error: body,
                        headers: headers,
                        status: status,
                        statusText: statusText,
                        url: url || undefined,
                    }));
                }
            };
            // The onError callback is called when something goes wrong at the network level.
            // Connection timeout, DNS error, offline, etc. These are actual errors, and are
            // transmitted on the error channel.
            var onError = function (error) {
                var res = new HttpErrorResponse({
                    error: error,
                    status: xhr.status || 0,
                    statusText: xhr.statusText || 'Unknown Error',
                });
                observer.error(res);
            };
            // The sentHeaders flag tracks whether the HttpResponseHeaders event
            // has been sent on the stream. This is necessary to track if progress
            // is enabled since the event will be sent on only the first download
            // progerss event.
            var sentHeaders = false;
            // The download progress event handler, which is only registered if
            // progress events are enabled.
            var onDownProgress = function (event) {
                // Send the HttpResponseHeaders event if it hasn't been sent already.
                if (!sentHeaders) {
                    observer.next(partialFromXhr());
                    sentHeaders = true;
                }
                // Start building the download progress event to deliver on the response
                // event stream.
                var progressEvent = {
                    type: HttpEventType.DownloadProgress,
                    loaded: event.loaded,
                };
                // Set the total number of bytes in the event if it's available.
                if (event.lengthComputable) {
                    progressEvent.total = event.total;
                }
                // If the request was for text content and a partial response is
                // available on XMLHttpRequest, include it in the progress event
                // to allow for streaming reads.
                if (req.responseType === 'text' && !!xhr.responseText) {
                    progressEvent.partialText = xhr.responseText;
                }
                // Finally, fire the event.
                observer.next(progressEvent);
            };
            // The upload progress event handler, which is only registered if
            // progress events are enabled.
            var onUpProgress = function (event) {
                // Upload progress events are simpler. Begin building the progress
                // event.
                var progress = {
                    type: HttpEventType.UploadProgress,
                    loaded: event.loaded,
                };
                // If the total number of bytes being uploaded is available, include
                // it.
                if (event.lengthComputable) {
                    progress.total = event.total;
                }
                // Send the event.
                observer.next(progress);
            };
            // By default, register for load and error events.
            xhr.addEventListener('load', onLoad);
            xhr.addEventListener('error', onError);
            // Progress events are only enabled if requested.
            if (req.reportProgress) {
                // Download progress is always enabled if requested.
                xhr.addEventListener('progress', onDownProgress);
                // Upload progress depends on whether there is a body to upload.
                if (reqBody !== null && xhr.upload) {
                    xhr.upload.addEventListener('progress', onUpProgress);
                }
            }
            // Fire the request, and notify the event stream that it was fired.
            xhr.send(reqBody);
            observer.next({ type: HttpEventType.Sent });
            // This is the return from the Observable function, which is the
            // request cancellation handler.
            return function () {
                // On a cancellation, remove all registered event listeners.
                xhr.removeEventListener('error', onError);
                xhr.removeEventListener('load', onLoad);
                if (req.reportProgress) {
                    xhr.removeEventListener('progress', onDownProgress);
                    if (reqBody !== null && xhr.upload) {
                        xhr.upload.removeEventListener('progress', onUpProgress);
                    }
                }
                // Finally, abort the in-flight request.
                xhr.abort();
            };
        });
    };
    HttpXhrBackend.decorators = [
        { type: Injectable }
    ];
    /** @nocollapse */
    HttpXhrBackend.ctorParameters = function () { return [
        { type: XhrFactory }
    ]; };
    return HttpXhrBackend;
}());
export { HttpXhrBackend };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoieGhyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL2h0dHAvc3JjL3hoci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pDLE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBc0IsWUFBWSxFQUEwQixNQUFNLFlBQVksQ0FBQztBQUVqTCxJQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7QUFFbkM7OztHQUdHO0FBQ0gsd0JBQXdCLEdBQVE7SUFDOUIsSUFBSSxhQUFhLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxXQUFXLEVBQUU7UUFDM0MsT0FBTyxHQUFHLENBQUMsV0FBVyxDQUFDO0tBQ3hCO0lBQ0QsSUFBSSxrQkFBa0IsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLHFCQUFxQixFQUFFLENBQUMsRUFBRTtRQUN4RCxPQUFPLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsQ0FBQztLQUMvQztJQUNELE9BQU8sSUFBSSxDQUFDO0FBQ2QsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSDtJQUFBO0lBQXFFLENBQUM7SUFBRCxpQkFBQztBQUFELENBQUMsQUFBdEUsSUFBc0U7O0FBRXRFOzs7O0dBSUc7QUFDSDtJQUVFO0lBQWUsQ0FBQztJQUNoQiwwQkFBSyxHQUFMLGNBQWUsT0FBWSxDQUFDLElBQUksY0FBYyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7O2dCQUhyRCxVQUFVOzs7O0lBSVgsaUJBQUM7Q0FBQSxBQUpELElBSUM7U0FIWSxVQUFVO0FBZXZCOzs7OztHQUtHO0FBQ0g7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Z0JBRWpELGdFQUFnRTtnQkFDaEUsSUFBSSxPQUFPLEtBQUssSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7b0JBQ2xDLEdBQUcsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLENBQUMsVUFBVSxFQUFFLFlBQVksQ0FBQyxDQUFDO2lCQUN2RDthQUNGO1lBRUQsbUVBQW1FO1lBQ25FLEdBQUcsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7WUFDbEIsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUUxQyxnRUFBZ0U7WUFDaEUsZ0NBQWdDO1lBQ2hDLE9BQU87Z0JBQ0wsNERBQTREO2dCQUM1RCxHQUFHLENBQUMsbUJBQW1CLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUMxQyxHQUFHLENBQUMsbUJBQW1CLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO2dCQUN4QyxJQUFJLEdBQUcsQ0FBQyxjQUFjLEVBQUU7b0JBQ3RCLEdBQUcsQ0FBQyxtQkFBbUIsQ0FBQyxVQUFVLEVBQUUsY0FBYyxDQUFDLENBQUM7b0JBQ3BELElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFO3dCQUNsQyxHQUFHLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFVBQVUsRUFBRSxZQUFZLENBQUMsQ0FBQztxQkFDMUQ7aUJBQ0Y7Z0JBRUQsd0NBQXdDO2dCQUN4QyxHQUFHLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZCxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7O2dCQTlRRixVQUFVOzs7O2dCQUV1QixVQUFVOztJQTZRNUMscUJBQUM7Q0FBQSxBQS9RRCxJQStRQztTQTlRWSxjQUFjIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtPYnNlcnZhYmxlLCBPYnNlcnZlcn0gZnJvbSAncnhqcyc7XG5cbmltcG9ydCB7SHR0cEJhY2tlbmR9IGZyb20gJy4vYmFja2VuZCc7XG5pbXBvcnQge0h0dHBIZWFkZXJzfSBmcm9tICcuL2hlYWRlcnMnO1xuaW1wb3J0IHtIdHRwUmVxdWVzdH0gZnJvbSAnLi9yZXF1ZXN0JztcbmltcG9ydCB7SHR0cERvd25sb2FkUHJvZ3Jlc3NFdmVudCwgSHR0cEVycm9yUmVzcG9uc2UsIEh0dHBFdmVudCwgSHR0cEV2ZW50VHlwZSwgSHR0cEhlYWRlclJlc3BvbnNlLCBIdHRwSnNvblBhcnNlRXJyb3IsIEh0dHBSZXNwb25zZSwgSHR0cFVwbG9hZFByb2dyZXNzRXZlbnR9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuLyoqXG4gKiBEZXRlcm1pbmUgYW4gYXBwcm9wcmlhdGUgVVJMIGZvciB0aGUgcmVzcG9uc2UsIGJ5IGNoZWNraW5nIGVpdGhlclxuICogWE1MSHR0cFJlcXVlc3QucmVzcG9uc2VVUkwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybCh4aHI6IGFueSk6IHN0cmluZ3xudWxsIHtcbiAgaWYgKCdyZXNwb25zZVVSTCcgaW4geGhyICYmIHhoci5yZXNwb25zZVVSTCkge1xuICAgIHJldHVybiB4aHIucmVzcG9uc2VVUkw7XG4gIH1cbiAgaWYgKC9eWC1SZXF1ZXN0LVVSTDovbS50ZXN0KHhoci5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpIHtcbiAgICByZXR1cm4geGhyLmdldFJlc3BvbnNlSGVhZGVyKCdYLVJlcXVlc3QtVVJMJyk7XG4gIH1cbiAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogQSB3cmFwcGVyIGFyb3VuZCB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBjb25zdHJ1Y3Rvci5cbiAqXG4gKlxuICovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgWGhyRmFjdG9yeSB7IGFic3RyYWN0IGJ1aWxkKCk6IFhNTEh0dHBSZXF1ZXN0OyB9XG5cbi8qKlxuICogQSBmYWN0b3J5IGZvciBAe2xpbmsgSHR0cFhockJhY2tlbmR9IHRoYXQgdXNlcyB0aGUgYFhNTEh0dHBSZXF1ZXN0YCBicm93c2VyIEFQSS5cbiAqXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgQnJvd3NlclhociBpbXBsZW1lbnRzIFhockZhY3Rvcnkge1xuICBjb25zdHJ1Y3RvcigpIHt9XG4gIGJ1aWxkKCk6IGFueSB7IHJldHVybiA8YW55PihuZXcgWE1MSHR0cFJlcXVlc3QoKSk7IH1cbn1cblxuLyoqXG4gKiBUcmFja3MgYSByZXNwb25zZSBmcm9tIHRoZSBzZXJ2ZXIgdGhhdCBkb2VzIG5vdCB5ZXQgaGF2ZSBhIGJvZHkuXG4gKi9cbmludGVyZmFjZSBQYXJ0aWFsUmVzcG9uc2Uge1xuICBoZWFkZXJzOiBIdHRwSGVhZGVycztcbiAgc3RhdHVzOiBudW1iZXI7XG4gIHN0YXR1c1RleHQ6IHN0cmluZztcbiAgdXJsOiBzdHJpbmc7XG59XG5cbi8qKlxuICogQW4gYEh0dHBCYWNrZW5kYCB3aGljaCB1c2VzIHRoZSBYTUxIdHRwUmVxdWVzdCBBUEkgdG8gc2VuZFxuICogcmVxdWVzdHMgdG8gYSBiYWNrZW5kIHNlcnZlci5cbiAqXG4gKlxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgSHR0cFhockJhY2tlbmQgaW1wbGVtZW50cyBIdHRwQmFja2VuZCB7XG4gIGNvbnN0cnVjdG9yKHByaXZhdGUgeGhyRmFjdG9yeTogWGhyRmFjdG9yeSkge31cblxuICAvKipcbiAgICogUHJvY2VzcyBhIHJlcXVlc3QgYW5kIHJldHVybiBhIHN0cmVhbSBvZiByZXNwb25zZSBldmVudHMuXG4gICAqL1xuICBoYW5kbGUocmVxOiBIdHRwUmVxdWVzdDxhbnk+KTogT2JzZXJ2YWJsZTxIdHRwRXZlbnQ8YW55Pj4ge1xuICAgIC8vIFF1aWNrIGNoZWNrIHRvIGdpdmUgYSBiZXR0ZXIgZXJyb3IgbWVzc2FnZSB3aGVuIGEgdXNlciBhdHRlbXB0cyB0byB1c2VcbiAgICAvLyBIdHRwQ2xpZW50Lmpzb25wKCkgd2l0aG91dCBpbnN0YWxsaW5nIHRoZSBKc29ucENsaWVudE1vZHVsZVxuICAgIGlmIChyZXEubWV0aG9kID09PSAnSlNPTlAnKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYEF0dGVtcHRlZCB0byBjb25zdHJ1Y3QgSnNvbnAgcmVxdWVzdCB3aXRob3V0IEpzb25wQ2xpZW50TW9kdWxlIGluc3RhbGxlZC5gKTtcbiAgICB9XG5cbiAgICAvLyBFdmVyeXRoaW5nIGhhcHBlbnMgb24gT2JzZXJ2YWJsZSBzdWJzY3JpcHRpb24uXG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKChvYnNlcnZlcjogT2JzZXJ2ZXI8SHR0cEV2ZW50PGFueT4+KSA9PiB7XG4gICAgICAvLyBTdGFydCBieSBzZXR0aW5nIHVwIHRoZSBYSFIgb2JqZWN0IHdpdGggcmVxdWVzdCBtZXRob2QsIFVSTCwgYW5kIHdpdGhDcmVkZW50aWFscyBmbGFnLlxuICAgICAgY29uc3QgeGhyID0gdGhpcy54aHJGYWN0b3J5LmJ1aWxkKCk7XG4gICAgICB4aHIub3BlbihyZXEubWV0aG9kLCByZXEudXJsV2l0aFBhcmFtcyk7XG4gICAgICBpZiAoISFyZXEud2l0aENyZWRlbnRpYWxzKSB7XG4gICAgICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBBZGQgYWxsIHRoZSByZXF1ZXN0ZWQgaGVhZGVycy5cbiAgICAgIHJlcS5oZWFkZXJzLmZvckVhY2goKG5hbWUsIHZhbHVlcykgPT4geGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWVzLmpvaW4oJywnKSkpO1xuXG4gICAgICAvLyBBZGQgYW4gQWNjZXB0IGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgICAgaWYgKCFyZXEuaGVhZGVycy5oYXMoJ0FjY2VwdCcpKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBY2NlcHQnLCAnYXBwbGljYXRpb24vanNvbiwgdGV4dC9wbGFpbiwgKi8qJyk7XG4gICAgICB9XG5cbiAgICAgIC8vIEF1dG8tZGV0ZWN0IHRoZSBDb250ZW50LVR5cGUgaGVhZGVyIGlmIG9uZSBpc24ndCBwcmVzZW50IGFscmVhZHkuXG4gICAgICBpZiAoIXJlcS5oZWFkZXJzLmhhcygnQ29udGVudC1UeXBlJykpIHtcbiAgICAgICAgY29uc3QgZGV0ZWN0ZWRUeXBlID0gcmVxLmRldGVjdENvbnRlbnRUeXBlSGVhZGVyKCk7XG4gICAgICAgIC8vIFNvbWV0aW1lcyBDb250ZW50LVR5cGUgZGV0ZWN0aW9uIGZhaWxzLlxuICAgICAgICBpZiAoZGV0ZWN0ZWRUeXBlICE9PSBudWxsKSB7XG4gICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsIGRldGVjdGVkVHlwZSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU2V0IHRoZSByZXNwb25zZVR5cGUgaWYgb25lIHdhcyByZXF1ZXN0ZWQuXG4gICAgICBpZiAocmVxLnJlc3BvbnNlVHlwZSkge1xuICAgICAgICBjb25zdCByZXNwb25zZVR5cGUgPSByZXEucmVzcG9uc2VUeXBlLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAgICAgLy8gSlNPTiByZXNwb25zZXMgbmVlZCB0byBiZSBwcm9jZXNzZWQgYXMgdGV4dC4gVGhpcyBpcyBiZWNhdXNlIGlmIHRoZSBzZXJ2ZXJcbiAgICAgICAgLy8gcmV0dXJucyBhbiBYU1NJLXByZWZpeGVkIEpTT04gcmVzcG9uc2UsIHRoZSBicm93c2VyIHdpbGwgZmFpbCB0byBwYXJzZSBpdCxcbiAgICAgICAgLy8geGhyLnJlc3BvbnNlIHdpbGwgYmUgbnVsbCwgYW5kIHhoci5yZXNwb25zZVRleHQgY2Fubm90IGJlIGFjY2Vzc2VkIHRvXG4gICAgICAgIC8vIHJldHJpZXZlIHRoZSBwcmVmaXhlZCBKU09OIGRhdGEgaW4gb3JkZXIgdG8gc3RyaXAgdGhlIHByZWZpeC4gVGh1cywgYWxsIEpTT05cbiAgICAgICAgLy8gaXMgcGFyc2VkIGJ5IGZpcnN0IHJlcXVlc3RpbmcgdGV4dCBhbmQgdGhlbiBhcHBseWluZyBKU09OLnBhcnNlLlxuICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gKChyZXNwb25zZVR5cGUgIT09ICdqc29uJykgPyByZXNwb25zZVR5cGUgOiAndGV4dCcpIGFzIGFueTtcbiAgICAgIH1cblxuICAgICAgLy8gU2VyaWFsaXplIHRoZSByZXF1ZXN0IGJvZHkgaWYgb25lIGlzIHByZXNlbnQuIElmIG5vdCwgdGhpcyB3aWxsIGJlIHNldCB0byBudWxsLlxuICAgICAgY29uc3QgcmVxQm9keSA9IHJlcS5zZXJpYWxpemVCb2R5KCk7XG5cbiAgICAgIC8vIElmIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZCwgcmVzcG9uc2UgaGVhZGVycyB3aWxsIGJlIGRlbGl2ZXJlZFxuICAgICAgLy8gaW4gdHdvIGV2ZW50cyAtIHRoZSBIdHRwSGVhZGVyUmVzcG9uc2UgZXZlbnQgYW5kIHRoZSBmdWxsIEh0dHBSZXNwb25zZVxuICAgICAgLy8gZXZlbnQuIEhvd2V2ZXIsIHNpbmNlIHJlc3BvbnNlIGhlYWRlcnMgZG9uJ3QgY2hhbmdlIGluIGJldHdlZW4gdGhlc2VcbiAgICAgIC8vIHR3byBldmVudHMsIGl0IGRvZXNuJ3QgbWFrZSBzZW5zZSB0byBwYXJzZSB0aGVtIHR3aWNlLiBTbyBoZWFkZXJSZXNwb25zZVxuICAgICAgLy8gY2FjaGVzIHRoZSBkYXRhIGV4dHJhY3RlZCBmcm9tIHRoZSByZXNwb25zZSB3aGVuZXZlciBpdCdzIGZpcnN0IHBhcnNlZCxcbiAgICAgIC8vIHRvIGVuc3VyZSBwYXJzaW5nIGlzbid0IGR1cGxpY2F0ZWQuXG4gICAgICBsZXQgaGVhZGVyUmVzcG9uc2U6IEh0dHBIZWFkZXJSZXNwb25zZXxudWxsID0gbnVsbDtcblxuICAgICAgLy8gcGFydGlhbEZyb21YaHIgZXh0cmFjdHMgdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBmcm9tIHRoZSBjdXJyZW50IFhNTEh0dHBSZXF1ZXN0XG4gICAgICAvLyBzdGF0ZSwgYW5kIG1lbW9pemVzIGl0IGludG8gaGVhZGVyUmVzcG9uc2UuXG4gICAgICBjb25zdCBwYXJ0aWFsRnJvbVhociA9ICgpOiBIdHRwSGVhZGVyUmVzcG9uc2UgPT4ge1xuICAgICAgICBpZiAoaGVhZGVyUmVzcG9uc2UgIT09IG51bGwpIHtcbiAgICAgICAgICByZXR1cm4gaGVhZGVyUmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZWFkIHN0YXR1cyBhbmQgbm9ybWFsaXplIGFuIElFOSBidWcgKGh0dHA6Ly9idWdzLmpxdWVyeS5jb20vdGlja2V0LzE0NTApLlxuICAgICAgICBjb25zdCBzdGF0dXM6IG51bWJlciA9IHhoci5zdGF0dXMgPT09IDEyMjMgPyAyMDQgOiB4aHIuc3RhdHVzO1xuICAgICAgICBjb25zdCBzdGF0dXNUZXh0ID0geGhyLnN0YXR1c1RleHQgfHwgJ09LJztcblxuICAgICAgICAvLyBQYXJzZSBoZWFkZXJzIGZyb20gWE1MSHR0cFJlcXVlc3QgLSB0aGlzIHN0ZXAgaXMgbGF6eS5cbiAgICAgICAgY29uc3QgaGVhZGVycyA9IG5ldyBIdHRwSGVhZGVycyh4aHIuZ2V0QWxsUmVzcG9uc2VIZWFkZXJzKCkpO1xuXG4gICAgICAgIC8vIFJlYWQgdGhlIHJlc3BvbnNlIFVSTCBmcm9tIHRoZSBYTUxIdHRwUmVzcG9uc2UgaW5zdGFuY2UgYW5kIGZhbGwgYmFjayBvbiB0aGVcbiAgICAgICAgLy8gcmVxdWVzdCBVUkwuXG4gICAgICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHhocikgfHwgcmVxLnVybDtcblxuICAgICAgICAvLyBDb25zdHJ1Y3QgdGhlIEh0dHBIZWFkZXJSZXNwb25zZSBhbmQgbWVtb2l6ZSBpdC5cbiAgICAgICAgaGVhZGVyUmVzcG9uc2UgPSBuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pO1xuICAgICAgICByZXR1cm4gaGVhZGVyUmVzcG9uc2U7XG4gICAgICB9O1xuXG4gICAgICAvLyBOZXh0LCBhIGZldyBjbG9zdXJlcyBhcmUgZGVmaW5lZCBmb3IgdGhlIHZhcmlvdXMgZXZlbnRzIHdoaWNoIFhNTEh0dHBSZXF1ZXN0IGNhblxuICAgICAgLy8gZW1pdC4gVGhpcyBhbGxvd3MgdGhlbSB0byBiZSB1bnJlZ2lzdGVyZWQgYXMgZXZlbnQgbGlzdGVuZXJzIGxhdGVyLlxuXG4gICAgICAvLyBGaXJzdCB1cCBpcyB0aGUgbG9hZCBldmVudCwgd2hpY2ggcmVwcmVzZW50cyBhIHJlc3BvbnNlIGJlaW5nIGZ1bGx5IGF2YWlsYWJsZS5cbiAgICAgIGNvbnN0IG9uTG9hZCA9ICgpID0+IHtcbiAgICAgICAgLy8gUmVhZCByZXNwb25zZSBzdGF0ZSBmcm9tIHRoZSBtZW1vaXplZCBwYXJ0aWFsIGRhdGEuXG4gICAgICAgIGxldCB7aGVhZGVycywgc3RhdHVzLCBzdGF0dXNUZXh0LCB1cmx9ID0gcGFydGlhbEZyb21YaHIoKTtcblxuICAgICAgICAvLyBUaGUgYm9keSB3aWxsIGJlIHJlYWQgb3V0IGlmIHByZXNlbnQuXG4gICAgICAgIGxldCBib2R5OiBhbnl8bnVsbCA9IG51bGw7XG5cbiAgICAgICAgaWYgKHN0YXR1cyAhPT0gMjA0KSB7XG4gICAgICAgICAgLy8gVXNlIFhNTEh0dHBSZXF1ZXN0LnJlc3BvbnNlIGlmIHNldCwgcmVzcG9uc2VUZXh0IG90aGVyd2lzZS5cbiAgICAgICAgICBib2R5ID0gKHR5cGVvZiB4aHIucmVzcG9uc2UgPT09ICd1bmRlZmluZWQnKSA/IHhoci5yZXNwb25zZVRleHQgOiB4aHIucmVzcG9uc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBOb3JtYWxpemUgYW5vdGhlciBwb3RlbnRpYWwgYnVnICh0aGlzIG9uZSBjb21lcyBmcm9tIENPUlMpLlxuICAgICAgICBpZiAoc3RhdHVzID09PSAwKSB7XG4gICAgICAgICAgc3RhdHVzID0gISFib2R5ID8gMjAwIDogMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIG9rIGRldGVybWluZXMgd2hldGhlciB0aGUgcmVzcG9uc2Ugd2lsbCBiZSB0cmFuc21pdHRlZCBvbiB0aGUgZXZlbnQgb3JcbiAgICAgICAgLy8gZXJyb3IgY2hhbm5lbC4gVW5zdWNjZXNzZnVsIHN0YXR1cyBjb2RlcyAobm90IDJ4eCkgd2lsbCBhbHdheXMgYmUgZXJyb3JzLFxuICAgICAgICAvLyBidXQgYSBzdWNjZXNzZnVsIHN0YXR1cyBjb2RlIGNhbiBzdGlsbCByZXN1bHQgaW4gYW4gZXJyb3IgaWYgdGhlIHVzZXJcbiAgICAgICAgLy8gYXNrZWQgZm9yIEpTT04gZGF0YSBhbmQgdGhlIGJvZHkgY2Fubm90IGJlIHBhcnNlZCBhcyBzdWNoLlxuICAgICAgICBsZXQgb2sgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcblxuICAgICAgICAvLyBDaGVjayB3aGV0aGVyIHRoZSBib2R5IG5lZWRzIHRvIGJlIHBhcnNlZCBhcyBKU09OIChpbiBtYW55IGNhc2VzIHRoZSBicm93c2VyXG4gICAgICAgIC8vIHdpbGwgaGF2ZSBkb25lIHRoYXQgYWxyZWFkeSkuXG4gICAgICAgIGlmIChyZXEucmVzcG9uc2VUeXBlID09PSAnanNvbicgJiYgdHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gU2F2ZSB0aGUgb3JpZ2luYWwgYm9keSwgYmVmb3JlIGF0dGVtcHRpbmcgWFNTSSBwcmVmaXggc3RyaXBwaW5nLlxuICAgICAgICAgIGNvbnN0IG9yaWdpbmFsQm9keSA9IGJvZHk7XG4gICAgICAgICAgYm9keSA9IGJvZHkucmVwbGFjZShYU1NJX1BSRUZJWCwgJycpO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBBdHRlbXB0IHRoZSBwYXJzZS4gSWYgaXQgZmFpbHMsIGEgcGFyc2UgZXJyb3Igc2hvdWxkIGJlIGRlbGl2ZXJlZCB0byB0aGUgdXNlci5cbiAgICAgICAgICAgIGJvZHkgPSBib2R5ICE9PSAnJyA/IEpTT04ucGFyc2UoYm9keSkgOiBudWxsO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICAvLyBTaW5jZSB0aGUgSlNPTi5wYXJzZSBmYWlsZWQsIGl0J3MgcmVhc29uYWJsZSB0byBhc3N1bWUgdGhpcyBtaWdodCBub3QgaGF2ZSBiZWVuIGFcbiAgICAgICAgICAgIC8vIEpTT04gcmVzcG9uc2UuIFJlc3RvcmUgdGhlIG9yaWdpbmFsIGJvZHkgKGluY2x1ZGluZyBhbnkgWFNTSSBwcmVmaXgpIHRvIGRlbGl2ZXJcbiAgICAgICAgICAgIC8vIGEgYmV0dGVyIGVycm9yIHJlc3BvbnNlLlxuICAgICAgICAgICAgYm9keSA9IG9yaWdpbmFsQm9keTtcblxuICAgICAgICAgICAgLy8gSWYgdGhpcyB3YXMgYW4gZXJyb3IgcmVxdWVzdCB0byBiZWdpbiB3aXRoLCBsZWF2ZSBpdCBhcyBhIHN0cmluZywgaXQgcHJvYmFibHlcbiAgICAgICAgICAgIC8vIGp1c3QgaXNuJ3QgSlNPTi4gT3RoZXJ3aXNlLCBkZWxpdmVyIHRoZSBwYXJzaW5nIGVycm9yIHRvIHRoZSB1c2VyLlxuICAgICAgICAgICAgaWYgKG9rKSB7XG4gICAgICAgICAgICAgIC8vIEV2ZW4gdGhvdWdoIHRoZSByZXNwb25zZSBzdGF0dXMgd2FzIDJ4eCwgdGhpcyBpcyBzdGlsbCBhbiBlcnJvci5cbiAgICAgICAgICAgICAgb2sgPSBmYWxzZTtcbiAgICAgICAgICAgICAgLy8gVGhlIHBhcnNlIGVycm9yIGNvbnRhaW5zIHRoZSB0ZXh0IG9mIHRoZSBib2R5IHRoYXQgZmFpbGVkIHRvIHBhcnNlLlxuICAgICAgICAgICAgICBib2R5ID0geyBlcnJvciwgdGV4dDogYm9keSB9IGFzIEh0dHBKc29uUGFyc2VFcnJvcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAob2spIHtcbiAgICAgICAgICAvLyBBIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgaXMgZGVsaXZlcmVkIG9uIHRoZSBldmVudCBzdHJlYW0uXG4gICAgICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgICAgIGJvZHksXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgICAgLy8gVGhlIGZ1bGwgYm9keSBoYXMgYmVlbiByZWNlaXZlZCBhbmQgZGVsaXZlcmVkLCBubyBmdXJ0aGVyIGV2ZW50c1xuICAgICAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgICAgIG9ic2VydmVyLmNvbXBsZXRlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gQW4gdW5zdWNjZXNzZnVsIHJlcXVlc3QgaXMgZGVsaXZlcmVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgICAgICAvLyBUaGUgZXJyb3IgaW4gdGhpcyBjYXNlIGlzIHRoZSByZXNwb25zZSBib2R5IChlcnJvciBmcm9tIHRoZSBzZXJ2ZXIpLlxuICAgICAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgICAgICBoZWFkZXJzLFxuICAgICAgICAgICAgc3RhdHVzLFxuICAgICAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgICAgIHVybDogdXJsIHx8IHVuZGVmaW5lZCxcbiAgICAgICAgICB9KSk7XG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIC8vIFRoZSBvbkVycm9yIGNhbGxiYWNrIGlzIGNhbGxlZCB3aGVuIHNvbWV0aGluZyBnb2VzIHdyb25nIGF0IHRoZSBuZXR3b3JrIGxldmVsLlxuICAgICAgLy8gQ29ubmVjdGlvbiB0aW1lb3V0LCBETlMgZXJyb3IsIG9mZmxpbmUsIGV0Yy4gVGhlc2UgYXJlIGFjdHVhbCBlcnJvcnMsIGFuZCBhcmVcbiAgICAgIC8vIHRyYW5zbWl0dGVkIG9uIHRoZSBlcnJvciBjaGFubmVsLlxuICAgICAgY29uc3Qgb25FcnJvciA9IChlcnJvcjogRXJyb3JFdmVudCkgPT4ge1xuICAgICAgICBjb25zdCByZXMgPSBuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIHN0YXR1czogeGhyLnN0YXR1cyB8fCAwLFxuICAgICAgICAgIHN0YXR1c1RleHQ6IHhoci5zdGF0dXNUZXh0IHx8ICdVbmtub3duIEVycm9yJyxcbiAgICAgICAgfSk7XG4gICAgICAgIG9ic2VydmVyLmVycm9yKHJlcyk7XG4gICAgICB9O1xuXG4gICAgICAvLyBUaGUgc2VudEhlYWRlcnMgZmxhZyB0cmFja3Mgd2hldGhlciB0aGUgSHR0cFJlc3BvbnNlSGVhZGVycyBldmVudFxuICAgICAgLy8gaGFzIGJlZW4gc2VudCBvbiB0aGUgc3RyZWFtLiBUaGlzIGlzIG5lY2Vzc2FyeSB0byB0cmFjayBpZiBwcm9ncmVzc1xuICAgICAgLy8gaXMgZW5hYmxlZCBzaW5jZSB0aGUgZXZlbnQgd2lsbCBiZSBzZW50IG9uIG9ubHkgdGhlIGZpcnN0IGRvd25sb2FkXG4gICAgICAvLyBwcm9nZXJzcyBldmVudC5cbiAgICAgIGxldCBzZW50SGVhZGVycyA9IGZhbHNlO1xuXG4gICAgICAvLyBUaGUgZG93bmxvYWQgcHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciwgd2hpY2ggaXMgb25seSByZWdpc3RlcmVkIGlmXG4gICAgICAvLyBwcm9ncmVzcyBldmVudHMgYXJlIGVuYWJsZWQuXG4gICAgICBjb25zdCBvbkRvd25Qcm9ncmVzcyA9IChldmVudDogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAvLyBTZW5kIHRoZSBIdHRwUmVzcG9uc2VIZWFkZXJzIGV2ZW50IGlmIGl0IGhhc24ndCBiZWVuIHNlbnQgYWxyZWFkeS5cbiAgICAgICAgaWYgKCFzZW50SGVhZGVycykge1xuICAgICAgICAgIG9ic2VydmVyLm5leHQocGFydGlhbEZyb21YaHIoKSk7XG4gICAgICAgICAgc2VudEhlYWRlcnMgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RhcnQgYnVpbGRpbmcgdGhlIGRvd25sb2FkIHByb2dyZXNzIGV2ZW50IHRvIGRlbGl2ZXIgb24gdGhlIHJlc3BvbnNlXG4gICAgICAgIC8vIGV2ZW50IHN0cmVhbS5cbiAgICAgICAgbGV0IHByb2dyZXNzRXZlbnQ6IEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5Eb3dubG9hZFByb2dyZXNzLFxuICAgICAgICAgIGxvYWRlZDogZXZlbnQubG9hZGVkLFxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFNldCB0aGUgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGluIHRoZSBldmVudCBpZiBpdCdzIGF2YWlsYWJsZS5cbiAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBwcm9ncmVzc0V2ZW50LnRvdGFsID0gZXZlbnQudG90YWw7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdCB3YXMgZm9yIHRleHQgY29udGVudCBhbmQgYSBwYXJ0aWFsIHJlc3BvbnNlIGlzXG4gICAgICAgIC8vIGF2YWlsYWJsZSBvbiBYTUxIdHRwUmVxdWVzdCwgaW5jbHVkZSBpdCBpbiB0aGUgcHJvZ3Jlc3MgZXZlbnRcbiAgICAgICAgLy8gdG8gYWxsb3cgZm9yIHN0cmVhbWluZyByZWFkcy5cbiAgICAgICAgaWYgKHJlcS5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyAmJiAhIXhoci5yZXNwb25zZVRleHQpIHtcbiAgICAgICAgICBwcm9ncmVzc0V2ZW50LnBhcnRpYWxUZXh0ID0geGhyLnJlc3BvbnNlVGV4dDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpbmFsbHksIGZpcmUgdGhlIGV2ZW50LlxuICAgICAgICBvYnNlcnZlci5uZXh0KHByb2dyZXNzRXZlbnQpO1xuICAgICAgfTtcblxuICAgICAgLy8gVGhlIHVwbG9hZCBwcm9ncmVzcyBldmVudCBoYW5kbGVyLCB3aGljaCBpcyBvbmx5IHJlZ2lzdGVyZWQgaWZcbiAgICAgIC8vIHByb2dyZXNzIGV2ZW50cyBhcmUgZW5hYmxlZC5cbiAgICAgIGNvbnN0IG9uVXBQcm9ncmVzcyA9IChldmVudDogUHJvZ3Jlc3NFdmVudCkgPT4ge1xuICAgICAgICAvLyBVcGxvYWQgcHJvZ3Jlc3MgZXZlbnRzIGFyZSBzaW1wbGVyLiBCZWdpbiBidWlsZGluZyB0aGUgcHJvZ3Jlc3NcbiAgICAgICAgLy8gZXZlbnQuXG4gICAgICAgIGxldCBwcm9ncmVzczogSHR0cFVwbG9hZFByb2dyZXNzRXZlbnQgPSB7XG4gICAgICAgICAgdHlwZTogSHR0cEV2ZW50VHlwZS5VcGxvYWRQcm9ncmVzcyxcbiAgICAgICAgICBsb2FkZWQ6IGV2ZW50LmxvYWRlZCxcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBJZiB0aGUgdG90YWwgbnVtYmVyIG9mIGJ5dGVzIGJlaW5nIHVwbG9hZGVkIGlzIGF2YWlsYWJsZSwgaW5jbHVkZVxuICAgICAgICAvLyBpdC5cbiAgICAgICAgaWYgKGV2ZW50Lmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICBwcm9ncmVzcy50b3RhbCA9IGV2ZW50LnRvdGFsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2VuZCB0aGUgZXZlbnQuXG4gICAgICAgIG9ic2VydmVyLm5leHQocHJvZ3Jlc3MpO1xuICAgICAgfTtcblxuICAgICAgLy8gQnkgZGVmYXVsdCwgcmVnaXN0ZXIgZm9yIGxvYWQgYW5kIGVycm9yIGV2ZW50cy5cbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgIHhoci5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIG9uRXJyb3IpO1xuXG4gICAgICAvLyBQcm9ncmVzcyBldmVudHMgYXJlIG9ubHkgZW5hYmxlZCBpZiByZXF1ZXN0ZWQuXG4gICAgICBpZiAocmVxLnJlcG9ydFByb2dyZXNzKSB7XG4gICAgICAgIC8vIERvd25sb2FkIHByb2dyZXNzIGlzIGFsd2F5cyBlbmFibGVkIGlmIHJlcXVlc3RlZC5cbiAgICAgICAgeGhyLmFkZEV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25Eb3duUHJvZ3Jlc3MpO1xuXG4gICAgICAgIC8vIFVwbG9hZCBwcm9ncmVzcyBkZXBlbmRzIG9uIHdoZXRoZXIgdGhlcmUgaXMgYSBib2R5IHRvIHVwbG9hZC5cbiAgICAgICAgaWYgKHJlcUJvZHkgIT09IG51bGwgJiYgeGhyLnVwbG9hZCkge1xuICAgICAgICAgIHhoci51cGxvYWQuYWRkRXZlbnRMaXN0ZW5lcigncHJvZ3Jlc3MnLCBvblVwUHJvZ3Jlc3MpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEZpcmUgdGhlIHJlcXVlc3QsIGFuZCBub3RpZnkgdGhlIGV2ZW50IHN0cmVhbSB0aGF0IGl0IHdhcyBmaXJlZC5cbiAgICAgIHhoci5zZW5kKHJlcUJvZHkpO1xuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIC8vIFRoaXMgaXMgdGhlIHJldHVybiBmcm9tIHRoZSBPYnNlcnZhYmxlIGZ1bmN0aW9uLCB3aGljaCBpcyB0aGVcbiAgICAgIC8vIHJlcXVlc3QgY2FuY2VsbGF0aW9uIGhhbmRsZXIuXG4gICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAvLyBPbiBhIGNhbmNlbGxhdGlvbiwgcmVtb3ZlIGFsbCByZWdpc3RlcmVkIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgICAgeGhyLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgb25FcnJvcik7XG4gICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkJywgb25Mb2FkKTtcbiAgICAgICAgaWYgKHJlcS5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgICAgIHhoci5yZW1vdmVFdmVudExpc3RlbmVyKCdwcm9ncmVzcycsIG9uRG93blByb2dyZXNzKTtcbiAgICAgICAgICBpZiAocmVxQm9keSAhPT0gbnVsbCAmJiB4aHIudXBsb2FkKSB7XG4gICAgICAgICAgICB4aHIudXBsb2FkLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3Byb2dyZXNzJywgb25VcFByb2dyZXNzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBGaW5hbGx5LCBhYm9ydCB0aGUgaW4tZmxpZ2h0IHJlcXVlc3QuXG4gICAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfVxufVxuIl19