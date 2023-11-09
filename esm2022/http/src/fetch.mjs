/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, NgZone } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders } from './headers';
import { HttpErrorResponse, HttpEventType, HttpHeaderResponse, HttpResponse, HttpStatusCode } from './response';
import * as i0 from "@angular/core";
const XSSI_PREFIX = /^\)\]\}',?\n/;
const REQUEST_URL_HEADER = `X-Request-URL`;
/**
 * Determine an appropriate URL for the response, by checking either
 * response url or the X-Request-URL header.
 */
function getResponseUrl(response) {
    if (response.url) {
        return response.url;
    }
    // stored as lowercase in the map
    const xRequestUrl = REQUEST_URL_HEADER.toLocaleLowerCase();
    return response.headers.get(xRequestUrl);
}
/**
 * Uses `fetch` to send requests to a backend server.
 *
 * This `FetchBackend` requires the support of the
 * [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) which is available on all
 * supported browsers and on Node.js v18 or later.
 *
 * @see {@link HttpHandler}
 *
 * @publicApi
 */
export class FetchBackend {
    constructor() {
        // We need to bind the native fetch to its context or it will throw an "illegal invocation"
        this.fetchImpl = inject(FetchFactory, { optional: true })?.fetch ?? fetch.bind(globalThis);
        this.ngZone = inject(NgZone);
    }
    handle(request) {
        return new Observable(observer => {
            const aborter = new AbortController();
            this.doRequest(request, aborter.signal, observer)
                .then(noop, error => observer.error(new HttpErrorResponse({ error })));
            return () => aborter.abort();
        });
    }
    async doRequest(request, signal, observer) {
        const init = this.createRequestInit(request);
        let response;
        try {
            const fetchPromise = this.fetchImpl(request.urlWithParams, { signal, ...init });
            // Make sure Zone.js doesn't trigger false-positive unhandled promise
            // error in case the Promise is rejected synchronously. See function
            // description for additional information.
            silenceSuperfluousUnhandledPromiseRejection(fetchPromise);
            // Send the `Sent` event before awaiting the response.
            observer.next({ type: HttpEventType.Sent });
            response = await fetchPromise;
        }
        catch (error) {
            observer.error(new HttpErrorResponse({
                error,
                status: error.status ?? 0,
                statusText: error.statusText,
                url: request.urlWithParams,
                headers: error.headers,
            }));
            return;
        }
        const headers = new HttpHeaders(response.headers);
        const statusText = response.statusText;
        const url = getResponseUrl(response) ?? request.urlWithParams;
        let status = response.status;
        let body = null;
        if (request.reportProgress) {
            observer.next(new HttpHeaderResponse({ headers, status, statusText, url }));
        }
        if (response.body) {
            // Read Progress
            const contentLength = response.headers.get('content-length');
            const chunks = [];
            const reader = response.body.getReader();
            let receivedLength = 0;
            let decoder;
            let partialText;
            // We have to check whether the Zone is defined in the global scope because this may be called
            // when the zone is nooped.
            const reqZone = typeof Zone !== 'undefined' && Zone.current;
            // Perform response processing outside of Angular zone to
            // ensure no excessive change detection runs are executed
            // Here calling the async ReadableStreamDefaultReader.read() is responsible for triggering CD
            await this.ngZone.runOutsideAngular(async () => {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) {
                        break;
                    }
                    chunks.push(value);
                    receivedLength += value.length;
                    if (request.reportProgress) {
                        partialText = request.responseType === 'text' ?
                            (partialText ?? '') + (decoder ??= new TextDecoder).decode(value, { stream: true }) :
                            undefined;
                        const reportProgress = () => observer.next({
                            type: HttpEventType.DownloadProgress,
                            total: contentLength ? +contentLength : undefined,
                            loaded: receivedLength,
                            partialText,
                        });
                        reqZone ? reqZone.run(reportProgress) : reportProgress();
                    }
                }
            });
            // Combine all chunks.
            const chunksAll = this.concatChunks(chunks, receivedLength);
            try {
                body = this.parseBody(request, chunksAll);
            }
            catch (error) {
                // Body loading or parsing failed
                observer.error(new HttpErrorResponse({
                    error,
                    headers: new HttpHeaders(response.headers),
                    status: response.status,
                    statusText: response.statusText,
                    url: getResponseUrl(response) ?? request.urlWithParams,
                }));
                return;
            }
        }
        // Same behavior as the XhrBackend
        if (status === 0) {
            status = body ? HttpStatusCode.Ok : 0;
        }
        // ok determines whether the response will be transmitted on the event or
        // error channel. Unsuccessful status codes (not 2xx) will always be errors,
        // but a successful status code can still result in an error if the user
        // asked for JSON data and the body cannot be parsed as such.
        const ok = status >= 200 && status < 300;
        if (ok) {
            observer.next(new HttpResponse({
                body,
                headers,
                status,
                statusText,
                url,
            }));
            // The full body has been received and delivered, no further events
            // are possible. This request is complete.
            observer.complete();
        }
        else {
            observer.error(new HttpErrorResponse({
                error: body,
                headers,
                status,
                statusText,
                url,
            }));
        }
    }
    parseBody(request, binContent) {
        switch (request.responseType) {
            case 'json':
                // stripping the XSSI when present
                const text = new TextDecoder().decode(binContent).replace(XSSI_PREFIX, '');
                return text === '' ? null : JSON.parse(text);
            case 'text':
                return new TextDecoder().decode(binContent);
            case 'blob':
                return new Blob([binContent]);
            case 'arraybuffer':
                return binContent.buffer;
        }
    }
    createRequestInit(req) {
        // We could share some of this logic with the XhrBackend
        const headers = {};
        const credentials = req.withCredentials ? 'include' : undefined;
        // Setting all the requested headers.
        req.headers.forEach((name, values) => (headers[name] = values.join(',')));
        // Add an Accept header if one isn't present already.
        headers['Accept'] ??= 'application/json, text/plain, */*';
        // Auto-detect the Content-Type header if one isn't present already.
        if (!headers['Content-Type']) {
            const detectedType = req.detectContentTypeHeader();
            // Sometimes Content-Type detection fails.
            if (detectedType !== null) {
                headers['Content-Type'] = detectedType;
            }
        }
        return {
            body: req.serializeBody(),
            method: req.method,
            headers,
            credentials,
        };
    }
    concatChunks(chunks, totalLength) {
        const chunksAll = new Uint8Array(totalLength);
        let position = 0;
        for (const chunk of chunks) {
            chunksAll.set(chunk, position);
            position += chunk.length;
        }
        return chunksAll;
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-6c8776f", ngImport: i0, type: FetchBackend, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-6c8776f", ngImport: i0, type: FetchBackend }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-6c8776f", ngImport: i0, type: FetchBackend, decorators: [{
            type: Injectable
        }] });
