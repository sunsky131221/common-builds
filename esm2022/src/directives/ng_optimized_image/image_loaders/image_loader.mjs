/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { InjectionToken, ɵRuntimeError as RuntimeError } from '@angular/core';
import { isAbsoluteUrl, isValidPath, normalizePath, normalizeSrc } from '../url';
/**
 * Noop image loader that does no transformation to the original src and just returns it as is.
 * This loader is used as a default one if more specific logic is not provided in an app config.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 */
export const noopImageLoader = (config) => config.src;
/**
 * Injection token that configures the image loader function.
 *
 * @see {@link ImageLoader}
 * @see {@link NgOptimizedImage}
 * @publicApi
 */
export const IMAGE_LOADER = new InjectionToken(ngDevMode ? 'ImageLoader' : '', {
    providedIn: 'root',
    factory: () => noopImageLoader,
});
/**
 * Internal helper function that makes it easier to introduce custom image loaders for the
 * `NgOptimizedImage` directive. It is enough to specify a URL builder function to obtain full DI
 * configuration for a given loader: a DI token corresponding to the actual loader function, plus DI
 * tokens managing preconnect check functionality.
 * @param buildUrlFn a function returning a full URL based on loader's configuration
 * @param exampleUrls example of full URLs for a given loader (used in error messages)
 * @returns a set of DI providers corresponding to the configured image loader
 */
