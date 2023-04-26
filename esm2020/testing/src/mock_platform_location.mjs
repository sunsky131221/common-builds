import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Subject } from 'rxjs';
import * as i0 from "@angular/core";
/**
 * Parser from https://tools.ietf.org/html/rfc3986#appendix-B
 * ^(([^:/?#]+):)?(//([^/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?
 *  12            3  4          5       6  7        8 9
 *
 * Example: http://www.ics.uci.edu/pub/ietf/uri/#Related
 *
 * Results in:
 *
 * $1 = http:
 * $2 = http
 * $3 = //www.ics.uci.edu
 * $4 = www.ics.uci.edu
 * $5 = /pub/ietf/uri/
 * $6 = <undefined>
 * $7 = <undefined>
 * $8 = #Related
 * $9 = Related
 */
const urlParse = /^(([^:\/?#]+):)?(\/\/([^\/?#]*))?([^?#]*)(\?([^#]*))?(#(.*))?/;
function parseUrl(urlStr, baseHref) {
    const verifyProtocol = /^((http[s]?|ftp):\/\/)/;
    let serverBase;
    // URL class requires full URL. If the URL string doesn't start with protocol, we need to add
    // an arbitrary base URL which can be removed afterward.
    if (!verifyProtocol.test(urlStr)) {
        serverBase = 'http://empty.com/';
    }
    let parsedUrl;
    try {
        parsedUrl = new URL(urlStr, serverBase);
    }
    catch (e) {
        const result = urlParse.exec(serverBase || '' + urlStr);
        if (!result) {
            throw new Error(`Invalid URL: ${urlStr} with base: ${baseHref}`);
        }
        const hostSplit = result[4].split(':');
        parsedUrl = {
            protocol: result[1],
            hostname: hostSplit[0],
            port: hostSplit[1] || '',
            pathname: result[5],
            search: result[6],
            hash: result[8],
        };
    }
    if (parsedUrl.pathname && parsedUrl.pathname.indexOf(baseHref) === 0) {
        parsedUrl.pathname = parsedUrl.pathname.substring(baseHref.length);
    }
    return {
        hostname: !serverBase && parsedUrl.hostname || '',
        protocol: !serverBase && parsedUrl.protocol || '',
        port: !serverBase && parsedUrl.port || '',
        pathname: parsedUrl.pathname || '/',
        search: parsedUrl.search || '',
        hash: parsedUrl.hash || '',
    };
}
/**
 * Provider for mock platform location config
 *
 * @publicApi
 */
export const MOCK_PLATFORM_LOCATION_CONFIG = new InjectionToken('MOCK_PLATFORM_LOCATION_CONFIG');
/**
 * Mock implementation of URL state.
 *
 * @publicApi
 */
export class MockPlatformLocation {
    constructor(config) {
        this.baseHref = '';
        this.hashUpdate = new Subject();
        this.popStateSubject = new Subject();
        this.urlChangeIndex = 0;
        this.urlChanges = [{ hostname: '', protocol: '', port: '', pathname: '/', search: '', hash: '', state: null }];
        if (config) {
            this.baseHref = config.appBaseHref || '';
            const parsedChanges = this.parseChanges(null, config.startUrl || 'http://_empty_/', this.baseHref);
            this.urlChanges[0] = { ...parsedChanges };
        }
    }
    get hostname() {
        return this.urlChanges[this.urlChangeIndex].hostname;
    }
    get protocol() {
        return this.urlChanges[this.urlChangeIndex].protocol;
    }
    get port() {
        return this.urlChanges[this.urlChangeIndex].port;
    }
    get pathname() {
        return this.urlChanges[this.urlChangeIndex].pathname;
    }
    get search() {
        return this.urlChanges[this.urlChangeIndex].search;
    }
    get hash() {
        return this.urlChanges[this.urlChangeIndex].hash;
    }
    get state() {
        return this.urlChanges[this.urlChangeIndex].state;
    }
    getBaseHrefFromDOM() {
        return this.baseHref;
    }
    onPopState(fn) {
        const subscription = this.popStateSubject.subscribe(fn);
        return () => subscription.unsubscribe();
    }
    onHashChange(fn) {
        const subscription = this.hashUpdate.subscribe(fn);
        return () => subscription.unsubscribe();
    }
    get href() {
        let url = `${this.protocol}//${this.hostname}${this.port ? ':' + this.port : ''}`;
        url += `${this.pathname === '/' ? '' : this.pathname}${this.search}${this.hash}`;
        return url;
    }
    get url() {
        return `${this.pathname}${this.search}${this.hash}`;
    }
    parseChanges(state, url, baseHref = '') {
        // When the `history.state` value is stored, it is always copied.
        state = JSON.parse(JSON.stringify(state));
        return { ...parseUrl(url, baseHref), state };
    }
    replaceState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        this.urlChanges[this.urlChangeIndex] =
            { ...this.urlChanges[this.urlChangeIndex], pathname, search, hash, state: parsedState };
    }
    pushState(state, title, newUrl) {
        const { pathname, search, state: parsedState, hash } = this.parseChanges(state, newUrl);
        if (this.urlChangeIndex > 0) {
            this.urlChanges.splice(this.urlChangeIndex + 1);
        }
        this.urlChanges.push({ ...this.urlChanges[this.urlChangeIndex], pathname, search, hash, state: parsedState });
        this.urlChangeIndex = this.urlChanges.length - 1;
    }
    forward() {
        const oldUrl = this.url;
        const oldHash = this.hash;
        if (this.urlChangeIndex < this.urlChanges.length) {
            this.urlChangeIndex++;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    back() {
        const oldUrl = this.url;
        const oldHash = this.hash;
        if (this.urlChangeIndex > 0) {
            this.urlChangeIndex--;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    historyGo(relativePosition = 0) {
        const oldUrl = this.url;
        const oldHash = this.hash;
        const nextPageIndex = this.urlChangeIndex + relativePosition;
        if (nextPageIndex >= 0 && nextPageIndex < this.urlChanges.length) {
            this.urlChangeIndex = nextPageIndex;
        }
        this.emitEvents(oldHash, oldUrl);
    }
    getState() {
        return this.state;
    }
    /**
     * Browsers are inconsistent in when they fire events and perform the state updates
     * The most easiest thing to do in our mock is synchronous and that happens to match
     * Firefox and Chrome, at least somewhat closely
     *
     * https://github.com/WICG/navigation-api#watching-for-navigations
     * https://docs.google.com/document/d/1Pdve-DJ1JCGilj9Yqf5HxRJyBKSel5owgOvUJqTauwU/edit#heading=h.3ye4v71wsz94
     * popstate is always sent before hashchange:
     * https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event#when_popstate_is_sent
     */
    emitEvents(oldHash, oldUrl) {
        this.popStateSubject.next({ type: 'popstate', state: this.getState(), oldUrl, newUrl: this.url });
        if (oldHash !== this.hash) {
            this.hashUpdate.next({ type: 'hashchange', state: null, oldUrl, newUrl: this.url });
        }
    }
}
MockPlatformLocation.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "15.2.8+sha-dd4fb18", ngImport: i0, type: MockPlatformLocation, deps: [{ token: MOCK_PLATFORM_LOCATION_CONFIG, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
MockPlatformLocation.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "15.2.8+sha-dd4fb18", ngImport: i0, type: MockPlatformLocation });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "15.2.8+sha-dd4fb18", ngImport: i0, type: MockPlatformLocation, decorators: [{
            type: Injectable
        }], ctorParameters: function () { return [{ type: undefined, decorators: [{
                    type: Inject,
                    args: [MOCK_PLATFORM_LOCATION_CONFIG]
                }, {
                    type: Optional
                }] }]; } });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9ja19wbGF0Zm9ybV9sb2NhdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9tb2NrX3BsYXRmb3JtX2xvY2F0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0UsT0FBTyxFQUFDLE9BQU8sRUFBQyxNQUFNLE1BQU0sQ0FBQzs7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWtCRztBQUNILE1BQU0sUUFBUSxHQUFHLCtEQUErRCxDQUFDO0FBRWpGLFNBQVMsUUFBUSxDQUFDLE1BQWMsRUFBRSxRQUFnQjtJQUNoRCxNQUFNLGNBQWMsR0FBRyx3QkFBd0IsQ0FBQztJQUNoRCxJQUFJLFVBQTRCLENBQUM7SUFFakMsNkZBQTZGO0lBQzdGLHdEQUF3RDtJQUN4RCxJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRTtRQUNoQyxVQUFVLEdBQUcsbUJBQW1CLENBQUM7S0FDbEM7SUFDRCxJQUFJLFNBT0gsQ0FBQztJQUNGLElBQUk7UUFDRixTQUFTLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO0tBQ3pDO0lBQUMsT0FBTyxDQUFDLEVBQUU7UUFDVixNQUFNLE1BQU0sR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLFVBQVUsSUFBSSxFQUFFLEdBQUcsTUFBTSxDQUFDLENBQUM7UUFDeEQsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUNYLE1BQU0sSUFBSSxLQUFLLENBQUMsZ0JBQWdCLE1BQU0sZUFBZSxRQUFRLEVBQUUsQ0FBQyxDQUFDO1NBQ2xFO1FBQ0QsTUFBTSxTQUFTLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FB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QUFPLEdBQUcsSUFBSSxDQUFDLElBQUksQ0FBQztRQUMxQixNQUFNLGFBQWEsR0FBRyxJQUFJLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDO1FBQzdELElBQUksYUFBYSxJQUFJLENBQUMsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEVBQUU7WUFDaEUsSUFBSSxDQUFDLGNBQWMsR0FBRyxhQUFhLENBQUM7U0FDckM7UUFDRCxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUNuQyxDQUFDO0lBRUQsUUFBUTtRQUNOLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztJQUNwQixDQUFDO0lBRUQ7Ozs7Ozs7OztPQVNHO0lBQ0ssVUFBVSxDQUFDLE9BQWUsRUFBRSxNQUFjO1FBQ2hELElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUNyQixFQUFDLElBQUksRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQ2hELENBQUMsQ0FBQztRQUN6QixJQUFJLE9BQU8sS0FBSyxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ3pCLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUNoQixFQUFDLElBQUksRUFBRSxZQUFZLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxHQUFHLEVBQXdCLENBQUMsQ0FBQztTQUN6RjtJQUNILENBQUM7OzRIQWxKVSxvQkFBb0Isa0JBZVgsNkJBQTZCO2dJQWZ0QyxvQkFBb0I7c0dBQXBCLG9CQUFvQjtrQkFEaEMsVUFBVTs7MEJBZ0JJLE1BQU07MkJBQUMsNkJBQTZCOzswQkFBRyxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7TG9jYXRpb25DaGFuZ2VFdmVudCwgTG9jYXRpb25DaGFuZ2VMaXN0ZW5lciwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnQGFuZ3VsYXIvY29tbW9uJztcbmltcG9ydCB7SW5qZWN0LCBJbmplY3RhYmxlLCBJbmplY3Rpb25Ub2tlbiwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJqZWN0fSBmcm9tICdyeGpzJztcblxuLyoqXG4gKiBQYXJzZXIgZnJvbSBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiNhcHBlbmRpeC1CXG4gKiBeKChbXjovPyNdKyk6KT8oLy8oW14vPyNdKikpPyhbXj8jXSopKFxcPyhbXiNdKikpPygjKC4qKSk/XG4gKiAgMTIgICAgICAgICAgICAzICA0ICAgICAgICAgIDUgICAgICAgNiAgNyAgICAgICAgOCA5XG4gKlxuICogRXhhbXBsZTogaHR0cDovL3d3dy5pY3MudWNpLmVkdS9wdWIvaWV0Zi91cmkvI1JlbGF0ZWRcbiAqXG4gKiBSZXN1bHRzIGluOlxuICpcbiAqICQxID0gaHR0cDpcbiAqICQyID0gaHR0cFxuICogJDMgPSAvL3d3dy5pY3MudWNpLmVkdVxuICogJDQgPSB3d3cuaWNzLnVjaS5lZHVcbiAqICQ1ID0gL3B1Yi9pZXRmL3VyaS9cbiAqICQ2ID0gPHVuZGVmaW5lZD5cbiAqICQ3ID0gPHVuZGVmaW5lZD5cbiAqICQ4ID0gI1JlbGF0ZWRcbiAqICQ5ID0gUmVsYXRlZFxuICovXG5jb25zdCB1cmxQYXJzZSA9IC9eKChbXjpcXC8/I10rKTopPyhcXC9cXC8oW15cXC8/I10qKSk/KFtePyNdKikoXFw/KFteI10qKSk/KCMoLiopKT8vO1xuXG5mdW5jdGlvbiBwYXJzZVVybCh1cmxTdHI6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZykge1xuICBjb25zdCB2ZXJpZnlQcm90b2NvbCA9IC9eKChodHRwW3NdP3xmdHApOlxcL1xcLykvO1xuICBsZXQgc2VydmVyQmFzZTogc3RyaW5nfHVuZGVmaW5lZDtcblxuICAvLyBVUkwgY2xhc3MgcmVxdWlyZXMgZnVsbCBVUkwuIElmIHRoZSBVUkwgc3RyaW5nIGRvZXNuJ3Qgc3RhcnQgd2l0aCBwcm90b2NvbCwgd2UgbmVlZCB0byBhZGRcbiAgLy8gYW4gYXJiaXRyYXJ5IGJhc2UgVVJMIHdoaWNoIGNhbiBiZSByZW1vdmVkIGFmdGVyd2FyZC5cbiAgaWYgKCF2ZXJpZnlQcm90b2NvbC50ZXN0KHVybFN0cikpIHtcbiAgICBzZXJ2ZXJCYXNlID0gJ2h0dHA6Ly9lbXB0eS5jb20vJztcbiAgfVxuICBsZXQgcGFyc2VkVXJsOiB7XG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBob3N0bmFtZTogc3RyaW5nLFxuICAgIHBvcnQ6IHN0cmluZyxcbiAgICBwYXRobmFtZTogc3RyaW5nLFxuICAgIHNlYXJjaDogc3RyaW5nLFxuICAgIGhhc2g6IHN0cmluZ1xuICB9O1xuICB0cnkge1xuICAgIHBhcnNlZFVybCA9IG5ldyBVUkwodXJsU3RyLCBzZXJ2ZXJCYXNlKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGNvbnN0IHJlc3VsdCA9IHVybFBhcnNlLmV4ZWMoc2VydmVyQmFzZSB8fCAnJyArIHVybFN0cik7XG4gICAgaWYgKCFyZXN1bHQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBVUkw6ICR7dXJsU3RyfSB3aXRoIGJhc2U6ICR7YmFzZUhyZWZ9YCk7XG4gICAgfVxuICAgIGNvbnN0IGhvc3RTcGxpdCA9IHJlc3VsdFs0XS5zcGxpdCgnOicpO1xuICAgIHBhcnNlZFVybCA9IHtcbiAgICAgIHByb3RvY29sOiByZXN1bHRbMV0sXG4gICAgICBob3N0bmFtZTogaG9zdFNwbGl0WzBdLFxuICAgICAgcG9ydDogaG9zdFNwbGl0WzFdIHx8ICcnLFxuICAgICAgcGF0aG5hbWU6IHJlc3VsdFs1XSxcbiAgICAgIHNlYXJjaDogcmVzdWx0WzZdLFxuICAgICAgaGFzaDogcmVzdWx0WzhdLFxuICAgIH07XG4gIH1cbiAgaWYgKHBhcnNlZFVybC5wYXRobmFtZSAmJiBwYXJzZWRVcmwucGF0aG5hbWUuaW5kZXhPZihiYXNlSHJlZikgPT09IDApIHtcbiAgICBwYXJzZWRVcmwucGF0aG5hbWUgPSBwYXJzZWRVcmwucGF0aG5hbWUuc3Vic3RyaW5nKGJhc2VIcmVmLmxlbmd0aCk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBob3N0bmFtZTogIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLmhvc3RuYW1lIHx8ICcnLFxuICAgIHByb3RvY29sOiAhc2VydmVyQmFzZSAmJiBwYXJzZWRVcmwucHJvdG9jb2wgfHwgJycsXG4gICAgcG9ydDogIXNlcnZlckJhc2UgJiYgcGFyc2VkVXJsLnBvcnQgfHwgJycsXG4gICAgcGF0aG5hbWU6IHBhcnNlZFVybC5wYXRobmFtZSB8fCAnLycsXG4gICAgc2VhcmNoOiBwYXJzZWRVcmwuc2VhcmNoIHx8ICcnLFxuICAgIGhhc2g6IHBhcnNlZFVybC5oYXNoIHx8ICcnLFxuICB9O1xufVxuXG4vKipcbiAqIE1vY2sgcGxhdGZvcm0gbG9jYXRpb24gY29uZmlnXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgaW50ZXJmYWNlIE1vY2tQbGF0Zm9ybUxvY2F0aW9uQ29uZmlnIHtcbiAgc3RhcnRVcmw/OiBzdHJpbmc7XG4gIGFwcEJhc2VIcmVmPzogc3RyaW5nO1xufVxuXG4vKipcbiAqIFByb3ZpZGVyIGZvciBtb2NrIHBsYXRmb3JtIGxvY2F0aW9uIGNvbmZpZ1xuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGNvbnN0IE1PQ0tfUExBVEZPUk1fTE9DQVRJT05fQ09ORklHID1cbiAgICBuZXcgSW5qZWN0aW9uVG9rZW48TW9ja1BsYXRmb3JtTG9jYXRpb25Db25maWc+KCdNT0NLX1BMQVRGT1JNX0xPQ0FUSU9OX0NPTkZJRycpO1xuXG4vKipcbiAqIE1vY2sgaW1wbGVtZW50YXRpb24gb2YgVVJMIHN0YXRlLlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE1vY2tQbGF0Zm9ybUxvY2F0aW9uIGltcGxlbWVudHMgUGxhdGZvcm1Mb2NhdGlvbiB7XG4gIHByaXZhdGUgYmFzZUhyZWY6IHN0cmluZyA9ICcnO1xuICBwcml2YXRlIGhhc2hVcGRhdGUgPSBuZXcgU3ViamVjdDxMb2NhdGlvbkNoYW5nZUV2ZW50PigpO1xuICBwcml2YXRlIHBvcFN0YXRlU3ViamVjdCA9IG5ldyBTdWJqZWN0PExvY2F0aW9uQ2hhbmdlRXZlbnQ+KCk7XG4gIHByaXZhdGUgdXJsQ2hhbmdlSW5kZXg6IG51bWJlciA9IDA7XG4gIHByaXZhdGUgdXJsQ2hhbmdlczoge1xuICAgIGhvc3RuYW1lOiBzdHJpbmcsXG4gICAgcHJvdG9jb2w6IHN0cmluZyxcbiAgICBwb3J0OiBzdHJpbmcsXG4gICAgcGF0aG5hbWU6IHN0cmluZyxcbiAgICBzZWFyY2g6IHN0cmluZyxcbiAgICBoYXNoOiBzdHJpbmcsXG4gICAgc3RhdGU6IHVua25vd25cbiAgfVtdID0gW3tob3N0bmFtZTogJycsIHByb3RvY29sOiAnJywgcG9ydDogJycsIHBhdGhuYW1lOiAnLycsIHNlYXJjaDogJycsIGhhc2g6ICcnLCBzdGF0ZTogbnVsbH1dO1xuXG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTU9DS19QTEFURk9STV9MT0NBVElPTl9DT05GSUcpIEBPcHRpb25hbCgpIGNvbmZpZz86XG4gICAgICAgICAgICAgICAgICBNb2NrUGxhdGZvcm1Mb2NhdGlvbkNvbmZpZykge1xuICAgIGlmIChjb25maWcpIHtcbiAgICAgIHRoaXMuYmFzZUhyZWYgPSBjb25maWcuYXBwQmFzZUhyZWYgfHwgJyc7XG5cbiAgICAgIGNvbnN0IHBhcnNlZENoYW5nZXMgPVxuICAgICAgICAgIHRoaXMucGFyc2VDaGFuZ2VzKG51bGwsIGNvbmZpZy5zdGFydFVybCB8fCAnaHR0cDovL19lbXB0eV8vJywgdGhpcy5iYXNlSHJlZik7XG4gICAgICB0aGlzLnVybENoYW5nZXNbMF0gPSB7Li4ucGFyc2VkQ2hhbmdlc307XG4gICAgfVxuICB9XG5cbiAgZ2V0IGhvc3RuYW1lKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0uaG9zdG5hbWU7XG4gIH1cbiAgZ2V0IHByb3RvY29sKCkge1xuICAgIHJldHVybiB0aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0ucHJvdG9jb2w7XG4gIH1cbiAgZ2V0IHBvcnQoKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5wb3J0O1xuICB9XG4gIGdldCBwYXRobmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnBhdGhuYW1lO1xuICB9XG4gIGdldCBzZWFyY2goKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5zZWFyY2g7XG4gIH1cbiAgZ2V0IGhhc2goKSB7XG4gICAgcmV0dXJuIHRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XS5oYXNoO1xuICB9XG4gIGdldCBzdGF0ZSgpIHtcbiAgICByZXR1cm4gdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdLnN0YXRlO1xuICB9XG5cblxuICBnZXRCYXNlSHJlZkZyb21ET00oKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5iYXNlSHJlZjtcbiAgfVxuXG4gIG9uUG9wU3RhdGUoZm46IExvY2F0aW9uQ2hhbmdlTGlzdGVuZXIpOiBWb2lkRnVuY3Rpb24ge1xuICAgIGNvbnN0IHN1YnNjcmlwdGlvbiA9IHRoaXMucG9wU3RhdGVTdWJqZWN0LnN1YnNjcmliZShmbik7XG4gICAgcmV0dXJuICgpID0+IHN1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICB9XG5cbiAgb25IYXNoQ2hhbmdlKGZuOiBMb2NhdGlvbkNoYW5nZUxpc3RlbmVyKTogVm9pZEZ1bmN0aW9uIHtcbiAgICBjb25zdCBzdWJzY3JpcHRpb24gPSB0aGlzLmhhc2hVcGRhdGUuc3Vic2NyaWJlKGZuKTtcbiAgICByZXR1cm4gKCkgPT4gc3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gIH1cblxuICBnZXQgaHJlZigpOiBzdHJpbmcge1xuICAgIGxldCB1cmwgPSBgJHt0aGlzLnByb3RvY29sfS8vJHt0aGlzLmhvc3RuYW1lfSR7dGhpcy5wb3J0ID8gJzonICsgdGhpcy5wb3J0IDogJyd9YDtcbiAgICB1cmwgKz0gYCR7dGhpcy5wYXRobmFtZSA9PT0gJy8nID8gJycgOiB0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDtcbiAgICByZXR1cm4gdXJsO1xuICB9XG5cbiAgZ2V0IHVybCgpOiBzdHJpbmcge1xuICAgIHJldHVybiBgJHt0aGlzLnBhdGhuYW1lfSR7dGhpcy5zZWFyY2h9JHt0aGlzLmhhc2h9YDtcbiAgfVxuXG4gIHByaXZhdGUgcGFyc2VDaGFuZ2VzKHN0YXRlOiB1bmtub3duLCB1cmw6IHN0cmluZywgYmFzZUhyZWY6IHN0cmluZyA9ICcnKSB7XG4gICAgLy8gV2hlbiB0aGUgYGhpc3Rvcnkuc3RhdGVgIHZhbHVlIGlzIHN0b3JlZCwgaXQgaXMgYWx3YXlzIGNvcGllZC5cbiAgICBzdGF0ZSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoc3RhdGUpKTtcbiAgICByZXR1cm4gey4uLnBhcnNlVXJsKHVybCwgYmFzZUhyZWYpLCBzdGF0ZX07XG4gIH1cblxuICByZXBsYWNlU3RhdGUoc3RhdGU6IGFueSwgdGl0bGU6IHN0cmluZywgbmV3VXJsOiBzdHJpbmcpOiB2b2lkIHtcbiAgICBjb25zdCB7cGF0aG5hbWUsIHNlYXJjaCwgc3RhdGU6IHBhcnNlZFN0YXRlLCBoYXNofSA9IHRoaXMucGFyc2VDaGFuZ2VzKHN0YXRlLCBuZXdVcmwpO1xuXG4gICAgdGhpcy51cmxDaGFuZ2VzW3RoaXMudXJsQ2hhbmdlSW5kZXhdID1cbiAgICAgICAgey4uLnRoaXMudXJsQ2hhbmdlc1t0aGlzLnVybENoYW5nZUluZGV4XSwgcGF0aG5hbWUsIHNlYXJjaCwgaGFzaCwgc3RhdGU6IHBhcnNlZFN0YXRlfTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCBuZXdVcmw6IHN0cmluZyk6IHZvaWQge1xuICAgIGNvbnN0IHtwYXRobmFtZSwgc2VhcmNoLCBzdGF0ZTogcGFyc2VkU3RhdGUsIGhhc2h9ID0gdGhpcy5wYXJzZUNoYW5nZXMoc3RhdGUsIG5ld1VybCk7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLnVybENoYW5nZXMuc3BsaWNlKHRoaXMudXJsQ2hhbmdlSW5kZXggKyAxKTtcbiAgICB9XG4gICAgdGhpcy51cmxDaGFuZ2VzLnB1c2goXG4gICAgICAgIHsuLi50aGlzLnVybENoYW5nZXNbdGhpcy51cmxDaGFuZ2VJbmRleF0sIHBhdGhuYW1lLCBzZWFyY2gsIGhhc2gsIHN0YXRlOiBwYXJzZWRTdGF0ZX0pO1xuICAgIHRoaXMudXJsQ2hhbmdlSW5kZXggPSB0aGlzLnVybENoYW5nZXMubGVuZ3RoIC0gMTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7XG4gICAgY29uc3Qgb2xkVXJsID0gdGhpcy51cmw7XG4gICAgY29uc3Qgb2xkSGFzaCA9IHRoaXMuaGFzaDtcbiAgICBpZiAodGhpcy51cmxDaGFuZ2VJbmRleCA8IHRoaXMudXJsQ2hhbmdlcy5sZW5ndGgpIHtcbiAgICAgIHRoaXMudXJsQ2hhbmdlSW5kZXgrKztcbiAgICB9XG4gICAgdGhpcy5lbWl0RXZlbnRzKG9sZEhhc2gsIG9sZFVybCk7XG4gIH1cblxuICBiYWNrKCk6IHZvaWQge1xuICAgIGNvbnN0IG9sZFVybCA9IHRoaXMudXJsO1xuICAgIGNvbnN0IG9sZEhhc2ggPSB0aGlzLmhhc2g7XG4gICAgaWYgKHRoaXMudXJsQ2hhbmdlSW5kZXggPiAwKSB7XG4gICAgICB0aGlzLnVybENoYW5nZUluZGV4LS07XG4gICAgfVxuICAgIHRoaXMuZW1pdEV2ZW50cyhvbGRIYXNoLCBvbGRVcmwpO1xuICB9XG5cbiAgaGlzdG9yeUdvKHJlbGF0aXZlUG9zaXRpb246IG51bWJlciA9IDApOiB2b2lkIHtcbiAgICBjb25zdCBvbGRVcmwgPSB0aGlzLnVybDtcbiAgICBjb25zdCBvbGRIYXNoID0gdGhpcy5oYXNoO1xuICAgIGNvbnN0IG5leHRQYWdlSW5kZXggPSB0aGlzLnVybENoYW5nZUluZGV4ICsgcmVsYXRpdmVQb3NpdGlvbjtcbiAgICBpZiAobmV4dFBhZ2VJbmRleCA+PSAwICYmIG5leHRQYWdlSW5kZXggPCB0aGlzLnVybENoYW5nZXMubGVuZ3RoKSB7XG4gICAgICB0aGlzLnVybENoYW5nZUluZGV4ID0gbmV4dFBhZ2VJbmRleDtcbiAgICB9XG4gICAgdGhpcy5lbWl0RXZlbnRzKG9sZEhhc2gsIG9sZFVybCk7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBCcm93c2VycyBhcmUgaW5jb25zaXN0ZW50IGluIHdoZW4gdGhleSBmaXJlIGV2ZW50cyBhbmQgcGVyZm9ybSB0aGUgc3RhdGUgdXBkYXRlc1xuICAgKiBUaGUgbW9zdCBlYXNpZXN0IHRoaW5nIHRvIGRvIGluIG91ciBtb2NrIGlzIHN5bmNocm9ub3VzIGFuZCB0aGF0IGhhcHBlbnMgdG8gbWF0Y2hcbiAgICogRmlyZWZveCBhbmQgQ2hyb21lLCBhdCBsZWFzdCBzb21ld2hhdCBjbG9zZWx5XG4gICAqXG4gICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9XSUNHL25hdmlnYXRpb24tYXBpI3dhdGNoaW5nLWZvci1uYXZpZ2F0aW9uc1xuICAgKiBodHRwczovL2RvY3MuZ29vZ2xlLmNvbS9kb2N1bWVudC9kLzFQZHZlLURKMUpDR2lsajlZcWY1SHhSSnlCS1NlbDVvd2dPdlVKcVRhdXdVL2VkaXQjaGVhZGluZz1oLjN5ZTR2NzF3c3o5NFxuICAgKiBwb3BzdGF0ZSBpcyBhbHdheXMgc2VudCBiZWZvcmUgaGFzaGNoYW5nZTpcbiAgICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQVBJL1dpbmRvdy9wb3BzdGF0ZV9ldmVudCN3aGVuX3BvcHN0YXRlX2lzX3NlbnRcbiAgICovXG4gIHByaXZhdGUgZW1pdEV2ZW50cyhvbGRIYXNoOiBzdHJpbmcsIG9sZFVybDogc3RyaW5nKSB7XG4gICAgdGhpcy5wb3BTdGF0ZVN1YmplY3QubmV4dChcbiAgICAgICAge3R5cGU6ICdwb3BzdGF0ZScsIHN0YXRlOiB0aGlzLmdldFN0YXRlKCksIG9sZFVybCwgbmV3VXJsOiB0aGlzLnVybH0gYXNcbiAgICAgICAgTG9jYXRpb25DaGFuZ2VFdmVudCk7XG4gICAgaWYgKG9sZEhhc2ggIT09IHRoaXMuaGFzaCkge1xuICAgICAgdGhpcy5oYXNoVXBkYXRlLm5leHQoXG4gICAgICAgICAge3R5cGU6ICdoYXNoY2hhbmdlJywgc3RhdGU6IG51bGwsIG9sZFVybCwgbmV3VXJsOiB0aGlzLnVybH0gYXMgTG9jYXRpb25DaGFuZ2VFdmVudCk7XG4gICAgfVxuICB9XG59XG4iXX0=