/**
 * Abstract class to provide a mocked implementation of `fetch()`
 */
export class FetchFactory {
}
function noop() { }
/**
 * Zone.js treats a rejected promise that has not yet been awaited
 * as an unhandled error. This function adds a noop `.then` to make
 * sure that Zone.js doesn't throw an error if the Promise is rejected
 * synchronously.
 */
function silenceSuperfluousUnhandledPromiseRejection(promise) {
    promise.then(noop, noop);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZmV0Y2guanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vaHR0cC9zcmMvZmV0Y2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQ3pELE9BQU8sRUFBQyxVQUFVLEVBQVcsTUFBTSxNQUFNLENBQUM7QUFHMUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxNQUFNLFdBQVcsQ0FBQztBQUV0QyxPQUFPLEVBQTRCLGlCQUFpQixFQUFhLGFBQWEsRUFBRSxrQkFBa0IsRUFBRSxZQUFZLEVBQUUsY0FBYyxFQUFDLE1BQU0sWUFBWSxDQUFDOztBQUVwSixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUM7QUFFbkMsTUFBTSxrQkFBa0IsR0FBRyxlQUFlLENBQUM7QUFFM0M7OztHQUdHO0FBQ0gsU0FBUyxjQUFjLENBQUMsUUFBa0I7SUFDeEMsSUFBSSxRQUFRLENBQUMsR0FBRyxFQUFFO1FBQ2hCLE9BQU8sUUFBUSxDQUFDLEdBQUcsQ0FBQztLQUNyQjtJQUNELGlDQUFpQztJQUNqQyxNQUFNLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQzNELE9BQU8sUUFBUSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUM7QUFDM0MsQ0FBQztBQUVEOzs7Ozs7Ozs7O0dBVUc7QUFFSCxNQUFNLE9BQU8sWUFBWTtJQUR6QjtRQUVFLDJGQUEyRjtRQUMxRSxjQUFTLEdBQ3RCLE1BQU0sQ0FBQyxZQUFZLEVBQUUsRUFBQyxRQUFRLEVBQUUsSUFBSSxFQUFDLENBQUMsRUFBRSxLQUFLLElBQUksS0FBSyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUMzRCxXQUFNLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBeU0xQztJQXZNQyxNQUFNLENBQUMsT0FBeUI7UUFDOUIsT0FBTyxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMvQixNQUFNLE9BQU8sR0FBRyxJQUFJLGVBQWUsRUFBRSxDQUFDO1lBQ3RDLElBQUksQ0FBQyxTQUFTLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDO2lCQUM1QyxJQUFJLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDekUsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDL0IsQ0FBQyxDQUFDLENBQUM7SUFDTCxDQUFDO0lBRU8sS0FBSyxDQUFDLFNBQVMsQ0FDbkIsT0FBeUIsRUFBRSxNQUFtQixFQUM5QyxRQUFrQztRQUNwQyxNQUFNLElBQUksR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDN0MsSUFBSSxRQUFRLENBQUM7UUFFYixJQUFJO1lBQ0YsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLEVBQUMsTUFBTSxFQUFFLEdBQUcsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUU5RSxxRUFBcUU7WUFDckUsb0VBQW9FO1lBQ3BFLDBDQUEwQztZQUMxQywyQ0FBMkMsQ0FBQyxZQUFZLENBQUMsQ0FBQztZQUUxRCxzREFBc0Q7WUFDdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFDLElBQUksRUFBRSxhQUFhLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQztZQUUxQyxRQUFRLEdBQUcsTUFBTSxZQUFZLENBQUM7U0FDL0I7UUFBQyxPQUFPLEtBQVUsRUFBRTtZQUNuQixRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUM7Z0JBQ25DLEtBQUs7Z0JBQ0wsTUFBTSxFQUFFLEtBQUssQ0FBQyxNQUFNLElBQUksQ0FBQztnQkFDekIsVUFBVSxFQUFFLEtBQUssQ0FBQyxVQUFVO2dCQUM1QixHQUFHLEVBQUUsT0FBTyxDQUFDLGFBQWE7Z0JBQzFCLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTzthQUN2QixDQUFDLENBQUMsQ0FBQztZQUNKLE9BQU87U0FDUjtRQUVELE1BQU0sT0FBTyxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNsRCxNQUFNLFVBQVUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO1FBQ3ZDLE1BQU0sR0FBRyxHQUFHLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYSxDQUFDO1FBRTlELElBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUM7UUFDN0IsSUFBSSxJQUFJLEdBQXdDLElBQUksQ0FBQztRQUVyRCxJQUFJLE9BQU8sQ0FBQyxjQUFjLEVBQUU7WUFDMUIsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLGtCQUFrQixDQUFDLEVBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxVQUFVLEVBQUUsR0FBRyxFQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzNFO1FBRUQsSUFBSSxRQUFRLENBQUMsSUFBSSxFQUFFO1lBQ2pCLGdCQUFnQjtZQUNoQixNQUFNLGFBQWEsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDO1lBQzdELE1BQU0sTUFBTSxHQUFpQixFQUFFLENBQUM7WUFDaEMsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztZQUN6QyxJQUFJLGNBQWMsR0FBRyxDQUFDLENBQUM7WUFFdkIsSUFBSSxPQUFvQixDQUFDO1lBQ3pCLElBQUksV0FBNkIsQ0FBQztZQUVsQyw4RkFBOEY7WUFDOUYsMkJBQTJCO1lBQzNCLE1BQU0sT0FBTyxHQUFHLE9BQU8sSUFBSSxLQUFLLFdBQVcsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDO1lBRTVELHlEQUF5RDtZQUN6RCx5REFBeUQ7WUFDekQsNkZBQTZGO1lBQzdGLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDN0MsT0FBTyxJQUFJLEVBQUU7b0JBQ1gsTUFBTSxFQUFDLElBQUksRUFBRSxLQUFLLEVBQUMsR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztvQkFFMUMsSUFBSSxJQUFJLEVBQUU7d0JBQ1IsTUFBTTtxQkFDUDtvQkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO29CQUNuQixjQUFjLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQztvQkFFL0IsSUFBSSxPQUFPLENBQUMsY0FBYyxFQUFFO3dCQUMxQixXQUFXLEdBQUcsT0FBTyxDQUFDLFlBQVksS0FBSyxNQUFNLENBQUMsQ0FBQzs0QkFDM0MsQ0FBQyxXQUFXLElBQUksRUFBRSxDQUFDLEdBQUcsQ0FBQyxPQUFPLEtBQUssSUFBSSxXQUFXLENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLEVBQUMsTUFBTSxFQUFFLElBQUksRUFBQyxDQUFDLENBQUMsQ0FBQzs0QkFDbkYsU0FBUyxDQUFDO3dCQUVkLE1BQU0sY0FBYyxHQUFHLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUM7NEJBQ3pDLElBQUksRUFBRSxhQUFhLENBQUMsZ0JBQWdCOzRCQUNwQyxLQUFLLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLENBQUMsU0FBUzs0QkFDakQsTUFBTSxFQUFFLGNBQWM7NEJBQ3RCLFdBQVc7eUJBQ2lCLENBQUMsQ0FBQzt3QkFDaEMsT0FBTyxDQUFDLENBQUMsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxjQUFjLEVBQUUsQ0FBQztxQkFDMUQ7aUJBQ0Y7WUFDSCxDQUFDLENBQUMsQ0FBQztZQUVILHNCQUFzQjtZQUN0QixNQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxjQUFjLENBQUMsQ0FBQztZQUM1RCxJQUFJO2dCQUNGLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLE9BQU8sRUFBRSxTQUFTLENBQUMsQ0FBQzthQUMzQztZQUFDLE9BQU8sS0FBSyxFQUFFO2dCQUNkLGlDQUFpQztnQkFDakMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLGlCQUFpQixDQUFDO29CQUNuQyxLQUFLO29CQUNMLE9BQU8sRUFBRSxJQUFJLFdBQVcsQ0FBQyxRQUFRLENBQUMsT0FBTyxDQUFDO29CQUMxQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07b0JBQ3ZCLFVBQVUsRUFBRSxRQUFRLENBQUMsVUFBVTtvQkFDL0IsR0FBRyxFQUFFLGNBQWMsQ0FBQyxRQUFRLENBQUMsSUFBSSxPQUFPLENBQUMsYUFBYTtpQkFDdkQsQ0FBQyxDQUFDLENBQUM7Z0JBQ0osT0FBTzthQUNSO1NBQ0Y7UUFFRCxrQ0FBa0M7UUFDbEMsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hCLE1BQU0sR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUN2QztRQUVELHlFQUF5RTtRQUN6RSw0RUFBNEU7UUFDNUUsd0VBQXdFO1FBQ3hFLDZEQUE2RDtRQUM3RCxNQUFNLEVBQUUsR0FBRyxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sR0FBRyxHQUFHLENBQUM7UUFFekMsSUFBSSxFQUFFLEVBQUU7WUFDTixRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksWUFBWSxDQUFDO2dCQUM3QixJQUFJO2dCQUNKLE9BQU87Z0JBQ1AsTUFBTTtnQkFDTixVQUFVO2dCQUNWLEdBQUc7YUFDSixDQUFDLENBQUMsQ0FBQztZQUVKLG1FQUFtRTtZQUNuRSwwQ0FBMEM7WUFDMUMsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDO1NBQ3JCO2FBQU07WUFDTCxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksaUJBQWlCLENBQUM7Z0JBQ25DLEtBQUssRUFBRSxJQUFJO2dCQUNYLE9BQU87Z0JBQ1AsTUFBTTtnQkFDTixVQUFVO2dCQUNWLEdBQUc7YUFDSixDQUFDLENBQUMsQ0FBQztTQUNMO0lBQ0gsQ0FBQztJQUVPLFNBQVMsQ0FBQyxPQUF5QixFQUFFLFVBQXNCO1FBRWpFLFFBQVEsT0FBTyxDQUFDLFlBQVksRUFBRTtZQUM1QixLQUFLLE1BQU07Z0JBQ1Qsa0NBQWtDO2dCQUNsQyxNQUFNLElBQUksR0FBRyxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUMzRSxPQUFPLElBQUksS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQVcsQ0FBQztZQUN6RCxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxJQUFJLFdBQVcsRUFBRSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUM5QyxLQUFLLE1BQU07Z0JBQ1QsT0FBTyxJQUFJLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUM7WUFDaEMsS0FBSyxhQUFhO2dCQUNoQixPQUFPLFVBQVUsQ0FBQyxNQUFNLENBQUM7U0FDNUI7SUFDSCxDQUFDO0lBRU8saUJBQWlCLENBQUMsR0FBcUI7UUFDN0Msd0RBQXdEO1FBRXhELE1BQU0sT0FBTyxHQUEyQixFQUFFLENBQUM7UUFDM0MsTUFBTSxXQUFXLEdBQWlDLEdBQUcsQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDO1FBRTlGLHFDQUFxQztRQUNyQyxHQUFHLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQUksRUFBRSxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBRTFFLHFEQUFxRDtRQUNyRCxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssbUNBQW1DLENBQUM7UUFFMUQsb0VBQW9FO1FBQ3BFLElBQUksQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEVBQUU7WUFDNUIsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDLHVCQUF1QixFQUFFLENBQUM7WUFDbkQsMENBQTBDO1lBQzFDLElBQUksWUFBWSxLQUFLLElBQUksRUFBRTtnQkFDekIsT0FBTyxDQUFDLGNBQWMsQ0FBQyxHQUFHLFlBQVksQ0FBQzthQUN4QztTQUNGO1FBRUQsT0FBTztZQUNMLElBQUksRUFBRSxHQUFHLENBQUMsYUFBYSxFQUFFO1lBQ3pCLE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTTtZQUNsQixPQUFPO1lBQ1AsV0FBVztTQUNaLENBQUM7SUFDSixDQUFDO0lBRU8sWUFBWSxDQUFDLE1BQW9CLEVBQUUsV0FBbUI7UUFDNUQsTUFBTSxTQUFTLEdBQUcsSUFBSSxVQUFVLENBQUMsV0FBVyxDQUFDLENBQUM7UUFDOUMsSUFBSSxRQUFRLEdBQUcsQ0FBQyxDQUFDO1FBQ2pCLEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1lBQzFCLFNBQVMsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxDQUFDO1lBQy9CLFFBQVEsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDO1NBQzFCO1FBRUQsT0FBTyxTQUFTLENBQUM7SUFDbkIsQ0FBQzt5SEE1TVUsWUFBWTs2SEFBWixZQUFZOztzR0FBWixZQUFZO2tCQUR4QixVQUFVOztBQWdOWDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsWUFBWTtDQUVqQztBQUVELFNBQVMsSUFBSSxLQUFVLENBQUM7QUFFeEI7Ozs7O0dBS0c7QUFDSCxTQUFTLDJDQUEyQyxDQUFDLE9BQXlCO0lBQzVFLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0FBQzNCLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtpbmplY3QsIEluamVjdGFibGUsIE5nWm9uZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge09ic2VydmFibGUsIE9ic2VydmVyfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtIdHRwQmFja2VuZH0gZnJvbSAnLi9iYWNrZW5kJztcbmltcG9ydCB7SHR0cEhlYWRlcnN9IGZyb20gJy4vaGVhZGVycyc7XG5pbXBvcnQge0h0dHBSZXF1ZXN0fSBmcm9tICcuL3JlcXVlc3QnO1xuaW1wb3J0IHtIdHRwRG93bmxvYWRQcm9ncmVzc0V2ZW50LCBIdHRwRXJyb3JSZXNwb25zZSwgSHR0cEV2ZW50LCBIdHRwRXZlbnRUeXBlLCBIdHRwSGVhZGVyUmVzcG9uc2UsIEh0dHBSZXNwb25zZSwgSHR0cFN0YXR1c0NvZGV9IGZyb20gJy4vcmVzcG9uc2UnO1xuXG5jb25zdCBYU1NJX1BSRUZJWCA9IC9eXFwpXFxdXFx9Jyw/XFxuLztcblxuY29uc3QgUkVRVUVTVF9VUkxfSEVBREVSID0gYFgtUmVxdWVzdC1VUkxgO1xuXG4vKipcbiAqIERldGVybWluZSBhbiBhcHByb3ByaWF0ZSBVUkwgZm9yIHRoZSByZXNwb25zZSwgYnkgY2hlY2tpbmcgZWl0aGVyXG4gKiByZXNwb25zZSB1cmwgb3IgdGhlIFgtUmVxdWVzdC1VUkwgaGVhZGVyLlxuICovXG5mdW5jdGlvbiBnZXRSZXNwb25zZVVybChyZXNwb25zZTogUmVzcG9uc2UpOiBzdHJpbmd8bnVsbCB7XG4gIGlmIChyZXNwb25zZS51cmwpIHtcbiAgICByZXR1cm4gcmVzcG9uc2UudXJsO1xuICB9XG4gIC8vIHN0b3JlZCBhcyBsb3dlcmNhc2UgaW4gdGhlIG1hcFxuICBjb25zdCB4UmVxdWVzdFVybCA9IFJFUVVFU1RfVVJMX0hFQURFUi50b0xvY2FsZUxvd2VyQ2FzZSgpO1xuICByZXR1cm4gcmVzcG9uc2UuaGVhZGVycy5nZXQoeFJlcXVlc3RVcmwpO1xufVxuXG4vKipcbiAqIFVzZXMgYGZldGNoYCB0byBzZW5kIHJlcXVlc3RzIHRvIGEgYmFja2VuZCBzZXJ2ZXIuXG4gKlxuICogVGhpcyBgRmV0Y2hCYWNrZW5kYCByZXF1aXJlcyB0aGUgc3VwcG9ydCBvZiB0aGVcbiAqIFtGZXRjaCBBUEldKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0FQSS9GZXRjaF9BUEkpIHdoaWNoIGlzIGF2YWlsYWJsZSBvbiBhbGxcbiAqIHN1cHBvcnRlZCBicm93c2VycyBhbmQgb24gTm9kZS5qcyB2MTggb3IgbGF0ZXIuXG4gKlxuICogQHNlZSB7QGxpbmsgSHR0cEhhbmRsZXJ9XG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgRmV0Y2hCYWNrZW5kIGltcGxlbWVudHMgSHR0cEJhY2tlbmQge1xuICAvLyBXZSBuZWVkIHRvIGJpbmQgdGhlIG5hdGl2ZSBmZXRjaCB0byBpdHMgY29udGV4dCBvciBpdCB3aWxsIHRocm93IGFuIFwiaWxsZWdhbCBpbnZvY2F0aW9uXCJcbiAgcHJpdmF0ZSByZWFkb25seSBmZXRjaEltcGwgPVxuICAgICAgaW5qZWN0KEZldGNoRmFjdG9yeSwge29wdGlvbmFsOiB0cnVlfSk/LmZldGNoID8/IGZldGNoLmJpbmQoZ2xvYmFsVGhpcyk7XG4gIHByaXZhdGUgcmVhZG9ubHkgbmdab25lID0gaW5qZWN0KE5nWm9uZSk7XG5cbiAgaGFuZGxlKHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4pOiBPYnNlcnZhYmxlPEh0dHBFdmVudDxhbnk+PiB7XG4gICAgcmV0dXJuIG5ldyBPYnNlcnZhYmxlKG9ic2VydmVyID0+IHtcbiAgICAgIGNvbnN0IGFib3J0ZXIgPSBuZXcgQWJvcnRDb250cm9sbGVyKCk7XG4gICAgICB0aGlzLmRvUmVxdWVzdChyZXF1ZXN0LCBhYm9ydGVyLnNpZ25hbCwgb2JzZXJ2ZXIpXG4gICAgICAgICAgLnRoZW4obm9vcCwgZXJyb3IgPT4gb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtlcnJvcn0pKSk7XG4gICAgICByZXR1cm4gKCkgPT4gYWJvcnRlci5hYm9ydCgpO1xuICAgIH0pO1xuICB9XG5cbiAgcHJpdmF0ZSBhc3luYyBkb1JlcXVlc3QoXG4gICAgICByZXF1ZXN0OiBIdHRwUmVxdWVzdDxhbnk+LCBzaWduYWw6IEFib3J0U2lnbmFsLFxuICAgICAgb2JzZXJ2ZXI6IE9ic2VydmVyPEh0dHBFdmVudDxhbnk+Pik6IFByb21pc2U8dm9pZD4ge1xuICAgIGNvbnN0IGluaXQgPSB0aGlzLmNyZWF0ZVJlcXVlc3RJbml0KHJlcXVlc3QpO1xuICAgIGxldCByZXNwb25zZTtcblxuICAgIHRyeSB7XG4gICAgICBjb25zdCBmZXRjaFByb21pc2UgPSB0aGlzLmZldGNoSW1wbChyZXF1ZXN0LnVybFdpdGhQYXJhbXMsIHtzaWduYWwsIC4uLmluaXR9KTtcblxuICAgICAgLy8gTWFrZSBzdXJlIFpvbmUuanMgZG9lc24ndCB0cmlnZ2VyIGZhbHNlLXBvc2l0aXZlIHVuaGFuZGxlZCBwcm9taXNlXG4gICAgICAvLyBlcnJvciBpbiBjYXNlIHRoZSBQcm9taXNlIGlzIHJlamVjdGVkIHN5bmNocm9ub3VzbHkuIFNlZSBmdW5jdGlvblxuICAgICAgLy8gZGVzY3JpcHRpb24gZm9yIGFkZGl0aW9uYWwgaW5mb3JtYXRpb24uXG4gICAgICBzaWxlbmNlU3VwZXJmbHVvdXNVbmhhbmRsZWRQcm9taXNlUmVqZWN0aW9uKGZldGNoUHJvbWlzZSk7XG5cbiAgICAgIC8vIFNlbmQgdGhlIGBTZW50YCBldmVudCBiZWZvcmUgYXdhaXRpbmcgdGhlIHJlc3BvbnNlLlxuICAgICAgb2JzZXJ2ZXIubmV4dCh7dHlwZTogSHR0cEV2ZW50VHlwZS5TZW50fSk7XG5cbiAgICAgIHJlc3BvbnNlID0gYXdhaXQgZmV0Y2hQcm9taXNlO1xuICAgIH0gY2F0Y2ggKGVycm9yOiBhbnkpIHtcbiAgICAgIG9ic2VydmVyLmVycm9yKG5ldyBIdHRwRXJyb3JSZXNwb25zZSh7XG4gICAgICAgIGVycm9yLFxuICAgICAgICBzdGF0dXM6IGVycm9yLnN0YXR1cyA/PyAwLFxuICAgICAgICBzdGF0dXNUZXh0OiBlcnJvci5zdGF0dXNUZXh0LFxuICAgICAgICB1cmw6IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgaGVhZGVyczogZXJyb3IuaGVhZGVycyxcbiAgICAgIH0pKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCBoZWFkZXJzID0gbmV3IEh0dHBIZWFkZXJzKHJlc3BvbnNlLmhlYWRlcnMpO1xuICAgIGNvbnN0IHN0YXR1c1RleHQgPSByZXNwb25zZS5zdGF0dXNUZXh0O1xuICAgIGNvbnN0IHVybCA9IGdldFJlc3BvbnNlVXJsKHJlc3BvbnNlKSA/PyByZXF1ZXN0LnVybFdpdGhQYXJhbXM7XG5cbiAgICBsZXQgc3RhdHVzID0gcmVzcG9uc2Uuc3RhdHVzO1xuICAgIGxldCBib2R5OiBzdHJpbmd8QXJyYXlCdWZmZXJ8QmxvYnxvYmplY3R8bnVsbCA9IG51bGw7XG5cbiAgICBpZiAocmVxdWVzdC5yZXBvcnRQcm9ncmVzcykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cEhlYWRlclJlc3BvbnNlKHtoZWFkZXJzLCBzdGF0dXMsIHN0YXR1c1RleHQsIHVybH0pKTtcbiAgICB9XG5cbiAgICBpZiAocmVzcG9uc2UuYm9keSkge1xuICAgICAgLy8gUmVhZCBQcm9ncmVzc1xuICAgICAgY29uc3QgY29udGVudExlbmd0aCA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdjb250ZW50LWxlbmd0aCcpO1xuICAgICAgY29uc3QgY2h1bmtzOiBVaW50OEFycmF5W10gPSBbXTtcbiAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG4gICAgICBsZXQgcmVjZWl2ZWRMZW5ndGggPSAwO1xuXG4gICAgICBsZXQgZGVjb2RlcjogVGV4dERlY29kZXI7XG4gICAgICBsZXQgcGFydGlhbFRleHQ6IHN0cmluZ3x1bmRlZmluZWQ7XG5cbiAgICAgIC8vIFdlIGhhdmUgdG8gY2hlY2sgd2hldGhlciB0aGUgWm9uZSBpcyBkZWZpbmVkIGluIHRoZSBnbG9iYWwgc2NvcGUgYmVjYXVzZSB0aGlzIG1heSBiZSBjYWxsZWRcbiAgICAgIC8vIHdoZW4gdGhlIHpvbmUgaXMgbm9vcGVkLlxuICAgICAgY29uc3QgcmVxWm9uZSA9IHR5cGVvZiBab25lICE9PSAndW5kZWZpbmVkJyAmJiBab25lLmN1cnJlbnQ7XG5cbiAgICAgIC8vIFBlcmZvcm0gcmVzcG9uc2UgcHJvY2Vzc2luZyBvdXRzaWRlIG9mIEFuZ3VsYXIgem9uZSB0b1xuICAgICAgLy8gZW5zdXJlIG5vIGV4Y2Vzc2l2ZSBjaGFuZ2UgZGV0ZWN0aW9uIHJ1bnMgYXJlIGV4ZWN1dGVkXG4gICAgICAvLyBIZXJlIGNhbGxpbmcgdGhlIGFzeW5jIFJlYWRhYmxlU3RyZWFtRGVmYXVsdFJlYWRlci5yZWFkKCkgaXMgcmVzcG9uc2libGUgZm9yIHRyaWdnZXJpbmcgQ0RcbiAgICAgIGF3YWl0IHRoaXMubmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKGFzeW5jICgpID0+IHtcbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCB7ZG9uZSwgdmFsdWV9ID0gYXdhaXQgcmVhZGVyLnJlYWQoKTtcblxuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjaHVua3MucHVzaCh2YWx1ZSk7XG4gICAgICAgICAgcmVjZWl2ZWRMZW5ndGggKz0gdmFsdWUubGVuZ3RoO1xuXG4gICAgICAgICAgaWYgKHJlcXVlc3QucmVwb3J0UHJvZ3Jlc3MpIHtcbiAgICAgICAgICAgIHBhcnRpYWxUZXh0ID0gcmVxdWVzdC5yZXNwb25zZVR5cGUgPT09ICd0ZXh0JyA/XG4gICAgICAgICAgICAgICAgKHBhcnRpYWxUZXh0ID8/ICcnKSArIChkZWNvZGVyID8/PSBuZXcgVGV4dERlY29kZXIpLmRlY29kZSh2YWx1ZSwge3N0cmVhbTogdHJ1ZX0pIDpcbiAgICAgICAgICAgICAgICB1bmRlZmluZWQ7XG5cbiAgICAgICAgICAgIGNvbnN0IHJlcG9ydFByb2dyZXNzID0gKCkgPT4gb2JzZXJ2ZXIubmV4dCh7XG4gICAgICAgICAgICAgIHR5cGU6IEh0dHBFdmVudFR5cGUuRG93bmxvYWRQcm9ncmVzcyxcbiAgICAgICAgICAgICAgdG90YWw6IGNvbnRlbnRMZW5ndGggPyArY29udGVudExlbmd0aCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICAgICAgbG9hZGVkOiByZWNlaXZlZExlbmd0aCxcbiAgICAgICAgICAgICAgcGFydGlhbFRleHQsXG4gICAgICAgICAgICB9IGFzIEh0dHBEb3dubG9hZFByb2dyZXNzRXZlbnQpO1xuICAgICAgICAgICAgcmVxWm9uZSA/IHJlcVpvbmUucnVuKHJlcG9ydFByb2dyZXNzKSA6IHJlcG9ydFByb2dyZXNzKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ29tYmluZSBhbGwgY2h1bmtzLlxuICAgICAgY29uc3QgY2h1bmtzQWxsID0gdGhpcy5jb25jYXRDaHVua3MoY2h1bmtzLCByZWNlaXZlZExlbmd0aCk7XG4gICAgICB0cnkge1xuICAgICAgICBib2R5ID0gdGhpcy5wYXJzZUJvZHkocmVxdWVzdCwgY2h1bmtzQWxsKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIC8vIEJvZHkgbG9hZGluZyBvciBwYXJzaW5nIGZhaWxlZFxuICAgICAgICBvYnNlcnZlci5lcnJvcihuZXcgSHR0cEVycm9yUmVzcG9uc2Uoe1xuICAgICAgICAgIGVycm9yLFxuICAgICAgICAgIGhlYWRlcnM6IG5ldyBIdHRwSGVhZGVycyhyZXNwb25zZS5oZWFkZXJzKSxcbiAgICAgICAgICBzdGF0dXM6IHJlc3BvbnNlLnN0YXR1cyxcbiAgICAgICAgICBzdGF0dXNUZXh0OiByZXNwb25zZS5zdGF0dXNUZXh0LFxuICAgICAgICAgIHVybDogZ2V0UmVzcG9uc2VVcmwocmVzcG9uc2UpID8/IHJlcXVlc3QudXJsV2l0aFBhcmFtcyxcbiAgICAgICAgfSkpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gU2FtZSBiZWhhdmlvciBhcyB0aGUgWGhyQmFja2VuZFxuICAgIGlmIChzdGF0dXMgPT09IDApIHtcbiAgICAgIHN0YXR1cyA9IGJvZHkgPyBIdHRwU3RhdHVzQ29kZS5PayA6IDA7XG4gICAgfVxuXG4gICAgLy8gb2sgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSByZXNwb25zZSB3aWxsIGJlIHRyYW5zbWl0dGVkIG9uIHRoZSBldmVudCBvclxuICAgIC8vIGVycm9yIGNoYW5uZWwuIFVuc3VjY2Vzc2Z1bCBzdGF0dXMgY29kZXMgKG5vdCAyeHgpIHdpbGwgYWx3YXlzIGJlIGVycm9ycyxcbiAgICAvLyBidXQgYSBzdWNjZXNzZnVsIHN0YXR1cyBjb2RlIGNhbiBzdGlsbCByZXN1bHQgaW4gYW4gZXJyb3IgaWYgdGhlIHVzZXJcbiAgICAvLyBhc2tlZCBmb3IgSlNPTiBkYXRhIGFuZCB0aGUgYm9keSBjYW5ub3QgYmUgcGFyc2VkIGFzIHN1Y2guXG4gICAgY29uc3Qgb2sgPSBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMDtcblxuICAgIGlmIChvaykge1xuICAgICAgb2JzZXJ2ZXIubmV4dChuZXcgSHR0cFJlc3BvbnNlKHtcbiAgICAgICAgYm9keSxcbiAgICAgICAgaGVhZGVycyxcbiAgICAgICAgc3RhdHVzLFxuICAgICAgICBzdGF0dXNUZXh0LFxuICAgICAgICB1cmwsXG4gICAgICB9KSk7XG5cbiAgICAgIC8vIFRoZSBmdWxsIGJvZHkgaGFzIGJlZW4gcmVjZWl2ZWQgYW5kIGRlbGl2ZXJlZCwgbm8gZnVydGhlciBldmVudHNcbiAgICAgIC8vIGFyZSBwb3NzaWJsZS4gVGhpcyByZXF1ZXN0IGlzIGNvbXBsZXRlLlxuICAgICAgb2JzZXJ2ZXIuY29tcGxldGUoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgb2JzZXJ2ZXIuZXJyb3IobmV3IEh0dHBFcnJvclJlc3BvbnNlKHtcbiAgICAgICAgZXJyb3I6IGJvZHksXG4gICAgICAgIGhlYWRlcnMsXG4gICAgICAgIHN0YXR1cyxcbiAgICAgICAgc3RhdHVzVGV4dCxcbiAgICAgICAgdXJsLFxuICAgICAgfSkpO1xuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VCb2R5KHJlcXVlc3Q6IEh0dHBSZXF1ZXN0PGFueT4sIGJpbkNvbnRlbnQ6IFVpbnQ4QXJyYXkpOiBzdHJpbmd8QXJyYXlCdWZmZXJ8QmxvYlxuICAgICAgfG9iamVjdHxudWxsIHtcbiAgICBzd2l0Y2ggKHJlcXVlc3QucmVzcG9uc2VUeXBlKSB7XG4gICAgICBjYXNlICdqc29uJzpcbiAgICAgICAgLy8gc3RyaXBwaW5nIHRoZSBYU1NJIHdoZW4gcHJlc2VudFxuICAgICAgICBjb25zdCB0ZXh0ID0gbmV3IFRleHREZWNvZGVyKCkuZGVjb2RlKGJpbkNvbnRlbnQpLnJlcGxhY2UoWFNTSV9QUkVGSVgsICcnKTtcbiAgICAgICAgcmV0dXJuIHRleHQgPT09ICcnID8gbnVsbCA6IEpTT04ucGFyc2UodGV4dCkgYXMgb2JqZWN0O1xuICAgICAgY2FzZSAndGV4dCc6XG4gICAgICAgIHJldHVybiBuZXcgVGV4dERlY29kZXIoKS5kZWNvZGUoYmluQ29udGVudCk7XG4gICAgICBjYXNlICdibG9iJzpcbiAgICAgICAgcmV0dXJuIG5ldyBCbG9iKFtiaW5Db250ZW50XSk7XG4gICAgICBjYXNlICdhcnJheWJ1ZmZlcic6XG4gICAgICAgIHJldHVybiBiaW5Db250ZW50LmJ1ZmZlcjtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGNyZWF0ZVJlcXVlc3RJbml0KHJlcTogSHR0cFJlcXVlc3Q8YW55Pik6IFJlcXVlc3RJbml0IHtcbiAgICAvLyBXZSBjb3VsZCBzaGFyZSBzb21lIG9mIHRoaXMgbG9naWMgd2l0aCB0aGUgWGhyQmFja2VuZFxuXG4gICAgY29uc3QgaGVhZGVyczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHt9O1xuICAgIGNvbnN0IGNyZWRlbnRpYWxzOiBSZXF1ZXN0Q3JlZGVudGlhbHN8dW5kZWZpbmVkID0gcmVxLndpdGhDcmVkZW50aWFscyA/ICdpbmNsdWRlJyA6IHVuZGVmaW5lZDtcblxuICAgIC8vIFNldHRpbmcgYWxsIHRoZSByZXF1ZXN0ZWQgaGVhZGVycy5cbiAgICByZXEuaGVhZGVycy5mb3JFYWNoKChuYW1lLCB2YWx1ZXMpID0+IChoZWFkZXJzW25hbWVdID0gdmFsdWVzLmpvaW4oJywnKSkpO1xuXG4gICAgLy8gQWRkIGFuIEFjY2VwdCBoZWFkZXIgaWYgb25lIGlzbid0IHByZXNlbnQgYWxyZWFkeS5cbiAgICBoZWFkZXJzWydBY2NlcHQnXSA/Pz0gJ2FwcGxpY2F0aW9uL2pzb24sIHRleHQvcGxhaW4sICovKic7XG5cbiAgICAvLyBBdXRvLWRldGVjdCB0aGUgQ29udGVudC1UeXBlIGhlYWRlciBpZiBvbmUgaXNuJ3QgcHJlc2VudCBhbHJlYWR5LlxuICAgIGlmICghaGVhZGVyc1snQ29udGVudC1UeXBlJ10pIHtcbiAgICAgIGNvbnN0IGRldGVjdGVkVHlwZSA9IHJlcS5kZXRlY3RDb250ZW50VHlwZUhlYWRlcigpO1xuICAgICAgLy8gU29tZXRpbWVzIENvbnRlbnQtVHlwZSBkZXRlY3Rpb24gZmFpbHMuXG4gICAgICBpZiAoZGV0ZWN0ZWRUeXBlICE9PSBudWxsKSB7XG4gICAgICAgIGhlYWRlcnNbJ0NvbnRlbnQtVHlwZSddID0gZGV0ZWN0ZWRUeXBlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBib2R5OiByZXEuc2VyaWFsaXplQm9keSgpLFxuICAgICAgbWV0aG9kOiByZXEubWV0aG9kLFxuICAgICAgaGVhZGVycyxcbiAgICAgIGNyZWRlbnRpYWxzLFxuICAgIH07XG4gIH1cblxuICBwcml2YXRlIGNvbmNhdENodW5rcyhjaHVua3M6IFVpbnQ4QXJyYXlbXSwgdG90YWxMZW5ndGg6IG51bWJlcik6IFVpbnQ4QXJyYXkge1xuICAgIGNvbnN0IGNodW5rc0FsbCA9IG5ldyBVaW50OEFycmF5KHRvdGFsTGVuZ3RoKTtcbiAgICBsZXQgcG9zaXRpb24gPSAwO1xuICAgIGZvciAoY29uc3QgY2h1bmsgb2YgY2h1bmtzKSB7XG4gICAgICBjaHVua3NBbGwuc2V0KGNodW5rLCBwb3NpdGlvbik7XG4gICAgICBwb3NpdGlvbiArPSBjaHVuay5sZW5ndGg7XG4gICAgfVxuXG4gICAgcmV0dXJuIGNodW5rc0FsbDtcbiAgfVxufVxuXG4vKipcbiAqIEFic3RyYWN0IGNsYXNzIHRvIHByb3ZpZGUgYSBtb2NrZWQgaW1wbGVtZW50YXRpb24gb2YgYGZldGNoKClgXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBGZXRjaEZhY3Rvcnkge1xuICBhYnN0cmFjdCBmZXRjaDogdHlwZW9mIGZldGNoO1xufVxuXG5mdW5jdGlvbiBub29wKCk6IHZvaWQge31cblxuLyoqXG4gKiBab25lLmpzIHRyZWF0cyBhIHJlamVjdGVkIHByb21pc2UgdGhhdCBoYXMgbm90IHlldCBiZWVuIGF3YWl0ZWRcbiAqIGFzIGFuIHVuaGFuZGxlZCBlcnJvci4gVGhpcyBmdW5jdGlvbiBhZGRzIGEgbm9vcCBgLnRoZW5gIHRvIG1ha2VcbiAqIHN1cmUgdGhhdCBab25lLmpzIGRvZXNuJ3QgdGhyb3cgYW4gZXJyb3IgaWYgdGhlIFByb21pc2UgaXMgcmVqZWN0ZWRcbiAqIHN5bmNocm9ub3VzbHkuXG4gKi9cbmZ1bmN0aW9uIHNpbGVuY2VTdXBlcmZsdW91c1VuaGFuZGxlZFByb21pc2VSZWplY3Rpb24ocHJvbWlzZTogUHJvbWlzZTx1bmtub3duPikge1xuICBwcm9taXNlLnRoZW4obm9vcCwgbm9vcCk7XG59XG4iXX0=