/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { inject, Injectable, ɵRuntimeError as RuntimeError } from '@angular/core';
import { DOCUMENT } from '../../dom_tokens';
import { DEFAULT_PRELOADED_IMAGES_LIMIT, PRELOADED_IMAGES } from './tokens';
import * as i0 from "@angular/core";
/**
 * @description Contains the logic needed to track and add preload link tags to the `<head>` tag. It
 * will also track what images have already had preload link tags added so as to not duplicate link
 * tags.
 *
 * In dev mode this service will validate that the number of preloaded images does not exceed the
 * configured default preloaded images limit: {@link DEFAULT_PRELOADED_IMAGES_LIMIT}.
 */
class PreloadLinkCreator {
    constructor() {
        this.preloadedImages = inject(PRELOADED_IMAGES);
        this.document = inject(DOCUMENT);
    }
    /**
     * @description Add a preload `<link>` to the `<head>` of the `index.html` that is served from the
     * server while using Angular Universal and SSR to kick off image loads for high priority images.
     *
     * The `sizes` (passed in from the user) and `srcset` (parsed and formatted from `ngSrcset`)
     * properties used to set the corresponding attributes, `imagesizes` and `imagesrcset`
     * respectively, on the preload `<link>` tag so that the correctly sized image is preloaded from
     * the CDN.
     *
     * {@link https://web.dev/preload-responsive-images/#imagesrcset-and-imagesizes}
     *
     * @param renderer The `Renderer2` passed in from the directive
     * @param src The original src of the image that is set on the `ngSrc` input.
     * @param srcset The parsed and formatted srcset created from the `ngSrcset` input
     * @param sizes The value of the `sizes` attribute passed in to the `<img>` tag
     */
    createPreloadLinkTag(renderer, src, srcset, sizes) {
        if (ngDevMode) {
            if (this.preloadedImages.size >= DEFAULT_PRELOADED_IMAGES_LIMIT) {
                throw new RuntimeError(2961 /* RuntimeErrorCode.TOO_MANY_PRELOADED_IMAGES */, ngDevMode &&
                    `The \`NgOptimizedImage\` directive has detected that more than ` +
                        `${DEFAULT_PRELOADED_IMAGES_LIMIT} images were marked as priority. ` +
                        `This might negatively affect an overall performance of the page. ` +
                        `To fix this, remove the "priority" attribute from images with less priority.`);
            }
        }
        if (this.preloadedImages.has(src)) {
            return;
        }
        this.preloadedImages.add(src);
        const preload = renderer.createElement('link');
        renderer.setAttribute(preload, 'as', 'image');
        renderer.setAttribute(preload, 'href', src);
        renderer.setAttribute(preload, 'rel', 'preload');
        renderer.setAttribute(preload, 'fetchpriority', 'high');
        if (sizes) {
            renderer.setAttribute(preload, 'imageSizes', sizes);
        }
        if (srcset) {
            renderer.setAttribute(preload, 'imageSrcset', srcset);
        }
        renderer.appendChild(this.document.head, preload);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-f2926b1", ngImport: i0, type: PreloadLinkCreator, deps: [], target: i0.ɵɵFactoryTarget.Injectable }); }
    static { this.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-f2926b1", ngImport: i0, type: PreloadLinkCreator, providedIn: 'root' }); }
}
export { PreloadLinkCreator };
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "16.1.0-next.0+sha-f2926b1", ngImport: i0, type: PreloadLinkCreator, decorators: [{
            type: Injectable,
            args: [{ providedIn: 'root' }]
        }] });
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlbG9hZC1saW5rLWNyZWF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2RpcmVjdGl2ZXMvbmdfb3B0aW1pemVkX2ltYWdlL3ByZWxvYWQtbGluay1jcmVhdG9yLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBQyxNQUFNLEVBQUUsVUFBVSxFQUFhLGFBQWEsSUFBSSxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFM0YsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGtCQUFrQixDQUFDO0FBRzFDLE9BQU8sRUFBQyw4QkFBOEIsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLFVBQVUsQ0FBQzs7QUFFMUU7Ozs7Ozs7R0FPRztBQUNILE1BQ2Esa0JBQWtCO0lBRC9CO1FBRW1CLG9CQUFlLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLENBQUM7UUFDM0MsYUFBUSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsQ0FBQztLQXFEOUM7SUFuREM7Ozs7Ozs7Ozs7Ozs7OztPQWVHO0lBQ0gsb0JBQW9CLENBQUMsUUFBbUIsRUFBRSxHQUFXLEVBQUUsTUFBZSxFQUFFLEtBQWM7UUFDcEYsSUFBSSxTQUFTLEVBQUU7WUFDYixJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsSUFBSSxJQUFJLDhCQUE4QixFQUFFO2dCQUMvRCxNQUFNLElBQUksWUFBWSx3REFFbEIsU0FBUztvQkFDTCxpRUFBaUU7d0JBQzdELEdBQUcsOEJBQThCLG1DQUFtQzt3QkFDcEUsbUVBQW1FO3dCQUNuRSw4RUFBOEUsQ0FBQyxDQUFDO2FBQzdGO1NBQ0Y7UUFFRCxJQUFJLElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFFO1lBQ2pDLE9BQU87U0FDUjtRQUVELElBQUksQ0FBQyxlQUFlLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRTlCLE1BQU0sT0FBTyxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUM7UUFDL0MsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlDLFFBQVEsQ0FBQyxZQUFZLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUM1QyxRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsU0FBUyxDQUFDLENBQUM7UUFDakQsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXhELElBQUksS0FBSyxFQUFFO1lBQ1QsUUFBUSxDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQyxDQUFDO1NBQ3JEO1FBRUQsSUFBSSxNQUFNLEVBQUU7WUFDVixRQUFRLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxhQUFhLEVBQUUsTUFBTSxDQUFDLENBQUM7U0FDdkQ7UUFFRCxRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3BELENBQUM7eUhBdERVLGtCQUFrQjs2SEFBbEIsa0JBQWtCLGNBRE4sTUFBTTs7U0FDbEIsa0JBQWtCO3NHQUFsQixrQkFBa0I7a0JBRDlCLFVBQVU7bUJBQUMsRUFBQyxVQUFVLEVBQUUsTUFBTSxFQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7aW5qZWN0LCBJbmplY3RhYmxlLCBSZW5kZXJlcjIsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvcn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7RE9DVU1FTlR9IGZyb20gJy4uLy4uL2RvbV90b2tlbnMnO1xuaW1wb3J0IHtSdW50aW1lRXJyb3JDb2RlfSBmcm9tICcuLi8uLi9lcnJvcnMnO1xuXG5pbXBvcnQge0RFRkFVTFRfUFJFTE9BREVEX0lNQUdFU19MSU1JVCwgUFJFTE9BREVEX0lNQUdFU30gZnJvbSAnLi90b2tlbnMnO1xuXG4vKipcbiAqIEBkZXNjcmlwdGlvbiBDb250YWlucyB0aGUgbG9naWMgbmVlZGVkIHRvIHRyYWNrIGFuZCBhZGQgcHJlbG9hZCBsaW5rIHRhZ3MgdG8gdGhlIGA8aGVhZD5gIHRhZy4gSXRcbiAqIHdpbGwgYWxzbyB0cmFjayB3aGF0IGltYWdlcyBoYXZlIGFscmVhZHkgaGFkIHByZWxvYWQgbGluayB0YWdzIGFkZGVkIHNvIGFzIHRvIG5vdCBkdXBsaWNhdGUgbGlua1xuICogdGFncy5cbiAqXG4gKiBJbiBkZXYgbW9kZSB0aGlzIHNlcnZpY2Ugd2lsbCB2YWxpZGF0ZSB0aGF0IHRoZSBudW1iZXIgb2YgcHJlbG9hZGVkIGltYWdlcyBkb2VzIG5vdCBleGNlZWQgdGhlXG4gKiBjb25maWd1cmVkIGRlZmF1bHQgcHJlbG9hZGVkIGltYWdlcyBsaW1pdDoge0BsaW5rIERFRkFVTFRfUFJFTE9BREVEX0lNQUdFU19MSU1JVH0uXG4gKi9cbkBJbmplY3RhYmxlKHtwcm92aWRlZEluOiAncm9vdCd9KVxuZXhwb3J0IGNsYXNzIFByZWxvYWRMaW5rQ3JlYXRvciB7XG4gIHByaXZhdGUgcmVhZG9ubHkgcHJlbG9hZGVkSW1hZ2VzID0gaW5qZWN0KFBSRUxPQURFRF9JTUFHRVMpO1xuICBwcml2YXRlIHJlYWRvbmx5IGRvY3VtZW50ID0gaW5qZWN0KERPQ1VNRU5UKTtcblxuICAvKipcbiAgICogQGRlc2NyaXB0aW9uIEFkZCBhIHByZWxvYWQgYDxsaW5rPmAgdG8gdGhlIGA8aGVhZD5gIG9mIHRoZSBgaW5kZXguaHRtbGAgdGhhdCBpcyBzZXJ2ZWQgZnJvbSB0aGVcbiAgICogc2VydmVyIHdoaWxlIHVzaW5nIEFuZ3VsYXIgVW5pdmVyc2FsIGFuZCBTU1IgdG8ga2ljayBvZmYgaW1hZ2UgbG9hZHMgZm9yIGhpZ2ggcHJpb3JpdHkgaW1hZ2VzLlxuICAgKlxuICAgKiBUaGUgYHNpemVzYCAocGFzc2VkIGluIGZyb20gdGhlIHVzZXIpIGFuZCBgc3Jjc2V0YCAocGFyc2VkIGFuZCBmb3JtYXR0ZWQgZnJvbSBgbmdTcmNzZXRgKVxuICAgKiBwcm9wZXJ0aWVzIHVzZWQgdG8gc2V0IHRoZSBjb3JyZXNwb25kaW5nIGF0dHJpYnV0ZXMsIGBpbWFnZXNpemVzYCBhbmQgYGltYWdlc3Jjc2V0YFxuICAgKiByZXNwZWN0aXZlbHksIG9uIHRoZSBwcmVsb2FkIGA8bGluaz5gIHRhZyBzbyB0aGF0IHRoZSBjb3JyZWN0bHkgc2l6ZWQgaW1hZ2UgaXMgcHJlbG9hZGVkIGZyb21cbiAgICogdGhlIENETi5cbiAgICpcbiAgICoge0BsaW5rIGh0dHBzOi8vd2ViLmRldi9wcmVsb2FkLXJlc3BvbnNpdmUtaW1hZ2VzLyNpbWFnZXNyY3NldC1hbmQtaW1hZ2VzaXplc31cbiAgICpcbiAgICogQHBhcmFtIHJlbmRlcmVyIFRoZSBgUmVuZGVyZXIyYCBwYXNzZWQgaW4gZnJvbSB0aGUgZGlyZWN0aXZlXG4gICAqIEBwYXJhbSBzcmMgVGhlIG9yaWdpbmFsIHNyYyBvZiB0aGUgaW1hZ2UgdGhhdCBpcyBzZXQgb24gdGhlIGBuZ1NyY2AgaW5wdXQuXG4gICAqIEBwYXJhbSBzcmNzZXQgVGhlIHBhcnNlZCBhbmQgZm9ybWF0dGVkIHNyY3NldCBjcmVhdGVkIGZyb20gdGhlIGBuZ1NyY3NldGAgaW5wdXRcbiAgICogQHBhcmFtIHNpemVzIFRoZSB2YWx1ZSBvZiB0aGUgYHNpemVzYCBhdHRyaWJ1dGUgcGFzc2VkIGluIHRvIHRoZSBgPGltZz5gIHRhZ1xuICAgKi9cbiAgY3JlYXRlUHJlbG9hZExpbmtUYWcocmVuZGVyZXI6IFJlbmRlcmVyMiwgc3JjOiBzdHJpbmcsIHNyY3NldD86IHN0cmluZywgc2l6ZXM/OiBzdHJpbmcpOiB2b2lkIHtcbiAgICBpZiAobmdEZXZNb2RlKSB7XG4gICAgICBpZiAodGhpcy5wcmVsb2FkZWRJbWFnZXMuc2l6ZSA+PSBERUZBVUxUX1BSRUxPQURFRF9JTUFHRVNfTElNSVQpIHtcbiAgICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVE9PX01BTllfUFJFTE9BREVEX0lNQUdFUyxcbiAgICAgICAgICAgIG5nRGV2TW9kZSAmJlxuICAgICAgICAgICAgICAgIGBUaGUgXFxgTmdPcHRpbWl6ZWRJbWFnZVxcYCBkaXJlY3RpdmUgaGFzIGRldGVjdGVkIHRoYXQgbW9yZSB0aGFuIGAgK1xuICAgICAgICAgICAgICAgICAgICBgJHtERUZBVUxUX1BSRUxPQURFRF9JTUFHRVNfTElNSVR9IGltYWdlcyB3ZXJlIG1hcmtlZCBhcyBwcmlvcml0eS4gYCArXG4gICAgICAgICAgICAgICAgICAgIGBUaGlzIG1pZ2h0IG5lZ2F0aXZlbHkgYWZmZWN0IGFuIG92ZXJhbGwgcGVyZm9ybWFuY2Ugb2YgdGhlIHBhZ2UuIGAgK1xuICAgICAgICAgICAgICAgICAgICBgVG8gZml4IHRoaXMsIHJlbW92ZSB0aGUgXCJwcmlvcml0eVwiIGF0dHJpYnV0ZSBmcm9tIGltYWdlcyB3aXRoIGxlc3MgcHJpb3JpdHkuYCk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHRoaXMucHJlbG9hZGVkSW1hZ2VzLmhhcyhzcmMpKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5wcmVsb2FkZWRJbWFnZXMuYWRkKHNyYyk7XG5cbiAgICBjb25zdCBwcmVsb2FkID0gcmVuZGVyZXIuY3JlYXRlRWxlbWVudCgnbGluaycpO1xuICAgIHJlbmRlcmVyLnNldEF0dHJpYnV0ZShwcmVsb2FkLCAnYXMnLCAnaW1hZ2UnKTtcbiAgICByZW5kZXJlci5zZXRBdHRyaWJ1dGUocHJlbG9hZCwgJ2hyZWYnLCBzcmMpO1xuICAgIHJlbmRlcmVyLnNldEF0dHJpYnV0ZShwcmVsb2FkLCAncmVsJywgJ3ByZWxvYWQnKTtcbiAgICByZW5kZXJlci5zZXRBdHRyaWJ1dGUocHJlbG9hZCwgJ2ZldGNocHJpb3JpdHknLCAnaGlnaCcpO1xuXG4gICAgaWYgKHNpemVzKSB7XG4gICAgICByZW5kZXJlci5zZXRBdHRyaWJ1dGUocHJlbG9hZCwgJ2ltYWdlU2l6ZXMnLCBzaXplcyk7XG4gICAgfVxuXG4gICAgaWYgKHNyY3NldCkge1xuICAgICAgcmVuZGVyZXIuc2V0QXR0cmlidXRlKHByZWxvYWQsICdpbWFnZVNyY3NldCcsIHNyY3NldCk7XG4gICAgfVxuXG4gICAgcmVuZGVyZXIuYXBwZW5kQ2hpbGQodGhpcy5kb2N1bWVudC5oZWFkLCBwcmVsb2FkKTtcbiAgfVxufVxuIl19