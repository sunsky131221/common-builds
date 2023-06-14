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
export const IMAGE_LOADER = new InjectionToken('ImageLoader', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1hZ2VfbG9hZGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9pbWFnZV9sb2FkZXJzL2ltYWdlX2xvYWRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsY0FBYyxFQUFZLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHdEYsT0FBTyxFQUFDLGFBQWEsRUFBRSxXQUFXLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBQyxNQUFNLFFBQVEsQ0FBQztBQWdDL0U7Ozs7OztHQU1HO0FBQ0gsTUFBTSxDQUFDLE1BQU0sZUFBZSxHQUFHLENBQUMsTUFBeUIsRUFBRSxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQztBQVV6RTs7Ozs7O0dBTUc7QUFDSCxNQUFNLENBQUMsTUFBTSxZQUFZLEdBQUcsSUFBSSxjQUFjLENBQWMsYUFBYSxFQUFFO0lBQ3pFLFVBQVUsRUFBRSxNQUFNO0lBQ2xCLE9BQU8sRUFBRSxHQUFHLEVBQUUsQ0FBQyxlQUFlO0NBQy9CLENBQUMsQ0FBQztBQUVIOzs7Ozs7OztHQVFHO0FBQ0gsTUFBTSxVQUFVLGlCQUFpQixDQUM3QixVQUErRCxFQUFFLFdBQXNCO0lBQ3pGLE9BQU8sU0FBUyxrQkFBa0IsQ0FBQyxJQUFZO1FBQzdDLElBQUksQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDdEIscUJBQXFCLENBQUMsSUFBSSxFQUFFLFdBQVcsSUFBSSxFQUFFLENBQUMsQ0FBQztTQUNoRDtRQUVELDhGQUE4RjtRQUM5RixtQ0FBbUM7UUFDbkMsSUFBSSxHQUFHLGFBQWEsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUUzQixNQUFNLFFBQVEsR0FBRyxDQUFDLE1BQXlCLEVBQUUsRUFBRTtZQUM3QyxJQUFJLGFBQWEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUU7Z0JBQzdCLHlFQUF5RTtnQkFDekUsNkVBQTZFO2dCQUM3RSxnREFBZ0Q7Z0JBQ2hELGdFQUFnRTtnQkFDaEUsZ0VBQWdFO2dCQUNoRSwrQkFBK0IsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2FBQ25EO1lBRUQsT0FBTyxVQUFVLENBQUMsSUFBSSxFQUFFLEVBQUMsR0FBRyxNQUFNLEVBQUUsR0FBRyxFQUFFLFlBQVksQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxDQUFDO1FBQ3RFLENBQUMsQ0FBQztRQUVGLE1BQU0sU0FBUyxHQUFlLENBQUMsRUFBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO1FBQzVFLE9BQU8sU0FBUyxDQUFDO0lBQ25CLENBQUMsQ0FBQztBQUNKLENBQUM7QUFFRCxTQUFTLHFCQUFxQixDQUFDLElBQWEsRUFBRSxXQUFxQjtJQUNqRSxNQUFNLElBQUksWUFBWSx1REFFbEIsU0FBUztRQUNMLGdEQUFnRCxJQUFJLE9BQU87WUFDdkQsa0VBQ0ksV0FBVyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDOUMsQ0FBQztBQUVELFNBQVMsK0JBQStCLENBQUMsSUFBWSxFQUFFLEdBQVc7SUFDaEUsTUFBTSxJQUFJLFlBQVksdURBRWxCLFNBQVM7UUFDTCxrRkFDSSxHQUFHLElBQUk7WUFDUCw2REFBNkQ7WUFDN0QsaURBQWlEO1lBQ2pELG9FQUFvRTtZQUNwRSxpQ0FBaUMsSUFBSSxNQUFNLENBQUMsQ0FBQztBQUMzRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0aW9uVG9rZW4sIFByb3ZpZGVyLCDJtVJ1bnRpbWVFcnJvciBhcyBSdW50aW1lRXJyb3J9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzQWJzb2x1dGVVcmwsIGlzVmFsaWRQYXRoLCBub3JtYWxpemVQYXRoLCBub3JtYWxpemVTcmN9IGZyb20gJy4uL3VybCc7XG5cbi8qKlxuICogQ29uZmlnIG9wdGlvbnMgcmVjb2duaXplZCBieSB0aGUgaW1hZ2UgbG9hZGVyIGZ1bmN0aW9uLlxuICpcbiAqIEBzZWUge0BsaW5rIEltYWdlTG9hZGVyfVxuICogQHNlZSB7QGxpbmsgTmdPcHRpbWl6ZWRJbWFnZX1cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbWFnZUxvYWRlckNvbmZpZyB7XG4gIC8qKlxuICAgKiBJbWFnZSBmaWxlIG5hbWUgdG8gYmUgYWRkZWQgdG8gdGhlIGltYWdlIHJlcXVlc3QgVVJMLlxuICAgKi9cbiAgc3JjOiBzdHJpbmc7XG4gIC8qKlxuICAgKiBXaWR0aCBvZiB0aGUgcmVxdWVzdGVkIGltYWdlICh0byBiZSB1c2VkIHdoZW4gZ2VuZXJhdGluZyBzcmNzZXQpLlxuICAgKi9cbiAgd2lkdGg/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBBZGRpdGlvbmFsIHVzZXItcHJvdmlkZWQgcGFyYW1ldGVycyBmb3IgdXNlIGJ5IHRoZSBJbWFnZUxvYWRlci5cbiAgICovXG4gIGxvYWRlclBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnk7fTtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGltYWdlIGxvYWRlciBmdW5jdGlvbi4gSW1hZ2UgbG9hZGVyIGZ1bmN0aW9ucyBhcmUgdXNlZCBieSB0aGVcbiAqIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHRvIHByb2R1Y2UgZnVsbCBpbWFnZSBVUkwgYmFzZWQgb24gdGhlIGltYWdlIG5hbWUgYW5kIGl0cyB3aWR0aC5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCB0eXBlIEltYWdlTG9hZGVyID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHN0cmluZztcblxuLyoqXG4gKiBOb29wIGltYWdlIGxvYWRlciB0aGF0IGRvZXMgbm8gdHJhbnNmb3JtYXRpb24gdG8gdGhlIG9yaWdpbmFsIHNyYyBhbmQganVzdCByZXR1cm5zIGl0IGFzIGlzLlxuICogVGhpcyBsb2FkZXIgaXMgdXNlZCBhcyBhIGRlZmF1bHQgb25lIGlmIG1vcmUgc3BlY2lmaWMgbG9naWMgaXMgbm90IHByb3ZpZGVkIGluIGFuIGFwcCBjb25maWcuXG4gKlxuICogQHNlZSB7QGxpbmsgSW1hZ2VMb2FkZXJ9XG4gKiBAc2VlIHtAbGluayBOZ09wdGltaXplZEltYWdlfVxuICovXG5leHBvcnQgY29uc3Qgbm9vcEltYWdlTG9hZGVyID0gKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IGNvbmZpZy5zcmM7XG5cbi8qKlxuICogTWV0YWRhdGEgYWJvdXQgdGhlIGltYWdlIGxvYWRlci5cbiAqL1xuZXhwb3J0IHR5cGUgSW1hZ2VMb2FkZXJJbmZvID0ge1xuICBuYW1lOiBzdHJpbmcsXG4gIHRlc3RVcmw6ICh1cmw6IHN0cmluZykgPT4gYm9vbGVhblxufTtcblxuLyoqXG4gKiBJbmplY3Rpb24gdG9rZW4gdGhhdCBjb25maWd1cmVzIHRoZSBpbWFnZSBsb2FkZXIgZnVuY3Rpb24uXG4gKlxuICogQHNlZSB7QGxpbmsgSW1hZ2VMb2FkZXJ9XG4gKiBAc2VlIHtAbGluayBOZ09wdGltaXplZEltYWdlfVxuICogQHB1YmxpY0FwaVxuICovXG5leHBvcnQgY29uc3QgSU1BR0VfTE9BREVSID0gbmV3IEluamVjdGlvblRva2VuPEltYWdlTG9hZGVyPignSW1hZ2VMb2FkZXInLCB7XG4gIHByb3ZpZGVkSW46ICdyb290JyxcbiAgZmFjdG9yeTogKCkgPT4gbm9vcEltYWdlTG9hZGVyLFxufSk7XG5cbi8qKlxuICogSW50ZXJuYWwgaGVscGVyIGZ1bmN0aW9uIHRoYXQgbWFrZXMgaXQgZWFzaWVyIHRvIGludHJvZHVjZSBjdXN0b20gaW1hZ2UgbG9hZGVycyBmb3IgdGhlXG4gKiBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLiBJdCBpcyBlbm91Z2ggdG8gc3BlY2lmeSBhIFVSTCBidWlsZGVyIGZ1bmN0aW9uIHRvIG9idGFpbiBmdWxsIERJXG4gKiBjb25maWd1cmF0aW9uIGZvciBhIGdpdmVuIGxvYWRlcjogYSBESSB0b2tlbiBjb3JyZXNwb25kaW5nIHRvIHRoZSBhY3R1YWwgbG9hZGVyIGZ1bmN0aW9uLCBwbHVzIERJXG4gKiB0b2tlbnMgbWFuYWdpbmcgcHJlY29ubmVjdCBjaGVjayBmdW5jdGlvbmFsaXR5LlxuICogQHBhcmFtIGJ1aWxkVXJsRm4gYSBmdW5jdGlvbiByZXR1cm5pbmcgYSBmdWxsIFVSTCBiYXNlZCBvbiBsb2FkZXIncyBjb25maWd1cmF0aW9uXG4gKiBAcGFyYW0gZXhhbXBsZVVybHMgZXhhbXBsZSBvZiBmdWxsIFVSTHMgZm9yIGEgZ2l2ZW4gbG9hZGVyICh1c2VkIGluIGVycm9yIG1lc3NhZ2VzKVxuICogQHJldHVybnMgYSBzZXQgb2YgREkgcHJvdmlkZXJzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGNvbmZpZ3VyZWQgaW1hZ2UgbG9hZGVyXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJbWFnZUxvYWRlcihcbiAgICBidWlsZFVybEZuOiAocGF0aDogc3RyaW5nLCBjb25maWc6IEltYWdlTG9hZGVyQ29uZmlnKSA9PiBzdHJpbmcsIGV4YW1wbGVVcmxzPzogc3RyaW5nW10pIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIHByb3ZpZGVJbWFnZUxvYWRlcihwYXRoOiBzdHJpbmcpIHtcbiAgICBpZiAoIWlzVmFsaWRQYXRoKHBhdGgpKSB7XG4gICAgICB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aCwgZXhhbXBsZVVybHMgfHwgW10pO1xuICAgIH1cblxuICAgIC8vIFRoZSB0cmFpbGluZyAvIGlzIHN0cmlwcGVkIChpZiBwcm92aWRlZCkgdG8gbWFrZSBVUkwgY29uc3RydWN0aW9uIChjb25jYXRlbmF0aW9uKSBlYXNpZXIgaW5cbiAgICAvLyB0aGUgaW5kaXZpZHVhbCBsb2FkZXIgZnVuY3Rpb25zLlxuICAgIHBhdGggPSBub3JtYWxpemVQYXRoKHBhdGgpO1xuXG4gICAgY29uc3QgbG9hZGVyRm4gPSAoY29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZykgPT4ge1xuICAgICAgaWYgKGlzQWJzb2x1dGVVcmwoY29uZmlnLnNyYykpIHtcbiAgICAgICAgLy8gSW1hZ2UgbG9hZGVyIGZ1bmN0aW9ucyBleHBlY3QgYW4gaW1hZ2UgZmlsZSBuYW1lIChlLmcuIGBteS1pbWFnZS5wbmdgKVxuICAgICAgICAvLyBvciBhIHJlbGF0aXZlIHBhdGggKyBhIGZpbGUgbmFtZSAoZS5nLiBgL2EvYi9jL215LWltYWdlLnBuZ2ApIGFzIGFuIGlucHV0LFxuICAgICAgICAvLyBzbyB0aGUgZmluYWwgYWJzb2x1dGUgVVJMIGNhbiBiZSBjb25zdHJ1Y3RlZC5cbiAgICAgICAgLy8gV2hlbiBhbiBhYnNvbHV0ZSBVUkwgaXMgcHJvdmlkZWQgaW5zdGVhZCAtIHRoZSBsb2FkZXIgY2FuIG5vdFxuICAgICAgICAvLyBidWlsZCBhIGZpbmFsIFVSTCwgdGh1cyB0aGUgZXJyb3IgaXMgdGhyb3duIHRvIGluZGljYXRlIHRoYXQuXG4gICAgICAgIHRocm93VW5leHBlY3RlZEFic29sdXRlVXJsRXJyb3IocGF0aCwgY29uZmlnLnNyYyk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBidWlsZFVybEZuKHBhdGgsIHsuLi5jb25maWcsIHNyYzogbm9ybWFsaXplU3JjKGNvbmZpZy5zcmMpfSk7XG4gICAgfTtcblxuICAgIGNvbnN0IHByb3ZpZGVyczogUHJvdmlkZXJbXSA9IFt7cHJvdmlkZTogSU1BR0VfTE9BREVSLCB1c2VWYWx1ZTogbG9hZGVyRm59XTtcbiAgICByZXR1cm4gcHJvdmlkZXJzO1xuICB9O1xufVxuXG5mdW5jdGlvbiB0aHJvd0ludmFsaWRQYXRoRXJyb3IocGF0aDogdW5rbm93biwgZXhhbXBsZVVybHM6IHN0cmluZ1tdKTogbmV2ZXIge1xuICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0xPQURFUl9BUkdVTUVOVFMsXG4gICAgICBuZ0Rldk1vZGUgJiZcbiAgICAgICAgICBgSW1hZ2UgbG9hZGVyIGhhcyBkZXRlY3RlZCBhbiBpbnZhbGlkIHBhdGggKFxcYCR7cGF0aH1cXGApLiBgICtcbiAgICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBzdXBwbHkgYSBwYXRoIHVzaW5nIG9uZSBvZiB0aGUgZm9sbG93aW5nIGZvcm1hdHM6ICR7XG4gICAgICAgICAgICAgICAgICBleGFtcGxlVXJscy5qb2luKCcgb3IgJyl9YCk7XG59XG5cbmZ1bmN0aW9uIHRocm93VW5leHBlY3RlZEFic29sdXRlVXJsRXJyb3IocGF0aDogc3RyaW5nLCB1cmw6IHN0cmluZyk6IG5ldmVyIHtcbiAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9MT0FERVJfQVJHVU1FTlRTLFxuICAgICAgbmdEZXZNb2RlICYmXG4gICAgICAgICAgYEltYWdlIGxvYWRlciBoYXMgZGV0ZWN0ZWQgYSBcXGA8aW1nPlxcYCB0YWcgd2l0aCBhbiBpbnZhbGlkIFxcYG5nU3JjXFxgIGF0dHJpYnV0ZTogJHtcbiAgICAgICAgICAgICAgdXJsfS4gYCArXG4gICAgICAgICAgICAgIGBUaGlzIGltYWdlIGxvYWRlciBleHBlY3RzIFxcYG5nU3JjXFxgIHRvIGJlIGEgcmVsYXRpdmUgVVJMIC0gYCArXG4gICAgICAgICAgICAgIGBob3dldmVyIHRoZSBwcm92aWRlZCB2YWx1ZSBpcyBhbiBhYnNvbHV0ZSBVUkwuIGAgK1xuICAgICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgXFxgbmdTcmNcXGAgYXMgYSBwYXRoIHJlbGF0aXZlIHRvIHRoZSBiYXNlIFVSTCBgICtcbiAgICAgICAgICAgICAgYGNvbmZpZ3VyZWQgZm9yIHRoaXMgbG9hZGVyIChcXGAke3BhdGh9XFxgKS5gKTtcbn1cbiJdfQ==