export function createImageLoader(buildUrlFn, exampleUrls) {
    return function provideImageLoader(path) {
        if (!isValidPath(path)) {
            throwInvalidPathError(path, exampleUrls || []);
        }
        // The trailing / is stripped (if provided) to make URL construction (concatenation) easier in
        // the individual loader functions.
        path = normalizePath(path);
        const loaderFn = (config) => {
            if (isAbsoluteUrl(config.src)) {
                // Image loader functions expect an image file name (e.g. `my-image.png`)
                // or a relative path + a file name (e.g. `/a/b/c/my-image.png`) as an input,
                // so the final absolute URL can be constructed.
                // When an absolute URL is provided instead - the loader can not
                // build a final URL, thus the error is thrown to indicate that.
                throwUnexpectedAbsoluteUrlError(path, config.src);
            }
            return buildUrlFn(path, { ...config, src: normalizeSrc(config.src) });
        };
        const providers = [{ provide: IMAGE_LOADER, useValue: loaderFn }];
        return providers;
    };
}
function throwInvalidPathError(path, exampleUrls) {
    throw new RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, ngDevMode &&
        `Image loader has detected an invalid path (\`${path}\`). ` +
            `To fix this, supply a path using one of the following formats: ${exampleUrls.join(' or ')}`);
}
function throwUnexpectedAbsoluteUrlError(path, url) {
    throw new RuntimeError(2959 /* RuntimeErrorCode.INVALID_LOADER_ARGUMENTS */, ngDevMode &&
        `Image loader has detected a \`<img>\` tag with an invalid \`ngSrc\` attribute: ${url}. ` +
            `This image loader expects \`ngSrc\` to be a relative URL - ` +
            `however the provided value is an absolute URL. ` +
            `To fix this, provide \`ngSrc\` as a path relative to the base URL ` +
            `configured for this loader (\`${path}\`).`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdlX2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFZLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHdEYsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQXFDL0U7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBeUIsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQVV6RTs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQWMsU0FBUyxDQUFDLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRTtJQUMxRixVQUFVLEVBQUUsTUFBTTtJQUNsQixPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsZUFBZTtDQUMvQixDQUFDLENBQUM7QUFFSDs7Ozs7Ozs7R0FRRztBQUNILE1BQU0sVUFBVSxpQkFBaUIsQ0FDN0IsVUFBK0QsRUFBRSxXQUFzQjtJQUN6RixPQUFPLFNBQVMsa0JBQWtCLENBQUMsSUFBWTtRQUM3QyxJQUFJLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7WUFDdkIscUJBQXFCLENBQUMsSUFBSSxFQUFFLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQztRQUNqRCxDQUFDO1FBRUQsOEZBQThGO1FBQzlGLG1DQUFtQztRQUNuQyxJQUFJLEdBQUcsYUFBYSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBRTNCLE1BQU0sUUFBUSxHQUFHLENBQUMsTUFBeUIsRUFBRSxFQUFFO1lBQzdDLElBQUksYUFBYSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDO2dCQUM5Qix5RUFBeUU7Z0JBQ3pFLDZFQUE2RTtnQkFDN0UsZ0RBQWdEO2dCQUNoRCxnRUFBZ0U7Z0JBQ2hFLGdFQUFnRTtnQkFDaEUsK0JBQStCLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUNwRCxDQUFDO1lBRUQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFlLENBQUMsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWEsRUFBRSxXQUFxQjtJQUNqRSxNQUFNLElBQUksWUFBWSx1REFFbEIsU0FBUztRQUNMLGdEQUFnRCxJQUFJLE9BQU87WUFDdkQsa0VBQ0ksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVELFNBQVMsK0JBQStCLENBQUMsSUFBWSxFQUFFLEdBQVc7SUFDaEUsTUFBTSxJQUFJLFlBQVksdURBRWxCLFNBQVM7UUFDTCxrRkFDSSxHQUFHLElBQUk7WUFDUCw2REFBNkQ7WUFDN0QsaURBQWlEO1lBQ2pELG9FQUFvRTtZQUNwRSxpQ0FBaUMsSUFBSSxNQUFNLENBQUMsQ0FBQztBQUMzRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0aW9uVG9rZW4sIFByb3ZpZGVyLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzQWJzb2x1dGVVcmwsIGlzVmFsaWRQYXRoLCBub3JtYWxpemVQYXRoLCBub3JtYWxpemVTcmN9IGZyb20gJy4uL3VybCc7XG5cbi8qKlxuICogQ29uZmlnIG9wdGlvbnMgcmVjb2duaXplZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBzZWUge0BsaW5rIEltYWdlTG9hZGVyfVxuICogQHNlZSB7QGxpbmsgTmdPcHRpbWl6ZWRJbWFnZX1cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbWFnZUxvYWRlckNvbmZpZyB7XG4gIC8qKlxuICAgKiBJbWFnZSBmaWxlIG5hbWUgdG8gYmUgYWRkZWQgdG8gdGhlIGltYWdlIHJlcXVlc3QgVVJMLlxuICAgKi9cbiAgc3JjOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBXaWR0aCBvZiB0aGUgcmVxdWVzdGVkIGltYWdlICh0byBiZSB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzcmNzZXQpLlxuICAgKi9cbiAgd2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBsb2FkZXIgc2hvdWxkIGdlbmVyYXRlIGEgVVJMIGZvciBhIHNtYWxsIGltYWdlIHBsYWNlaG9sZGVyIGluc3RlYWQgb2YgYSBmdWxsLXNpemVkXG4gICAqIGltYWdlLlxuICAgKi9cbiAgaXNQbGFjZWhvbGRlcj86IGJvb2xlYW47XG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIHVzZXItcHJvdmlkZWQgcGFyYW1ldGVycyBmb3IgdXNlIGJ5IHRoZSBJbWFnZUxvYWRlci5cbiAgICovXG4gIGxvYWRlclBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnk7fTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGltYWdlIGxvYWRlciBmdW5jdGlvbi4gSW1hZ2UgbG9hZGVyIGZ1bmN0aW9ucyBhcmUgdXNlZCBieSB0aGVcbiAqIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHRvIHByb2R1Y2UgZnVsbCBpbWFnZSBVUkwgYmFzZWQgb24gdGhlIGltYWdlIG5hbWUgYW5kIGl0cyB3aWR0aC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEltYWdlTG9hZGVyID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHN0cmluZztcblxuLyoqXG4gKiBOb29wIGltYWdlIGxvYWRlciB0aGF0IGRvZXMgbm8gdHJhbnNmb3JtYXRpb24gdG8gdGhlIG9yaWdpbmFsIHNyYyBhbmQganVzdCByZXR1cm5zIGl0IGFzIGlzLlxuICogVGhpcyBsb2FkZXIgaXMgdXNlZCBhcyBhIGRlZmF1bHQgb25lIGlmIG1vcmUgc3BlY2lmaWMgbG9naWMgaXMgbm90IHByb3ZpZGVkIGluIGFuIGFwcCBjb25maWcuXG4gKlxuICogQHNlZSB7QGxpbmsgSW1hZ2VMb2FkZXJ9XG4gKiBAc2VlIHtAbGluayBOZ09wdGltaXplZEltYWdlfVxuICovXG5leHBvcnQgY29uc3Qgbm9vcEltYWdlTG9hZGVyID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IGNvbmZpZy5zcmM7XG5cbi8qKlxuICogTWV0YWRhdGEgYWJvdXQgdGhlIGltYWdlIGxvYWRlci5cbiAqL1xuZXhwb3J0IHR5cGUgSW1hZ2VMb2FkZXJJbmZvID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHRlc3RVcmw6ICh1cmw6IHN0cmluZykgPT4gYm9vbGVhblxufTtcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjb25maWd1cmVzIHRoZSBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gKlxuICogQHNlZSB7QGxpbmsgSW1hZ2VMb2FkZXJ9XG4gKiBAc2VlIHtAbGluayBOZ09wdGltaXplZEltYWdlfVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSU1BR0VfTE9BREVSID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlTG9hZGVyPihuZ0Rldk1vZGUgPyAnSW1hZ2VMb2FkZXInIDogJycsIHtcbiAgcHJvdmlkZWRJbjogJ3Jvb3QnLFxuICBmYWN0b3J5OiAoKSA9PiBub29wSW1hZ2VMb2FkZXIsXG59KTtcblxuLyoqXG4gKiBJbnRlcm5hbCBoZWxwZXIgZnVuY3Rpb24gdGhhdCBtYWtlcyBpdCBlYXNpZXIgdG8gaW50cm9kdWNlIGN1c3RvbSBpbWFnZSBsb2FkZXJzIGZvciB0aGVcbiAqIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUuIEl0IGlzIGVub3VnaCB0byBzcGVjaWZ5IGEgVVJMIGJ1aWxkZXIgZnVuY3Rpb24gdG8gb2J0YWluIGZ1bGwgRElcbiAqIGNvbmZpZ3VyYXRpb24gZm9yIGEgZ2l2ZW4gbG9hZGVyOiBhIERJIHRva2VuIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGFjdHVhbCBsb2FkZXIgZnVuY3Rpb24sIHBsdXMgRElcbiAqIHRva2VucyBtYW5hZ2luZyBwcmVjb25uZWN0IGNoZWNrIGZ1bmN0aW9uYWxpdHkuXG4gKiBAcGFyYW0gYnVpbGRVcmxGbiBhIGZ1bmN0aW9uIHJldHVybmluZyBhIGZ1bGwgVVJMIGJhc2VkIG9uIGxvYWRlcidzIGNvbmZpZ3VyYXRpb25cbiAqIEBwYXJhbSBleGFtcGxlVXJscyBleGFtcGxlIG9mIGZ1bGwgVVJMcyBmb3IgYSBnaXZlbiBsb2FkZXIgKHVzZWQgaW4gZXJyb3IgbWVzc2FnZXMpXG4gKiBAcmV0dXJucyBhIHNldCBvZiBESSBwcm92aWRlcnMgY29ycmVzcG9uZGluZyB0byB0aGUgY29uZmlndXJlZCBpbWFnZSBsb2FkZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUltYWdlTG9hZGVyKFxuICAgIGJ1aWxkVXJsRm46IChwYXRoOiBzdHJpbmcsIGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHN0cmluZywgZXhhbXBsZVVybHM/OiBzdHJpbmdbXSkge1xuICByZXR1cm4gZnVuY3Rpb24gcHJvdmlkZUltYWdlTG9hZGVyKHBhdGg6IHN0cmluZykge1xuICAgIGlmICghaXNWYWxpZFBhdGgocGF0aCkpIHtcbiAgICAgIHRocm93SW52YWxpZFBhdGhFcnJvcihwYXRoLCBleGFtcGxlVXJscyB8fCBbXSk7XG4gICAgfVxuXG4gICAgLy8gVGhlIHRyYWlsaW5nIC8gaXMgc3RyaXBwZWQgKGlmIHByb3ZpZGVkKSB0byBtYWtlIFVSTCBjb25zdHJ1Y3Rpb24gKGNvbmNhdGVuYXRpb24pIGVhc2llciBpblxuICAgIC8vIHRoZSBpbmRpdmlkdWFsIGxvYWRlciBmdW5jdGlvbnMuXG4gICAgcGF0aCA9IG5vcm1hbGl6ZVBhdGgocGF0aCk7XG5cbiAgICBjb25zdCBsb2FkZXJGbiA9IChjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiB7XG4gICAgICBpZiAoaXNBYnNvbHV0ZVVybChjb25maWcuc3JjKSkge1xuICAgICAgICAvLyBJbWFnZSBsb2FkZXIgZnVuY3Rpb25zIGV4cGVjdCBhbiBpbWFnZSBmaWxlIG5hbWUgKGUuZy4gYG15LWltYWdlLnBuZ2ApXG4gICAgICAgIC8vIG9yIGEgcmVsYXRpdmUgcGF0aCArIGEgZmlsZSBuYW1lIChlLmcuIGAvYS9iL2MvbXktaW1hZ2UucG5nYCkgYXMgYW4gaW5wdXQsXG4gICAgICAgIC8vIHNvIHRoZSBmaW5hbCBhYnNvbHV0ZSBVUkwgY2FuIGJlIGNvbnN0cnVjdGVkLlxuICAgICAgICAvLyBXaGVuIGFuIGFic29sdXRlIFVSTCBpcyBwcm92aWRlZCBpbnN0ZWFkIC0gdGhlIGxvYWRlciBjYW4gbm90XG4gICAgICAgIC8vIGJ1aWxkIGEgZmluYWwgVVJMLCB0aHVzIHRoZSBlcnJvciBpcyB0aHJvd24gdG8gaW5kaWNhdGUgdGhhdC5cbiAgICAgICAgdGhyb3dVbmV4cGVjdGVkQWJzb2x1dGVVcmxFcnJvcihwYXRoLCBjb25maWcuc3JjKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGJ1aWxkVXJsRm4ocGF0aCwgey4uLmNvbmZpZywgc3JjOiBub3JtYWxpemVTcmMoY29uZmlnLnNyYyl9KTtcbiAgICB9O1xuXG4gICAgY29uc3QgcHJvdmlkZXJzOiBQcm92aWRlcltdID0gW3twcm92aWRlOiBJTUFHRV9MT0FERVIsIHVzZVZhbHVlOiBsb2FkZXJGbn1dO1xuICAgIHJldHVybiBwcm92aWRlcnM7XG4gIH07XG59XG5cbmZ1bmN0aW9uIHRocm93SW52YWxpZFBhdGhFcnJvcihwYXRoOiB1bmtub3duLCBleGFtcGxlVXJsczogc3RyaW5nW10pOiBuZXZlciB7XG4gIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfTE9BREVSX0FSR1VNRU5UUyxcbiAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgIGBJbWFnZSBsb2FkZXIgaGFzIGRldGVjdGVkIGFuIGludmFsaWQgcGF0aCAoXFxgJHtwYXRofVxcYCkuIGAgK1xuICAgICAgICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBhIHBhdGggdXNpbmcgb25lIG9mIHRoZSBmb2xsb3dpbmcgZm9ybWF0czogJHtcbiAgICAgICAgICAgICAgICAgIGV4YW1wbGVVcmxzLmpvaW4oJyBvciAnKX1gKTtcbn1cblxuZnVuY3Rpb24gdGhyb3dVbmV4cGVjdGVkQWJzb2x1dGVVcmxFcnJvcihwYXRoOiBzdHJpbmcsIHVybDogc3RyaW5nKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0xPQURFUl9BUkdVTUVOVFMsXG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICBgSW1hZ2UgbG9hZGVyIGhhcyBkZXRlY3RlZCBhIFxcYDxpbWc+XFxgIHRhZyB3aXRoIGFuIGludmFsaWQgXFxgbmdTcmNcXGAgYXR0cmlidXRlOiAke1xuICAgICAgICAgICAgICB1cmx9LiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaW1hZ2UgbG9hZGVyIGV4cGVjdHMgXFxgbmdTcmNcXGAgdG8gYmUgYSByZWxhdGl2ZSBVUkwgLSBgICtcbiAgICAgICAgICAgICAgYGhvd2V2ZXIgdGhlIHByb3ZpZGVkIHZhbHVlIGlzIGFuIGFic29sdXRlIFVSTC4gYCArXG4gICAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGBuZ1NyY1xcYCBhcyBhIHBhdGggcmVsYXRpdmUgdG8gdGhlIGJhc2UgVVJMIGAgK1xuICAgICAgICAgICAgICBgY29uZmlndXJlZCBmb3IgdGhpcyBsb2FkZXIgKFxcYCR7cGF0aH1cXGApLmApO1xufVxuIl19