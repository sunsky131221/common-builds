/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵperformanceMarkFeature as performanceMarkFeature, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue, ChangeDetectorRef, } from '@angular/core';
import { isPlatformServer } from '../../platform_id';
import { imgDirectiveDetails } from './error_helper';
import { cloudinaryLoaderInfo } from './image_loaders/cloudinary_loader';
import { IMAGE_LOADER, noopImageLoader, } from './image_loaders/image_loader';
import { imageKitLoaderInfo } from './image_loaders/imagekit_loader';
import { imgixLoaderInfo } from './image_loaders/imgix_loader';
import { netlifyLoaderInfo } from './image_loaders/netlify_loader';
import { LCPImageObserver } from './lcp_image_observer';
import { PreconnectLinkChecker } from './preconnect_link_checker';
import { PreloadLinkCreator } from './preload-link-creator';
import * as i0 from "@angular/core";
/**
 * When a Base64-encoded image is passed as an input to the `NgOptimizedImage` directive,
 * an error is thrown. The image content (as a string) might be very long, thus making
 * it hard to read an error message if the entire string is included. This const defines
 * the number of characters that should be included into the error message. The rest
 * of the content is truncated.
 */
const BASE64_IMG_MAX_LENGTH_IN_ERROR = 50;
/**
 * RegExpr to determine whether a src in a srcset is using width descriptors.
 * Should match something like: "100w, 200w".
 */
const VALID_WIDTH_DESCRIPTOR_SRCSET = /^((\s*\d+w\s*(,|$)){1,})$/;
/**
 * RegExpr to determine whether a src in a srcset is using density descriptors.
 * Should match something like: "1x, 2x, 50x". Also supports decimals like "1.5x, 1.50x".
 */
const VALID_DENSITY_DESCRIPTOR_SRCSET = /^((\s*\d+(\.\d+)?x\s*(,|$)){1,})$/;
/**
 * Srcset values with a density descriptor higher than this value will actively
 * throw an error. Such densities are not permitted as they cause image sizes
 * to be unreasonably large and slow down LCP.
 */
export const ABSOLUTE_SRCSET_DENSITY_CAP = 3;
/**
 * Used only in error message text to communicate best practices, as we will
 * only throw based on the slightly more conservative ABSOLUTE_SRCSET_DENSITY_CAP.
 */
export const RECOMMENDED_SRCSET_DENSITY_CAP = 2;
/**
 * Used in generating automatic density-based srcsets
 */
const DENSITY_SRCSET_MULTIPLIERS = [1, 2];
/**
 * Used to determine which breakpoints to use on full-width images
 */
const VIEWPORT_BREAKPOINT_CUTOFF = 640;
/**
 * Used to determine whether two aspect ratios are similar in value.
 */
const ASPECT_RATIO_TOLERANCE = 0.1;
/**
 * Used to determine whether the image has been requested at an overly
 * large size compared to the actual rendered image size (after taking
 * into account a typical device pixel ratio). In pixels.
 */
const OVERSIZED_IMAGE_TOLERANCE = 1000;
/**
 * Used to limit automatic srcset generation of very large sources for
 * fixed-size images. In pixels.
 */
const FIXED_SRCSET_WIDTH_LIMIT = 1920;
const FIXED_SRCSET_HEIGHT_LIMIT = 1080;
/**
 * Default blur radius of the CSS filter used on placeholder images, in pixels
 */
export const PLACEHOLDER_BLUR_AMOUNT = 15;
/**
 * Used to warn or error when the user provides an overly large dataURL for the placeholder
 * attribute.
 * Character count of Base64 images is 1 character per byte, and base64 encoding is approximately
 * 33% larger than base images, so 4000 characters is around 3KB on disk and 10000 characters is
 * around 7.7KB. Experimentally, 4000 characters is about 20x20px in PNG or medium-quality JPEG
 * format, and 10,000 is around 50x50px, but there's quite a bit of variation depending on how the
 * image is saved.
 */
export const DATA_URL_WARN_LIMIT = 4000;
export const DATA_URL_ERROR_LIMIT = 10000;
/** Info about built-in loaders we can test for. */
export const BUILT_IN_LOADERS = [
    imgixLoaderInfo,
    imageKitLoaderInfo,
    cloudinaryLoaderInfo,
    netlifyLoaderInfo,
];
/**
 * Directive that improves image loading performance by enforcing best practices.
 *
 * `NgOptimizedImage` ensures that the loading of the Largest Contentful Paint (LCP) image is
 * prioritized by:
 * - Automatically setting the `fetchpriority` attribute on the `<img>` tag
 * - Lazy loading non-priority images by default
 * - Automatically generating a preconnect link tag in the document head
 *
 * In addition, the directive:
 * - Generates appropriate asset URLs if a corresponding `ImageLoader` function is provided
 * - Automatically generates a srcset
 * - Requires that `width` and `height` are set
 * - Warns if `width` or `height` have been set incorrectly
 * - Warns if the image will be visually distorted when rendered
 *
 * @usageNotes
 * The `NgOptimizedImage` directive is marked as [standalone](guide/components/importing) and can
 * be imported directly.
 *
 * Follow the steps below to enable and use the directive:
 * 1. Import it into the necessary NgModule or a standalone Component.
 * 2. Optionally provide an `ImageLoader` if you use an image hosting service.
 * 3. Update the necessary `<img>` tags in templates and replace `src` attributes with `ngSrc`.
 * Using a `ngSrc` allows the directive to control when the `src` gets set, which triggers an image
 * download.
 *
 * Step 1: import the `NgOptimizedImage` directive.
 *
 * ```typescript
 * import { NgOptimizedImage } from '@angular/common';
 *
 * // Include it into the necessary NgModule
 * @NgModule({
 *   imports: [NgOptimizedImage],
 * })
 * class AppModule {}
 *
 * // ... or a standalone Component
 * @Component({
 *   standalone: true
 *   imports: [NgOptimizedImage],
 * })
 * class MyStandaloneComponent {}
 * ```
 *
 * Step 2: configure a loader.
 *
 * To use the **default loader**: no additional code changes are necessary. The URL returned by the
 * generic loader will always match the value of "src". In other words, this loader applies no
 * transformations to the resource URL and the value of the `ngSrc` attribute will be used as is.
 *
 * To use an existing loader for a **third-party image service**: add the provider factory for your
 * chosen service to the `providers` array. In the example below, the Imgix loader is used:
 *
 * ```typescript
 * import {provideImgixLoader} from '@angular/common';
 *
 * // Call the function and add the result to the `providers` array:
 * providers: [
 *   provideImgixLoader("https://my.base.url/"),
 * ],
 * ```
 *
 * The `NgOptimizedImage` directive provides the following functions:
 * - `provideCloudflareLoader`
 * - `provideCloudinaryLoader`
 * - `provideImageKitLoader`
 * - `provideImgixLoader`
 *
 * If you use a different image provider, you can create a custom loader function as described
 * below.
 *
 * To use a **custom loader**: provide your loader function as a value for the `IMAGE_LOADER` DI
 * token.
 *
 * ```typescript
 * import {IMAGE_LOADER, ImageLoaderConfig} from '@angular/common';
 *
 * // Configure the loader using the `IMAGE_LOADER` token.
 * providers: [
 *   {
 *      provide: IMAGE_LOADER,
 *      useValue: (config: ImageLoaderConfig) => {
 *        return `https://example.com/${config.src}-${config.width}.jpg}`;
 *      }
 *   },
 * ],
 * ```
 *
 * Step 3: update `<img>` tags in templates to use `ngSrc` instead of `src`.
 *
 * ```
 * <img ngSrc="logo.png" width="200" height="100">
 * ```
 *
 * @publicApi
 */
export class NgOptimizedImage {
    constructor() {
        this.imageLoader = inject(IMAGE_LOADER);
        this.config = processConfig(inject(IMAGE_CONFIG));
        this.renderer = inject(Renderer2);
        this.imgElement = inject(ElementRef).nativeElement;
        this.injector = inject(Injector);
        this.isServer = isPlatformServer(inject(PLATFORM_ID));
        this.preloadLinkCreator = inject(PreloadLinkCreator);
        // a LCP image observer - should be injected only in the dev mode
        this.lcpObserver = ngDevMode ? this.injector.get(LCPImageObserver) : null;
        /**
         * Calculate the rewritten `src` once and store it.
         * This is needed to avoid repetitive calculations and make sure the directive cleanup in the
         * `ngOnDestroy` does not rely on the `IMAGE_LOADER` logic (which in turn can rely on some other
         * instance that might be already destroyed).
         */
        this._renderedSrc = null;
        /**
         * Indicates whether this image should have a high priority.
         */
        this.priority = false;
        /**
         * Disables automatic srcset generation for this image.
         */
        this.disableOptimizedSrcset = false;
        /**
         * Sets the image to "fill mode", which eliminates the height/width requirement and adds
         * styles such that the image fills its containing element.
         */
        this.fill = false;
    }
    /** @nodoc */
    ngOnInit() {
        performanceMarkFeature('NgOptimizedImage');
        if (ngDevMode) {
            const ngZone = this.injector.get(NgZone);
            assertNonEmptyInput(this, 'ngSrc', this.ngSrc);
            assertValidNgSrcset(this, this.ngSrcset);
            assertNoConflictingSrc(this);
            if (this.ngSrcset) {
                assertNoConflictingSrcset(this);
            }
            assertNotBase64Image(this);
            assertNotBlobUrl(this);
            if (this.fill) {
                assertEmptyWidthAndHeight(this);
                // This leaves the Angular zone to avoid triggering unnecessary change detection cycles when
                // `load` tasks are invoked on images.
                ngZone.runOutsideAngular(() => assertNonZeroRenderedHeight(this, this.imgElement, this.renderer));
            }
            else {
                assertNonEmptyWidthAndHeight(this);
                if (this.height !== undefined) {
                    assertGreaterThanZero(this, this.height, 'height');
                }
                if (this.width !== undefined) {
                    assertGreaterThanZero(this, this.width, 'width');
                }
                // Only check for distorted images when not in fill mode, where
                // images may be intentionally stretched, cropped or letterboxed.
                ngZone.runOutsideAngular(() => assertNoImageDistortion(this, this.imgElement, this.renderer));
            }
            assertValidLoadingInput(this);
            if (!this.ngSrcset) {
                assertNoComplexSizes(this);
            }
            assertValidPlaceholder(this, this.imageLoader);
            assertNotMissingBuiltInLoader(this.ngSrc, this.imageLoader);
            assertNoNgSrcsetWithoutLoader(this, this.imageLoader);
            assertNoLoaderParamsWithoutLoader(this, this.imageLoader);
            if (this.lcpObserver !== null) {
                const ngZone = this.injector.get(NgZone);
                ngZone.runOutsideAngular(() => {
                    this.lcpObserver.registerImage(this.getRewrittenSrc(), this.ngSrc, this.priority);
                });
            }
            if (this.priority) {
                const checker = this.injector.get(PreconnectLinkChecker);
                checker.assertPreconnect(this.getRewrittenSrc(), this.ngSrc);
            }
        }
        if (this.placeholder) {
            this.removePlaceholderOnLoad(this.imgElement);
        }
        this.setHostAttributes();
    }
    setHostAttributes() {
        // Must set width/height explicitly in case they are bound (in which case they will
        // only be reflected and not found by the browser)
        if (this.fill) {
            this.sizes ||= '100vw';
        }
        else {
            this.setHostAttribute('width', this.width.toString());
            this.setHostAttribute('height', this.height.toString());
        }
        this.setHostAttribute('loading', this.getLoadingBehavior());
        this.setHostAttribute('fetchpriority', this.getFetchPriority());
        // The `data-ng-img` attribute flags an image as using the directive, to allow
        // for analysis of the directive's performance.
        this.setHostAttribute('ng-img', 'true');
        // The `src` and `srcset` attributes should be set last since other attributes
        // could affect the image's loading behavior.
        const rewrittenSrcset = this.updateSrcAndSrcset();
        if (this.sizes) {
            this.setHostAttribute('sizes', this.sizes);
        }
        if (this.isServer && this.priority) {
            this.preloadLinkCreator.createPreloadLinkTag(this.renderer, this.getRewrittenSrc(), rewrittenSrcset, this.sizes);
        }
    }
    /** @nodoc */
    ngOnChanges(changes) {
        if (ngDevMode) {
            assertNoPostInitInputChange(this, changes, [
                'ngSrcset',
                'width',
                'height',
                'priority',
                'fill',
                'loading',
                'sizes',
                'loaderParams',
                'disableOptimizedSrcset',
            ]);
        }
        if (changes['ngSrc'] && !changes['ngSrc'].isFirstChange()) {
            const oldSrc = this._renderedSrc;
            this.updateSrcAndSrcset(true);
            const newSrc = this._renderedSrc;
            if (this.lcpObserver !== null && oldSrc && newSrc && oldSrc !== newSrc) {
                const ngZone = this.injector.get(NgZone);
                ngZone.runOutsideAngular(() => {
                    this.lcpObserver?.updateImage(oldSrc, newSrc);
                });
            }
        }
    }
    callImageLoader(configWithoutCustomParams) {
        let augmentedConfig = configWithoutCustomParams;
        if (this.loaderParams) {
            augmentedConfig.loaderParams = this.loaderParams;
        }
        return this.imageLoader(augmentedConfig);
    }
    getLoadingBehavior() {
        if (!this.priority && this.loading !== undefined) {
            return this.loading;
        }
        return this.priority ? 'eager' : 'lazy';
    }
    getFetchPriority() {
        return this.priority ? 'high' : 'auto';
    }
    getRewrittenSrc() {
        // ImageLoaderConfig supports setting a width property. However, we're not setting width here
        // because if the developer uses rendered width instead of intrinsic width in the HTML width
        // attribute, the image requested may be too small for 2x+ screens.
        if (!this._renderedSrc) {
            const imgConfig = { src: this.ngSrc };
            // Cache calculated image src to reuse it later in the code.
            this._renderedSrc = this.callImageLoader(imgConfig);
        }
        return this._renderedSrc;
    }
    getRewrittenSrcset() {
        const widthSrcSet = VALID_WIDTH_DESCRIPTOR_SRCSET.test(this.ngSrcset);
        const finalSrcs = this.ngSrcset
            .split(',')
            .filter((src) => src !== '')
            .map((srcStr) => {
            srcStr = srcStr.trim();
            const width = widthSrcSet ? parseFloat(srcStr) : parseFloat(srcStr) * this.width;
            return `${this.callImageLoader({ src: this.ngSrc, width })} ${srcStr}`;
        });
        return finalSrcs.join(', ');
    }
    getAutomaticSrcset() {
        if (this.sizes) {
            return this.getResponsiveSrcset();
        }
        else {
            return this.getFixedSrcset();
        }
    }
    getResponsiveSrcset() {
        const { breakpoints } = this.config;
        let filteredBreakpoints = breakpoints;
        if (this.sizes?.trim() === '100vw') {
            // Since this is a full-screen-width image, our srcset only needs to include
            // breakpoints with full viewport widths.
            filteredBreakpoints = breakpoints.filter((bp) => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
        }
        const finalSrcs = filteredBreakpoints.map((bp) => `${this.callImageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
        return finalSrcs.join(', ');
    }
    updateSrcAndSrcset(forceSrcRecalc = false) {
        if (forceSrcRecalc) {
            // Reset cached value, so that the followup `getRewrittenSrc()` call
            // will recalculate it and update the cache.
            this._renderedSrc = null;
        }
        const rewrittenSrc = this.getRewrittenSrc();
        this.setHostAttribute('src', rewrittenSrc);
        let rewrittenSrcset = undefined;
        if (this.ngSrcset) {
            rewrittenSrcset = this.getRewrittenSrcset();
        }
        else if (this.shouldGenerateAutomaticSrcset()) {
            rewrittenSrcset = this.getAutomaticSrcset();
        }
        if (rewrittenSrcset) {
            this.setHostAttribute('srcset', rewrittenSrcset);
        }
        return rewrittenSrcset;
    }
    getFixedSrcset() {
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map((multiplier) => `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier,
        })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
        let oversizedImage = false;
        if (!this.sizes) {
            oversizedImage =
                this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
        }
        return (!this.disableOptimizedSrcset &&
            !this.srcset &&
            this.imageLoader !== noopImageLoader &&
            !oversizedImage);
    }
    /**
     * Returns an image url formatted for use with the CSS background-image property. Expects one of:
     * * A base64 encoded image, which is wrapped and passed through.
     * * A boolean. If true, calls the image loader to generate a small placeholder url.
     */
    generatePlaceholder(placeholderInput) {
        const { placeholderResolution } = this.config;
        if (placeholderInput === true) {
            return `url(${this.callImageLoader({
                src: this.ngSrc,
                width: placeholderResolution,
                isPlaceholder: true,
            })})`;
        }
        else if (typeof placeholderInput === 'string' && placeholderInput.startsWith('data:')) {
            return `url(${placeholderInput})`;
        }
        return null;
    }
    /**
     * Determines if blur should be applied, based on an optional boolean
     * property `blur` within the optional configuration object `placeholderConfig`.
     */
    shouldBlurPlaceholder(placeholderConfig) {
        if (!placeholderConfig || !placeholderConfig.hasOwnProperty('blur')) {
            return true;
        }
        return Boolean(placeholderConfig.blur);
    }
    removePlaceholderOnLoad(img) {
        const callback = () => {
            const changeDetectorRef = this.injector.get(ChangeDetectorRef);
            removeLoadListenerFn();
            removeErrorListenerFn();
            this.placeholder = false;
            changeDetectorRef.markForCheck();
        };
        const removeLoadListenerFn = this.renderer.listen(img, 'load', callback);
        const removeErrorListenerFn = this.renderer.listen(img, 'error', callback);
    }
    /** @nodoc */
    ngOnDestroy() {
        if (ngDevMode) {
            if (!this.priority && this._renderedSrc !== null && this.lcpObserver !== null) {
                this.lcpObserver.unregisterImage(this._renderedSrc);
            }
        }
    }
    setHostAttribute(name, value) {
        this.renderer.setAttribute(this.imgElement, name, value);
    }
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "18.1.0-next.0+sha-1360110", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "18.1.0-next.0+sha-1360110", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], placeholder: ["placeholder", "placeholder", booleanOrDataUrlAttribute], placeholderConfig: "placeholderConfig", src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0\" : null", "style.background-size": "placeholder ? \"cover\" : null", "style.background-position": "placeholder ? \"50% 50%\" : null", "style.background-repeat": "placeholder ? \"no-repeat\" : null", "style.background-image": "placeholder ? generatePlaceholder(placeholder) : null", "style.filter": "placeholder && shouldBlurPlaceholder(placeholderConfig) ? \"blur(15px)\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "18.1.0-next.0+sha-1360110", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc]',
                    host: {
                        '[style.position]': 'fill ? "absolute" : null',
                        '[style.width]': 'fill ? "100%" : null',
                        '[style.height]': 'fill ? "100%" : null',
                        '[style.inset]': 'fill ? "0" : null',
                        '[style.background-size]': 'placeholder ? "cover" : null',
                        '[style.background-position]': 'placeholder ? "50% 50%" : null',
                        '[style.background-repeat]': 'placeholder ? "no-repeat" : null',
                        '[style.background-image]': 'placeholder ? generatePlaceholder(placeholder) : null',
                        '[style.filter]': `placeholder && shouldBlurPlaceholder(placeholderConfig) ? "blur(${PLACEHOLDER_BLUR_AMOUNT}px)" : null`,
                    },
                }]
        }], propDecorators: { ngSrc: [{
                type: Input,
                args: [{ required: true, transform: unwrapSafeUrl }]
            }], ngSrcset: [{
                type: Input
            }], sizes: [{
                type: Input
            }], width: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], height: [{
                type: Input,
                args: [{ transform: numberAttribute }]
            }], loading: [{
                type: Input
            }], priority: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], loaderParams: [{
                type: Input
            }], disableOptimizedSrcset: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], fill: [{
                type: Input,
                args: [{ transform: booleanAttribute }]
            }], placeholder: [{
                type: Input,
                args: [{ transform: booleanOrDataUrlAttribute }]
            }], placeholderConfig: [{
                type: Input
            }], src: [{
                type: Input
            }], srcset: [{
                type: Input
            }] } });
