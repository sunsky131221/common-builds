/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { PLACEHOLDER_QUALITY } from './constants';
import { createImageLoader } from './image_loader';
/**
 * Name and URL tester for ImageKit.
 */
export const imageKitLoaderInfo = {
    name: 'ImageKit',
    testUrl: isImageKitUrl,
};
const IMAGE_KIT_LOADER_REGEX = /https?\:\/\/[^\/]+\.imagekit\.io\/.+/;
/**
 * Tests whether a URL is from ImageKit CDN.
 */
function isImageKitUrl(url) {
    return IMAGE_KIT_LOADER_REGEX.test(url);
}
/**
 * Function that generates an ImageLoader for ImageKit and turns it into an Angular provider.
 *
 * @param path Base URL of your ImageKit images
 * This URL should match one of the following formats:
 * https://ik.imagekit.io/myaccount
 * https://subdomain.mysite.com
 * @returns Set of providers to configure the ImageKit loader.
 *
 * @publicApi
 */
export const provideImageKitLoader = createImageLoader(createImagekitUrl, ngDevMode ? ['https://ik.imagekit.io/mysite', 'https://subdomain.mysite.com'] : undefined);
export function createImagekitUrl(path, config) {
    // Example of an ImageKit image URL:
    // https://ik.imagekit.io/demo/tr:w-300,h-300/medium_cafe_B1iTdD0C.jpg
    const { src, width } = config;
    const params = [];
    if (width) {
        params.push(`w-${width}`);
    }
    // When requesting a placeholder image we ask for a low quality image to reduce the load time.
    if (config.isPlaceholder) {
        params.push(`q-${PLACEHOLDER_QUALITY}`);
    }
    const urlSegments = params.length ? [path, `tr:${params.join(',')}`, src] : [path, src];
    const url = new URL(urlSegments.join('/'));
    return url.href;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VraXRfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxhQUFhLENBQUM7QUFDaEQsT0FBTyxFQUFDLGlCQUFpQixFQUFxQyxNQUFNLGdCQUFnQixDQUFDO0FBRXJGOztHQUVHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sa0JBQWtCLEdBQW9CO0lBQ2pELElBQUksRUFBRSxVQUFVO0lBQ2hCLE9BQU8sRUFBRSxhQUFhO0NBQ3ZCLENBQUM7QUFFRixNQUFNLHNCQUFzQixHQUFHLHNDQUFzQyxDQUFDO0FBQ3RFOztHQUVHO0FBQ0gsU0FBUyxhQUFhLENBQUMsR0FBVztJQUNoQyxPQUFPLHNCQUFzQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztBQUMxQyxDQUFDO0FBRUQ7Ozs7Ozs7Ozs7R0FVRztBQUNILE1BQU0sQ0FBQyxNQUFNLHFCQUFxQixHQUFHLGlCQUFpQixDQUNwRCxpQkFBaUIsRUFDakIsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLCtCQUErQixFQUFFLDhCQUE4QixDQUFDLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FDMUYsQ0FBQztBQUVGLE1BQU0sVUFBVSxpQkFBaUIsQ0FBQyxJQUFZLEVBQUUsTUFBeUI7SUFDdkUsb0NBQW9DO0lBQ3BDLHNFQUFzRTtJQUN0RSxNQUFNLEVBQUMsR0FBRyxFQUFFLEtBQUssRUFBQyxHQUFHLE1BQU0sQ0FBQztJQUM1QixNQUFNLE1BQU0sR0FBYSxFQUFFLENBQUM7SUFFNUIsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxLQUFLLEVBQUUsQ0FBQyxDQUFDO0lBQzVCLENBQUM7SUFFRCw4RkFBOEY7SUFDOUYsSUFBSSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUM7UUFDekIsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLG1CQUFtQixFQUFFLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRUQsTUFBTSxXQUFXLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hGLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztJQUMzQyxPQUFPLEdBQUcsQ0FBQyxJQUFJLENBQUM7QUFDbEIsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BMQUNFSE9MREVSX1FVQUxJVFl9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7Y3JlYXRlSW1hZ2VMb2FkZXIsIEltYWdlTG9hZGVyQ29uZmlnLCBJbWFnZUxvYWRlckluZm99IGZyb20gJy4vaW1hZ2VfbG9hZGVyJztcblxuLyoqXG4gKiBOYW1lIGFuZCBVUkwgdGVzdGVyIGZvciBJbWFnZUtpdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGltYWdlS2l0TG9hZGVySW5mbzogSW1hZ2VMb2FkZXJJbmZvID0ge1xuICBuYW1lOiAnSW1hZ2VLaXQnLFxuICB0ZXN0VXJsOiBpc0ltYWdlS2l0VXJsLFxufTtcblxuY29uc3QgSU1BR0VfS0lUX0xPQURFUl9SRUdFWCA9IC9odHRwcz9cXDpcXC9cXC9bXlxcL10rXFwuaW1hZ2VraXRcXC5pb1xcLy4rLztcbi8qKlxuICogVGVzdHMgd2hldGhlciBhIFVSTCBpcyBmcm9tIEltYWdlS2l0IENETi5cbiAqL1xuZnVuY3Rpb24gaXNJbWFnZUtpdFVybCh1cmw6IHN0cmluZyk6IGJvb2xlYW4ge1xuICByZXR1cm4gSU1BR0VfS0lUX0xPQURFUl9SRUdFWC50ZXN0KHVybCk7XG59XG5cbi8qKlxuICogRnVuY3Rpb24gdGhhdCBnZW5lcmF0ZXMgYW4gSW1hZ2VMb2FkZXIgZm9yIEltYWdlS2l0IGFuZCB0dXJucyBpdCBpbnRvIGFuIEFuZ3VsYXIgcHJvdmlkZXIuXG4gKlxuICogQHBhcmFtIHBhdGggQmFzZSBVUkwgb2YgeW91ciBJbWFnZUtpdCBpbWFnZXNcbiAqIFRoaXMgVVJMIHNob3VsZCBtYXRjaCBvbmUgb2YgdGhlIGZvbGxvd2luZyBmb3JtYXRzOlxuICogaHR0cHM6Ly9pay5pbWFnZWtpdC5pby9teWFjY291bnRcbiAqIGh0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb21cbiAqIEByZXR1cm5zIFNldCBvZiBwcm92aWRlcnMgdG8gY29uZmlndXJlIHRoZSBJbWFnZUtpdCBsb2FkZXIuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgcHJvdmlkZUltYWdlS2l0TG9hZGVyID0gY3JlYXRlSW1hZ2VMb2FkZXIoXG4gIGNyZWF0ZUltYWdla2l0VXJsLFxuICBuZ0Rldk1vZGUgPyBbJ2h0dHBzOi8vaWsuaW1hZ2VraXQuaW8vbXlzaXRlJywgJ2h0dHBzOi8vc3ViZG9tYWluLm15c2l0ZS5jb20nXSA6IHVuZGVmaW5lZCxcbik7XG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbWFnZWtpdFVybChwYXRoOiBzdHJpbmcsIGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpOiBzdHJpbmcge1xuICAvLyBFeGFtcGxlIG9mIGFuIEltYWdlS2l0IGltYWdlIFVSTDpcbiAgLy8gaHR0cHM6Ly9pay5pbWFnZWtpdC5pby9kZW1vL3RyOnctMzAwLGgtMzAwL21lZGl1bV9jYWZlX0IxaVRkRDBDLmpwZ1xuICBjb25zdCB7c3JjLCB3aWR0aH0gPSBjb25maWc7XG4gIGNvbnN0IHBhcmFtczogc3RyaW5nW10gPSBbXTtcblxuICBpZiAod2lkdGgpIHtcbiAgICBwYXJhbXMucHVzaChgdy0ke3dpZHRofWApO1xuICB9XG5cbiAgLy8gV2hlbiByZXF1ZXN0aW5nIGEgcGxhY2Vob2xkZXIgaW1hZ2Ugd2UgYXNrIGZvciBhIGxvdyBxdWFsaXR5IGltYWdlIHRvIHJlZHVjZSB0aGUgbG9hZCB0aW1lLlxuICBpZiAoY29uZmlnLmlzUGxhY2Vob2xkZXIpIHtcbiAgICBwYXJhbXMucHVzaChgcS0ke1BMQUNFSE9MREVSX1FVQUxJVFl9YCk7XG4gIH1cblxuICBjb25zdCB1cmxTZWdtZW50cyA9IHBhcmFtcy5sZW5ndGggPyBbcGF0aCwgYHRyOiR7cGFyYW1zLmpvaW4oJywnKX1gLCBzcmNdIDogW3BhdGgsIHNyY107XG4gIGNvbnN0IHVybCA9IG5ldyBVUkwodXJsU2VnbWVudHMuam9pbignLycpKTtcbiAgcmV0dXJuIHVybC5ocmVmO1xufVxuIl19