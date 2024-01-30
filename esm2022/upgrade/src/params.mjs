/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * A codec for encoding and decoding URL parts.
 *
 * @publicApi
 **/
export class UrlCodec {
}
/**
 * A `UrlCodec` that uses logic from AngularJS to serialize and parse URLs
 * and URL parameters.
 *
 * @publicApi
 */
export class AngularJSUrlCodec {
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L15
    encodePath(path) {
        const segments = path.split('/');
        let i = segments.length;
        while (i--) {
            // decode forward slashes to prevent them from being double encoded
            segments[i] = encodeUriSegment(segments[i].replace(/%2F/g, '/'));
        }
        path = segments.join('/');
        return _stripIndexHtml(((path && path[0] !== '/' && '/') || '') + path);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L42
    encodeSearch(search) {
        if (typeof search === 'string') {
            search = parseKeyValue(search);
        }
        search = toKeyValue(search);
        return search ? '?' + search : '';
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L44
    encodeHash(hash) {
        hash = encodeUriSegment(hash);
        return hash ? '#' + hash : '';
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L27
    decodePath(path, html5Mode = true) {
        const segments = path.split('/');
        let i = segments.length;
        while (i--) {
            segments[i] = decodeURIComponent(segments[i]);
            if (html5Mode) {
                // encode forward slashes to prevent them from being mistaken for path separators
                segments[i] = segments[i].replace(/\//g, '%2F');
            }
        }
        return segments.join('/');
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L72
    decodeSearch(search) {
        return parseKeyValue(search);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/location.js#L73
    decodeHash(hash) {
        hash = decodeURIComponent(hash);
        return hash[0] === '#' ? hash.substring(1) : hash;
    }
    normalize(pathOrHref, search, hash, baseUrl) {
        if (arguments.length === 1) {
            const parsed = this.parse(pathOrHref, baseUrl);
            if (typeof parsed === 'string') {
                return parsed;
            }
            const serverUrl = `${parsed.protocol}://${parsed.hostname}${parsed.port ? ':' + parsed.port : ''}`;
            return this.normalize(this.decodePath(parsed.pathname), this.decodeSearch(parsed.search), this.decodeHash(parsed.hash), serverUrl);
        }
        else {
            const encPath = this.encodePath(pathOrHref);
            const encSearch = (search && this.encodeSearch(search)) || '';
            const encHash = (hash && this.encodeHash(hash)) || '';
            let joinedPath = (baseUrl || '') + encPath;
            if (!joinedPath.length || joinedPath[0] !== '/') {
                joinedPath = '/' + joinedPath;
            }
            return joinedPath + encSearch + encHash;
        }
    }
    areEqual(valA, valB) {
        return this.normalize(valA) === this.normalize(valB);
    }
    // https://github.com/angular/angular.js/blob/864c7f0/src/ng/urlUtils.js#L60
    parse(url, base) {
        try {
            // Safari 12 throws an error when the URL constructor is called with an undefined base.
            const parsed = !base ? new URL(url) : new URL(url, base);
            return {
                href: parsed.href,
                protocol: parsed.protocol ? parsed.protocol.replace(/:$/, '') : '',
                host: parsed.host,
                search: parsed.search ? parsed.search.replace(/^\?/, '') : '',
                hash: parsed.hash ? parsed.hash.replace(/^#/, '') : '',
                hostname: parsed.hostname,
                port: parsed.port,
                pathname: parsed.pathname.charAt(0) === '/' ? parsed.pathname : '/' + parsed.pathname,
            };
        }
        catch (e) {
            throw new Error(`Invalid URL (${url}) with base (${base})`);
        }
    }
}
function _stripIndexHtml(url) {
    return url.replace(/\/index.html$/, '');
}
/**
 * Tries to decode the URI component without throwing an exception.
 *
 * @param str value potential URI component to check.
 * @returns the decoded URI if it can be decoded or else `undefined`.
 */
function tryDecodeURIComponent(value) {
    try {
        return decodeURIComponent(value);
    }
    catch (e) {
        // Ignore any invalid uri component.
        return undefined;
    }
}
/**
 * Parses an escaped url query string into key-value pairs. Logic taken from
 * https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1382
 */
function parseKeyValue(keyValue) {
    const obj = {};
    (keyValue || '').split('&').forEach((keyValue) => {
        let splitPoint, key, val;
        if (keyValue) {
            key = keyValue = keyValue.replace(/\+/g, '%20');
            splitPoint = keyValue.indexOf('=');
            if (splitPoint !== -1) {
                key = keyValue.substring(0, splitPoint);
                val = keyValue.substring(splitPoint + 1);
            }
            key = tryDecodeURIComponent(key);
            if (typeof key !== 'undefined') {
                val = typeof val !== 'undefined' ? tryDecodeURIComponent(val) : true;
                if (!obj.hasOwnProperty(key)) {
                    obj[key] = val;
                }
                else if (Array.isArray(obj[key])) {
                    obj[key].push(val);
                }
                else {
                    obj[key] = [obj[key], val];
                }
            }
        }
    });
    return obj;
}
/**
 * Serializes into key-value pairs. Logic taken from
 * https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1409
 */
function toKeyValue(obj) {
    const parts = [];
    for (const key in obj) {
        let value = obj[key];
        if (Array.isArray(value)) {
            value.forEach((arrayValue) => {
                parts.push(encodeUriQuery(key, true) +
                    (arrayValue === true ? '' : '=' + encodeUriQuery(arrayValue, true)));
            });
        }
        else {
            parts.push(encodeUriQuery(key, true) +
                (value === true ? '' : '=' + encodeUriQuery(value, true)));
        }
    }
    return parts.length ? parts.join('&') : '';
}
/**
 * We need our custom method because encodeURIComponent is too aggressive and doesn't follow
 * https://tools.ietf.org/html/rfc3986 with regards to the character set (pchar) allowed in path
 * segments:
 *    segment       = *pchar
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 *
 * Logic from https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1437
 */
function encodeUriSegment(val) {
    return encodeUriQuery(val, true).replace(/%26/g, '&').replace(/%3D/gi, '=').replace(/%2B/gi, '+');
}
/**
 * This method is intended for encoding *key* or *value* parts of query component. We need a custom
 * method because encodeURIComponent is too aggressive and encodes stuff that doesn't have to be
 * encoded per https://tools.ietf.org/html/rfc3986:
 *    query         = *( pchar / "/" / "?" )
 *    pchar         = unreserved / pct-encoded / sub-delims / ":" / "@"
 *    unreserved    = ALPHA / DIGIT / "-" / "." / "_" / "~"
 *    pct-encoded   = "%" HEXDIG HEXDIG
 *    sub-delims    = "!" / "$" / "&" / "'" / "(" / ")"
 *                     / "*" / "+" / "," / ";" / "="
 *
 * Logic from https://github.com/angular/angular.js/blob/864c7f0/src/Angular.js#L1456
 */
function encodeUriQuery(val, pctEncodeSpaces = false) {
    return encodeURIComponent(val)
        .replace(/%40/g, '@')
        .replace(/%3A/gi, ':')
        .replace(/%24/g, '$')
        .replace(/%2C/gi, ',')
        .replace(/%3B/gi, ';')
        .replace(/%20/g, pctEncodeSpaces ? '%20' : '+');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyYW1zLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3VwZ3JhZGUvc3JjL3BhcmFtcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSDs7OztJQUlJO0FBQ0osTUFBTSxPQUFnQixRQUFRO0NBMkY3QjtBQUVEOzs7OztHQUtHO0FBQ0gsTUFBTSxPQUFPLGlCQUFpQjtJQUM1Qiw0RUFBNEU7SUFDNUUsVUFBVSxDQUFDLElBQVk7UUFDckIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNqQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDO1FBRXhCLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQztZQUNYLG1FQUFtRTtZQUNuRSxRQUFRLENBQUMsQ0FBQyxDQUFDLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNuRSxDQUFDO1FBRUQsSUFBSSxHQUFHLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDMUIsT0FBTyxlQUFlLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQzFFLENBQUM7SUFFRCw0RUFBNEU7SUFDNUUsWUFBWSxDQUFDLE1BQXVDO1FBQ2xELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDL0IsTUFBTSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUNqQyxDQUFDO1FBRUQsTUFBTSxHQUFHLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUM1QixPQUFPLE1BQU0sQ0FBQyxD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QyxPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDcEcsQ0FBQztBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILFNBQVMsY0FBYyxDQUFDLEdBQVcsRUFBRSxrQkFBMkIsS0FBSztJQUNuRSxPQUFPLGtCQUFrQixDQUFDLEdBQUcsQ0FBQztTQUMzQixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztTQUNwQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztTQUNyQixPQUFPLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztTQUNwQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztTQUNyQixPQUFPLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQztTQUNyQixPQUFPLENBQUMsTUFBTSxFQUFFLGVBQWUsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUNwRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8qKlxuICogQSBjb2RlYyBmb3IgZW5jb2RpbmcgYW5kIGRlY29kaW5nIFVSTCBwYXJ0cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiovXG5leHBvcnQgYWJzdHJhY3QgY2xhc3MgVXJsQ29kZWMge1xuICAvKipcbiAgICogRW5jb2RlcyB0aGUgcGF0aCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIHBhdGggc3RyaW5nXG4gICAqL1xuICBhYnN0cmFjdCBlbmNvZGVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZztcblxuICAvKipcbiAgICogRGVjb2RlcyB0aGUgcGF0aCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIHBhdGggc3RyaW5nXG4gICAqL1xuICBhYnN0cmFjdCBkZWNvZGVQYXRoKHBhdGg6IHN0cmluZyk6IHN0cmluZztcblxuICAvKipcbiAgICogRW5jb2RlcyB0aGUgc2VhcmNoIHN0cmluZyBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmcgb3Igb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBwYXRoIHN0cmluZyBvciBvYmplY3RcbiAgICovXG4gIGFic3RyYWN0IGVuY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZyB8IHtbazogc3RyaW5nXTogdW5rbm93bn0pOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIHNlYXJjaCBvYmplY3RzIGZyb20gdGhlIHByb3ZpZGVkIHN0cmluZ1xuICAgKlxuICAgKiBAcGFyYW0gcGF0aCBUaGUgcGF0aCBzdHJpbmdcbiAgICovXG4gIGFic3RyYWN0IGRlY29kZVNlYXJjaChzZWFyY2g6IHN0cmluZyk6IHtbazogc3RyaW5nXTogdW5rbm93bn07XG5cbiAgLyoqXG4gICAqIEVuY29kZXMgdGhlIGhhc2ggZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBoYXNoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZW5jb2RlSGFzaChoYXNoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIERlY29kZXMgdGhlIGhhc2ggZnJvbSB0aGUgcHJvdmlkZWQgc3RyaW5nXG4gICAqXG4gICAqIEBwYXJhbSBwYXRoIFRoZSBoYXNoIHN0cmluZ1xuICAgKi9cbiAgYWJzdHJhY3QgZGVjb2RlSGFzaChoYXNoOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIFVSTCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmdcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIFVSTCBzdHJpbmdcbiAgICovXG4gIGFic3RyYWN0IG5vcm1hbGl6ZShocmVmOiBzdHJpbmcpOiBzdHJpbmc7XG5cbiAgLyoqXG4gICAqIE5vcm1hbGl6ZXMgdGhlIFVSTCBmcm9tIHRoZSBwcm92aWRlZCBzdHJpbmcsIHNlYXJjaCwgaGFzaCwgYW5kIGJhc2UgVVJMIHBhcmFtZXRlcnNcbiAgICpcbiAgICogQHBhcmFtIHBhdGggVGhlIFVSTCBwYXRoXG4gICAqIEBwYXJhbSBzZWFyY2ggVGhlIHNlYXJjaCBvYmplY3RcbiAgICogQHBhcmFtIGhhc2ggVGhlIGhhcyBzdHJpbmdcbiAgICogQHBhcmFtIGJhc2VVcmwgVGhlIGJhc2UgVVJMIGZvciB0aGUgVVJMXG4gICAqL1xuICBhYnN0cmFjdCBub3JtYWxpemUoXG4gICAgcGF0aDogc3RyaW5nLFxuICAgIHNlYXJjaDoge1trOiBzdHJpbmddOiB1bmtub3dufSxcbiAgICBoYXNoOiBzdHJpbmcsXG4gICAgYmFzZVVybD86IHN0cmluZyxcbiAgKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBDaGVja3Mgd2hldGhlciB0aGUgdHdvIHN0cmluZ3MgYXJlIGVxdWFsXG4gICAqIEBwYXJhbSB2YWxBIEZpcnN0IHN0cmluZyBmb3IgY29tcGFyaXNvblxuICAgKiBAcGFyYW0gdmFsQiBTZWNvbmQgc3RyaW5nIGZvciBjb21wYXJpc29uXG4gICAqL1xuICBhYnN0cmFjdCBhcmVFcXVhbCh2YWxBOiBzdHJpbmcsIHZhbEI6IHN0cmluZyk6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFBhcnNlcyB0aGUgVVJMIHN0cmluZyBiYXNlZCBvbiB0aGUgYmFzZSBVUkxcbiAgICpcbiAgICogQHBhcmFtIHVybCBUaGUgZnVsbCBVUkwgc3RyaW5nXG4gICAqIEBwYXJhbSBiYXNlIFRoZSBiYXNlIGZvciB0aGUgVVJMXG4gICAqL1xuICBhYnN0cmFjdCBwYXJzZShcbiAgICB1cmw6IHN0cmluZyxcbiAgICBiYXNlPzogc3RyaW5nLFxuICApOiB7XG4gICAgaHJlZjogc3RyaW5nO1xuICAgIHByb3RvY29sOiBzdHJpbmc7XG4gICAgaG9zdDogc3RyaW5nO1xuICAgIHNlYXJjaDogc3RyaW5nO1xuICAgIGhhc2g6IHN0cmluZztcbiAgICBob3N0bmFtZTogc3RyaW5nO1xuICAgIHBvcnQ6IHN0cmluZztcbiAgICBwYXRobmFtZTogc3RyaW5nO1xuICB9O1xufVxuXG4vKipcbiAqIEEgYFVybENvZGVjYCB0aGF0IHVzZXMgbG9naWMgZnJvbSBBbmd1bGFySlMgdG8gc2VyaWFsaXplIGFuZCBwYXJzZSBVUkxzXG4gKiBhbmQgVVJMIHBhcmFtZXRlcnMuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY2xhc3MgQW5ndWxhckpTVXJsQ29kZWMgaW1wbGVtZW50cyBVcmxDb2RlYyB7XG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMMTVcbiAgZW5jb2RlUGF0aChwYXRoOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIGNvbnN0IHNlZ21lbnRzID0gcGF0aC5zcGxpdCgnLycpO1xuICAgIGxldCBpID0gc2VnbWVudHMubGVuZ3RoO1xuXG4gICAgd2hpbGUgKGktLSkge1xuICAgICAgLy8gZGVjb2RlIGZvcndhcmQgc2xhc2hlcyB0byBwcmV2ZW50IHRoZW0gZnJvbSBiZWluZyBkb3VibGUgZW5jb2RlZFxuICAgICAgc2VnbWVudHNbaV0gPSBlbmNvZGVVcmlTZWdtZW50KHNlZ21lbnRzW2ldLnJlcGxhY2UoLyUyRi9nLCAnLycpKTtcbiAgICB9XG5cbiAgICBwYXRoID0gc2VnbWVudHMuam9pbignLycpO1xuICAgIHJldHVybiBfc3RyaXBJbmRleEh0bWwoKChwYXRoICYmIHBhdGhbMF0gIT09ICcvJyAmJiAnLycpIHx8ICcnKSArIHBhdGgpO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w0MlxuICBlbmNvZGVTZWFyY2goc2VhcmNoOiBzdHJpbmcgfCB7W2s6IHN0cmluZ106IHVua25vd259KTogc3RyaW5nIHtcbiAgICBpZiAodHlwZW9mIHNlYXJjaCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIHNlYXJjaCA9IHBhcnNlS2V5VmFsdWUoc2VhcmNoKTtcbiAgICB9XG5cbiAgICBzZWFyY2ggPSB0b0tleVZhbHVlKHNlYXJjaCk7XG4gICAgcmV0dXJuIHNlYXJjaCA/ICc/JyArIHNlYXJjaCA6ICcnO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0w0NFxuICBlbmNvZGVIYXNoKGhhc2g6IHN0cmluZykge1xuICAgIGhhc2ggPSBlbmNvZGVVcmlTZWdtZW50KGhhc2gpO1xuICAgIHJldHVybiBoYXNoID8gJyMnICsgaGFzaCA6ICcnO1xuICB9XG5cbiAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvYW5ndWxhci5qcy9ibG9iLzg2NGM3ZjAvc3JjL25nL2xvY2F0aW9uLmpzI0wyN1xuICBkZWNvZGVQYXRoKHBhdGg6IHN0cmluZywgaHRtbDVNb2RlID0gdHJ1ZSk6IHN0cmluZyB7XG4gICAgY29uc3Qgc2VnbWVudHMgPSBwYXRoLnNwbGl0KCcvJyk7XG4gICAgbGV0IGkgPSBzZWdtZW50cy5sZW5ndGg7XG5cbiAgICB3aGlsZSAoaS0tKSB7XG4gICAgICBzZWdtZW50c1tpXSA9IGRlY29kZVVSSUNvbXBvbmVudChzZWdtZW50c1tpXSk7XG4gICAgICBpZiAoaHRtbDVNb2RlKSB7XG4gICAgICAgIC8vIGVuY29kZSBmb3J3YXJkIHNsYXNoZXMgdG8gcHJldmVudCB0aGVtIGZyb20gYmVpbmcgbWlzdGFrZW4gZm9yIHBhdGggc2VwYXJhdG9yc1xuICAgICAgICBzZWdtZW50c1tpXSA9IHNlZ21lbnRzW2ldLnJlcGxhY2UoL1xcLy9nLCAnJTJGJyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlZ21lbnRzLmpvaW4oJy8nKTtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNzJcbiAgZGVjb2RlU2VhcmNoKHNlYXJjaDogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHBhcnNlS2V5VmFsdWUoc2VhcmNoKTtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy9sb2NhdGlvbi5qcyNMNzNcbiAgZGVjb2RlSGFzaChoYXNoOiBzdHJpbmcpIHtcbiAgICBoYXNoID0gZGVjb2RlVVJJQ29tcG9uZW50KGhhc2gpO1xuICAgIHJldHVybiBoYXNoWzBdID09PSAnIycgPyBoYXNoLnN1YnN0cmluZygxKSA6IGhhc2g7XG4gIH1cblxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDE0OVxuICAvLyBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvbmcvbG9jYXRpb24uanMjTDQyXG4gIG5vcm1hbGl6ZShocmVmOiBzdHJpbmcpOiBzdHJpbmc7XG4gIG5vcm1hbGl6ZShwYXRoOiBzdHJpbmcsIHNlYXJjaDoge1trOiBzdHJpbmddOiB1bmtub3dufSwgaGFzaDogc3RyaW5nLCBiYXNlVXJsPzogc3RyaW5nKTogc3RyaW5nO1xuICBub3JtYWxpemUoXG4gICAgcGF0aE9ySHJlZjogc3RyaW5nLFxuICAgIHNlYXJjaD86IHtbazogc3RyaW5nXTogdW5rbm93bn0sXG4gICAgaGFzaD86IHN0cmluZyxcbiAgICBiYXNlVXJsPzogc3RyaW5nLFxuICApOiBzdHJpbmcge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAxKSB7XG4gICAgICBjb25zdCBwYXJzZWQgPSB0aGlzLnBhcnNlKHBhdGhPckhyZWYsIGJhc2VVcmwpO1xuXG4gICAgICBpZiAodHlwZW9mIHBhcnNlZCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIHBhcnNlZDtcbiAgICAgIH1cblxuICAgICAgY29uc3Qgc2VydmVyVXJsID0gYCR7cGFyc2VkLnByb3RvY29sfTovLyR7cGFyc2VkLmhvc3RuYW1lfSR7XG4gICAgICAgIHBhcnNlZC5wb3J0ID8gJzonICsgcGFyc2VkLnBvcnQgOiAnJ1xuICAgICAgfWA7XG5cbiAgICAgIHJldHVybiB0aGlzLm5vcm1hbGl6ZShcbiAgICAgICAgdGhpcy5kZWNvZGVQYXRoKHBhcnNlZC5wYXRobmFtZSksXG4gICAgICAgIHRoaXMuZGVjb2RlU2VhcmNoKHBhcnNlZC5zZWFyY2gpLFxuICAgICAgICB0aGlzLmRlY29kZUhhc2gocGFyc2VkLmhhc2gpLFxuICAgICAgICBzZXJ2ZXJVcmwsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBlbmNQYXRoID0gdGhpcy5lbmNvZGVQYXRoKHBhdGhPckhyZWYpO1xuICAgICAgY29uc3QgZW5jU2VhcmNoID0gKHNlYXJjaCAmJiB0aGlzLmVuY29kZVNlYXJjaChzZWFyY2gpKSB8fCAnJztcbiAgICAgIGNvbnN0IGVuY0hhc2ggPSAoaGFzaCAmJiB0aGlzLmVuY29kZUhhc2goaGFzaCkpIHx8ICcnO1xuXG4gICAgICBsZXQgam9pbmVkUGF0aCA9IChiYXNlVXJsIHx8ICcnKSArIGVuY1BhdGg7XG5cbiAgICAgIGlmICgham9pbmVkUGF0aC5sZW5ndGggfHwgam9pbmVkUGF0aFswXSAhPT0gJy8nKSB7XG4gICAgICAgIGpvaW5lZFBhdGggPSAnLycgKyBqb2luZWRQYXRoO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGpvaW5lZFBhdGggKyBlbmNTZWFyY2ggKyBlbmNIYXNoO1xuICAgIH1cbiAgfVxuXG4gIGFyZUVxdWFsKHZhbEE6IHN0cmluZywgdmFsQjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHRoaXMubm9ybWFsaXplKHZhbEEpID09PSB0aGlzLm5vcm1hbGl6ZSh2YWxCKTtcbiAgfVxuXG4gIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9uZy91cmxVdGlscy5qcyNMNjBcbiAgcGFyc2UodXJsOiBzdHJpbmcsIGJhc2U/OiBzdHJpbmcpIHtcbiAgICB0cnkge1xuICAgICAgLy8gU2FmYXJpIDEyIHRocm93cyBhbiBlcnJvciB3aGVuIHRoZSBVUkwgY29uc3RydWN0b3IgaXMgY2FsbGVkIHdpdGggYW4gdW5kZWZpbmVkIGJhc2UuXG4gICAgICBjb25zdCBwYXJzZWQgPSAhYmFzZSA/IG5ldyBVUkwodXJsKSA6IG5ldyBVUkwodXJsLCBiYXNlKTtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGhyZWY6IHBhcnNlZC5ocmVmLFxuICAgICAgICBwcm90b2NvbDogcGFyc2VkLnByb3RvY29sID8gcGFyc2VkLnByb3RvY29sLnJlcGxhY2UoLzokLywgJycpIDogJycsXG4gICAgICAgIGhvc3Q6IHBhcnNlZC5ob3N0LFxuICAgICAgICBzZWFyY2g6IHBhcnNlZC5zZWFyY2ggPyBwYXJzZWQuc2VhcmNoLnJlcGxhY2UoL15cXD8vLCAnJykgOiAnJyxcbiAgICAgICAgaGFzaDogcGFyc2VkLmhhc2ggPyBwYXJzZWQuaGFzaC5yZXBsYWNlKC9eIy8sICcnKSA6ICcnLFxuICAgICAgICBob3N0bmFtZTogcGFyc2VkLmhvc3RuYW1lLFxuICAgICAgICBwb3J0OiBwYXJzZWQucG9ydCxcbiAgICAgICAgcGF0aG5hbWU6IHBhcnNlZC5wYXRobmFtZS5jaGFyQXQoMCkgPT09ICcvJyA/IHBhcnNlZC5wYXRobmFtZSA6ICcvJyArIHBhcnNlZC5wYXRobmFtZSxcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIFVSTCAoJHt1cmx9KSB3aXRoIGJhc2UgKCR7YmFzZX0pYCk7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIF9zdHJpcEluZGV4SHRtbCh1cmw6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiB1cmwucmVwbGFjZSgvXFwvaW5kZXguaHRtbCQvLCAnJyk7XG59XG5cbi8qKlxuICogVHJpZXMgdG8gZGVjb2RlIHRoZSBVUkkgY29tcG9uZW50IHdpdGhvdXQgdGhyb3dpbmcgYW4gZXhjZXB0aW9uLlxuICpcbiAqIEBwYXJhbSBzdHIgdmFsdWUgcG90ZW50aWFsIFVSSSBjb21wb25lbnQgdG8gY2hlY2suXG4gKiBAcmV0dXJucyB0aGUgZGVjb2RlZCBVUkkgaWYgaXQgY2FuIGJlIGRlY29kZWQgb3IgZWxzZSBgdW5kZWZpbmVkYC5cbiAqL1xuZnVuY3Rpb24gdHJ5RGVjb2RlVVJJQ29tcG9uZW50KHZhbHVlOiBzdHJpbmcpOiBzdHJpbmcgfCB1bmRlZmluZWQge1xuICB0cnkge1xuICAgIHJldHVybiBkZWNvZGVVUklDb21wb25lbnQodmFsdWUpO1xuICB9IGNhdGNoIChlKSB7XG4gICAgLy8gSWdub3JlIGFueSBpbnZhbGlkIHVyaSBjb21wb25lbnQuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyBhbiBlc2NhcGVkIHVybCBxdWVyeSBzdHJpbmcgaW50byBrZXktdmFsdWUgcGFpcnMuIExvZ2ljIHRha2VuIGZyb21cbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxMzgyXG4gKi9cbmZ1bmN0aW9uIHBhcnNlS2V5VmFsdWUoa2V5VmFsdWU6IHN0cmluZyk6IHtbazogc3RyaW5nXTogdW5rbm93bn0ge1xuICBjb25zdCBvYmo6IHtbazogc3RyaW5nXTogdW5rbm93bn0gPSB7fTtcbiAgKGtleVZhbHVlIHx8ICcnKS5zcGxpdCgnJicpLmZvckVhY2goKGtleVZhbHVlKSA9PiB7XG4gICAgbGV0IHNwbGl0UG9pbnQsIGtleSwgdmFsO1xuICAgIGlmIChrZXlWYWx1ZSkge1xuICAgICAga2V5ID0ga2V5VmFsdWUgPSBrZXlWYWx1ZS5yZXBsYWNlKC9cXCsvZywgJyUyMCcpO1xuICAgICAgc3BsaXRQb2ludCA9IGtleVZhbHVlLmluZGV4T2YoJz0nKTtcbiAgICAgIGlmIChzcGxpdFBvaW50ICE9PSAtMSkge1xuICAgICAgICBrZXkgPSBrZXlWYWx1ZS5zdWJzdHJpbmcoMCwgc3BsaXRQb2ludCk7XG4gICAgICAgIHZhbCA9IGtleVZhbHVlLnN1YnN0cmluZyhzcGxpdFBvaW50ICsgMSk7XG4gICAgICB9XG4gICAgICBrZXkgPSB0cnlEZWNvZGVVUklDb21wb25lbnQoa2V5KTtcbiAgICAgIGlmICh0eXBlb2Yga2V5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB2YWwgPSB0eXBlb2YgdmFsICE9PSAndW5kZWZpbmVkJyA/IHRyeURlY29kZVVSSUNvbXBvbmVudCh2YWwpIDogdHJ1ZTtcbiAgICAgICAgaWYgKCFvYmouaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgIG9ialtrZXldID0gdmFsO1xuICAgICAgICB9IGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqW2tleV0pKSB7XG4gICAgICAgICAgKG9ialtrZXldIGFzIHVua25vd25bXSkucHVzaCh2YWwpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9ialtrZXldID0gW29ialtrZXldLCB2YWxdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIG9iajtcbn1cblxuLyoqXG4gKiBTZXJpYWxpemVzIGludG8ga2V5LXZhbHVlIHBhaXJzLiBMb2dpYyB0YWtlbiBmcm9tXG4gKiBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvQW5ndWxhci5qcyNMMTQwOVxuICovXG5mdW5jdGlvbiB0b0tleVZhbHVlKG9iajoge1trOiBzdHJpbmddOiB1bmtub3dufSkge1xuICBjb25zdCBwYXJ0czogdW5rbm93bltdID0gW107XG4gIGZvciAoY29uc3Qga2V5IGluIG9iaikge1xuICAgIGxldCB2YWx1ZSA9IG9ialtrZXldO1xuICAgIGlmIChBcnJheS5pc0FycmF5KHZhbHVlKSkge1xuICAgICAgdmFsdWUuZm9yRWFjaCgoYXJyYXlWYWx1ZSkgPT4ge1xuICAgICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICAgIGVuY29kZVVyaVF1ZXJ5KGtleSwgdHJ1ZSkgK1xuICAgICAgICAgICAgKGFycmF5VmFsdWUgPT09IHRydWUgPyAnJyA6ICc9JyArIGVuY29kZVVyaVF1ZXJ5KGFycmF5VmFsdWUsIHRydWUpKSxcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYXJ0cy5wdXNoKFxuICAgICAgICBlbmNvZGVVcmlRdWVyeShrZXksIHRydWUpICtcbiAgICAgICAgICAodmFsdWUgPT09IHRydWUgPyAnJyA6ICc9JyArIGVuY29kZVVyaVF1ZXJ5KHZhbHVlIGFzIGFueSwgdHJ1ZSkpLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHBhcnRzLmxlbmd0aCA/IHBhcnRzLmpvaW4oJyYnKSA6ICcnO1xufVxuXG4vKipcbiAqIFdlIG5lZWQgb3VyIGN1c3RvbSBtZXRob2QgYmVjYXVzZSBlbmNvZGVVUklDb21wb25lbnQgaXMgdG9vIGFnZ3Jlc3NpdmUgYW5kIGRvZXNuJ3QgZm9sbG93XG4gKiBodHRwczovL3Rvb2xzLmlldGYub3JnL2h0bWwvcmZjMzk4NiB3aXRoIHJlZ2FyZHMgdG8gdGhlIGNoYXJhY3RlciBzZXQgKHBjaGFyKSBhbGxvd2VkIGluIHBhdGhcbiAqIHNlZ21lbnRzOlxuICogICAgc2VnbWVudCAgICAgICA9ICpwY2hhclxuICogICAgcGNoYXIgICAgICAgICA9IHVucmVzZXJ2ZWQgLyBwY3QtZW5jb2RlZCAvIHN1Yi1kZWxpbXMgLyBcIjpcIiAvIFwiQFwiXG4gKiAgICBwY3QtZW5jb2RlZCAgID0gXCIlXCIgSEVYRElHIEhFWERJR1xuICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICogICAgc3ViLWRlbGltcyAgICA9IFwiIVwiIC8gXCIkXCIgLyBcIiZcIiAvIFwiJ1wiIC8gXCIoXCIgLyBcIilcIlxuICogICAgICAgICAgICAgICAgICAgICAvIFwiKlwiIC8gXCIrXCIgLyBcIixcIiAvIFwiO1wiIC8gXCI9XCJcbiAqXG4gKiBMb2dpYyBmcm9tIGh0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2FuZ3VsYXIuanMvYmxvYi84NjRjN2YwL3NyYy9Bbmd1bGFyLmpzI0wxNDM3XG4gKi9cbmZ1bmN0aW9uIGVuY29kZVVyaVNlZ21lbnQodmFsOiBzdHJpbmcpIHtcbiAgcmV0dXJuIGVuY29kZVVyaVF1ZXJ5KHZhbCwgdHJ1ZSkucmVwbGFjZSgvJTI2L2csICcmJykucmVwbGFjZSgvJTNEL2dpLCAnPScpLnJlcGxhY2UoLyUyQi9naSwgJysnKTtcbn1cblxuLyoqXG4gKiBUaGlzIG1ldGhvZCBpcyBpbnRlbmRlZCBmb3IgZW5jb2RpbmcgKmtleSogb3IgKnZhbHVlKiBwYXJ0cyBvZiBxdWVyeSBjb21wb25lbnQuIFdlIG5lZWQgYSBjdXN0b21cbiAqIG1ldGhvZCBiZWNhdXNlIGVuY29kZVVSSUNvbXBvbmVudCBpcyB0b28gYWdncmVzc2l2ZSBhbmQgZW5jb2RlcyBzdHVmZiB0aGF0IGRvZXNuJ3QgaGF2ZSB0byBiZVxuICogZW5jb2RlZCBwZXIgaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzM5ODY6XG4gKiAgICBxdWVyeSAgICAgICAgID0gKiggcGNoYXIgLyBcIi9cIiAvIFwiP1wiIClcbiAqICAgIHBjaGFyICAgICAgICAgPSB1bnJlc2VydmVkIC8gcGN0LWVuY29kZWQgLyBzdWItZGVsaW1zIC8gXCI6XCIgLyBcIkBcIlxuICogICAgdW5yZXNlcnZlZCAgICA9IEFMUEhBIC8gRElHSVQgLyBcIi1cIiAvIFwiLlwiIC8gXCJfXCIgLyBcIn5cIlxuICogICAgcGN0LWVuY29kZWQgICA9IFwiJVwiIEhFWERJRyBIRVhESUdcbiAqICAgIHN1Yi1kZWxpbXMgICAgPSBcIiFcIiAvIFwiJFwiIC8gXCImXCIgLyBcIidcIiAvIFwiKFwiIC8gXCIpXCJcbiAqICAgICAgICAgICAgICAgICAgICAgLyBcIipcIiAvIFwiK1wiIC8gXCIsXCIgLyBcIjtcIiAvIFwiPVwiXG4gKlxuICogTG9naWMgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9hbmd1bGFyLmpzL2Jsb2IvODY0YzdmMC9zcmMvQW5ndWxhci5qcyNMMTQ1NlxuICovXG5mdW5jdGlvbiBlbmNvZGVVcmlRdWVyeSh2YWw6IHN0cmluZywgcGN0RW5jb2RlU3BhY2VzOiBib29sZWFuID0gZmFsc2UpIHtcbiAgcmV0dXJuIGVuY29kZVVSSUNvbXBvbmVudCh2YWwpXG4gICAgLnJlcGxhY2UoLyU0MC9nLCAnQCcpXG4gICAgLnJlcGxhY2UoLyUzQS9naSwgJzonKVxuICAgIC5yZXBsYWNlKC8lMjQvZywgJyQnKVxuICAgIC5yZXBsYWNlKC8lMkMvZ2ksICcsJylcbiAgICAucmVwbGFjZSgvJTNCL2dpLCAnOycpXG4gICAgLnJlcGxhY2UoLyUyMC9nLCBwY3RFbmNvZGVTcGFjZXMgPyAnJTIwJyA6ICcrJyk7XG59XG4iXX0=