/***** Helpers *****/
/**
 * Sorts provided config breakpoints and uses defaults.
 */
function processConfig(config) {
    let sortedBreakpoints = {};
    if (config.breakpoints) {
        sortedBreakpoints.breakpoints = config.breakpoints.sort((a, b) => a - b);
    }
    return Object.assign({}, IMAGE_CONFIG_DEFAULTS, config, sortedBreakpoints);
}
/***** Assert functions *****/
/**
 * Verifies that there is no `src` set on a host element.
 */
function assertNoConflictingSrc(dir) {
    if (dir.src) {
        throw new RuntimeError(2950 /* RuntimeErrorCode.UNEXPECTED_SRC_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`src\` and \`ngSrc\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`src\` itself based on the value of \`ngSrc\`. ` +
            `To fix this, please remove the \`src\` attribute.`);
    }
}
/**
 * Verifies that there is no `srcset` set on a host element.
 */
function assertNoConflictingSrcset(dir) {
    if (dir.srcset) {
        throw new RuntimeError(2951 /* RuntimeErrorCode.UNEXPECTED_SRCSET_ATTR */, `${imgDirectiveDetails(dir.ngSrc)} both \`srcset\` and \`ngSrcset\` have been set. ` +
            `Supplying both of these attributes breaks lazy loading. ` +
            `The NgOptimizedImage directive sets \`srcset\` itself based on the value of ` +
            `\`ngSrcset\`. To fix this, please remove the \`srcset\` attribute.`);
    }
}
/**
 * Verifies that the `ngSrc` is not a Base64-encoded image.
 */
function assertNotBase64Image(dir) {
    let ngSrc = dir.ngSrc.trim();
    if (ngSrc.startsWith('data:')) {
        if (ngSrc.length > BASE64_IMG_MAX_LENGTH_IN_ERROR) {
            ngSrc = ngSrc.substring(0, BASE64_IMG_MAX_LENGTH_IN_ERROR) + '...';
        }
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`ngSrc\` is a Base64-encoded string ` +
            `(${ngSrc}). NgOptimizedImage does not support Base64-encoded strings. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`ngSrc\` and using a standard \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the 'sizes' only includes responsive values.
 */
function assertNoComplexSizes(dir) {
    let sizes = dir.sizes;
    if (sizes?.match(/((\)|,)\s|^)\d+px/)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`sizes\` was set to a string including ` +
            `pixel values. For automatic \`srcset\` generation, \`sizes\` must only include responsive ` +
            `values, such as \`sizes="50vw"\` or \`sizes="(min-width: 768px) 50vw, 100vw"\`. ` +
            `To fix this, modify the \`sizes\` attribute, or provide your own \`ngSrcset\` value directly.`);
    }
}
function assertValidPlaceholder(dir, imageLoader) {
    assertNoPlaceholderConfigWithoutPlaceholder(dir);
    assertNoRelativePlaceholderWithoutLoader(dir, imageLoader);
    assertNoOversizedDataUrl(dir);
}
/**
 * Verifies that placeholderConfig isn't being used without placeholder
 */
function assertNoPlaceholderConfigWithoutPlaceholder(dir) {
    if (dir.placeholderConfig && !dir.placeholder) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc, false)} \`placeholderConfig\` options were provided for an ` +
            `image that does not use the \`placeholder\` attribute, and will have no effect.`);
    }
}
/**
 * Warns if a relative URL placeholder is specified, but no loader is present to provide the small
 * image.
 */
function assertNoRelativePlaceholderWithoutLoader(dir, imageLoader) {
    if (dir.placeholder === true && imageLoader === noopImageLoader) {
        throw new RuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to true but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which would result in the same image being used for the primary image and its placeholder. ` +
            `To fix this, provide a loader or remove the \`placeholder\` attribute from the image.`);
    }
}
/**
 * Warns or throws an error if an oversized dataURL placeholder is provided.
 */
function assertNoOversizedDataUrl(dir) {
    if (dir.placeholder &&
        typeof dir.placeholder === 'string' &&
        dir.placeholder.startsWith('data:')) {
        if (dir.placeholder.length > DATA_URL_ERROR_LIMIT) {
            throw new RuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
                `than ${DATA_URL_ERROR_LIMIT} characters. This is strongly discouraged, as large inline placeholders ` +
                `directly increase the bundle size of Angular and hurt page load performance. To fix this, generate ` +
                `a smaller data URL placeholder.`);
        }
        if (dir.placeholder.length > DATA_URL_WARN_LIMIT) {
            console.warn(formatRuntimeError(2965 /* RuntimeErrorCode.OVERSIZED_PLACEHOLDER */, `${imgDirectiveDetails(dir.ngSrc)} the \`placeholder\` attribute is set to a data URL which is longer ` +
                `than ${DATA_URL_WARN_LIMIT} characters. This is discouraged, as large inline placeholders ` +
                `directly increase the bundle size of Angular and hurt page load performance. For better loading performance, ` +
                `generate a smaller data URL placeholder.`));
        }
    }
}
/**
 * Verifies that the `ngSrc` is not a Blob URL.
 */
function assertNotBlobUrl(dir) {
    const ngSrc = dir.ngSrc.trim();
    if (ngSrc.startsWith('blob:')) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrc\` was set to a blob URL (${ngSrc}). ` +
            `Blob URLs are not supported by the NgOptimizedImage directive. ` +
            `To fix this, disable the NgOptimizedImage directive for this element ` +
            `by removing \`ngSrc\` and using a regular \`src\` attribute instead.`);
    }
}
/**
 * Verifies that the input is set to a non-empty string.
 */
function assertNonEmptyInput(dir, name, value) {
    const isString = typeof value === 'string';
    const isEmptyString = isString && value.trim() === '';
    if (!isString || isEmptyString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${name}\` has an invalid value ` +
            `(\`${value}\`). To fix this, change the value to a non-empty string.`);
    }
}
/**
 * Verifies that the `ngSrcset` is in a valid format, e.g. "100w, 200w" or "1x, 2x".
 */
export function assertValidNgSrcset(dir, value) {
    if (value == null)
        return;
    assertNonEmptyInput(dir, 'ngSrcset', value);
    const stringVal = value;
    const isValidWidthDescriptor = VALID_WIDTH_DESCRIPTOR_SRCSET.test(stringVal);
    const isValidDensityDescriptor = VALID_DENSITY_DESCRIPTOR_SRCSET.test(stringVal);
    if (isValidDensityDescriptor) {
        assertUnderDensityCap(dir, stringVal);
    }
    const isValidSrcset = isValidWidthDescriptor || isValidDensityDescriptor;
    if (!isValidSrcset) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`ngSrcset\` has an invalid value (\`${value}\`). ` +
            `To fix this, supply \`ngSrcset\` using a comma-separated list of one or more width ` +
            `descriptors (e.g. "100w, 200w") or density descriptors (e.g. "1x, 2x").`);
    }
}
function assertUnderDensityCap(dir, value) {
    const underDensityCap = value
        .split(',')
        .every((num) => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
    if (!underDensityCap) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` contains an unsupported image density:` +
            `\`${value}\`. NgOptimizedImage generally recommends a max image density of ` +
            `${RECOMMENDED_SRCSET_DENSITY_CAP}x but supports image densities up to ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x. The human eye cannot distinguish between image densities ` +
            `greater than ${RECOMMENDED_SRCSET_DENSITY_CAP}x - which makes them unnecessary for ` +
            `most use cases. Images that will be pinch-zoomed are typically the primary use case for ` +
            `${ABSOLUTE_SRCSET_DENSITY_CAP}x images. Please remove the high density descriptor and try again.`);
    }
}
/**
 * Creates a `RuntimeError` instance to represent a situation when an input is set after
 * the directive has initialized.
 */
function postInitInputChangeError(dir, inputName) {
    let reason;
    if (inputName === 'width' || inputName === 'height') {
        reason =
            `Changing \`${inputName}\` may result in different attribute value ` +
                `applied to the underlying image element and cause layout shifts on a page.`;
    }
    else {
        reason =
            `Changing the \`${inputName}\` would have no effect on the underlying ` +
                `image element, because the resource loading has already occurred.`;
    }
    return new RuntimeError(2953 /* RuntimeErrorCode.UNEXPECTED_INPUT_CHANGE */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` was updated after initialization. ` +
        `The NgOptimizedImage directive will not react to this input change. ${reason} ` +
        `To fix this, either switch \`${inputName}\` to a static value ` +
        `or wrap the image element in an *ngIf that is gated on the necessary value.`);
}
/**
 * Verify that none of the listed inputs has changed.
 */
function assertNoPostInitInputChange(dir, changes, inputs) {
    inputs.forEach((input) => {
        const isUpdated = changes.hasOwnProperty(input);
        if (isUpdated && !changes[input].isFirstChange()) {
            if (input === 'ngSrc') {
                // When the `ngSrc` input changes, we detect that only in the
                // `ngOnChanges` hook, thus the `ngSrc` is already set. We use
                // `ngSrc` in the error message, so we use a previous value, but
                // not the updated one in it.
                dir = { ngSrc: changes[input].previousValue };
            }
            throw postInitInputChangeError(dir, input);
        }
    });
}
/**
 * Verifies that a specified input is a number greater than 0.
 */
function assertGreaterThanZero(dir, inputValue, inputName) {
    const validNumber = typeof inputValue === 'number' && inputValue > 0;
    const validString = typeof inputValue === 'string' && /^\d+$/.test(inputValue.trim()) && parseInt(inputValue) > 0;
    if (!validNumber && !validString) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} \`${inputName}\` has an invalid value. ` +
            `To fix this, provide \`${inputName}\` as a number greater than 0.`);
    }
}
/**
 * Verifies that the rendered image is not visually distorted. Effectively this is checking:
 * - Whether the "width" and "height" attributes reflect the actual dimensions of the image.
 * - Whether image styling is "correct" (see below for a longer explanation).
 */
function assertNoImageDistortion(dir, img, renderer) {
    const removeLoadListenerFn = renderer.listen(img, 'load', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
        const computedStyle = window.getComputedStyle(img);
        let renderedWidth = parseFloat(computedStyle.getPropertyValue('width'));
        let renderedHeight = parseFloat(computedStyle.getPropertyValue('height'));
        const boxSizing = computedStyle.getPropertyValue('box-sizing');
        if (boxSizing === 'border-box') {
            const paddingTop = computedStyle.getPropertyValue('padding-top');
            const paddingRight = computedStyle.getPropertyValue('padding-right');
            const paddingBottom = computedStyle.getPropertyValue('padding-bottom');
            const paddingLeft = computedStyle.getPropertyValue('padding-left');
            renderedWidth -= parseFloat(paddingRight) + parseFloat(paddingLeft);
            renderedHeight -= parseFloat(paddingTop) + parseFloat(paddingBottom);
        }
        const renderedAspectRatio = renderedWidth / renderedHeight;
        const nonZeroRenderedDimensions = renderedWidth !== 0 && renderedHeight !== 0;
        const intrinsicWidth = img.naturalWidth;
        const intrinsicHeight = img.naturalHeight;
        const intrinsicAspectRatio = intrinsicWidth / intrinsicHeight;
        const suppliedWidth = dir.width;
        const suppliedHeight = dir.height;
        const suppliedAspectRatio = suppliedWidth / suppliedHeight;
        // Tolerance is used to account for the impact of subpixel rendering.
        // Due to subpixel rendering, the rendered, intrinsic, and supplied
        // aspect ratios of a correctly configured image may not exactly match.
        // For example, a `width=4030 height=3020` image might have a rendered
        // size of "1062w, 796.48h". (An aspect ratio of 1.334... vs. 1.333...)
        const inaccurateDimensions = Math.abs(suppliedAspectRatio - intrinsicAspectRatio) > ASPECT_RATIO_TOLERANCE;
        const stylingDistortion = nonZeroRenderedDimensions &&
            Math.abs(intrinsicAspectRatio - renderedAspectRatio) > ASPECT_RATIO_TOLERANCE;
        if (inaccurateDimensions) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the image does not match ` +
                `the aspect ratio indicated by the width and height attributes. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nSupplied width and height attributes: ` +
                `${suppliedWidth}w x ${suppliedHeight}h (aspect-ratio: ${round(suppliedAspectRatio)}). ` +
                `\nTo fix this, update the width and height attributes.`));
        }
        else if (stylingDistortion) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the aspect ratio of the rendered image ` +
                `does not match the image's intrinsic aspect ratio. ` +
                `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h ` +
                `(aspect-ratio: ${round(intrinsicAspectRatio)}). \nRendered image size: ` +
                `${renderedWidth}w x ${renderedHeight}h (aspect-ratio: ` +
                `${round(renderedAspectRatio)}). \nThis issue can occur if "width" and "height" ` +
                `attributes are added to an image without updating the corresponding ` +
                `image styling. To fix this, adjust image styling. In most cases, ` +
                `adding "height: auto" or "width: auto" to the image styling will fix ` +
                `this issue.`));
        }
        else if (!dir.ngSrcset && nonZeroRenderedDimensions) {
            // If `ngSrcset` hasn't been set, sanity check the intrinsic size.
            const recommendedWidth = RECOMMENDED_SRCSET_DENSITY_CAP * renderedWidth;
            const recommendedHeight = RECOMMENDED_SRCSET_DENSITY_CAP * renderedHeight;
            const oversizedWidth = intrinsicWidth - recommendedWidth >= OVERSIZED_IMAGE_TOLERANCE;
            const oversizedHeight = intrinsicHeight - recommendedHeight >= OVERSIZED_IMAGE_TOLERANCE;
            if (oversizedWidth || oversizedHeight) {
                console.warn(formatRuntimeError(2960 /* RuntimeErrorCode.OVERSIZED_IMAGE */, `${imgDirectiveDetails(dir.ngSrc)} the intrinsic image is significantly ` +
                    `larger than necessary. ` +
                    `\nRendered image size: ${renderedWidth}w x ${renderedHeight}h. ` +
                    `\nIntrinsic image size: ${intrinsicWidth}w x ${intrinsicHeight}h. ` +
                    `\nRecommended intrinsic image size: ${recommendedWidth}w x ${recommendedHeight}h. ` +
                    `\nNote: Recommended intrinsic image size is calculated assuming a maximum DPR of ` +
                    `${RECOMMENDED_SRCSET_DENSITY_CAP}. To improve loading time, resize the image ` +
                    `or consider using the "ngSrcset" and "sizes" attributes.`));
            }
        }
    });
    // We only listen to the `error` event to remove the `load` event listener because it will not be
    // fired if the image fails to load. This is done to prevent memory leaks in development mode
    // because image elements aren't garbage-collected properly. It happens because zone.js stores the
    // event listener directly on the element and closures capture `dir`.
    const removeErrorListenerFn = renderer.listen(img, 'error', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
    });
}
/**
 * Verifies that a specified input is set.
 */
