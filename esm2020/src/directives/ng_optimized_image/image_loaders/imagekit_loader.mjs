/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createImageLoader } from './image_loader';
/**
 * Function that generates a built-in ImageLoader for ImageKit
 * and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageKit images
 * This URL should match one of the following formats:
 * https://ik.imagekit.io/myaccount
 * https://subdomain.mysite.com
 * @param options An object that allows to provide extra configuration:
 * - `ensurePreconnect`: boolean flag indicating whether the NgOptimizedImage directive
 *                       should verify that there is a corresponding `<link rel="preconnect">`
 *                       present in the document's `<head>`.
 * @returns Set of providers to configure the ImageKit loader.
 *
 * @publicApi
 * @developerPreview
 */
export const provideImageKitLoader = createImageLoader(createImagekitURL, ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined);
export function createImagekitURL(path, config) {
    // Example of an ImageKit image URL:
    // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
    let params = `tr:q-auto`; // applies the "auto quality" transformation
    if (config.width) {
        params += `,w-${config.width}`;
    }
    return `${path}/${params}/${config.src}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VraXRfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsaUJBQWlCLEVBQW9CLE1BQU0sZ0JBQWdCLENBQUM7QUFFcEU7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQkc7QUFDSCxNQUFNLENBQUMsTUFBTSxxQkFBcUIsR0FBRyxpQkFBaUIsQ0FDbEQsaUJBQWlCLEVBQ2pCLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQywrQkFBK0IsRUFBRSw4QkFBOEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQztBQUUvRixNQUFNLFVBQVUsaUJBQWlCLENBQUMsSUFBWSxFQUFFLE1BQXlCO0lBQ3ZFLG9DQUFvQztJQUNwQyxzRUFBc0U7SUFDdEUsSUFBSSxNQUFNLEdBQUcsV0FBVyxDQUFDLENBQUUsNENBQTRDO0lBQ3ZFLElBQUksTUFBTSxDQUFDLEtBQUssRUFBRTtRQUNoQixNQUFNLElBQUksTUFBTSxNQUFNLENBQUMsS0FBSyxFQUFFLENBQUM7S0FDaEM7SUFDRCxPQUFPLEdBQUcsSUFBSSxJQUFJLE1BQU0sSUFBSSxNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7QUFDM0MsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge2NyZWF0ZUltYWdlTG9hZGVyLCBJbWFnZUxvYWRlckNvbmZpZ30gZnJvbSAnLi9pbWFnZV9sb2FkZXInO1xuXG4vKipcbiAqIEZ1bmN0aW9uIHRoYXQgZ2VuZXJhdGVzIGEgYnVpbHQtaW4gSW1hZ2VMb2FkZXIgZm9yIEltYWdlS2l0XG4gKiBhbmQgdHVybnMgaXQgaW50byBhbiBBbmd1bGFyIHByb3ZpZGVyLlxuICpcbiAqIEBwYXJhbSBwYXRoIEJhc2UgVVJMIG9mIHlvdXIgSW1hZ2VLaXQgaW1hZ2VzXG4gKiBUaGlzIFVSTCBzaG91bGQgbWF0Y2ggb25lIG9mIHRoZSBmb2xsb3dpbmcgZm9ybWF0czpcbiAqIGh0dHBzOi8vaWsuaW1hZ2VraXQuaW8vbXlhY2NvdW50XG4gKiBodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tXG4gKiBAcGFyYW0gb3B0aW9ucyBBbiBvYmplY3QgdGhhdCBhbGxvd3MgdG8gcHJvdmlkZSBleHRyYSBjb25maWd1cmF0aW9uOlxuICogLSBgZW5zdXJlUHJlY29ubmVjdGA6IGJvb2xlYW4gZmxhZyBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlXG4gKiAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkIHZlcmlmeSB0aGF0IHRoZXJlIGlzIGEgY29ycmVzcG9uZGluZyBgPGxpbmsgcmVsPVwicHJlY29ubmVjdFwiPmBcbiAqICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW50IGluIHRoZSBkb2N1bWVudCdzIGA8aGVhZD5gLlxuICogQHJldHVybnMgU2V0IG9mIHByb3ZpZGVycyB0byBjb25maWd1cmUgdGhlIEltYWdlS2l0IGxvYWRlci5cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAZGV2ZWxvcGVyUHJldmlld1xuICovXG5leHBvcnQgY29uc3QgcHJvdmlkZUltYWdlS2l0TG9hZGVyID0gY3JlYXRlSW1hZ2VMb2FkZXIoXG4gICAgY3JlYXRlSW1hZ2VraXRVUkwsXG4gICAgbmdEZXZNb2RlID8gWydodHRwczovL2lrLmltYWdla2l0LmlvL215c2l0ZScsICdodHRwczovL3N1YmRvbWFpbi5teXNpdGUuY29tJ10gOiB1bmRlZmluZWQpO1xuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlSW1hZ2VraXRVUkwocGF0aDogc3RyaW5nLCBjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSB7XG4gIC8vIEV4YW1wbGUgb2YgYW4gSW1hZ2VLaXQgaW1hZ2UgVVJMOlxuICAvLyBodHRwczovL2lrLmltYWdla2l0LmlvL2RlbW8vdHI6dy0zMDAsaC0zMDAvbWVkaXVtX2NhZmVfQjFpVGREMEMuanBnXG4gIGxldCBwYXJhbXMgPSBgdHI6cS1hdXRvYDsgIC8vIGFwcGxpZXMgdGhlIFwiYXV0byBxdWFsaXR5XCIgdHJhbnNmb3JtYXRpb25cbiAgaWYgKGNvbmZpZy53aWR0aCkge1xuICAgIHBhcmFtcyArPSBgLHctJHtjb25maWcud2lkdGh9YDtcbiAgfVxuICByZXR1cm4gYCR7cGF0aH0vJHtwYXJhbXN9LyR7Y29uZmlnLnNyY31gO1xufVxuIl19