function assertNonEmptyWidthAndHeight(dir) {
    let missingAttributes = [];
    if (dir.width === undefined)
        missingAttributes.push('width');
    if (dir.height === undefined)
        missingAttributes.push('height');
    if (missingAttributes.length > 0) {
        throw new RuntimeError(2954 /* RuntimeErrorCode.REQUIRED_INPUT_MISSING */, `${imgDirectiveDetails(dir.ngSrc)} these required attributes ` +
            `are missing: ${missingAttributes.map((attr) => `"${attr}"`).join(', ')}. ` +
            `Including "width" and "height" attributes will prevent image-related layout shifts. ` +
            `To fix this, include "width" and "height" attributes on the image tag or turn on ` +
            `"fill" mode with the \`fill\` attribute.`);
    }
}
/**
 * Verifies that width and height are not set. Used in fill mode, where those attributes don't make
 * sense.
 */
function assertEmptyWidthAndHeight(dir) {
    if (dir.width || dir.height) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the attributes \`height\` and/or \`width\` are present ` +
            `along with the \`fill\` attribute. Because \`fill\` mode causes an image to fill its containing ` +
            `element, the size attributes have no effect and should be removed.`);
    }
}
/**
 * Verifies that the rendered image has a nonzero height. If the image is in fill mode, provides
 * guidance that this can be caused by the containing element's CSS position property.
 */
function assertNonZeroRenderedHeight(dir, img, renderer) {
    const removeLoadListenerFn = renderer.listen(img, 'load', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
        const renderedHeight = img.clientHeight;
        if (dir.fill && renderedHeight === 0) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` +
                `This is likely because the containing element does not have the CSS 'position' ` +
                `property set to one of the following: "relative", "fixed", or "absolute". ` +
                `To fix this problem, make sure the container element has the CSS 'position' ` +
                `property defined and the height of the element is not zero.`));
        }
    });
    // See comments in the `assertNoImageDistortion`.
    const removeErrorListenerFn = renderer.listen(img, 'error', () => {
        removeLoadListenerFn();
        removeErrorListenerFn();
    });
}
/**
 * Verifies that the `loading` attribute is set to a valid input &
 * is not used on priority images.
 */
function assertValidLoadingInput(dir) {
    if (dir.loading && dir.priority) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
            `was used on an image that was marked "priority". ` +
            `Setting \`loading\` on priority images is not allowed ` +
            `because these images will always be eagerly loaded. ` +
            `To fix this, remove the “loading” attribute from the priority image.`);
    }
    const validInputs = ['auto', 'eager', 'lazy'];
    if (typeof dir.loading === 'string' && !validInputs.includes(dir.loading)) {
        throw new RuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the \`loading\` attribute ` +
            `has an invalid value (\`${dir.loading}\`). ` +
            `To fix this, provide a valid value ("lazy", "eager", or "auto").`);
    }
}
/**
 * Warns if NOT using a loader (falling back to the generic loader) and
 * the image appears to be hosted on one of the image CDNs for which
 * we do have a built-in image loader. Suggests switching to the
 * built-in loader.
 *
 * @param ngSrc Value of the ngSrc attribute
 * @param imageLoader ImageLoader provided
 */
function assertNotMissingBuiltInLoader(ngSrc, imageLoader) {
    if (imageLoader === noopImageLoader) {
        let builtInLoaderName = '';
        for (const loader of BUILT_IN_LOADERS) {
            if (loader.testUrl(ngSrc)) {
                builtInLoaderName = loader.name;
                break;
            }
        }
        if (builtInLoaderName) {
            console.warn(formatRuntimeError(2962 /* RuntimeErrorCode.MISSING_BUILTIN_LOADER */, `NgOptimizedImage: It looks like your images may be hosted on the ` +
                `${builtInLoaderName} CDN, but your app is not using Angular's ` +
                `built-in loader for that CDN. We recommend switching to use ` +
                `the built-in by calling \`provide${builtInLoaderName}Loader()\` ` +
                `in your \`providers\` and passing it your instance's base URL. ` +
                `If you don't want to use the built-in loader, define a custom ` +
                `loader function using IMAGE_LOADER to silence this warning.`));
        }
    }
}
/**
 * Warns if ngSrcset is present and no loader is configured (i.e. the default one is being used).
 */
function assertNoNgSrcsetWithoutLoader(dir, imageLoader) {
    if (dir.ngSrcset && imageLoader === noopImageLoader) {
        console.warn(formatRuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`ngSrcset\` attribute is present but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which would result in the same image being used for all configured sizes. ` +
            `To fix this, provide a loader or remove the \`ngSrcset\` attribute from the image.`));
    }
}
/**
 * Warns if loaderParams is present and no loader is configured (i.e. the default one is being
 * used).
 */
function assertNoLoaderParamsWithoutLoader(dir, imageLoader) {
    if (dir.loaderParams && imageLoader === noopImageLoader) {
        console.warn(formatRuntimeError(2963 /* RuntimeErrorCode.MISSING_NECESSARY_LOADER */, `${imgDirectiveDetails(dir.ngSrc)} the \`loaderParams\` attribute is present but ` +
            `no image loader is configured (i.e. the default one is being used), ` +
            `which means that the loaderParams data will not be consumed and will not affect the URL. ` +
            `To fix this, provide a custom loader or remove the \`loaderParams\` attribute from the image.`));
    }
}
function round(input) {
    return Number.isInteger(input) ? input : input.toFixed(2);
}
// Transform function to handle SafeValue input for ngSrc. This doesn't do any sanitization,
// as that is not needed for img.src and img.srcset. This transform is purely for compatibility.
function unwrapSafeUrl(value) {
    if (typeof value === 'string') {
        return value;
    }
    return unwrapSafeValue(value);
}
// Transform function to handle inputs which may be booleans, strings, or string representations
// of boolean values. Used for the placeholder attribute.
export function booleanOrDataUrlAttribute(value) {
    if (typeof value === 'string' && value.startsWith(`data:`)) {
        return value;
    }
    return booleanAttribute(value);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUNMLGdCQUFnQixFQUNoQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sRUFDTixRQUFRLEVBQ1IsS0FBSyxFQUNMLE1BQU0sRUFDTixlQUFlLEVBSWYsV0FBVyxFQUNYLFNBQVMsRUFFVCxtQkFBbUIsSUFBSSxrQkFBa0IsRUFDekMsYUFBYSxJQUFJLFlBQVksRUFDN0Isc0JBQXNCLElBQUkscUJBQXFCLEVBRS9DLHVCQUF1QixJQUFJLHNCQUFzQixFQUNqRCxhQUFhLElBQUksWUFBWSxFQUU3QixnQkFBZ0IsSUFBSSxlQUFlLEVBQ25DLGlCQUFpQixHQUNsQixNQUFNLGVBQWUsQ0FBQztBQUd2QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxtQkFBbUIsQ0FBQztBQUVuRCxPQUFPLEVBQUMsbUJBQW1CLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUNuRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUMsTUFBTSxtQ0FBbUMsQ0FBQztBQUN2RSxPQUFPLEVBQ0wsWUFBWSxFQUdaLGVBQWUsR0FDaEIsTUFBTSw4QkFBOEIsQ0FBQztBQUN0QyxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxpQ0FBaUMsQ0FBQztBQUNuRSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDN0QsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sZ0NBQWdDLENBQUM7QUFDakUsT0FBTyxFQUFDLGdCQUFnQixFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDdEQsT0FBTyxFQUFDLHFCQUFxQixFQUFDLE1BQU0sMkJBQTJC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LENBQUMsR0FBcUIsRUFBRSxXQUF3QjtJQUN4RixJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRSxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQ1Ysa0JBQWtCLHVEQUVoQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaURBQWlEO1lBQ2hGLHNFQUFzRTtZQUN0RSwyRkFBMkY7WUFDM0YsK0ZBQStGLENBQ2xHLENBQ0YsQ0FBQztJQUNKLENBQUM7QUFDSCxDQUFDO0FBRUQsU0FBUyxLQUFLLENBQUMsS0FBYTtJQUMxQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsNEZBQTRGO0FBQzVGLGdHQUFnRztBQUNoRyxTQUFTLGFBQWEsQ0FBQyxLQUF5QjtJQUM5QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUM7QUFFRCxnR0FBZ0c7QUFDaEcseURBQXlEO0FBQ3pELE1BQU0sVUFBVSx5QkFBeUIsQ0FBQyxLQUF1QjtJQUMvRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDM0QsT0FBTyxLQUFLLENBQUM7SUFDZixDQUFDO0lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7XG4gIGJvb2xlYW5BdHRyaWJ1dGUsXG4gIERpcmVjdGl2ZSxcbiAgRWxlbWVudFJlZixcbiAgaW5qZWN0LFxuICBJbmplY3RvcixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgbnVtYmVyQXR0cmlidXRlLFxuICBPbkNoYW5nZXMsXG4gIE9uRGVzdHJveSxcbiAgT25Jbml0LFxuICBQTEFURk9STV9JRCxcbiAgUmVuZGVyZXIyLFxuICBTaW1wbGVDaGFuZ2VzLFxuICDJtWZvcm1hdFJ1bnRpbWVFcnJvciBhcyBmb3JtYXRSdW50aW1lRXJyb3IsXG4gIMm1SU1BR0VfQ09ORklHIGFzIElNQUdFX0NPTkZJRyxcbiAgybVJTUFHRV9DT05GSUdfREVGQVVMVFMgYXMgSU1BR0VfQ09ORklHX0RFRkFVTFRTLFxuICDJtUltYWdlQ29uZmlnIGFzIEltYWdlQ29uZmlnLFxuICDJtXBlcmZvcm1hbmNlTWFya0ZlYXR1cmUgYXMgcGVyZm9ybWFuY2VNYXJrRmVhdHVyZSxcbiAgybVSdW50aW1lRXJyb3IgYXMgUnVudGltZUVycm9yLFxuICDJtVNhZmVWYWx1ZSBhcyBTYWZlVmFsdWUsXG4gIMm1dW53cmFwU2FmZVZhbHVlIGFzIHVud3JhcFNhZmVWYWx1ZSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcblxuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2Nsb3VkaW5hcnlMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXInO1xuaW1wb3J0IHtcbiAgSU1BR0VfTE9BREVSLFxuICBJbWFnZUxvYWRlcixcbiAgSW1hZ2VMb2FkZXJDb25maWcsXG4gIG5vb3BJbWFnZUxvYWRlcixcbn0gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltYWdlX2xvYWRlcic7XG5pbXBvcnQge2ltYWdlS2l0TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltYWdla2l0X2xvYWRlcic7XG5pbXBvcnQge2ltZ2l4TG9hZGVySW5mb30gZnJvbSAnLi9pbWFnZV9sb2FkZXJzL2ltZ2l4X2xvYWRlcic7XG5pbXBvcnQge25ldGxpZnlMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvbmV0bGlmeV9sb2FkZXInO1xuaW1wb3J0IHtMQ1BJbWFnZU9ic2VydmVyfSBmcm9tICcuL2xjcF9pbWFnZV9vYnNlcnZlcic7XG5pbXBvcnQge1ByZWNvbm5lY3RMaW5rQ2hlY2tlcn0gZnJvbSAnLi9wcmVjb25uZWN0X2xpbmtfY2hlY2tlcic7XG5pbXBvcnQge1ByZWxvYWRMaW5rQ3JlYXRvcn0gZnJvbSAnLi9wcmVsb2FkLWxpbmstY3JlYXRvcic7XG5cbi8qKlxuICogV2hlbiBhIEJhc2U2NC1lbmNvZGVkIGltYWdlIGlzIHBhc3NlZCBhcyBhbiBpbnB1dCB0byB0aGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSxcbiAqIGFuIGVycm9yIGlzIHRocm93bi4gVGhlIGltYWdlIGNvbnRlbnQgKGFzIGEgc3RyaW5nKSBtaWdodCBiZSB2ZXJ5IGxvbmcsIHRodXMgbWFraW5nXG4gKiBpdCBoYXJkIHRvIHJlYWQgYW4gZXJyb3IgbWVzc2FnZSBpZiB0aGUgZW50aXJlIHN0cmluZyBpcyBpbmNsdWRlZC4gVGhpcyBjb25zdCBkZWZpbmVzXG4gKiB0aGUgbnVtYmVyIG9mIGNoYXJhY3RlcnMgdGhhdCBzaG91bGQgYmUgaW5jbHVkZWQgaW50byB0aGUgZXJyb3IgbWVzc2FnZS4gVGhlIHJlc3RcbiAqIG9mIHRoZSBjb250ZW50IGlzIHRydW5jYXRlZC5cbiAqL1xuY29uc3QgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SID0gNTA7XG5cbi8qKlxuICogUmVnRXhwciB0byBkZXRlcm1pbmUgd2hldGhlciBhIHNyYyBpbiBhIHNyY3NldCBpcyB1c2luZyB3aWR0aCBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxMDB3LCAyMDB3XCIuXG4gKi9cbmNvbnN0IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrd1xccyooLHwkKSl7MSx9KSQvO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgZGVuc2l0eSBkZXNjcmlwdG9ycy5cbiAqIFNob3VsZCBtYXRjaCBzb21ldGhpbmcgbGlrZTogXCIxeCwgMngsIDUweFwiLiBBbHNvIHN1cHBvcnRzIGRlY2ltYWxzIGxpa2UgXCIxLjV4LCAxLjUweFwiLlxuICovXG5jb25zdCBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VUID0gL14oKFxccypcXGQrKFxcLlxcZCspP3hcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBTcmNzZXQgdmFsdWVzIHdpdGggYSBkZW5zaXR5IGRlc2NyaXB0b3IgaGlnaGVyIHRoYW4gdGhpcyB2YWx1ZSB3aWxsIGFjdGl2ZWx5XG4gKiB0aHJvdyBhbiBlcnJvci4gU3VjaCBkZW5zaXRpZXMgYXJlIG5vdCBwZXJtaXR0ZWQgYXMgdGhleSBjYXVzZSBpbWFnZSBzaXplc1xuICogdG8gYmUgdW5yZWFzb25hYmx5IGxhcmdlIGFuZCBzbG93IGRvd24gTENQLlxuICovXG5leHBvcnQgY29uc3QgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMztcblxuLyoqXG4gKiBVc2VkIG9ubHkgaW4gZXJyb3IgbWVzc2FnZSB0ZXh0IHRvIGNvbW11bmljYXRlIGJlc3QgcHJhY3RpY2VzLCBhcyB3ZSB3aWxsXG4gKiBvbmx5IHRocm93IGJhc2VkIG9uIHRoZSBzbGlnaHRseSBtb3JlIGNvbnNlcnZhdGl2ZSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVAuXG4gKi9cbmV4cG9ydCBjb25zdCBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgPSAyO1xuXG4vKipcbiAqIFVzZWQgaW4gZ2VuZXJhdGluZyBhdXRvbWF0aWMgZGVuc2l0eS1iYXNlZCBzcmNzZXRzXG4gKi9cbmNvbnN0IERFTlNJVFlfU1JDU0VUX01VTFRJUExJRVJTID0gWzEsIDJdO1xuXG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoaWNoIGJyZWFrcG9pbnRzIHRvIHVzZSBvbiBmdWxsLXdpZHRoIGltYWdlc1xuICovXG5jb25zdCBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRiA9IDY0MDtcbi8qKlxuICogVXNlZCB0byBkZXRlcm1pbmUgd2hldGhlciB0d28gYXNwZWN0IHJhdGlvcyBhcmUgc2ltaWxhciBpbiB2YWx1ZS5cbiAqL1xuY29uc3QgQVNQRUNUX1JBVElPX1RPTEVSQU5DRSA9IDAuMTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBpbWFnZSBoYXMgYmVlbiByZXF1ZXN0ZWQgYXQgYW4gb3Zlcmx5XG4gKiBsYXJnZSBzaXplIGNvbXBhcmVkIHRvIHRoZSBhY3R1YWwgcmVuZGVyZWQgaW1hZ2Ugc2l6ZSAoYWZ0ZXIgdGFraW5nXG4gKiBpbnRvIGFjY291bnQgYSB0eXBpY2FsIGRldmljZSBwaXhlbCByYXRpbykuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRSA9IDEwMDA7XG5cbi8qKlxuICogVXNlZCB0byBsaW1pdCBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gb2YgdmVyeSBsYXJnZSBzb3VyY2VzIGZvclxuICogZml4ZWQtc2l6ZSBpbWFnZXMuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUID0gMTkyMDtcbmNvbnN0IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQgPSAxMDgwO1xuXG4vKipcbiAqIERlZmF1bHQgYmx1ciByYWRpdXMgb2YgdGhlIENTUyBmaWx0ZXIgdXNlZCBvbiBwbGFjZWhvbGRlciBpbWFnZXMsIGluIHBpeGVsc1xuICovXG5leHBvcnQgY29uc3QgUExBQ0VIT0xERVJfQkxVUl9BTU9VTlQgPSAxNTtcblxuLyoqXG4gKiBVc2VkIHRvIHdhcm4gb3IgZXJyb3Igd2hlbiB0aGUgdXNlciBwcm92aWRlcyBhbiBvdmVybHkgbGFyZ2UgZGF0YVVSTCBmb3IgdGhlIHBsYWNlaG9sZGVyXG4gKiBhdHRyaWJ1dGUuXG4gKiBDaGFyYWN0ZXIgY291bnQgb2YgQmFzZTY0IGltYWdlcyBpcyAxIGNoYXJhY3RlciBwZXIgYnl0ZSwgYW5kIGJhc2U2NCBlbmNvZGluZyBpcyBhcHByb3hpbWF0ZWx5XG4gKiAzMyUgbGFyZ2VyIHRoYW4gYmFzZSBpbWFnZXMsIHNvIDQwMDAgY2hhcmFjdGVycyBpcyBhcm91bmQgM0tCIG9uIGRpc2sgYW5kIDEwMDAwIGNoYXJhY3RlcnMgaXNcbiAqIGFyb3VuZCA3LjdLQi4gRXhwZXJpbWVudGFsbHksIDQwMDAgY2hhcmFjdGVycyBpcyBhYm91dCAyMHgyMHB4IGluIFBORyBvciBtZWRpdW0tcXVhbGl0eSBKUEVHXG4gKiBmb3JtYXQsIGFuZCAxMCwwMDAgaXMgYXJvdW5kIDUweDUwcHgsIGJ1dCB0aGVyZSdzIHF1aXRlIGEgYml0IG9mIHZhcmlhdGlvbiBkZXBlbmRpbmcgb24gaG93IHRoZVxuICogaW1hZ2UgaXMgc2F2ZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9XQVJOX0xJTUlUID0gNDAwMDtcbmV4cG9ydCBjb25zdCBEQVRBX1VSTF9FUlJPUl9MSU1JVCA9IDEwMDAwO1xuXG4vKiogSW5mbyBhYm91dCBidWlsdC1pbiBsb2FkZXJzIHdlIGNhbiB0ZXN0IGZvci4gKi9cbmV4cG9ydCBjb25zdCBCVUlMVF9JTl9MT0FERVJTID0gW1xuICBpbWdpeExvYWRlckluZm8sXG4gIGltYWdlS2l0TG9hZGVySW5mbyxcbiAgY2xvdWRpbmFyeUxvYWRlckluZm8sXG4gIG5ldGxpZnlMb2FkZXJJbmZvLFxuXTtcblxuLyoqXG4gKiBDb25maWcgb3B0aW9ucyB1c2VkIGluIHJlbmRlcmluZyBwbGFjZWhvbGRlciBpbWFnZXMuXG4gKlxuICogQHNlZSB7QGxpbmsgTmdPcHRpbWl6ZWRJbWFnZX1cbiAqIEBwdWJsaWNBcGlcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbWFnZVBsYWNlaG9sZGVyQ29uZmlnIHtcbiAgYmx1cj86IGJvb2xlYW47XG59XG5cbi8qKlxuICogRGlyZWN0aXZlIHRoYXQgaW1wcm92ZXMgaW1hZ2UgbG9hZGluZyBwZXJmb3JtYW5jZSBieSBlbmZvcmNpbmcgYmVzdCBwcmFjdGljZXMuXG4gKlxuICogYE5nT3B0aW1pemVkSW1hZ2VgIGVuc3VyZXMgdGhhdCB0aGUgbG9hZGluZyBvZiB0aGUgTGFyZ2VzdCBDb250ZW50ZnVsIFBhaW50IChMQ1ApIGltYWdlIGlzXG4gKiBwcmlvcml0aXplZCBieTpcbiAqIC0gQXV0b21hdGljYWxseSBzZXR0aW5nIHRoZSBgZmV0Y2hwcmlvcml0eWAgYXR0cmlidXRlIG9uIHRoZSBgPGltZz5gIHRhZ1xuICogLSBMYXp5IGxvYWRpbmcgbm9uLXByaW9yaXR5IGltYWdlcyBieSBkZWZhdWx0XG4gKiAtIEF1dG9tYXRpY2FsbHkgZ2VuZXJhdGluZyBhIHByZWNvbm5lY3QgbGluayB0YWcgaW4gdGhlIGRvY3VtZW50IGhlYWRcbiAqXG4gKiBJbiBhZGRpdGlvbiwgdGhlIGRpcmVjdGl2ZTpcbiAqIC0gR2VuZXJhdGVzIGFwcHJvcHJpYXRlIGFzc2V0IFVSTHMgaWYgYSBjb3JyZXNwb25kaW5nIGBJbWFnZUxvYWRlcmAgZnVuY3Rpb24gaXMgcHJvdmlkZWRcbiAqIC0gQXV0b21hdGljYWxseSBnZW5lcmF0ZXMgYSBzcmNzZXRcbiAqIC0gUmVxdWlyZXMgdGhhdCBgd2lkdGhgIGFuZCBgaGVpZ2h0YCBhcmUgc2V0XG4gKiAtIFdhcm5zIGlmIGB3aWR0aGAgb3IgYGhlaWdodGAgaGF2ZSBiZWVuIHNldCBpbmNvcnJlY3RseVxuICogLSBXYXJucyBpZiB0aGUgaW1hZ2Ugd2lsbCBiZSB2aXN1YWxseSBkaXN0b3J0ZWQgd2hlbiByZW5kZXJlZFxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBpcyBtYXJrZWQgYXMgW3N0YW5kYWxvbmVdKGd1aWRlL2NvbXBvbmVudHMvaW1wb3J0aW5nKSBhbmQgY2FuXG4gKiBiZSBpbXBvcnRlZCBkaXJlY3RseS5cbiAqXG4gKiBGb2xsb3cgdGhlIHN0ZXBzIGJlbG93IHRvIGVuYWJsZSBhbmQgdXNlIHRoZSBkaXJlY3RpdmU6XG4gKiAxLiBJbXBvcnQgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnQuXG4gKiAyLiBPcHRpb25hbGx5IHByb3ZpZGUgYW4gYEltYWdlTG9hZGVyYCBpZiB5b3UgdXNlIGFuIGltYWdlIGhvc3Rpbmcgc2VydmljZS5cbiAqIDMuIFVwZGF0ZSB0aGUgbmVjZXNzYXJ5IGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgYW5kIHJlcGxhY2UgYHNyY2AgYXR0cmlidXRlcyB3aXRoIGBuZ1NyY2AuXG4gKiBVc2luZyBhIGBuZ1NyY2AgYWxsb3dzIHRoZSBkaXJlY3RpdmUgdG8gY29udHJvbCB3aGVuIHRoZSBgc3JjYCBnZXRzIHNldCwgd2hpY2ggdHJpZ2dlcnMgYW4gaW1hZ2VcbiAqIGRvd25sb2FkLlxuICpcbiAqIFN0ZXAgMTogaW1wb3J0IHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE5nT3B0aW1pemVkSW1hZ2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIEluY2x1ZGUgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlXG4gKiBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKlxuICogLy8gLi4uIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlXG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBNeVN0YW5kYWxvbmVDb21wb25lbnQge31cbiAqIGBgYFxuICpcbiAqIFN0ZXAgMjogY29uZmlndXJlIGEgbG9hZGVyLlxuICpcbiAqIFRvIHVzZSB0aGUgKipkZWZhdWx0IGxvYWRlcioqOiBubyBhZGRpdGlvbmFsIGNvZGUgY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LiBUaGUgVVJMIHJldHVybmVkIGJ5IHRoZVxuICogZ2VuZXJpYyBsb2FkZXIgd2lsbCBhbHdheXMgbWF0Y2ggdGhlIHZhbHVlIG9mIFwic3JjXCIuIEluIG90aGVyIHdvcmRzLCB0aGlzIGxvYWRlciBhcHBsaWVzIG5vXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIHJlc291cmNlIFVSTCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBgbmdTcmNgIGF0dHJpYnV0ZSB3aWxsIGJlIHVzZWQgYXMgaXMuXG4gKlxuICogVG8gdXNlIGFuIGV4aXN0aW5nIGxvYWRlciBmb3IgYSAqKnRoaXJkLXBhcnR5IGltYWdlIHNlcnZpY2UqKjogYWRkIHRoZSBwcm92aWRlciBmYWN0b3J5IGZvciB5b3VyXG4gKiBjaG9zZW4gc2VydmljZSB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXkuIEluIHRoZSBleGFtcGxlIGJlbG93LCB0aGUgSW1naXggbG9hZGVyIGlzIHVzZWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtwcm92aWRlSW1naXhMb2FkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ2FsbCB0aGUgZnVuY3Rpb24gYW5kIGFkZCB0aGUgcmVzdWx0IHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheTpcbiAqIHByb3ZpZGVyczogW1xuICogICBwcm92aWRlSW1naXhMb2FkZXIoXCJodHRwczovL215LmJhc2UudXJsL1wiKSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBwcm92aWRlcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uczpcbiAqIC0gYHByb3ZpZGVDbG91ZGZsYXJlTG9hZGVyYFxuICogLSBgcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1hZ2VLaXRMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1naXhMb2FkZXJgXG4gKlxuICogSWYgeW91IHVzZSBhIGRpZmZlcmVudCBpbWFnZSBwcm92aWRlciwgeW91IGNhbiBjcmVhdGUgYSBjdXN0b20gbG9hZGVyIGZ1bmN0aW9uIGFzIGRlc2NyaWJlZFxuICogYmVsb3cuXG4gKlxuICogVG8gdXNlIGEgKipjdXN0b20gbG9hZGVyKio6IHByb3ZpZGUgeW91ciBsb2FkZXIgZnVuY3Rpb24gYXMgYSB2YWx1ZSBmb3IgdGhlIGBJTUFHRV9MT0FERVJgIERJXG4gKiB0b2tlbi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ29uZmlndXJlIHRoZSBsb2FkZXIgdXNpbmcgdGhlIGBJTUFHRV9MT0FERVJgIHRva2VuLlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHtcbiAqICAgICAgcHJvdmlkZTogSU1BR0VfTE9BREVSLFxuICogICAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAqICAgICAgICByZXR1cm4gYGh0dHBzOi8vZXhhbXBsZS5jb20vJHtjb25maWcuc3JjfS0ke2NvbmZpZy53aWR0aH0uanBnfWA7XG4gKiAgICAgIH1cbiAqICAgfSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBTdGVwIDM6IHVwZGF0ZSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIHRvIHVzZSBgbmdTcmNgIGluc3RlYWQgb2YgYHNyY2AuXG4gKlxuICogYGBgXG4gKiA8aW1nIG5nU3JjPVwibG9nby5wbmdcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjEwMFwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbbmdTcmNdJyxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUucG9zaXRpb25dJzogJ2ZpbGwgPyBcImFic29sdXRlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLndpZHRoXSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmhlaWdodF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5pbnNldF0nOiAnZmlsbCA/IFwiMFwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLXNpemVdJzogJ3BsYWNlaG9sZGVyID8gXCJjb3ZlclwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLXBvc2l0aW9uXSc6ICdwbGFjZWhvbGRlciA/IFwiNTAlIDUwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLXJlcGVhdF0nOiAncGxhY2Vob2xkZXIgPyBcIm5vLXJlcGVhdFwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5iYWNrZ3JvdW5kLWltYWdlXSc6ICdwbGFjZWhvbGRlciA/IGdlbmVyYXRlUGxhY2Vob2xkZXIocGxhY2Vob2xkZXIpIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5maWx0ZXJdJzogYHBsYWNlaG9sZGVyICYmIHNob3VsZEJsdXJQbGFjZWhvbGRlcihwbGFjZWhvbGRlckNvbmZpZykgPyBcImJsdXIoJHtQTEFDRUhPTERFUl9CTFVSX0FNT1VOVH1weClcIiA6IG51bGxgLFxuICB9LFxufSlcbmV4cG9ydCBjbGFzcyBOZ09wdGltaXplZEltYWdlIGltcGxlbWVudHMgT25Jbml0LCBPbkNoYW5nZXMsIE9uRGVzdHJveSB7XG4gIHByaXZhdGUgaW1hZ2VMb2FkZXIgPSBpbmplY3QoSU1BR0VfTE9BREVSKTtcbiAgcHJpdmF0ZSBjb25maWc6IEltYWdlQ29uZmlnID0gcHJvY2Vzc0NvbmZpZyhpbmplY3QoSU1BR0VfQ09ORklHKSk7XG4gIHByaXZhdGUgcmVuZGVyZXIgPSBpbmplY3QoUmVuZGVyZXIyKTtcbiAgcHJpdmF0ZSBpbWdFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50ID0gaW5qZWN0KEVsZW1lbnRSZWYpLm5hdGl2ZUVsZW1lbnQ7XG4gIHByaXZhdGUgaW5qZWN0b3IgPSBpbmplY3QoSW5qZWN0b3IpO1xuICBwcml2YXRlIHJlYWRvbmx5IGlzU2VydmVyID0gaXNQbGF0Zm9ybVNlcnZlcihpbmplY3QoUExBVEZPUk1fSUQpKTtcbiAgcHJpdmF0ZSByZWFkb25seSBwcmVsb2FkTGlua0NyZWF0b3IgPSBpbmplY3QoUHJlbG9hZExpbmtDcmVhdG9yKTtcblxuICAvLyBhIExDUCBpbWFnZSBvYnNlcnZlciAtIHNob3VsZCBiZSBpbmplY3RlZCBvbmx5IGluIHRoZSBkZXYgbW9kZVxuICBwcml2YXRlIGxjcE9ic2VydmVyID0gbmdEZXZNb2RlID8gdGhpcy5pbmplY3Rvci5nZXQoTENQSW1hZ2VPYnNlcnZlcikgOiBudWxsO1xuXG4gIC8qKlxuICAgKiBDYWxjdWxhdGUgdGhlIHJld3JpdHRlbiBgc3JjYCBvbmNlIGFuZCBzdG9yZSBpdC5cbiAgICogVGhpcyBpcyBuZWVkZWQgdG8gYXZvaWQgcmVwZXRpdGl2ZSBjYWxjdWxhdGlvbnMgYW5kIG1ha2Ugc3VyZSB0aGUgZGlyZWN0aXZlIGNsZWFudXAgaW4gdGhlXG4gICAqIGBuZ09uRGVzdHJveWAgZG9lcyBub3QgcmVseSBvbiB0aGUgYElNQUdFX0xPQURFUmAgbG9naWMgKHdoaWNoIGluIHR1cm4gY2FuIHJlbHkgb24gc29tZSBvdGhlclxuICAgKiBpbnN0YW5jZSB0aGF0IG1pZ2h0IGJlIGFscmVhZHkgZGVzdHJveWVkKS5cbiAgICovXG4gIHByaXZhdGUgX3JlbmRlcmVkU3JjOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoe3JlcXVpcmVkOiB0cnVlLCB0cmFuc2Zvcm06IHVud3JhcFNhZmVVcmx9KSBuZ1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogQSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICAgKiBUaGUgaW1hZ2UgbmFtZSB3aWxsIGJlIHRha2VuIGZyb20gYG5nU3JjYCBhbmQgY29tYmluZWQgd2l0aCB0aGUgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5XG4gICAqIGRlc2NyaXB0b3JzIHRvIGdlbmVyYXRlIHRoZSBmaW5hbCBgc3Jjc2V0YCBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIGBgYFxuICAgKiA8aW1nIG5nU3JjPVwiaGVsbG8uanBnXCIgbmdTcmNzZXQ9XCIxMDB3LCAyMDB3XCIgLz4gID0+XG4gICAqIDxpbWcgc3JjPVwicGF0aC9oZWxsby5qcGdcIiBzcmNzZXQ9XCJwYXRoL2hlbGxvLmpwZz93PTEwMCAxMDB3LCBwYXRoL2hlbGxvLmpwZz93PTIwMCAyMDB3XCIgLz5cbiAgICogYGBgXG4gICAqL1xuICBASW5wdXQoKSBuZ1NyY3NldCE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGJhc2UgYHNpemVzYCBhdHRyaWJ1dGUgcGFzc2VkIHRocm91Z2ggdG8gdGhlIGA8aW1nPmAgZWxlbWVudC5cbiAgICogUHJvdmlkaW5nIHNpemVzIGNhdXNlcyB0aGUgaW1hZ2UgdG8gY3JlYXRlIGFuIGF1dG9tYXRpYyByZXNwb25zaXZlIHNyY3NldC5cbiAgICovXG4gIEBJbnB1dCgpIHNpemVzPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pIHdpZHRoOiBudW1iZXIgfCB1bmRlZmluZWQ7XG5cbiAgLyoqXG4gICAqIEZvciByZXNwb25zaXZlIGltYWdlczogdGhlIGludHJpbnNpYyBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCBoZWlnaHQgb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBudW1iZXJBdHRyaWJ1dGV9KSBoZWlnaHQ6IG51bWJlciB8IHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLiBEZWZhdWx0cyB0byBgbGF6eWAsXG4gICAqIHdoaWNoIGlzIHJlY29tbWVuZGVkIGZvciBtb3N0IGltYWdlcy5cbiAgICpcbiAgICogV2FybmluZzogU2V0dGluZyBpbWFnZXMgYXMgbG9hZGluZz1cImVhZ2VyXCIgb3IgbG9hZGluZz1cImF1dG9cIiBtYXJrcyB0aGVtXG4gICAqIGFzIG5vbi1wcmlvcml0eSBpbWFnZXMgYW5kIGNhbiBodXJ0IGxvYWRpbmcgcGVyZm9ybWFuY2UuIEZvciBpbWFnZXMgd2hpY2hcbiAgICogbWF5IGJlIHRoZSBMQ1AgZWxlbWVudCwgdXNlIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZSBpbnN0ZWFkIG9mIGBsb2FkaW5nYC5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRpbmc/OiAnbGF6eScgfCAnZWFnZXInIHwgJ2F1dG8nO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZXMgd2hldGhlciB0aGlzIGltYWdlIHNob3VsZCBoYXZlIGEgaGlnaCBwcmlvcml0eS5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuQXR0cmlidXRlfSkgcHJpb3JpdHkgPSBmYWxzZTtcblxuICAvKipcbiAgICogRGF0YSB0byBwYXNzIHRocm91Z2ggdG8gY3VzdG9tIGxvYWRlcnMuXG4gICAqL1xuICBASW5wdXQoKSBsb2FkZXJQYXJhbXM/OiB7W2tleTogc3RyaW5nXTogYW55fTtcblxuICAvKipcbiAgICogRGlzYWJsZXMgYXV0b21hdGljIHNyY3NldCBnZW5lcmF0aW9uIGZvciB0aGlzIGltYWdlLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBkaXNhYmxlT3B0aW1pemVkU3Jjc2V0ID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIFNldHMgdGhlIGltYWdlIHRvIFwiZmlsbCBtb2RlXCIsIHdoaWNoIGVsaW1pbmF0ZXMgdGhlIGhlaWdodC93aWR0aCByZXF1aXJlbWVudCBhbmQgYWRkc1xuICAgKiBzdHlsZXMgc3VjaCB0aGF0IHRoZSBpbWFnZSBmaWxscyBpdHMgY29udGFpbmluZyBlbGVtZW50LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBmaWxsID0gZmFsc2U7XG5cbiAgLyoqXG4gICAqIEEgVVJMIG9yIGRhdGEgVVJMIGZvciBhbiBpbWFnZSB0byBiZSB1c2VkIGFzIGEgcGxhY2Vob2xkZXIgd2hpbGUgdGhpcyBpbWFnZSBsb2Fkcy5cbiAgICovXG4gIEBJbnB1dCh7dHJhbnNmb3JtOiBib29sZWFuT3JEYXRhVXJsQXR0cmlidXRlfSkgcGxhY2Vob2xkZXI/OiBzdHJpbmcgfCBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBDb25maWd1cmF0aW9uIG9iamVjdCBmb3IgcGxhY2Vob2xkZXIgc2V0dGluZ3MuIE9wdGlvbnM6XG4gICAqICAgKiBibHVyOiBTZXR0aW5nIHRoaXMgdG8gZmFsc2UgZGlzYWJsZXMgdGhlIGF1dG9tYXRpYyBDU1MgYmx1ci5cbiAgICovXG4gIEBJbnB1dCgpIHBsYWNlaG9sZGVyQ29uZmlnPzogSW1hZ2VQbGFjZWhvbGRlckNvbmZpZztcblxuICAvKipcbiAgICogVmFsdWUgb2YgdGhlIGBzcmNgIGF0dHJpYnV0ZSBpZiBzZXQgb24gdGhlIGhvc3QgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIGV4Y2x1c2l2ZWx5IHJlYWQgdG8gYXNzZXJ0IHRoYXQgYHNyY2AgaXMgbm90IHNldCBpbiBjb25mbGljdFxuICAgKiB3aXRoIGBuZ1NyY2AgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyYz86IHN0cmluZztcblxuICAvKipcbiAgICogVmFsdWUgb2YgdGhlIGBzcmNzZXRgIGF0dHJpYnV0ZSBpZiBzZXQgb24gdGhlIGhvc3QgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIGV4Y2x1c2l2ZWx5IHJlYWQgdG8gYXNzZXJ0IHRoYXQgYHNyY3NldGAgaXMgbm90IHNldCBpbiBjb25mbGljdFxuICAgKiB3aXRoIGBuZ1NyY3NldGAgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyY3NldD86IHN0cmluZztcblxuICAvKiogQG5vZG9jICovXG4gIG5nT25Jbml0KCkge1xuICAgIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nT3B0aW1pemVkSW1hZ2UnKTtcblxuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICBhc3NlcnROb25FbXB0eUlucHV0KHRoaXMsICduZ1NyYycsIHRoaXMubmdTcmMpO1xuICAgICAgYXNzZXJ0VmFsaWROZ1NyY3NldCh0aGlzLCB0aGlzLm5nU3Jjc2V0KTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90QmFzZTY0SW1hZ2UodGhpcyk7XG4gICAgICBhc3NlcnROb3RCbG9iVXJsKHRoaXMpO1xuICAgICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgICBhc3NlcnRFbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgICAvLyBUaGlzIGxlYXZlcyB0aGUgQW5ndWxhciB6b25lIHRvIGF2b2lkIHRyaWdnZXJpbmcgdW5uZWNlc3NhcnkgY2hhbmdlIGRldGVjdGlvbiBjeWNsZXMgd2hlblxuICAgICAgICAvLyBgbG9hZGAgdGFza3MgYXJlIGludm9rZWQgb24gaW1hZ2VzLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT5cbiAgICAgICAgICBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQodGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKSxcbiAgICAgICAgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQodGhpcyk7XG4gICAgICAgIGlmICh0aGlzLmhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgYXNzZXJ0R3JlYXRlclRoYW5aZXJvKHRoaXMsIHRoaXMuaGVpZ2h0LCAnaGVpZ2h0Jyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMud2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB0aGlzLndpZHRoLCAnd2lkdGgnKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBPbmx5IGNoZWNrIGZvciBkaXN0b3J0ZWQgaW1hZ2VzIHdoZW4gbm90IGluIGZpbGwgbW9kZSwgd2hlcmVcbiAgICAgICAgLy8gaW1hZ2VzIG1heSBiZSBpbnRlbnRpb25hbGx5IHN0cmV0Y2hlZCwgY3JvcHBlZCBvciBsZXR0ZXJib3hlZC5cbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+XG4gICAgICAgICAgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb24odGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICAgIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KHRoaXMpO1xuICAgICAgaWYgKCF0aGlzLm5nU3Jjc2V0KSB7XG4gICAgICAgIGFzc2VydE5vQ29tcGxleFNpemVzKHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0VmFsaWRQbGFjZWhvbGRlcih0aGlzLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKHRoaXMubmdTcmMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm9OZ1NyY3NldFdpdGhvdXRMb2FkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG4gICAgICBhc3NlcnROb0xvYWRlclBhcmFtc1dpdGhvdXRMb2FkZXIodGhpcywgdGhpcy5pbWFnZUxvYWRlcik7XG5cbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcigoKSA9PiB7XG4gICAgICAgICAgdGhpcy5sY3BPYnNlcnZlciEucmVnaXN0ZXJJbWFnZSh0aGlzLmdldFJld3JpdHRlblNyYygpLCB0aGlzLm5nU3JjLCB0aGlzLnByaW9yaXR5KTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0aGlzLnByaW9yaXR5KSB7XG4gICAgICAgIGNvbnN0IGNoZWNrZXIgPSB0aGlzLmluamVjdG9yLmdldChQcmVjb25uZWN0TGlua0NoZWNrZXIpO1xuICAgICAgICBjaGVja2VyLmFzc2VydFByZWNvbm5lY3QodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh0aGlzLnBsYWNlaG9sZGVyKSB7XG4gICAgICB0aGlzLnJlbW92ZVBsYWNlaG9sZGVyT25Mb2FkKHRoaXMuaW1nRWxlbWVudCk7XG4gICAgfVxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZXMoKTtcbiAgfVxuXG4gIHByaXZhdGUgc2V0SG9zdEF0dHJpYnV0ZXMoKSB7XG4gICAgLy8gTXVzdCBzZXQgd2lkdGgvaGVpZ2h0IGV4cGxpY2l0bHkgaW4gY2FzZSB0aGV5IGFyZSBib3VuZCAoaW4gd2hpY2ggY2FzZSB0aGV5IHdpbGxcbiAgICAvLyBvbmx5IGJlIHJlZmxlY3RlZCBhbmQgbm90IGZvdW5kIGJ5IHRoZSBicm93c2VyKVxuICAgIGlmICh0aGlzLmZpbGwpIHtcbiAgICAgIHRoaXMuc2l6ZXMgfHw9ICcxMDB2dyc7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoIS50b1N0cmluZygpKTtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQhLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcblxuICAgIC8vIFRoZSBgZGF0YS1uZy1pbWdgIGF0dHJpYnV0ZSBmbGFncyBhbiBpbWFnZSBhcyB1c2luZyB0aGUgZGlyZWN0aXZlLCB0byBhbGxvd1xuICAgIC8vIGZvciBhbmFseXNpcyBvZiB0aGUgZGlyZWN0aXZlJ3MgcGVyZm9ybWFuY2UuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCduZy1pbWcnLCAndHJ1ZScpO1xuXG4gICAgLy8gVGhlIGBzcmNgIGFuZCBgc3Jjc2V0YCBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgY29uc3QgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQoKTtcblxuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NpemVzJywgdGhpcy5zaXplcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU2VydmVyICYmIHRoaXMucHJpb3JpdHkpIHtcbiAgICAgIHRoaXMucHJlbG9hZExpbmtDcmVhdG9yLmNyZWF0ZVByZWxvYWRMaW5rVGFnKFxuICAgICAgICB0aGlzLnJlbmRlcmVyLFxuICAgICAgICB0aGlzLmdldFJld3JpdHRlblNyYygpLFxuICAgICAgICByZXdyaXR0ZW5TcmNzZXQsXG4gICAgICAgIHRoaXMuc2l6ZXMsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZSh0aGlzLCBjaGFuZ2VzLCBbXG4gICAgICAgICduZ1NyY3NldCcsXG4gICAgICAgICd3aWR0aCcsXG4gICAgICAgICdoZWlnaHQnLFxuICAgICAgICAncHJpb3JpdHknLFxuICAgICAgICAnZmlsbCcsXG4gICAgICAgICdsb2FkaW5nJyxcbiAgICAgICAgJ3NpemVzJyxcbiAgICAgICAgJ2xvYWRlclBhcmFtcycsXG4gICAgICAgICdkaXNhYmxlT3B0aW1pemVkU3Jjc2V0JyxcbiAgICAgIF0pO1xuICAgIH1cbiAgICBpZiAoY2hhbmdlc1snbmdTcmMnXSAmJiAhY2hhbmdlc1snbmdTcmMnXS5pc0ZpcnN0Q2hhbmdlKCkpIHtcbiAgICAgIGNvbnN0IG9sZFNyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQodHJ1ZSk7XG4gICAgICBjb25zdCBuZXdTcmMgPSB0aGlzLl9yZW5kZXJlZFNyYztcbiAgICAgIGlmICh0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsICYmIG9sZFNyYyAmJiBuZXdTcmMgJiYgb2xkU3JjICE9PSBuZXdTcmMpIHtcbiAgICAgICAgY29uc3Qgbmdab25lID0gdGhpcy5pbmplY3Rvci5nZXQoTmdab25lKTtcbiAgICAgICAgbmdab25lLnJ1bk91dHNpZGVBbmd1bGFyKCgpID0+IHtcbiAgICAgICAgICB0aGlzLmxjcE9ic2VydmVyPy51cGRhdGVJbWFnZShvbGRTcmMsIG5ld1NyYyk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgY2FsbEltYWdlTG9hZGVyKFxuICAgIGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM6IE9taXQ8SW1hZ2VMb2FkZXJDb25maWcsICdsb2FkZXJQYXJhbXMnPixcbiAgKTogc3RyaW5nIHtcbiAgICBsZXQgYXVnbWVudGVkQ29uZmlnOiBJbWFnZUxvYWRlckNvbmZpZyA9IGNvbmZpZ1dpdGhvdXRDdXN0b21QYXJhbXM7XG4gICAgaWYgKHRoaXMubG9hZGVyUGFyYW1zKSB7XG4gICAgICBhdWdtZW50ZWRDb25maWcubG9hZGVyUGFyYW1zID0gdGhpcy5sb2FkZXJQYXJhbXM7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmltYWdlTG9hZGVyKGF1Z21lbnRlZENvbmZpZyk7XG4gIH1cblxuICBwcml2YXRlIGdldExvYWRpbmdCZWhhdmlvcigpOiBzdHJpbmcge1xuICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLmxvYWRpbmcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgcmV0dXJuIHRoaXMubG9hZGluZztcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnZWFnZXInIDogJ2xhenknO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRGZXRjaFByaW9yaXR5KCk6IHN0cmluZyB7XG4gICAgcmV0dXJuIHRoaXMucHJpb3JpdHkgPyAnaGlnaCcgOiAnYXV0byc7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyYygpOiBzdHJpbmcge1xuICAgIC8vIEltYWdlTG9hZGVyQ29uZmlnIHN1cHBvcnRzIHNldHRpbmcgYSB3aWR0aCBwcm9wZXJ0eS4gSG93ZXZlciwgd2UncmUgbm90IHNldHRpbmcgd2lkdGggaGVyZVxuICAgIC8vIGJlY2F1c2UgaWYgdGhlIGRldmVsb3BlciB1c2VzIHJlbmRlcmVkIHdpZHRoIGluc3RlYWQgb2YgaW50cmluc2ljIHdpZHRoIGluIHRoZSBIVE1MIHdpZHRoXG4gICAgLy8gYXR0cmlidXRlLCB0aGUgaW1hZ2UgcmVxdWVzdGVkIG1heSBiZSB0b28gc21hbGwgZm9yIDJ4KyBzY3JlZW5zLlxuICAgIGlmICghdGhpcy5fcmVuZGVyZWRTcmMpIHtcbiAgICAgIGNvbnN0IGltZ0NvbmZpZyA9IHtzcmM6IHRoaXMubmdTcmN9O1xuICAgICAgLy8gQ2FjaGUgY2FsY3VsYXRlZCBpbWFnZSBzcmMgdG8gcmV1c2UgaXQgbGF0ZXIgaW4gdGhlIGNvZGUuXG4gICAgICB0aGlzLl9yZW5kZXJlZFNyYyA9IHRoaXMuY2FsbEltYWdlTG9hZGVyKGltZ0NvbmZpZyk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9yZW5kZXJlZFNyYztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0UmV3cml0dGVuU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qgd2lkdGhTcmNTZXQgPSBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHRoaXMubmdTcmNzZXQpO1xuICAgIGNvbnN0IGZpbmFsU3JjcyA9IHRoaXMubmdTcmNzZXRcbiAgICAgIC5zcGxpdCgnLCcpXG4gICAgICAuZmlsdGVyKChzcmMpID0+IHNyYyAhPT0gJycpXG4gICAgICAubWFwKChzcmNTdHIpID0+IHtcbiAgICAgICAgc3JjU3RyID0gc3JjU3RyLnRyaW0oKTtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB3aWR0aFNyY1NldCA/IHBhcnNlRmxvYXQoc3JjU3RyKSA6IHBhcnNlRmxvYXQoc3JjU3RyKSAqIHRoaXMud2lkdGghO1xuICAgICAgICByZXR1cm4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGh9KX0gJHtzcmNTdHJ9YDtcbiAgICAgIH0pO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgZ2V0QXV0b21hdGljU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgaWYgKHRoaXMuc2l6ZXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmdldFJlc3BvbnNpdmVTcmNzZXQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHRoaXMuZ2V0Rml4ZWRTcmNzZXQoKTtcbiAgICB9XG4gIH1cblxuICBwcml2YXRlIGdldFJlc3BvbnNpdmVTcmNzZXQoKTogc3RyaW5nIHtcbiAgICBjb25zdCB7YnJlYWtwb2ludHN9ID0gdGhpcy5jb25maWc7XG5cbiAgICBsZXQgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzITtcbiAgICBpZiAodGhpcy5zaXplcz8udHJpbSgpID09PSAnMTAwdncnKSB7XG4gICAgICAvLyBTaW5jZSB0aGlzIGlzIGEgZnVsbC1zY3JlZW4td2lkdGggaW1hZ2UsIG91ciBzcmNzZXQgb25seSBuZWVkcyB0byBpbmNsdWRlXG4gICAgICAvLyBicmVha3BvaW50cyB3aXRoIGZ1bGwgdmlld3BvcnQgd2lkdGhzLlxuICAgICAgZmlsdGVyZWRCcmVha3BvaW50cyA9IGJyZWFrcG9pbnRzIS5maWx0ZXIoKGJwKSA9PiBicCA+PSBWSUVXUE9SVF9CUkVBS1BPSU5UX0NVVE9GRik7XG4gICAgfVxuXG4gICAgY29uc3QgZmluYWxTcmNzID0gZmlsdGVyZWRCcmVha3BvaW50cy5tYXAoXG4gICAgICAoYnApID0+IGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtzcmM6IHRoaXMubmdTcmMsIHdpZHRoOiBicH0pfSAke2JwfXdgLFxuICAgICk7XG4gICAgcmV0dXJuIGZpbmFsU3Jjcy5qb2luKCcsICcpO1xuICB9XG5cbiAgcHJpdmF0ZSB1cGRhdGVTcmNBbmRTcmNzZXQoZm9yY2VTcmNSZWNhbGMgPSBmYWxzZSk6IHN0cmluZyB8IHVuZGVmaW5lZCB7XG4gICAgaWYgKGZvcmNlU3JjUmVjYWxjKSB7XG4gICAgICAvLyBSZXNldCBjYWNoZWQgdmFsdWUsIHNvIHRoYXQgdGhlIGZvbGxvd3VwIGBnZXRSZXdyaXR0ZW5TcmMoKWAgY2FsbFxuICAgICAgLy8gd2lsbCByZWNhbGN1bGF0ZSBpdCBhbmQgdXBkYXRlIHRoZSBjYWNoZS5cbiAgICAgIHRoaXMuX3JlbmRlcmVkU3JjID0gbnVsbDtcbiAgICB9XG5cbiAgICBjb25zdCByZXdyaXR0ZW5TcmMgPSB0aGlzLmdldFJld3JpdHRlblNyYygpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnc3JjJywgcmV3cml0dGVuU3JjKTtcblxuICAgIGxldCByZXdyaXR0ZW5TcmNzZXQ6IHN0cmluZyB8IHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy5nZXRSZXdyaXR0ZW5TcmNzZXQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hvdWxkR2VuZXJhdGVBdXRvbWF0aWNTcmNzZXQoKSkge1xuICAgICAgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy5nZXRBdXRvbWF0aWNTcmNzZXQoKTtcbiAgICB9XG5cbiAgICBpZiAocmV3cml0dGVuU3Jjc2V0KSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyY3NldCcsIHJld3JpdHRlblNyY3NldCk7XG4gICAgfVxuICAgIHJldHVybiByZXdyaXR0ZW5TcmNzZXQ7XG4gIH1cblxuICBwcml2YXRlIGdldEZpeGVkU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmluYWxTcmNzID0gREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMubWFwKFxuICAgICAgKG11bHRpcGxpZXIpID0+XG4gICAgICAgIGAke3RoaXMuY2FsbEltYWdlTG9hZGVyKHtcbiAgICAgICAgICBzcmM6IHRoaXMubmdTcmMsXG4gICAgICAgICAgd2lkdGg6IHRoaXMud2lkdGghICogbXVsdGlwbGllcixcbiAgICAgICAgfSl9ICR7bXVsdGlwbGllcn14YCxcbiAgICApO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkR2VuZXJhdGVBdXRvbWF0aWNTcmNzZXQoKTogYm9vbGVhbiB7XG4gICAgbGV0IG92ZXJzaXplZEltYWdlID0gZmFsc2U7XG4gICAgaWYgKCF0aGlzLnNpemVzKSB7XG4gICAgICBvdmVyc2l6ZWRJbWFnZSA9XG4gICAgICAgIHRoaXMud2lkdGghID4gRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUIHx8IHRoaXMuaGVpZ2h0ISA+IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQ7XG4gICAgfVxuICAgIHJldHVybiAoXG4gICAgICAhdGhpcy5kaXNhYmxlT3B0aW1pemVkU3Jjc2V0ICYmXG4gICAgICAhdGhpcy5zcmNzZXQgJiZcbiAgICAgIHRoaXMuaW1hZ2VMb2FkZXIgIT09IG5vb3BJbWFnZUxvYWRlciAmJlxuICAgICAgIW92ZXJzaXplZEltYWdlXG4gICAgKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXR1cm5zIGFuIGltYWdlIHVybCBmb3JtYXR0ZWQgZm9yIHVzZSB3aXRoIHRoZSBDU1MgYmFja2dyb3VuZC1pbWFnZSBwcm9wZXJ0eS4gRXhwZWN0cyBvbmUgb2Y6XG4gICAqICogQSBiYXNlNjQgZW5jb2RlZCBpbWFnZSwgd2hpY2ggaXMgd3JhcHBlZCBhbmQgcGFzc2VkIHRocm91Z2guXG4gICAqICogQSBib29sZWFuLiBJZiB0cnVlLCBjYWxscyB0aGUgaW1hZ2UgbG9hZGVyIHRvIGdlbmVyYXRlIGEgc21hbGwgcGxhY2Vob2xkZXIgdXJsLlxuICAgKi9cbiAgcHJpdmF0ZSBnZW5lcmF0ZVBsYWNlaG9sZGVyKHBsYWNlaG9sZGVySW5wdXQ6IHN0cmluZyB8IGJvb2xlYW4pOiBzdHJpbmcgfCBib29sZWFuIHwgbnVsbCB7XG4gICAgY29uc3Qge3BsYWNlaG9sZGVyUmVzb2x1dGlvbn0gPSB0aGlzLmNvbmZpZztcbiAgICBpZiAocGxhY2Vob2xkZXJJbnB1dCA9PT0gdHJ1ZSkge1xuICAgICAgcmV0dXJuIGB1cmwoJHt0aGlzLmNhbGxJbWFnZUxvYWRlcih7XG4gICAgICAgIHNyYzogdGhpcy5uZ1NyYyxcbiAgICAgICAgd2lkdGg6IHBsYWNlaG9sZGVyUmVzb2x1dGlvbixcbiAgICAgICAgaXNQbGFjZWhvbGRlcjogdHJ1ZSxcbiAgICAgIH0pfSlgO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHBsYWNlaG9sZGVySW5wdXQgPT09ICdzdHJpbmcnICYmIHBsYWNlaG9sZGVySW5wdXQuc3RhcnRzV2l0aCgnZGF0YTonKSkge1xuICAgICAgcmV0dXJuIGB1cmwoJHtwbGFjZWhvbGRlcklucHV0fSlgO1xuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIC8qKlxuICAgKiBEZXRlcm1pbmVzIGlmIGJsdXIgc2hvdWxkIGJlIGFwcGxpZWQsIGJhc2VkIG9uIGFuIG9wdGlvbmFsIGJvb2xlYW5cbiAgICogcHJvcGVydHkgYGJsdXJgIHdpdGhpbiB0aGUgb3B0aW9uYWwgY29uZmlndXJhdGlvbiBvYmplY3QgYHBsYWNlaG9sZGVyQ29uZmlnYC5cbiAgICovXG4gIHByaXZhdGUgc2hvdWxkQmx1clBsYWNlaG9sZGVyKHBsYWNlaG9sZGVyQ29uZmlnPzogSW1hZ2VQbGFjZWhvbGRlckNvbmZpZyk6IGJvb2xlYW4ge1xuICAgIGlmICghcGxhY2Vob2xkZXJDb25maWcgfHwgIXBsYWNlaG9sZGVyQ29uZmlnLmhhc093blByb3BlcnR5KCdibHVyJykpIHtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gQm9vbGVhbihwbGFjZWhvbGRlckNvbmZpZy5ibHVyKTtcbiAgfVxuXG4gIHByaXZhdGUgcmVtb3ZlUGxhY2Vob2xkZXJPbkxvYWQoaW1nOiBIVE1MSW1hZ2VFbGVtZW50KTogdm9pZCB7XG4gICAgY29uc3QgY2FsbGJhY2sgPSAoKSA9PiB7XG4gICAgICBjb25zdCBjaGFuZ2VEZXRlY3RvclJlZiA9IHRoaXMuaW5qZWN0b3IuZ2V0KENoYW5nZURldGVjdG9yUmVmKTtcbiAgICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgICAgIHRoaXMucGxhY2Vob2xkZXIgPSBmYWxzZTtcbiAgICAgIGNoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpO1xuICAgIH07XG5cbiAgICBjb25zdCByZW1vdmVMb2FkTGlzdGVuZXJGbiA9IHRoaXMucmVuZGVyZXIubGlzdGVuKGltZywgJ2xvYWQnLCBjYWxsYmFjayk7XG4gICAgY29uc3QgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuID0gdGhpcy5yZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCBjYWxsYmFjayk7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZW5kZXJlZFNyYyAhPT0gbnVsbCAmJiB0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8qKlxuICogU29ydHMgcHJvdmlkZWQgY29uZmlnIGJyZWFrcG9pbnRzIGFuZCB1c2VzIGRlZmF1bHRzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKGNvbmZpZzogSW1hZ2VDb25maWcpOiBJbWFnZUNvbmZpZyB7XG4gIGxldCBzb3J0ZWRCcmVha3BvaW50czoge2JyZWFrcG9pbnRzPzogbnVtYmVyW119ID0ge307XG4gIGlmIChjb25maWcuYnJlYWtwb2ludHMpIHtcbiAgICBzb3J0ZWRCcmVha3BvaW50cy5icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIElNQUdFX0NPTkZJR19ERUZBVUxUUywgY29uZmlnLCBzb3J0ZWRCcmVha3BvaW50cyk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDX0FUVFIsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IGJvdGggXFxgc3JjXFxgIGFuZCBcXGBuZ1NyY1xcYCBoYXZlIGJlZW4gc2V0LiBgICtcbiAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGBuZ1NyY1xcYC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcGxlYXNlIHJlbW92ZSB0aGUgXFxgc3JjXFxgIGF0dHJpYnV0ZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5VTkVYUEVDVEVEX1NSQ1NFVF9BVFRSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY3NldFxcYCBhbmQgXFxgbmdTcmNzZXRcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgIGBTdXBwbHlpbmcgYm90aCBvZiB0aGVzZSBhdHRyaWJ1dGVzIGJyZWFrcyBsYXp5IGxvYWRpbmcuIGAgK1xuICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgIGBcXGBuZ1NyY3NldFxcYC4gVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY3NldFxcYCBhdHRyaWJ1dGUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKG5nU3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgbmdTcmMgPSBuZ1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgbmdTcmNcXGAgaXMgYSBCYXNlNjQtZW5jb2RlZCBzdHJpbmcgYCArXG4gICAgICAgIGAoJHtuZ1NyY30pLiBOZ09wdGltaXplZEltYWdlIGRvZXMgbm90IHN1cHBvcnQgQmFzZTY0LWVuY29kZWQgc3RyaW5ncy4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHN0YW5kYXJkIFxcYHNyY1xcYCBhdHRyaWJ1dGUgaW5zdGVhZC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSAnc2l6ZXMnIG9ubHkgaW5jbHVkZXMgcmVzcG9uc2l2ZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29tcGxleFNpemVzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgc2l6ZXMgPSBkaXIuc2l6ZXM7XG4gIGlmIChzaXplcz8ubWF0Y2goLygoXFwpfCwpXFxzfF4pXFxkK3B4LykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMsIGZhbHNlKX0gXFxgc2l6ZXNcXGAgd2FzIHNldCB0byBhIHN0cmluZyBpbmNsdWRpbmcgYCArXG4gICAgICAgIGBwaXhlbCB2YWx1ZXMuIEZvciBhdXRvbWF0aWMgXFxgc3Jjc2V0XFxgIGdlbmVyYXRpb24sIFxcYHNpemVzXFxgIG11c3Qgb25seSBpbmNsdWRlIHJlc3BvbnNpdmUgYCArXG4gICAgICAgIGB2YWx1ZXMsIHN1Y2ggYXMgXFxgc2l6ZXM9XCI1MHZ3XCJcXGAgb3IgXFxgc2l6ZXM9XCIobWluLXdpZHRoOiA3NjhweCkgNTB2dywgMTAwdndcIlxcYC4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgbW9kaWZ5IHRoZSBcXGBzaXplc1xcYCBhdHRyaWJ1dGUsIG9yIHByb3ZpZGUgeW91ciBvd24gXFxgbmdTcmNzZXRcXGAgdmFsdWUgZGlyZWN0bHkuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFZhbGlkUGxhY2Vob2xkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgYXNzZXJ0Tm9QbGFjZWhvbGRlckNvbmZpZ1dpdGhvdXRQbGFjZWhvbGRlcihkaXIpO1xuICBhc3NlcnROb1JlbGF0aXZlUGxhY2Vob2xkZXJXaXRob3V0TG9hZGVyKGRpciwgaW1hZ2VMb2FkZXIpO1xuICBhc3NlcnROb092ZXJzaXplZERhdGFVcmwoZGlyKTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHBsYWNlaG9sZGVyQ29uZmlnIGlzbid0IGJlaW5nIHVzZWQgd2l0aG91dCBwbGFjZWhvbGRlclxuICovXG5mdW5jdGlvbiBhc3NlcnROb1BsYWNlaG9sZGVyQ29uZmlnV2l0aG91dFBsYWNlaG9sZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnBsYWNlaG9sZGVyQ29uZmlnICYmICFkaXIucGxhY2Vob2xkZXIpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhcbiAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICBmYWxzZSxcbiAgICAgICl9IFxcYHBsYWNlaG9sZGVyQ29uZmlnXFxgIG9wdGlvbnMgd2VyZSBwcm92aWRlZCBmb3IgYW4gYCArXG4gICAgICAgIGBpbWFnZSB0aGF0IGRvZXMgbm90IHVzZSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlLCBhbmQgd2lsbCBoYXZlIG5vIGVmZmVjdC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBhIHJlbGF0aXZlIFVSTCBwbGFjZWhvbGRlciBpcyBzcGVjaWZpZWQsIGJ1dCBubyBsb2FkZXIgaXMgcHJlc2VudCB0byBwcm92aWRlIHRoZSBzbWFsbFxuICogaW1hZ2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUmVsYXRpdmVQbGFjZWhvbGRlcldpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5wbGFjZWhvbGRlciA9PT0gdHJ1ZSAmJiBpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuTUlTU0lOR19ORUNFU1NBUllfTE9BREVSLFxuICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byB0cnVlIGJ1dCBgICtcbiAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgIGB3aGljaCB3b3VsZCByZXN1bHQgaW4gdGhlIHNhbWUgaW1hZ2UgYmVpbmcgdXNlZCBmb3IgdGhlIHByaW1hcnkgaW1hZ2UgYW5kIGl0cyBwbGFjZWhvbGRlci4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBvciB0aHJvd3MgYW4gZXJyb3IgaWYgYW4gb3ZlcnNpemVkIGRhdGFVUkwgcGxhY2Vob2xkZXIgaXMgcHJvdmlkZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vT3ZlcnNpemVkRGF0YVVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKFxuICAgIGRpci5wbGFjZWhvbGRlciAmJlxuICAgIHR5cGVvZiBkaXIucGxhY2Vob2xkZXIgPT09ICdzdHJpbmcnICYmXG4gICAgZGlyLnBsYWNlaG9sZGVyLnN0YXJ0c1dpdGgoJ2RhdGE6JylcbiAgKSB7XG4gICAgaWYgKGRpci5wbGFjZWhvbGRlci5sZW5ndGggPiBEQVRBX1VSTF9FUlJPUl9MSU1JVCkge1xuICAgICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfUExBQ0VIT0xERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgZGlyLm5nU3JjLFxuICAgICAgICApfSB0aGUgXFxgcGxhY2Vob2xkZXJcXGAgYXR0cmlidXRlIGlzIHNldCB0byBhIGRhdGEgVVJMIHdoaWNoIGlzIGxvbmdlciBgICtcbiAgICAgICAgICBgdGhhbiAke0RBVEFfVVJMX0VSUk9SX0xJTUlUfSBjaGFyYWN0ZXJzLiBUaGlzIGlzIHN0cm9uZ2x5IGRpc2NvdXJhZ2VkLCBhcyBsYXJnZSBpbmxpbmUgcGxhY2Vob2xkZXJzIGAgK1xuICAgICAgICAgIGBkaXJlY3RseSBpbmNyZWFzZSB0aGUgYnVuZGxlIHNpemUgb2YgQW5ndWxhciBhbmQgaHVydCBwYWdlIGxvYWQgcGVyZm9ybWFuY2UuIFRvIGZpeCB0aGlzLCBnZW5lcmF0ZSBgICtcbiAgICAgICAgICBgYSBzbWFsbGVyIGRhdGEgVVJMIHBsYWNlaG9sZGVyLmAsXG4gICAgICApO1xuICAgIH1cbiAgICBpZiAoZGlyLnBsYWNlaG9sZGVyLmxlbmd0aCA+IERBVEFfVVJMX1dBUk5fTElNSVQpIHtcbiAgICAgIGNvbnNvbGUud2FybihcbiAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX1BMQUNFSE9MREVSLFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoXG4gICAgICAgICAgICBkaXIubmdTcmMsXG4gICAgICAgICAgKX0gdGhlIFxcYHBsYWNlaG9sZGVyXFxgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSBkYXRhIFVSTCB3aGljaCBpcyBsb25nZXIgYCArXG4gICAgICAgICAgICBgdGhhbiAke0RBVEFfVVJMX1dBUk5fTElNSVR9IGNoYXJhY3RlcnMuIFRoaXMgaXMgZGlzY291cmFnZWQsIGFzIGxhcmdlIGlubGluZSBwbGFjZWhvbGRlcnMgYCArXG4gICAgICAgICAgICBgZGlyZWN0bHkgaW5jcmVhc2UgdGhlIGJ1bmRsZSBzaXplIG9mIEFuZ3VsYXIgYW5kIGh1cnQgcGFnZSBsb2FkIHBlcmZvcm1hbmNlLiBGb3IgYmV0dGVyIGxvYWRpbmcgcGVyZm9ybWFuY2UsIGAgK1xuICAgICAgICAgICAgYGdlbmVyYXRlIGEgc21hbGxlciBkYXRhIFVSTCBwbGFjZWhvbGRlci5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNgIGlzIG5vdCBhIEJsb2IgVVJMLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb3RCbG9iVXJsKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBjb25zdCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgbmdTcmNcXGAgd2FzIHNldCB0byBhIGJsb2IgVVJMICgke25nU3JjfSkuIGAgK1xuICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgYGJ5IHJlbW92aW5nIFxcYG5nU3JjXFxgIGFuZCB1c2luZyBhIHJlZ3VsYXIgXFxgc3JjXFxgIGF0dHJpYnV0ZSBpbnN0ZWFkLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGlucHV0IGlzIHNldCB0byBhIG5vbi1lbXB0eSBzdHJpbmcuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyOiBOZ09wdGltaXplZEltYWdlLCBuYW1lOiBzdHJpbmcsIHZhbHVlOiB1bmtub3duKSB7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgY29uc3QgaXNFbXB0eVN0cmluZyA9IGlzU3RyaW5nICYmIHZhbHVlLnRyaW0oKSA9PT0gJyc7XG4gIGlmICghaXNTdHJpbmcgfHwgaXNFbXB0eVN0cmluZykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7bmFtZX1cXGAgaGFzIGFuIGludmFsaWQgdmFsdWUgYCArXG4gICAgICAgIGAoXFxgJHt2YWx1ZX1cXGApLiBUbyBmaXggdGhpcywgY2hhbmdlIHRoZSB2YWx1ZSB0byBhIG5vbi1lbXB0eSBzdHJpbmcuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3Jjc2V0YCBpcyBpbiBhIHZhbGlkIGZvcm1hdCwgZS5nLiBcIjEwMHcsIDIwMHdcIiBvciBcIjF4LCAyeFwiLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0VmFsaWROZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiB1bmtub3duKSB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm47XG4gIGFzc2VydE5vbkVtcHR5SW5wdXQoZGlyLCAnbmdTcmNzZXQnLCB2YWx1ZSk7XG4gIGNvbnN0IHN0cmluZ1ZhbCA9IHZhbHVlIGFzIHN0cmluZztcbiAgY29uc3QgaXNWYWxpZFdpZHRoRGVzY3JpcHRvciA9IFZBTElEX1dJRFRIX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcbiAgY29uc3QgaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yID0gVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVC50ZXN0KHN0cmluZ1ZhbCk7XG5cbiAgaWYgKGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcikge1xuICAgIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXIsIHN0cmluZ1ZhbCk7XG4gIH1cblxuICBjb25zdCBpc1ZhbGlkU3Jjc2V0ID0gaXNWYWxpZFdpZHRoRGVzY3JpcHRvciB8fCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3I7XG4gIGlmICghaXNWYWxpZFNyY3NldCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke3ZhbHVlfVxcYCkuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHN1cHBseSBcXGBuZ1NyY3NldFxcYCB1c2luZyBhIGNvbW1hLXNlcGFyYXRlZCBsaXN0IG9mIG9uZSBvciBtb3JlIHdpZHRoIGAgK1xuICAgICAgICBgZGVzY3JpcHRvcnMgKGUuZy4gXCIxMDB3LCAyMDB3XCIpIG9yIGRlbnNpdHkgZGVzY3JpcHRvcnMgKGUuZy4gXCIxeCwgMnhcIikuYCxcbiAgICApO1xuICB9XG59XG5cbmZ1bmN0aW9uIGFzc2VydFVuZGVyRGVuc2l0eUNhcChkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIHZhbHVlOiBzdHJpbmcpIHtcbiAgY29uc3QgdW5kZXJEZW5zaXR5Q2FwID0gdmFsdWVcbiAgICAuc3BsaXQoJywnKVxuICAgIC5ldmVyeSgobnVtKSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBjb250YWlucyBhbiB1bnN1cHBvcnRlZCBpbWFnZSBkZW5zaXR5OmAgK1xuICAgICAgICBgXFxgJHt2YWx1ZX1cXGAuIE5nT3B0aW1pemVkSW1hZ2UgZ2VuZXJhbGx5IHJlY29tbWVuZHMgYSBtYXggaW1hZ2UgZGVuc2l0eSBvZiBgICtcbiAgICAgICAgYCR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggYnV0IHN1cHBvcnRzIGltYWdlIGRlbnNpdGllcyB1cCB0byBgICtcbiAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXguIFRoZSBodW1hbiBleWUgY2Fubm90IGRpc3Rpbmd1aXNoIGJldHdlZW4gaW1hZ2UgZGVuc2l0aWVzIGAgK1xuICAgICAgICBgZ3JlYXRlciB0aGFuICR7UkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQfXggLSB3aGljaCBtYWtlcyB0aGVtIHVubmVjZXNzYXJ5IGZvciBgICtcbiAgICAgICAgYG1vc3QgdXNlIGNhc2VzLiBJbWFnZXMgdGhhdCB3aWxsIGJlIHBpbmNoLXpvb21lZCBhcmUgdHlwaWNhbGx5IHRoZSBwcmltYXJ5IHVzZSBjYXNlIGZvciBgICtcbiAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBgUnVudGltZUVycm9yYCBpbnN0YW5jZSB0byByZXByZXNlbnQgYSBzaXR1YXRpb24gd2hlbiBhbiBpbnB1dCBpcyBzZXQgYWZ0ZXJcbiAqIHRoZSBkaXJlY3RpdmUgaGFzIGluaXRpYWxpemVkLlxuICovXG5mdW5jdGlvbiBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dE5hbWU6IHN0cmluZyk6IHt9IHtcbiAgbGV0IHJlYXNvbiE6IHN0cmluZztcbiAgaWYgKGlucHV0TmFtZSA9PT0gJ3dpZHRoJyB8fCBpbnB1dE5hbWUgPT09ICdoZWlnaHQnKSB7XG4gICAgcmVhc29uID1cbiAgICAgIGBDaGFuZ2luZyBcXGAke2lucHV0TmFtZX1cXGAgbWF5IHJlc3VsdCBpbiBkaWZmZXJlbnQgYXR0cmlidXRlIHZhbHVlIGAgK1xuICAgICAgYGFwcGxpZWQgdG8gdGhlIHVuZGVybHlpbmcgaW1hZ2UgZWxlbWVudCBhbmQgY2F1c2UgbGF5b3V0IHNoaWZ0cyBvbiBhIHBhZ2UuYDtcbiAgfSBlbHNlIHtcbiAgICByZWFzb24gPVxuICAgICAgYENoYW5naW5nIHRoZSBcXGAke2lucHV0TmFtZX1cXGAgd291bGQgaGF2ZSBubyBlZmZlY3Qgb24gdGhlIHVuZGVybHlpbmcgYCArXG4gICAgICBgaW1hZ2UgZWxlbWVudCwgYmVjYXVzZSB0aGUgcmVzb3VyY2UgbG9hZGluZyBoYXMgYWxyZWFkeSBvY2N1cnJlZC5gO1xuICB9XG4gIHJldHVybiBuZXcgUnVudGltZUVycm9yKFxuICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGAke2lucHV0TmFtZX1cXGAgd2FzIHVwZGF0ZWQgYWZ0ZXIgaW5pdGlhbGl6YXRpb24uIGAgK1xuICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS4gJHtyZWFzb259IGAgK1xuICAgICAgYFRvIGZpeCB0aGlzLCBlaXRoZXIgc3dpdGNoIFxcYCR7aW5wdXROYW1lfVxcYCB0byBhIHN0YXRpYyB2YWx1ZSBgICtcbiAgICAgIGBvciB3cmFwIHRoZSBpbWFnZSBlbGVtZW50IGluIGFuICpuZ0lmIHRoYXQgaXMgZ2F0ZWQgb24gdGhlIG5lY2Vzc2FyeSB2YWx1ZS5gLFxuICApO1xufVxuXG4vKipcbiAqIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgZGlyOiBOZ09wdGltaXplZEltYWdlLFxuICBjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzLFxuICBpbnB1dHM6IHN0cmluZ1tdLFxuKSB7XG4gIGlucHV0cy5mb3JFYWNoKChpbnB1dCkgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAnbmdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGBuZ1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgbmdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYG5nU3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7bmdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLlxuICovXG5mdW5jdGlvbiBhc3NlcnRHcmVhdGVyVGhhblplcm8oZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCB2YWxpZE51bWJlciA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnbnVtYmVyJyAmJiBpbnB1dFZhbHVlID4gMDtcbiAgY29uc3QgdmFsaWRTdHJpbmcgPVxuICAgIHR5cGVvZiBpbnB1dFZhbHVlID09PSAnc3RyaW5nJyAmJiAvXlxcZCskLy50ZXN0KGlucHV0VmFsdWUudHJpbSgpKSAmJiBwYXJzZUludChpbnB1dFZhbHVlKSA+IDA7XG4gIGlmICghdmFsaWROdW1iZXIgJiYgIXZhbGlkU3RyaW5nKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIFxcYCR7aW5wdXROYW1lfVxcYCBhcyBhIG51bWJlciBncmVhdGVyIHRoYW4gMC5gLFxuICAgICk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsXG4gIGltZzogSFRNTEltYWdlRWxlbWVudCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbikge1xuICBjb25zdCByZW1vdmVMb2FkTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZyk7XG4gICAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gICAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcbiAgICBjb25zdCBib3hTaXppbmcgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JveC1zaXppbmcnKTtcblxuICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdSaWdodCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1ib3R0b20nKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKTtcbiAgICAgIHJlbmRlcmVkV2lkdGggLT0gcGFyc2VGbG9hdChwYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChwYWRkaW5nTGVmdCk7XG4gICAgICByZW5kZXJlZEhlaWdodCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChwYWRkaW5nQm90dG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBpbWcubmF0dXJhbFdpZHRoO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgIE1hdGguYWJzKHN1cHBsaWVkQXNwZWN0UmF0aW8gLSBpbnRyaW5zaWNBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuICAgIGNvbnN0IHN0eWxpbmdEaXN0b3J0aW9uID1cbiAgICAgIG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgJiZcbiAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSBpbWFnZSBkb2VzIG5vdCBtYXRjaCBgICtcbiAgICAgICAgICAgIGB0aGUgYXNwZWN0IHJhdGlvIGluZGljYXRlZCBieSB0aGUgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzLiBgICtcbiAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKFxuICAgICAgICAgICAgICBpbnRyaW5zaWNBc3BlY3RSYXRpbyxcbiAgICAgICAgICAgICl9KS4gXFxuU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiBgICtcbiAgICAgICAgICAgIGAke3N1cHBsaWVkV2lkdGh9dyB4ICR7c3VwcGxpZWRIZWlnaHR9aCAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKFxuICAgICAgICAgICAgICBzdXBwbGllZEFzcGVjdFJhdGlvLFxuICAgICAgICAgICAgKX0pLiBgICtcbiAgICAgICAgICAgIGBcXG5UbyBmaXggdGhpcywgdXBkYXRlIHRoZSB3aWR0aCBhbmQgaGVpZ2h0IGF0dHJpYnV0ZXMuYCxcbiAgICAgICAgKSxcbiAgICAgICk7XG4gICAgfSBlbHNlIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGFzcGVjdCByYXRpbyBvZiB0aGUgcmVuZGVyZWQgaW1hZ2UgYCArXG4gICAgICAgICAgICBgZG9lcyBub3QgbWF0Y2ggdGhlIGltYWdlJ3MgaW50cmluc2ljIGFzcGVjdCByYXRpby4gYCArXG4gICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICBgKGFzcGVjdC1yYXRpbzogJHtyb3VuZChpbnRyaW5zaWNBc3BlY3RSYXRpbyl9KS4gXFxuUmVuZGVyZWQgaW1hZ2Ugc2l6ZTogYCArXG4gICAgICAgICAgICBgJHtyZW5kZXJlZFdpZHRofXcgeCAke3JlbmRlcmVkSGVpZ2h0fWggKGFzcGVjdC1yYXRpbzogYCArXG4gICAgICAgICAgICBgJHtyb3VuZChyZW5kZXJlZEFzcGVjdFJhdGlvKX0pLiBcXG5UaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICBgYXR0cmlidXRlcyBhcmUgYWRkZWQgdG8gYW4gaW1hZ2Ugd2l0aG91dCB1cGRhdGluZyB0aGUgY29ycmVzcG9uZGluZyBgICtcbiAgICAgICAgICAgIGBpbWFnZSBzdHlsaW5nLiBUbyBmaXggdGhpcywgYWRqdXN0IGltYWdlIHN0eWxpbmcuIEluIG1vc3QgY2FzZXMsIGAgK1xuICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgIGB0aGlzIGlzc3VlLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH0gZWxzZSBpZiAoIWRpci5uZ1NyY3NldCAmJiBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zKSB7XG4gICAgICAvLyBJZiBgbmdTcmNzZXRgIGhhc24ndCBiZWVuIHNldCwgc2FuaXR5IGNoZWNrIHRoZSBpbnRyaW5zaWMgc2l6ZS5cbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZFdpZHRoO1xuICAgICAgY29uc3QgcmVjb21tZW5kZWRIZWlnaHQgPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZEhlaWdodDtcbiAgICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gaW50cmluc2ljV2lkdGggLSByZWNvbW1lbmRlZFdpZHRoID49IE9WRVJTSVpFRF9JTUFHRV9UT0xFUkFOQ0U7XG4gICAgICBjb25zdCBvdmVyc2l6ZWRIZWlnaHQgPSBpbnRyaW5zaWNIZWlnaHQgLSByZWNvbW1lbmRlZEhlaWdodCA+PSBPVkVSU0laRURfSU1BR0VfVE9MRVJBTkNFO1xuICAgICAgaWYgKG92ZXJzaXplZFdpZHRoIHx8IG92ZXJzaXplZEhlaWdodCkge1xuICAgICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICAgZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgICAgUnVudGltZUVycm9yQ29kZS5PVkVSU0laRURfSU1BR0UsXG4gICAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBpbnRyaW5zaWMgaW1hZ2UgaXMgc2lnbmlmaWNhbnRseSBgICtcbiAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgIGBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiAke3JlbmRlcmVkV2lkdGh9dyB4ICR7cmVuZGVyZWRIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aC4gYCArXG4gICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke3JlY29tbWVuZGVkSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9LiBUbyBpbXByb3ZlIGxvYWRpbmcgdGltZSwgcmVzaXplIHRoZSBpbWFnZSBgICtcbiAgICAgICAgICAgICAgYG9yIGNvbnNpZGVyIHVzaW5nIHRoZSBcIm5nU3Jjc2V0XCIgYW5kIFwic2l6ZXNcIiBhdHRyaWJ1dGVzLmAsXG4gICAgICAgICAgKSxcbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIC8vIFdlIG9ubHkgbGlzdGVuIHRvIHRoZSBgZXJyb3JgIGV2ZW50IHRvIHJlbW92ZSB0aGUgYGxvYWRgIGV2ZW50IGxpc3RlbmVyIGJlY2F1c2UgaXQgd2lsbCBub3QgYmVcbiAgLy8gZmlyZWQgaWYgdGhlIGltYWdlIGZhaWxzIHRvIGxvYWQuIFRoaXMgaXMgZG9uZSB0byBwcmV2ZW50IG1lbW9yeSBsZWFrcyBpbiBkZXZlbG9wbWVudCBtb2RlXG4gIC8vIGJlY2F1c2UgaW1hZ2UgZWxlbWVudHMgYXJlbid0IGdhcmJhZ2UtY29sbGVjdGVkIHByb3Blcmx5LiBJdCBoYXBwZW5zIGJlY2F1c2Ugem9uZS5qcyBzdG9yZXMgdGhlXG4gIC8vIGV2ZW50IGxpc3RlbmVyIGRpcmVjdGx5IG9uIHRoZSBlbGVtZW50IGFuZCBjbG9zdXJlcyBjYXB0dXJlIGBkaXJgLlxuICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCBhIHNwZWNpZmllZCBpbnB1dCBpcyBzZXQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vbkVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBtaXNzaW5nQXR0cmlidXRlcyA9IFtdO1xuICBpZiAoZGlyLndpZHRoID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ3dpZHRoJyk7XG4gIGlmIChkaXIuaGVpZ2h0ID09PSB1bmRlZmluZWQpIG1pc3NpbmdBdHRyaWJ1dGVzLnB1c2goJ2hlaWdodCcpO1xuICBpZiAobWlzc2luZ0F0dHJpYnV0ZXMubGVuZ3RoID4gMCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLlJFUVVJUkVEX0lOUFVUX01JU1NJTkcsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXMgYCArXG4gICAgICAgIGBhcmUgbWlzc2luZzogJHttaXNzaW5nQXR0cmlidXRlcy5tYXAoKGF0dHIpID0+IGBcIiR7YXR0cn1cImApLmpvaW4oJywgJyl9LiBgICtcbiAgICAgICAgYEluY2x1ZGluZyBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyB3aWxsIHByZXZlbnQgaW1hZ2UtcmVsYXRlZCBsYXlvdXQgc2hpZnRzLiBgICtcbiAgICAgICAgYFRvIGZpeCB0aGlzLCBpbmNsdWRlIFwid2lkdGhcIiBhbmQgXCJoZWlnaHRcIiBhdHRyaWJ1dGVzIG9uIHRoZSBpbWFnZSB0YWcgb3IgdHVybiBvbiBgICtcbiAgICAgICAgYFwiZmlsbFwiIG1vZGUgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuYCxcbiAgICApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB3aWR0aCBhbmQgaGVpZ2h0IGFyZSBub3Qgc2V0LiBVc2VkIGluIGZpbGwgbW9kZSwgd2hlcmUgdGhvc2UgYXR0cmlidXRlcyBkb24ndCBtYWtlXG4gKiBzZW5zZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0RW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci53aWR0aCB8fCBkaXIuaGVpZ2h0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGF0dHJpYnV0ZXMgXFxgaGVpZ2h0XFxgIGFuZC9vciBcXGB3aWR0aFxcYCBhcmUgcHJlc2VudCBgICtcbiAgICAgICAgYGFsb25nIHdpdGggdGhlIFxcYGZpbGxcXGAgYXR0cmlidXRlLiBCZWNhdXNlIFxcYGZpbGxcXGAgbW9kZSBjYXVzZXMgYW4gaW1hZ2UgdG8gZmlsbCBpdHMgY29udGFpbmluZyBgICtcbiAgICAgICAgYGVsZW1lbnQsIHRoZSBzaXplIGF0dHJpYnV0ZXMgaGF2ZSBubyBlZmZlY3QgYW5kIHNob3VsZCBiZSByZW1vdmVkLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIHJlbmRlcmVkIGltYWdlIGhhcyBhIG5vbnplcm8gaGVpZ2h0LiBJZiB0aGUgaW1hZ2UgaXMgaW4gZmlsbCBtb2RlLCBwcm92aWRlc1xuICogZ3VpZGFuY2UgdGhhdCB0aGlzIGNhbiBiZSBjYXVzZWQgYnkgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCdzIENTUyBwb3NpdGlvbiBwcm9wZXJ0eS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uWmVyb1JlbmRlcmVkSGVpZ2h0KFxuICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsXG4gIGltZzogSFRNTEltYWdlRWxlbWVudCxcbiAgcmVuZGVyZXI6IFJlbmRlcmVyMixcbikge1xuICBjb25zdCByZW1vdmVMb2FkTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxvYWRMaXN0ZW5lckZuKCk7XG4gICAgcmVtb3ZlRXJyb3JMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgcmVuZGVyZWRIZWlnaHQgPSBpbWcuY2xpZW50SGVpZ2h0O1xuICAgIGlmIChkaXIuZmlsbCAmJiByZW5kZXJlZEhlaWdodCA9PT0gMCkge1xuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICBmb3JtYXRSdW50aW1lRXJyb3IoXG4gICAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIGhlaWdodCBvZiB0aGUgZmlsbC1tb2RlIGltYWdlIGlzIHplcm8uIGAgK1xuICAgICAgICAgICAgYFRoaXMgaXMgbGlrZWx5IGJlY2F1c2UgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgIGBwcm9wZXJ0eSBzZXQgdG8gb25lIG9mIHRoZSBmb2xsb3dpbmc6IFwicmVsYXRpdmVcIiwgXCJmaXhlZFwiLCBvciBcImFic29sdXRlXCIuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzIHByb2JsZW0sIG1ha2Ugc3VyZSB0aGUgY29udGFpbmVyIGVsZW1lbnQgaGFzIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgIGBwcm9wZXJ0eSBkZWZpbmVkIGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50IGlzIG5vdCB6ZXJvLmAsXG4gICAgICAgICksXG4gICAgICApO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gU2VlIGNvbW1lbnRzIGluIHRoZSBgYXNzZXJ0Tm9JbWFnZURpc3RvcnRpb25gLlxuICBjb25zdCByZW1vdmVFcnJvckxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnZXJyb3InLCAoKSA9PiB7XG4gICAgcmVtb3ZlTG9hZExpc3RlbmVyRm4oKTtcbiAgICByZW1vdmVFcnJvckxpc3RlbmVyRm4oKTtcbiAgfSk7XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYGxvYWRpbmdgIGF0dHJpYnV0ZSBpcyBzZXQgdG8gYSB2YWxpZCBpbnB1dCAmXG4gKiBpcyBub3QgdXNlZCBvbiBwcmlvcml0eSBpbWFnZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydFZhbGlkTG9hZGluZ0lucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLmxvYWRpbmcgJiYgZGlyLnByaW9yaXR5KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRpbmdcXGAgYXR0cmlidXRlIGAgK1xuICAgICAgICBgd2FzIHVzZWQgb24gYW4gaW1hZ2UgdGhhdCB3YXMgbWFya2VkIFwicHJpb3JpdHlcIi4gYCArXG4gICAgICAgIGBTZXR0aW5nIFxcYGxvYWRpbmdcXGAgb24gcHJpb3JpdHkgaW1hZ2VzIGlzIG5vdCBhbGxvd2VkIGAgK1xuICAgICAgICBgYmVjYXVzZSB0aGVzZSBpbWFnZXMgd2lsbCBhbHdheXMgYmUgZWFnZXJseSBsb2FkZWQuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHJlbW92ZSB0aGUg4oCcbG9hZGluZ+KAnSBhdHRyaWJ1dGUgZnJvbSB0aGUgcHJpb3JpdHkgaW1hZ2UuYCxcbiAgICApO1xuICB9XG4gIGNvbnN0IHZhbGlkSW5wdXRzID0gWydhdXRvJywgJ2VhZ2VyJywgJ2xhenknXTtcbiAgaWYgKHR5cGVvZiBkaXIubG9hZGluZyA9PT0gJ3N0cmluZycgJiYgIXZhbGlkSW5wdXRzLmluY2x1ZGVzKGRpci5sb2FkaW5nKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgYGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke2Rpci5sb2FkaW5nfVxcYCkuIGAgK1xuICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSB2YWxpZCB2YWx1ZSAoXCJsYXp5XCIsIFwiZWFnZXJcIiwgb3IgXCJhdXRvXCIpLmAsXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIE5PVCB1c2luZyBhIGxvYWRlciAoZmFsbGluZyBiYWNrIHRvIHRoZSBnZW5lcmljIGxvYWRlcikgYW5kXG4gKiB0aGUgaW1hZ2UgYXBwZWFycyB0byBiZSBob3N0ZWQgb24gb25lIG9mIHRoZSBpbWFnZSBDRE5zIGZvciB3aGljaFxuICogd2UgZG8gaGF2ZSBhIGJ1aWx0LWluIGltYWdlIGxvYWRlci4gU3VnZ2VzdHMgc3dpdGNoaW5nIHRvIHRoZVxuICogYnVpbHQtaW4gbG9hZGVyLlxuICpcbiAqIEBwYXJhbSBuZ1NyYyBWYWx1ZSBvZiB0aGUgbmdTcmMgYXR0cmlidXRlXG4gKiBAcGFyYW0gaW1hZ2VMb2FkZXIgSW1hZ2VMb2FkZXIgcHJvdmlkZWRcbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90TWlzc2luZ0J1aWx0SW5Mb2FkZXIobmdTcmM6IHN0cmluZywgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChpbWFnZUxvYWRlciA9PT0gbm9vcEltYWdlTG9hZGVyKSB7XG4gICAgbGV0IGJ1aWx0SW5Mb2FkZXJOYW1lID0gJyc7XG4gICAgZm9yIChjb25zdCBsb2FkZXIgb2YgQlVJTFRfSU5fTE9BREVSUykge1xuICAgICAgaWYgKGxvYWRlci50ZXN0VXJsKG5nU3JjKSkge1xuICAgICAgICBidWlsdEluTG9hZGVyTmFtZSA9IGxvYWRlci5uYW1lO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKGJ1aWx0SW5Mb2FkZXJOYW1lKSB7XG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfQlVJTFRJTl9MT0FERVIsXG4gICAgICAgICAgYE5nT3B0aW1pemVkSW1hZ2U6IEl0IGxvb2tzIGxpa2UgeW91ciBpbWFnZXMgbWF5IGJlIGhvc3RlZCBvbiB0aGUgYCArXG4gICAgICAgICAgICBgJHtidWlsdEluTG9hZGVyTmFtZX0gQ0ROLCBidXQgeW91ciBhcHAgaXMgbm90IHVzaW5nIEFuZ3VsYXIncyBgICtcbiAgICAgICAgICAgIGBidWlsdC1pbiBsb2FkZXIgZm9yIHRoYXQgQ0ROLiBXZSByZWNvbW1lbmQgc3dpdGNoaW5nIHRvIHVzZSBgICtcbiAgICAgICAgICAgIGB0aGUgYnVpbHQtaW4gYnkgY2FsbGluZyBcXGBwcm92aWRlJHtidWlsdEluTG9hZGVyTmFtZX1Mb2FkZXIoKVxcYCBgICtcbiAgICAgICAgICAgIGBpbiB5b3VyIFxcYHByb3ZpZGVyc1xcYCBhbmQgcGFzc2luZyBpdCB5b3VyIGluc3RhbmNlJ3MgYmFzZSBVUkwuIGAgK1xuICAgICAgICAgICAgYElmIHlvdSBkb24ndCB3YW50IHRvIHVzZSB0aGUgYnVpbHQtaW4gbG9hZGVyLCBkZWZpbmUgYSBjdXN0b20gYCArXG4gICAgICAgICAgICBgbG9hZGVyIGZ1bmN0aW9uIHVzaW5nIElNQUdFX0xPQURFUiB0byBzaWxlbmNlIHRoaXMgd2FybmluZy5gLFxuICAgICAgICApLFxuICAgICAgKTtcbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBuZ1NyY3NldCBpcyBwcmVzZW50IGFuZCBubyBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCkuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vTmdTcmNzZXRXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubmdTcmNzZXQgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICBgbm8gaW1hZ2UgbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLCBgICtcbiAgICAgICAgICBgd2hpY2ggd291bGQgcmVzdWx0IGluIHRoZSBzYW1lIGltYWdlIGJlaW5nIHVzZWQgZm9yIGFsbCBjb25maWd1cmVkIHNpemVzLiBgICtcbiAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBsb2FkZXIgb3IgcmVtb3ZlIHRoZSBcXGBuZ1NyY3NldFxcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCxcbiAgICAgICksXG4gICAgKTtcbiAgfVxufVxuXG4vKipcbiAqIFdhcm5zIGlmIGxvYWRlclBhcmFtcyBpcyBwcmVzZW50IGFuZCBubyBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmdcbiAqIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0xvYWRlclBhcmFtc1dpdGhvdXRMb2FkZXIoZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWFnZUxvYWRlcjogSW1hZ2VMb2FkZXIpIHtcbiAgaWYgKGRpci5sb2FkZXJQYXJhbXMgJiYgaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5NSVNTSU5HX05FQ0VTU0FSWV9MT0FERVIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gdGhlIFxcYGxvYWRlclBhcmFtc1xcYCBhdHRyaWJ1dGUgaXMgcHJlc2VudCBidXQgYCArXG4gICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgYHdoaWNoIG1lYW5zIHRoYXQgdGhlIGxvYWRlclBhcmFtcyBkYXRhIHdpbGwgbm90IGJlIGNvbnN1bWVkIGFuZCB3aWxsIG5vdCBhZmZlY3QgdGhlIFVSTC4gYCArXG4gICAgICAgICAgYFRvIGZpeCB0aGlzLCBwcm92aWRlIGEgY3VzdG9tIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYGxvYWRlclBhcmFtc1xcYCBhdHRyaWJ1dGUgZnJvbSB0aGUgaW1hZ2UuYCxcbiAgICAgICksXG4gICAgKTtcbiAgfVxufVxuXG5mdW5jdGlvbiByb3VuZChpbnB1dDogbnVtYmVyKTogbnVtYmVyIHwgc3RyaW5nIHtcbiAgcmV0dXJuIE51bWJlci5pc0ludGVnZXIoaW5wdXQpID8gaW5wdXQgOiBpbnB1dC50b0ZpeGVkKDIpO1xufVxuXG4vLyBUcmFuc2Zvcm0gZnVuY3Rpb24gdG8gaGFuZGxlIFNhZmVWYWx1ZSBpbnB1dCBmb3IgbmdTcmMuIFRoaXMgZG9lc24ndCBkbyBhbnkgc2FuaXRpemF0aW9uLFxuLy8gYXMgdGhhdCBpcyBub3QgbmVlZGVkIGZvciBpbWcuc3JjIGFuZCBpbWcuc3Jjc2V0LiBUaGlzIHRyYW5zZm9ybSBpcyBwdXJlbHkgZm9yIGNvbXBhdGliaWxpdHkuXG5mdW5jdGlvbiB1bndyYXBTYWZlVXJsKHZhbHVlOiBzdHJpbmcgfCBTYWZlVmFsdWUpOiBzdHJpbmcge1xuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfVxuICByZXR1cm4gdW53cmFwU2FmZVZhbHVlKHZhbHVlKTtcbn1cblxuLy8gVHJhbnNmb3JtIGZ1bmN0aW9uIHRvIGhhbmRsZSBpbnB1dHMgd2hpY2ggbWF5IGJlIGJvb2xlYW5zLCBzdHJpbmdzLCBvciBzdHJpbmcgcmVwcmVzZW50YXRpb25zXG4vLyBvZiBib29sZWFuIHZhbHVlcy4gVXNlZCBmb3IgdGhlIHBsYWNlaG9sZGVyIGF0dHJpYnV0ZS5cbmV4cG9ydCBmdW5jdGlvbiBib29sZWFuT3JEYXRhVXJsQXR0cmlidXRlKHZhbHVlOiBib29sZWFuIHwgc3RyaW5nKTogYm9vbGVhbiB8IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnICYmIHZhbHVlLnN0YXJ0c1dpdGgoYGRhdGE6YCkpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cbiAgcmV0dXJuIGJvb2xlYW5BdHRyaWJ1dGUodmFsdWUpO1xufVxuIl19