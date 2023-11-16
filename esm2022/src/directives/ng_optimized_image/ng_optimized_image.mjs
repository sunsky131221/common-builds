/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { booleanAttribute, Directive, ElementRef, inject, Injector, Input, NgZone, numberAttribute, PLATFORM_ID, Renderer2, ɵformatRuntimeError as formatRuntimeError, ɵIMAGE_CONFIG as IMAGE_CONFIG, ɵIMAGE_CONFIG_DEFAULTS as IMAGE_CONFIG_DEFAULTS, ɵperformanceMarkFeature as performanceMarkFeature, ɵRuntimeError as RuntimeError, ɵunwrapSafeValue as unwrapSafeValue } from '@angular/core';
import { isPlatformServer } from '../../platform_id';
import { imgDirectiveDetails } from './error_helper';
import { cloudinaryLoaderInfo } from './image_loaders/cloudinary_loader';
import { IMAGE_LOADER, noopImageLoader } from './image_loaders/image_loader';
import { imageKitLoaderInfo } from './image_loaders/imagekit_loader';
import { imgixLoaderInfo } from './image_loaders/imgix_loader';
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
const ASPECT_RATIO_TOLERANCE = .1;
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
/** Info about built-in loaders we can test for. */
export const BUILT_IN_LOADERS = [imgixLoaderInfo, imageKitLoaderInfo, cloudinaryLoaderInfo];
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
 * The `NgOptimizedImage` directive is marked as [standalone](guide/standalone-components) and can
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
        this.setHostAttributes();
    }
    setHostAttributes() {
        // Must set width/height explicitly in case they are bound (in which case they will
        // only be reflected and not found by the browser)
        if (this.fill) {
            if (!this.sizes) {
                this.sizes = '100vw';
            }
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
        const finalSrcs = this.ngSrcset.split(',').filter(src => src !== '').map(srcStr => {
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
            filteredBreakpoints = breakpoints.filter(bp => bp >= VIEWPORT_BREAKPOINT_CUTOFF);
        }
        const finalSrcs = filteredBreakpoints.map(bp => `${this.callImageLoader({ src: this.ngSrc, width: bp })} ${bp}w`);
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
        const finalSrcs = DENSITY_SRCSET_MULTIPLIERS.map(multiplier => `${this.callImageLoader({
            src: this.ngSrc,
            width: this.width * multiplier
        })} ${multiplier}x`);
        return finalSrcs.join(', ');
    }
    shouldGenerateAutomaticSrcset() {
        let oversizedImage = false;
        if (!this.sizes) {
            oversizedImage =
                this.width > FIXED_SRCSET_WIDTH_LIMIT || this.height > FIXED_SRCSET_HEIGHT_LIMIT;
        }
        return !this.disableOptimizedSrcset && !this.srcset && this.imageLoader !== noopImageLoader &&
            !oversizedImage;
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
    static { this.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-6e29e85", ngImport: i0, type: NgOptimizedImage, deps: [], target: i0.ɵɵFactoryTarget.Directive }); }
    static { this.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "16.1.0", version: "17.1.0-next.0+sha-6e29e85", type: NgOptimizedImage, isStandalone: true, selector: "img[ngSrc]", inputs: { ngSrc: ["ngSrc", "ngSrc", unwrapSafeUrl], ngSrcset: "ngSrcset", sizes: "sizes", width: ["width", "width", numberAttribute], height: ["height", "height", numberAttribute], loading: "loading", priority: ["priority", "priority", booleanAttribute], loaderParams: "loaderParams", disableOptimizedSrcset: ["disableOptimizedSrcset", "disableOptimizedSrcset", booleanAttribute], fill: ["fill", "fill", booleanAttribute], src: "src", srcset: "srcset" }, host: { properties: { "style.position": "fill ? \"absolute\" : null", "style.width": "fill ? \"100%\" : null", "style.height": "fill ? \"100%\" : null", "style.inset": "fill ? \"0px\" : null" } }, usesOnChanges: true, ngImport: i0 }); }
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "17.1.0-next.0+sha-6e29e85", ngImport: i0, type: NgOptimizedImage, decorators: [{
            type: Directive,
            args: [{
                    standalone: true,
                    selector: 'img[ngSrc]',
                    host: {
                        '[style.position]': 'fill ? "absolute" : null',
                        '[style.width]': 'fill ? "100%" : null',
                        '[style.height]': 'fill ? "100%" : null',
                        '[style.inset]': 'fill ? "0px" : null'
                    }
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
    const underDensityCap = value.split(',').every(num => num === '' || parseFloat(num) <= ABSOLUTE_SRCSET_DENSITY_CAP);
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
        reason = `Changing \`${inputName}\` may result in different attribute value ` +
            `applied to the underlying image element and cause layout shifts on a page.`;
    }
    else {
        reason = `Changing the \`${inputName}\` would have no effect on the underlying ` +
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
    inputs.forEach(input => {
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
    const removeListenerFn = renderer.listen(img, 'load', () => {
        removeListenerFn();
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
            const oversizedWidth = (intrinsicWidth - recommendedWidth) >= OVERSIZED_IMAGE_TOLERANCE;
            const oversizedHeight = (intrinsicHeight - recommendedHeight) >= OVERSIZED_IMAGE_TOLERANCE;
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
            `are missing: ${missingAttributes.map(attr => `"${attr}"`).join(', ')}. ` +
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
    const removeListenerFn = renderer.listen(img, 'load', () => {
        removeListenerFn();
        const renderedHeight = img.clientHeight;
        if (dir.fill && renderedHeight === 0) {
            console.warn(formatRuntimeError(2952 /* RuntimeErrorCode.INVALID_INPUT */, `${imgDirectiveDetails(dir.ngSrc)} the height of the fill-mode image is zero. ` +
                `This is likely because the containing element does not have the CSS 'position' ` +
                `property set to one of the following: "relative", "fixed", or "absolute". ` +
                `To fix this problem, make sure the container element has the CSS 'position' ` +
                `property defined and the height of the element is not zero.`));
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfb3B0aW1pemVkX2ltYWdlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX29wdGltaXplZF9pbWFnZS9uZ19vcHRpbWl6ZWRfaW1hZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGdCQUFnQixFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsTUFBTSxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLGVBQWUsRUFBZ0MsV0FBVyxFQUFFLFNBQVMsRUFBaUIsbUJBQW1CLElBQUksa0JBQWtCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBRSxzQkFBc0IsSUFBSSxxQkFBcUIsRUFBK0IsdUJBQXVCLElBQUksc0JBQXNCLEVBQUUsYUFBYSxJQUFJLFlBQVksRUFBMkIsZ0JBQWdCLElBQUksZUFBZSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3JlLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRW5ELE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBQ25ELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLG1DQUFtQyxDQUFDO0FBQ3ZFLE9BQU8sRUFBQyxZQUFZLEVBQWtDLGVBQWUsRUFBQyxNQUFNLDhCQUE4QixDQUFDO0FBQzNHLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLGlDQUFpQyxDQUFDO0FBQ25FLE9BQU8sRUFBQyxlQUFlLEVBQUMsTUFBTSw4QkFBOEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxzQkFBc0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMscUJBQXFCLEVBQUMsTUFBTSwyQkFBMkIsQ0FBQztBQUNoRSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQzs7QUFFMUQ7Ozs7OztHQU1HO0FBQ0gsTUFBTSw4QkFBOEIsR0FBRyxFQUFFLENBQUM7QUFFMUM7OztHQUdHO0FBQ0gsTUFBTSw2QkFBNkIsR0FBRywyQkFBMkIsQ0FBQztBQUVsRTs7O0dBR0c7QUFDSCxNQUFNLCtCQUErQixHQUFHLG1DQUFtQyxDQUFDO0FBRTVFOzs7O0dBSUc7QUFDSCxNQUFNLENBQUMsTUFBTSwyQkFBMkIsR0FBRyxDQUFDLENBQUM7QUFFN0M7OztHQUdHO0FBQ0gsTUFBTSxDQUFDLE1BQU0sOEJBQThCLEdBQUcsQ0FBQyxDQUFDO0FBRWhEOztHQUVHO0FBQ0gsTUFBTSwwQkFBMEIsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztBQUUxQzs7R0FFRztBQUNILE1BQU0sMEJBQTBCLEdBQUcsR0FBRyxDQUFDO0FBQ3ZDOztHQUVHO0FBQ0gsTUFBTSxzQkFBc0IsR0FBRyxFQUFFLENBQUM7QUFFbEM7Ozs7R0FJRztBQUNILE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDO0FBRXZDOzs7R0FHRztBQUNILE1BQU0sd0JBQXdCLEdBQUcsSUFBSSxDQUFDO0FBQ3RDLE1BQU0seUJBQXlCLEdBQUcsSUFBSSxDQUFDO0FBR3ZDLG1EQUFtRDtBQUNuRCxNQUFNLENBQUMsTUFBTSxnQkFBZ0IsR0FBRyxDQUFDLGVBQWUsRUFBRSxrQkFBa0IsRUFBRSxvQkFBb0IsQ0FBQyxDQUFDO0FBRTVGOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBaUdHO0FBV0gsTUFBTSxPQUFPLGdCQUFnQjtJQVY3QjtRQVdVLGdCQUFXLEdBQUcsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDO1FBQ25DLFdBQU0sR0FBZ0IsYUFBYSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQzFELGFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDN0IsZUFBVSxHQUFxQixNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsYUFBYSxDQUFDO1FBQ2hFLGFBQVEsR0FBRyxNQUFNLENBQUMsUUFBUSxDQUFDLENBQUM7UUFDbkIsYUFBUSxHQUFHLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQ2pELHVCQUFrQixHQUFHLE1BQU0sQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRWpFLGlFQUFpRTtRQUN6RCxnQkFBVyxHQUFHLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDO1FBRTdFOzs7OztXQUtHO1FBQ0ssaUJBQVksR0FBZ0IsSUFBSSxDQUFDO1FBbUR6Qzs7V0FFRztRQUNtQyxhQUFRLEdBQUcsS0FBSyxDQUFDO1FBT3ZEOztXQUVHO1FBQ21DLDJCQUFzQixHQUFHLEtBQUssQ0FBQztRQUVyRTs7O1dBR0c7UUFDbUMsU0FBSSxHQUFHLEtBQUssQ0FBQztLQTRQcEQ7SUExT0MsYUFBYTtJQUNiLFFBQVE7UUFDTixzQkFBc0IsQ0FBQyxrQkFBa0IsQ0FBQyxDQUFDO1FBRTNDLElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCxNQUFNLE1BQU0sR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUN6QyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMvQyxtQkFBbUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1lBQ3pDLHNCQUFzQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzdCLElBQUksSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNsQix5QkFBeUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNsQyxDQUFDO1lBQ0Qsb0JBQW9CLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDM0IsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDdkIsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLENBQUM7Z0JBQ2QseUJBQXlCLENBQUMsSUFBSSxDQUFDLENBQUM7Z0JBQ2hDLDRGQUE0RjtnQkFDNUYsc0NBQXNDO2dCQUN0QyxNQUFNLENBQUMsaUJBQWlCLENBQ3BCLEdBQUcsRUFBRSxDQUFDLDJCQUEyQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQy9FLENBQUM7aUJBQU0sQ0FBQztnQkFDTiw0QkFBNEIsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLFNBQVMsRUFBRSxDQUFDO29CQUM5QixxQkFBcUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLE1BQU0sRUFBRSxRQUFRLENBQUMsQ0FBQztnQkFDckQsQ0FBQztnQkFDRCxJQUFJLElBQUksQ0FBQyxLQUFLLEtBQUssU0FBUyxFQUFFLENBQUM7b0JBQzdCLHFCQUFxQixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2dCQUNuRCxDQUFDO2dCQUNELCtEQUErRDtnQkFDL0QsaUVBQWlFO2dCQUNqRSxNQUFNLENBQUMsaUJBQWlCLENBQ3BCLEdBQUcsRUFBRSxDQUFDLHVCQUF1QixDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzNFLENBQUM7WUFDRCx1QkFBdUIsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM5QixJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO2dCQUNuQixvQkFBb0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3QixDQUFDO1lBQ0QsNkJBQTZCLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDNUQsNkJBQTZCLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUN0RCxpQ0FBaUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBRTFELElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDOUIsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxXQUFZLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxlQUFlLEVBQUUsRUFBRSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQztnQkFDckYsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1lBRUQsSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7Z0JBQ2xCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLENBQUM7Z0JBQ3pELE9BQU8sQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLEVBQUUsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQy9ELENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFDM0IsQ0FBQztJQUVPLGlCQUFpQjtRQUN2QixtRkFBbUY7UUFDbkYsa0RBQWtEO1FBQ2xELElBQUksSUFBSSxDQUFDLElBQUksRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDaEIsSUFBSSxDQUFDLEtBQUssR0FBRyxPQUFPLENBQUM7WUFDdkIsQ0FBQztRQUNILENBQUM7YUFBTSxDQUFDO1lBQ04sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsS0FBTSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7WUFDdkQsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsTUFBTyxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDM0QsQ0FBQztRQUVELElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUMsQ0FBQztRQUM1RCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFFaEUsOEVBQThFO1FBQzlFLCtDQUErQztRQUMvQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLE1BQU0sQ0FBQyxDQUFDO1FBRXhDLDhFQUE4RTtRQUM5RSw2Q0FBNkM7UUFDN0MsTUFBTSxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFFbEQsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZixJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDO1FBQ0QsSUFBSSxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNuQyxJQUFJLENBQUMsa0JBQWtCLENBQUMsb0JBQW9CLENBQ3hDLElBQUksQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxFQUFFLGVBQWUsRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDMUUsQ0FBQztJQUNILENBQUM7SUFFRCxhQUFhO0lBQ2IsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLElBQUksU0FBUyxFQUFFLENBQUM7WUFDZCwyQkFBMkIsQ0FBQyxJQUFJLEVBQUUsT0FBTyxFQUFFO2dCQUN6QyxVQUFVO2dCQUNWLE9BQU87Z0JBQ1AsUUFBUTtnQkFDUixVQUFVO2dCQUNWLE1BQU07Z0JBQ04sU0FBUztnQkFDVCxPQUFPO2dCQUNQLGNBQWM7Z0JBQ2Qsd0JBQXdCO2FBQ3pCLENBQUMsQ0FBQztRQUNMLENBQUM7UUFDRCxJQUFJLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO1lBQzFELE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDakMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzlCLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7WUFDakMsSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLElBQUksSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJLE1BQU0sS0FBSyxNQUFNLEVBQUUsQ0FBQztnQkFDdkUsTUFBTSxNQUFNLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQ3pDLE1BQU0sQ0FBQyxpQkFBaUIsQ0FBQyxHQUFHLEVBQUU7b0JBQzVCLElBQUksQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsQ0FBQztnQkFDaEQsQ0FBQyxDQUFDLENBQUM7WUFDTCxDQUFDO1FBQ0gsQ0FBQztJQUNILENBQUM7SUFFTyxlQUFlLENBQUMseUJBQWtFO1FBRXhGLElBQUksZUFBZSxHQUFzQix5QkFBeUIsQ0FBQztRQUNuRSxJQUFJLElBQUksQ0FBQyxZQUFZLEVBQUUsQ0FBQztZQUN0QixlQUFlLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQyxZQUFZLENBQUM7UUFDbkQsQ0FBQztRQUNELE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxJQUFJLElBQUksQ0FBQyxPQUFPLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDakQsT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3RCLENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO0lBQzFDLENBQUM7SUFFTyxnQkFBZ0I7UUFDdEIsT0FBTyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUN6QyxDQUFDO0lBRU8sZUFBZTtRQUNyQiw2RkFBNkY7UUFDN0YsNEZBQTRGO1FBQzVGLG1FQUFtRTtRQUNuRSxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksRUFBRSxDQUFDO1lBQ3ZCLE1BQU0sU0FBUyxHQUFHLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUMsQ0FBQztZQUNwQyw0REFBNEQ7WUFDNUQsSUFBSSxDQUFDLFlBQVksR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3RELENBQUM7UUFDRCxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUM7SUFDM0IsQ0FBQztJQUVPLGtCQUFrQjtRQUN4QixNQUFNLFdBQVcsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RFLE1BQU0sU0FBUyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUU7WUFDaEYsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLEVBQUUsQ0FBQztZQUN2QixNQUFNLEtBQUssR0FBRyxXQUFXLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFNLENBQUM7WUFDbEYsT0FBTyxHQUFHLElBQUksQ0FBQyxlQUFlLENBQUMsRUFBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUMsQ0FBQyxJQUFJLE1BQU0sRUFBRSxDQUFDO1FBQ3ZFLENBQUMsQ0FBQyxDQUFDO1FBQ0gsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTyxrQkFBa0I7UUFDeEIsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLElBQUksQ0FBQyxtQkFBbUIsRUFBRSxDQUFDO1FBQ3BDLENBQUM7YUFBTSxDQUFDO1lBQ04sT0FBTyxJQUFJLENBQUMsY0FBYyxFQUFFLENBQUM7UUFDL0IsQ0FBQztJQUNILENBQUM7SUFFTyxtQkFBbUI7UUFDekIsTUFBTSxFQUFDLFdBQVcsRUFBQyxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUM7UUFFbEMsSUFBSSxtQkFBbUIsR0FBRyxXQUFZLENBQUM7UUFDdkMsSUFBSSxJQUFJLENBQUMsS0FBSyxFQUFFLElBQUksRUFBRSxLQUFLLE9BQU8sRUFBRSxDQUFDO1lBQ25DLDRFQUE0RTtZQUM1RSx5Q0FBeUM7WUFDekMsbUJBQW1CLEdBQUcsV0FBWSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ3BGLENBQUM7UUFFRCxNQUFNLFNBQVMsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQ3JDLEVBQUUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBQyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsQ0FBQztRQUMxRSxPQUFPLFNBQVMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDOUIsQ0FBQztJQUVPLGtCQUFrQixDQUFDLGNBQWMsR0FBRyxLQUFLO1FBQy9DLElBQUksY0FBYyxFQUFFLENBQUM7WUFDbkIsb0VBQW9FO1lBQ3BFLDRDQUE0QztZQUM1QyxJQUFJLENBQUMsWUFBWSxHQUFHLElBQUksQ0FBQztRQUMzQixDQUFDO1FBRUQsTUFBTSxZQUFZLEdBQUcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQzVDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLEVBQUUsWUFBWSxDQUFDLENBQUM7UUFFM0MsSUFBSSxlQUFlLEdBQXFCLFNBQVMsQ0FBQztRQUNsRCxJQUFJLElBQUksQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUNsQixlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsQ0FBQzthQUFNLElBQUksSUFBSSxDQUFDLDZCQUE2QixFQUFFLEVBQUUsQ0FBQztZQUNoRCxlQUFlLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixFQUFFLENBQUM7UUFDOUMsQ0FBQztRQUVELElBQUksZUFBZSxFQUFFLENBQUM7WUFDcEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsRUFBRSxlQUFlLENBQUMsQ0FBQztRQUNuRCxDQUFDO1FBQ0QsT0FBTyxlQUFlLENBQUM7SUFDekIsQ0FBQztJQUVPLGNBQWM7UUFDcEIsTUFBTSxTQUFTLEdBQUcsMEJBQTBCLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDO1lBQ3BDLEdBQUcsRUFBRSxJQUFJLENBQUMsS0FBSztZQUNmLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBTSxHQUFHLFVBQVU7U0FDaEMsQ0FBQyxJQUFJLFVBQVUsR0FBRyxDQUFDLENBQUM7UUFDdEUsT0FBTyxTQUFTLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQzlCLENBQUM7SUFFTyw2QkFBNkI7UUFDbkMsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1FBQzNCLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7WUFDaEIsY0FBYztnQkFDVixJQUFJLENBQUMsS0FBTSxHQUFHLHdCQUF3QixJQUFJLElBQUksQ0FBQyxNQUFPLEdBQUcseUJBQXlCLENBQUM7UUFDekYsQ0FBQztRQUNELE9BQU8sQ0FBQyxJQUFJLENBQUMsc0JBQXNCLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxJQUFJLElBQUksQ0FBQyxXQUFXLEtBQUssZUFBZTtZQUN2RixDQUFDLGNBQWMsQ0FBQztJQUN0QixDQUFDO0lBRUQsYUFBYTtJQUNiLFdBQVc7UUFDVCxJQUFJLFNBQVMsRUFBRSxDQUFDO1lBQ2QsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFlBQVksS0FBSyxJQUFJLElBQUksSUFBSSxDQUFDLFdBQVcsS0FBSyxJQUFJLEVBQUUsQ0FBQztnQkFDOUUsSUFBSSxDQUFDLFdBQVcsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO1lBQ3RELENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQztJQUVPLGdCQUFnQixDQUFDLElBQVksRUFBRSxLQUFhO1FBQ2xELElBQUksQ0FBQyxRQUFRLENBQUMsWUFBWSxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO0lBQzNELENBQUM7eUhBblZVLGdCQUFnQjs2R0FBaEIsZ0JBQWdCLGtGQSt3QnBCLGFBQWEsbUVBN3RCRCxlQUFlLGdDQU9mLGVBQWUsMERBZWYsZ0JBQWdCLDhHQVVoQixnQkFBZ0IsMEJBTWhCLGdCQUFnQjs7c0dBeEZ4QixnQkFBZ0I7a0JBVjVCLFNBQVM7bUJBQUM7b0JBQ1QsVUFBVSxFQUFFLElBQUk7b0JBQ2hCLFFBQVEsRUFBRSxZQUFZO29CQUN0QixJQUFJLEVBQUU7d0JBQ0osa0JBQWtCLEVBQUUsMEJBQTBCO3dCQUM5QyxlQUFlLEVBQUUsc0JBQXNCO3dCQUN2QyxnQkFBZ0IsRUFBRSxzQkFBc0I7d0JBQ3hDLGVBQWUsRUFBRSxxQkFBcUI7cUJBQ3ZDO2lCQUNGOzhCQTBCb0QsS0FBSztzQkFBdkQsS0FBSzt1QkFBQyxFQUFDLFFBQVEsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBQztnQkFheEMsUUFBUTtzQkFBaEIsS0FBSztnQkFNRyxLQUFLO3NCQUFiLEtBQUs7Z0JBTStCLEtBQUs7c0JBQXpDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZUFBZSxFQUFDO2dCQU9FLE1BQU07c0JBQTFDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZUFBZSxFQUFDO2dCQVUxQixPQUFPO3NCQUFmLEtBQUs7Z0JBS2dDLFFBQVE7c0JBQTdDLEtBQUs7dUJBQUMsRUFBQyxTQUFTLEVBQUUsZ0JBQWdCLEVBQUM7Z0JBSzNCLFlBQVk7c0JBQXBCLEtBQUs7Z0JBS2dDLHNCQUFzQjtzQkFBM0QsS0FBSzt1QkFBQyxFQUFDLFNBQVMsRUFBRSxnQkFBZ0IsRUFBQztnQkFNRSxJQUFJO3NCQUF6QyxLQUFLO3VCQUFDLEVBQUMsU0FBUyxFQUFFLGdCQUFnQixFQUFDO2dCQVEzQixHQUFHO3NCQUFYLEtBQUs7Z0JBUUcsTUFBTTtzQkFBZCxLQUFLOztBQThPUixxQkFBcUI7QUFFckI7O0dBRUc7QUFDSCxTQUFTLGFBQWEsQ0FBQyxNQUFtQjtJQUN4QyxJQUFJLGlCQUFpQixHQUE2QixFQUFFLENBQUM7SUFDckQsSUFBSSxNQUFNLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdkIsaUJBQWlCLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLHFCQUFxQixFQUFFLE1BQU0sRUFBRSxpQkFBaUIsQ0FBQyxDQUFDO0FBQzdFLENBQUM7QUFFRCw4QkFBOEI7QUFFOUI7O0dBRUc7QUFDSCxTQUFTLHNCQUFzQixDQUFDLEdBQXFCO0lBQ25ELElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO1FBQ1osTUFBTSxJQUFJLFlBQVksa0RBRWxCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyw2Q0FBNkM7WUFDMUUsMERBQTBEO1lBQzFELHNGQUFzRjtZQUN0RixtREFBbUQsQ0FBQyxDQUFDO0lBQy9ELENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHlCQUF5QixDQUFDLEdBQXFCO0lBQ3RELElBQUksR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ2YsTUFBTSxJQUFJLFlBQVkscURBRWxCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxtREFBbUQ7WUFDaEYsMERBQTBEO1lBQzFELDhFQUE4RTtZQUM5RSxvRUFBb0UsQ0FBQyxDQUFDO0lBQ2hGLENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLG9CQUFvQixDQUFDLEdBQXFCO0lBQ2pELElBQUksS0FBSyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFLENBQUM7SUFDN0IsSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDOUIsSUFBSSxLQUFLLENBQUMsTUFBTSxHQUFHLDhCQUE4QixFQUFFLENBQUM7WUFDbEQsS0FBSyxHQUFHLEtBQUssQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLDhCQUE4QixDQUFDLEdBQUcsS0FBSyxDQUFDO1FBQ3JFLENBQUM7UUFDRCxNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxFQUFFLEtBQUssQ0FBQyx3Q0FBd0M7WUFDNUUsSUFBSSxLQUFLLCtEQUErRDtZQUN4RSx1RUFBdUU7WUFDdkUsdUVBQXVFLENBQUMsQ0FBQztJQUNuRixDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxvQkFBb0IsQ0FBQyxHQUFxQjtJQUNqRCxJQUFJLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDO0lBQ3RCLElBQUksS0FBSyxFQUFFLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxFQUFFLENBQUM7UUFDdEMsTUFBTSxJQUFJLFlBQVksNENBRWxCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxLQUFLLENBQUMsMkNBQTJDO1lBQy9FLDRGQUE0RjtZQUM1RixrRkFBa0Y7WUFDbEYsK0ZBQStGLENBQUMsQ0FBQztJQUMzRyxDQUFDO0FBQ0gsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUyxnQkFBZ0IsQ0FBQyxHQUFxQjtJQUM3QyxNQUFNLEtBQUssR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQy9CLElBQUksS0FBSyxDQUFDLFVBQVUsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQzlCLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMscUNBQXFDLEtBQUssS0FBSztZQUM1RSxpRUFBaUU7WUFDakUsdUVBQXVFO1lBQ3ZFLHNFQUFzRSxDQUFDLENBQUM7SUFDbEYsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsbUJBQW1CLENBQUMsR0FBcUIsRUFBRSxJQUFZLEVBQUUsS0FBYztJQUM5RSxNQUFNLFFBQVEsR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLENBQUM7SUFDM0MsTUFBTSxhQUFhLEdBQUcsUUFBUSxJQUFJLEtBQUssQ0FBQyxJQUFJLEVBQUUsS0FBSyxFQUFFLENBQUM7SUFDdEQsSUFBSSxDQUFDLFFBQVEsSUFBSSxhQUFhLEVBQUUsQ0FBQztRQUMvQixNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sSUFBSSwwQkFBMEI7WUFDakUsTUFBTSxLQUFLLDJEQUEyRCxDQUFDLENBQUM7SUFDbEYsQ0FBQztBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILE1BQU0sVUFBVSxtQkFBbUIsQ0FBQyxHQUFxQixFQUFFLEtBQWM7SUFDdkUsSUFBSSxLQUFLLElBQUksSUFBSTtRQUFFLE9BQU87SUFDMUIsbUJBQW1CLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQztJQUM1QyxNQUFNLFNBQVMsR0FBRyxLQUFlLENBQUM7SUFDbEMsTUFBTSxzQkFBc0IsR0FBRyw2QkFBNkIsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDN0UsTUFBTSx3QkFBd0IsR0FBRywrQkFBK0IsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7SUFFakYsSUFBSSx3QkFBd0IsRUFBRSxDQUFDO1FBQzdCLHFCQUFxQixDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBRUQsTUFBTSxhQUFhLEdBQUcsc0JBQXNCLElBQUksd0JBQXdCLENBQUM7SUFDekUsSUFBSSxDQUFDLGFBQWEsRUFBRSxDQUFDO1FBQ25CLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMseUNBQXlDLEtBQUssT0FBTztZQUNsRixxRkFBcUY7WUFDckYseUVBQXlFLENBQUMsQ0FBQztJQUNyRixDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQVMscUJBQXFCLENBQUMsR0FBcUIsRUFBRSxLQUFhO0lBQ2pFLE1BQU0sZUFBZSxHQUNqQixLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxFQUFFLElBQUksVUFBVSxDQUFDLEdBQUcsQ0FBQyxJQUFJLDJCQUEyQixDQUFDLENBQUM7SUFDaEcsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDO1FBQ3JCLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUNJLG1CQUFtQixDQUNmLEdBQUcsQ0FBQyxLQUFLLENBQUMsMERBQTBEO1lBQ3hFLEtBQUssS0FBSyxtRUFBbUU7WUFDN0UsR0FBRyw4QkFBOEIsdUNBQXVDO1lBQ3hFLEdBQUcsMkJBQTJCLDhEQUE4RDtZQUM1RixnQkFBZ0IsOEJBQThCLHVDQUF1QztZQUNyRiwwRkFBMEY7WUFDMUYsR0FBRywyQkFBMkIsb0VBQW9FLENBQUMsQ0FBQztJQUM5RyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsd0JBQXdCLENBQUMsR0FBcUIsRUFBRSxTQUFpQjtJQUN4RSxJQUFJLE1BQWUsQ0FBQztJQUNwQixJQUFJLFNBQVMsS0FBSyxPQUFPLElBQUksU0FBUyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQ3BELE1BQU0sR0FBRyxjQUFjLFNBQVMsNkNBQTZDO1lBQ3pFLDRFQUE0RSxDQUFDO0lBQ25GLENBQUM7U0FBTSxDQUFDO1FBQ04sTUFBTSxHQUFHLGtCQUFrQixTQUFTLDRDQUE0QztZQUM1RSxtRUFBbUUsQ0FBQztJQUMxRSxDQUFDO0lBQ0QsT0FBTyxJQUFJLFlBQVksc0RBRW5CLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxNQUFNLFNBQVMsdUNBQXVDO1FBQ25GLHVFQUF1RSxNQUFNLEdBQUc7UUFDaEYsZ0NBQWdDLFNBQVMsdUJBQXVCO1FBQ2hFLDZFQUE2RSxDQUFDLENBQUM7QUFDekYsQ0FBQztBQUVEOztHQUVHO0FBQ0gsU0FBUywyQkFBMkIsQ0FDaEMsR0FBcUIsRUFBRSxPQUFzQixFQUFFLE1BQWdCO0lBQ2pFLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDckIsTUFBTSxTQUFTLEdBQUcsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNoRCxJQUFJLFNBQVMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxhQUFhLEVBQUUsRUFBRSxDQUFDO1lBQ2pELElBQUksS0FBSyxLQUFLLE9BQU8sRUFBRSxDQUFDO2dCQUN0Qiw2REFBNkQ7Z0JBQzdELDhEQUE4RDtnQkFDOUQsZ0VBQWdFO2dCQUNoRSw2QkFBNkI7Z0JBQzdCLEdBQUcsR0FBRyxFQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsS0FBSyxDQUFDLENBQUMsYUFBYSxFQUFxQixDQUFDO1lBQ2xFLENBQUM7WUFDRCxNQUFNLHdCQUF3QixDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUM3QyxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLHFCQUFxQixDQUFDLEdBQXFCLEVBQUUsVUFBbUIsRUFBRSxTQUFpQjtJQUMxRixNQUFNLFdBQVcsR0FBRyxPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksVUFBVSxHQUFHLENBQUMsQ0FBQztJQUNyRSxNQUFNLFdBQVcsR0FDYixPQUFPLFVBQVUsS0FBSyxRQUFRLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLENBQUMsSUFBSSxRQUFRLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2xHLElBQUksQ0FBQyxXQUFXLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQztRQUNqQyxNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLE1BQU0sU0FBUywyQkFBMkI7WUFDdkUsMEJBQTBCLFNBQVMsZ0NBQWdDLENBQUMsQ0FBQztJQUMvRSxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLHVCQUF1QixDQUM1QixHQUFxQixFQUFFLEdBQXFCLEVBQUUsUUFBbUI7SUFDbkUsTUFBTSxnQkFBZ0IsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFO1FBQ3pELGdCQUFnQixFQUFFLENBQUM7UUFDbkIsTUFBTSxhQUFhLEdBQUcsTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ25ELElBQUksYUFBYSxHQUFHLFVBQVUsQ0FBQyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQztRQUN4RSxJQUFJLGNBQWMsR0FBRyxVQUFVLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7UUFDMUUsTUFBTSxTQUFTLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRS9ELElBQUksU0FBUyxLQUFLLFlBQVksRUFBRSxDQUFDO1lBQy9CLE1BQU0sVUFBVSxHQUFHLGFBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxhQUFhLENBQUMsQ0FBQztZQUNqRSxNQUFNLFlBQVksR0FBRyxhQUFhLENBQUMsZ0JBQWdCLENBQUMsZUFBZSxDQUFDLENBQUM7WUFDckUsTUFBTSxhQUFhLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGdCQUFnQixDQUFDLENBQUM7WUFDdkUsTUFBTSxXQUFXLEdBQUcsYUFBYSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsQ0FBQyxDQUFDO1lBQ25FLGFBQWEsSUFBSSxVQUFVLENBQUMsWUFBWSxDQUFDLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQyxDQUFDO1lBQ3BFLGNBQWMsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLEdBQUcsVUFBVSxDQUFDLGFBQWEsQ0FBQyxDQUFDO1FBQ3ZFLENBQUM7UUFFRCxNQUFNLG1CQUFtQixHQUFHLGFBQWEsR0FBRyxjQUFjLENBQUM7UUFDM0QsTUFBTSx5QkFBeUIsR0FBRyxhQUFhLEtBQUssQ0FBQyxJQUFJLGNBQWMsS0FBSyxDQUFDLENBQUM7UUFFOUUsTUFBTSxjQUFjLEdBQUcsR0FBRyxDQUFDLFlBQVksQ0FBQztRQUN4QyxNQUFNLGVBQWUsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDO1FBQzFDLE1BQU0sb0JBQW9CLEdBQUcsY0FBYyxHQUFHLGVBQWUsQ0FBQztRQUU5RCxNQUFNLGFBQWEsR0FBRyxHQUFHLENBQUMsS0FBTSxDQUFDO1FBQ2pDLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FBQyxNQUFPLENBQUM7UUFDbkMsTUFBTSxtQkFBbUIsR0FBRyxhQUFhLEdBQUcsY0FBYyxDQUFDO1FBRTNELHFFQUFxRTtRQUNyRSxtRUFBbUU7UUFDbkUsdUVBQXVFO1FBQ3ZFLHNFQUFzRTtRQUN0RSx1RUFBdUU7UUFDdkUsTUFBTSxvQkFBb0IsR0FDdEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxtQkFBbUIsR0FBRyxvQkFBb0IsQ0FBQyxHQUFHLHNCQUFzQixDQUFDO1FBQ2xGLE1BQU0saUJBQWlCLEdBQUcseUJBQXlCO1lBQy9DLElBQUksQ0FBQyxHQUFHLENBQUMsb0JBQW9CLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxzQkFBc0IsQ0FBQztRQUVsRixJQUFJLG9CQUFvQixFQUFFLENBQUM7WUFDekIsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsNENBRTNCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxnREFBZ0Q7Z0JBQzdFLGlFQUFpRTtnQkFDakUsMkJBQTJCLGNBQWMsT0FBTyxlQUFlLElBQUk7Z0JBQ25FLGtCQUNJLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyw2Q0FBNkM7Z0JBQzVFLEdBQUcsYUFBYSxPQUFPLGNBQWMsb0JBQ2pDLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxLQUFLO2dCQUNuQyx3REFBd0QsQ0FBQyxDQUFDLENBQUM7UUFDckUsQ0FBQzthQUFNLElBQUksaUJBQWlCLEVBQUUsQ0FBQztZQUM3QixPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQiw0Q0FFM0IsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDBDQUEwQztnQkFDdkUscURBQXFEO2dCQUNyRCwyQkFBMkIsY0FBYyxPQUFPLGVBQWUsSUFBSTtnQkFDbkUsa0JBQWtCLEtBQUssQ0FBQyxvQkFBb0IsQ0FBQyw0QkFBNEI7Z0JBQ3pFLEdBQUcsYUFBYSxPQUFPLGNBQWMsbUJBQW1CO2dCQUN4RCxHQUFHLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxvREFBb0Q7Z0JBQ2pGLHNFQUFzRTtnQkFDdEUsbUVBQW1FO2dCQUNuRSx1RUFBdUU7Z0JBQ3ZFLGFBQWEsQ0FBQyxDQUFDLENBQUM7UUFDMUIsQ0FBQzthQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsUUFBUSxJQUFJLHlCQUF5QixFQUFFLENBQUM7WUFDdEQsa0VBQWtFO1lBQ2xFLE1BQU0sZ0JBQWdCLEdBQUcsOEJBQThCLEdBQUcsYUFBYSxDQUFDO1lBQ3hFLE1BQU0saUJBQWlCLEdBQUcsOEJBQThCLEdBQUcsY0FBYyxDQUFDO1lBQzFFLE1BQU0sY0FBYyxHQUFHLENBQUMsY0FBYyxHQUFHLGdCQUFnQixDQUFDLElBQUkseUJBQXlCLENBQUM7WUFDeEYsTUFBTSxlQUFlLEdBQUcsQ0FBQyxlQUFlLEdBQUcsaUJBQWlCLENBQUMsSUFBSSx5QkFBeUIsQ0FBQztZQUMzRixJQUFJLGNBQWMsSUFBSSxlQUFlLEVBQUUsQ0FBQztnQkFDdEMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsOENBRTNCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyx3Q0FBd0M7b0JBQ3JFLHlCQUF5QjtvQkFDekIsMEJBQTBCLGFBQWEsT0FBTyxjQUFjLEtBQUs7b0JBQ2pFLDJCQUEyQixjQUFjLE9BQU8sZUFBZSxLQUFLO29CQUNwRSx1Q0FBdUMsZ0JBQWdCLE9BQ25ELGlCQUFpQixLQUFLO29CQUMxQixtRkFBbUY7b0JBQ25GLEdBQUcsOEJBQThCLDhDQUE4QztvQkFDL0UsMERBQTBELENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLENBQUM7UUFDSCxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLDRCQUE0QixDQUFDLEdBQXFCO0lBQ3pELElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO0lBQzNCLElBQUksR0FBRyxDQUFDLEtBQUssS0FBSyxTQUFTO1FBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxTQUFTO1FBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQy9ELElBQUksaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRSxDQUFDO1FBQ2pDLE1BQU0sSUFBSSxZQUFZLHFEQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCO1lBQzFELGdCQUFnQixpQkFBaUIsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLElBQUksR0FBRyxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJO1lBQ3pFLHNGQUFzRjtZQUN0RixtRkFBbUY7WUFDbkYsMENBQTBDLENBQUMsQ0FBQztJQUN0RCxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMseUJBQXlCLENBQUMsR0FBcUI7SUFDdEQsSUFBSSxHQUFHLENBQUMsS0FBSyxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQUM1QixNQUFNLElBQUksWUFBWSw0Q0FFbEIsR0FDSSxtQkFBbUIsQ0FDZixHQUFHLENBQUMsS0FBSyxDQUFDLDBEQUEwRDtZQUN4RSxrR0FBa0c7WUFDbEcsb0VBQW9FLENBQUMsQ0FBQztJQUNoRixDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsMkJBQTJCLENBQ2hDLEdBQXFCLEVBQUUsR0FBcUIsRUFBRSxRQUFtQjtJQUNuRSxNQUFNLGdCQUFnQixHQUFHLFFBQVEsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUU7UUFDekQsZ0JBQWdCLEVBQUUsQ0FBQztRQUNuQixNQUFNLGNBQWMsR0FBRyxHQUFHLENBQUMsWUFBWSxDQUFDO1FBQ3hDLElBQUksR0FBRyxDQUFDLElBQUksSUFBSSxjQUFjLEtBQUssQ0FBQyxFQUFFLENBQUM7WUFDckMsT0FBTyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsNENBRTNCLEdBQUcsbUJBQW1CLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEM7Z0JBQzNFLGlGQUFpRjtnQkFDakYsNEVBQTRFO2dCQUM1RSw4RUFBOEU7Z0JBQzlFLDZEQUE2RCxDQUFDLENBQUMsQ0FBQztRQUMxRSxDQUFDO0lBQ0gsQ0FBQyxDQUFDLENBQUM7QUFDTCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsU0FBUyx1QkFBdUIsQ0FBQyxHQUFxQjtJQUNwRCxJQUFJLEdBQUcsQ0FBQyxPQUFPLElBQUksR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ2hDLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCO1lBQzFELG1EQUFtRDtZQUNuRCx3REFBd0Q7WUFDeEQsc0RBQXNEO1lBQ3RELHNFQUFzRSxDQUFDLENBQUM7SUFDbEYsQ0FBQztJQUNELE1BQU0sV0FBVyxHQUFHLENBQUMsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxJQUFJLE9BQU8sR0FBRyxDQUFDLE9BQU8sS0FBSyxRQUFRLElBQUksQ0FBQyxXQUFXLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1FBQzFFLE1BQU0sSUFBSSxZQUFZLDRDQUVsQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsNkJBQTZCO1lBQzFELDJCQUEyQixHQUFHLENBQUMsT0FBTyxPQUFPO1lBQzdDLGtFQUFrRSxDQUFDLENBQUM7SUFDOUUsQ0FBQztBQUNILENBQUM7QUFFRDs7Ozs7Ozs7R0FRRztBQUNILFNBQVMsNkJBQTZCLENBQUMsS0FBYSxFQUFFLFdBQXdCO0lBQzVFLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRSxDQUFDO1FBQ3BDLElBQUksaUJBQWlCLEdBQUcsRUFBRSxDQUFDO1FBQzNCLEtBQUssTUFBTSxNQUFNLElBQUksZ0JBQWdCLEVBQUUsQ0FBQztZQUN0QyxJQUFJLE1BQU0sQ0FBQyxPQUFPLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDMUIsaUJBQWlCLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQztnQkFDaEMsTUFBTTtZQUNSLENBQUM7UUFDSCxDQUFDO1FBQ0QsSUFBSSxpQkFBaUIsRUFBRSxDQUFDO1lBQ3RCLE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLHFEQUUzQixtRUFBbUU7Z0JBQy9ELEdBQUcsaUJBQWlCLDRDQUE0QztnQkFDaEUsOERBQThEO2dCQUM5RCxvQ0FBb0MsaUJBQWlCLGFBQWE7Z0JBQ2xFLGlFQUFpRTtnQkFDakUsZ0VBQWdFO2dCQUNoRSw2REFBNkQsQ0FBQyxDQUFDLENBQUM7UUFDMUUsQ0FBQztJQUNILENBQUM7QUFDSCxDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLDZCQUE2QixDQUFDLEdBQXFCLEVBQUUsV0FBd0I7SUFDcEYsSUFBSSxHQUFHLENBQUMsUUFBUSxJQUFJLFdBQVcsS0FBSyxlQUFlLEVBQUUsQ0FBQztRQUNwRCxPQUFPLENBQUMsSUFBSSxDQUFDLGtCQUFrQix1REFFM0IsR0FBRyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLDZDQUE2QztZQUMxRSxzRUFBc0U7WUFDdEUsNEVBQTRFO1lBQzVFLG9GQUFvRixDQUFDLENBQUMsQ0FBQztJQUNqRyxDQUFDO0FBQ0gsQ0FBQztBQUVEOzs7R0FHRztBQUNILFNBQVMsaUNBQWlDLENBQUMsR0FBcUIsRUFBRSxXQUF3QjtJQUN4RixJQUFJLEdBQUcsQ0FBQyxZQUFZLElBQUksV0FBVyxLQUFLLGVBQWUsRUFBRSxDQUFDO1FBQ3hELE9BQU8sQ0FBQyxJQUFJLENBQUMsa0JBQWtCLHVEQUUzQixHQUFHLG1CQUFtQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsaURBQWlEO1lBQzlFLHNFQUFzRTtZQUN0RSwyRkFBMkY7WUFDM0YsK0ZBQStGLENBQUMsQ0FBQyxDQUFDO0lBQzVHLENBQUM7QUFDSCxDQUFDO0FBR0QsU0FBUyxLQUFLLENBQUMsS0FBYTtJQUMxQixPQUFPLE1BQU0sQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUM1RCxDQUFDO0FBRUQsNEZBQTRGO0FBQzVGLGdHQUFnRztBQUNoRyxTQUFTLGFBQWEsQ0FBQyxLQUF1QjtJQUM1QyxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsRUFBRSxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0lBQ2YsQ0FBQztJQUNELE9BQU8sZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDO0FBQ2hDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtib29sZWFuQXR0cmlidXRlLCBEaXJlY3RpdmUsIEVsZW1lbnRSZWYsIGluamVjdCwgSW5qZWN0b3IsIElucHV0LCBOZ1pvbmUsIG51bWJlckF0dHJpYnV0ZSwgT25DaGFuZ2VzLCBPbkRlc3Ryb3ksIE9uSW5pdCwgUExBVEZPUk1fSUQsIFJlbmRlcmVyMiwgU2ltcGxlQ2hhbmdlcywgybVmb3JtYXRSdW50aW1lRXJyb3IgYXMgZm9ybWF0UnVudGltZUVycm9yLCDJtUlNQUdFX0NPTkZJRyBhcyBJTUFHRV9DT05GSUcsIMm1SU1BR0VfQ09ORklHX0RFRkFVTFRTIGFzIElNQUdFX0NPTkZJR19ERUZBVUxUUywgybVJbWFnZUNvbmZpZyBhcyBJbWFnZUNvbmZpZywgybVwZXJmb3JtYW5jZU1hcmtGZWF0dXJlIGFzIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUsIMm1UnVudGltZUVycm9yIGFzIFJ1bnRpbWVFcnJvciwgybVTYWZlVmFsdWUgYXMgU2FmZVZhbHVlLCDJtXVud3JhcFNhZmVWYWx1ZSBhcyB1bndyYXBTYWZlVmFsdWV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5pbXBvcnQge1J1bnRpbWVFcnJvckNvZGV9IGZyb20gJy4uLy4uL2Vycm9ycyc7XG5pbXBvcnQge2lzUGxhdGZvcm1TZXJ2ZXJ9IGZyb20gJy4uLy4uL3BsYXRmb3JtX2lkJztcblxuaW1wb3J0IHtpbWdEaXJlY3RpdmVEZXRhaWxzfSBmcm9tICcuL2Vycm9yX2hlbHBlcic7XG5pbXBvcnQge2Nsb3VkaW5hcnlMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvY2xvdWRpbmFyeV9sb2FkZXInO1xuaW1wb3J0IHtJTUFHRV9MT0FERVIsIEltYWdlTG9hZGVyLCBJbWFnZUxvYWRlckNvbmZpZywgbm9vcEltYWdlTG9hZGVyfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VfbG9hZGVyJztcbmltcG9ydCB7aW1hZ2VLaXRMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1hZ2VraXRfbG9hZGVyJztcbmltcG9ydCB7aW1naXhMb2FkZXJJbmZvfSBmcm9tICcuL2ltYWdlX2xvYWRlcnMvaW1naXhfbG9hZGVyJztcbmltcG9ydCB7TENQSW1hZ2VPYnNlcnZlcn0gZnJvbSAnLi9sY3BfaW1hZ2Vfb2JzZXJ2ZXInO1xuaW1wb3J0IHtQcmVjb25uZWN0TGlua0NoZWNrZXJ9IGZyb20gJy4vcHJlY29ubmVjdF9saW5rX2NoZWNrZXInO1xuaW1wb3J0IHtQcmVsb2FkTGlua0NyZWF0b3J9IGZyb20gJy4vcHJlbG9hZC1saW5rLWNyZWF0b3InO1xuXG4vKipcbiAqIFdoZW4gYSBCYXNlNjQtZW5jb2RlZCBpbWFnZSBpcyBwYXNzZWQgYXMgYW4gaW5wdXQgdG8gdGhlIGBOZ09wdGltaXplZEltYWdlYCBkaXJlY3RpdmUsXG4gKiBhbiBlcnJvciBpcyB0aHJvd24uIFRoZSBpbWFnZSBjb250ZW50IChhcyBhIHN0cmluZykgbWlnaHQgYmUgdmVyeSBsb25nLCB0aHVzIG1ha2luZ1xuICogaXQgaGFyZCB0byByZWFkIGFuIGVycm9yIG1lc3NhZ2UgaWYgdGhlIGVudGlyZSBzdHJpbmcgaXMgaW5jbHVkZWQuIFRoaXMgY29uc3QgZGVmaW5lc1xuICogdGhlIG51bWJlciBvZiBjaGFyYWN0ZXJzIHRoYXQgc2hvdWxkIGJlIGluY2x1ZGVkIGludG8gdGhlIGVycm9yIG1lc3NhZ2UuIFRoZSByZXN0XG4gKiBvZiB0aGUgY29udGVudCBpcyB0cnVuY2F0ZWQuXG4gKi9cbmNvbnN0IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUiA9IDUwO1xuXG4vKipcbiAqIFJlZ0V4cHIgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBzcmMgaW4gYSBzcmNzZXQgaXMgdXNpbmcgd2lkdGggZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMTAwdywgMjAwd1wiLlxuICovXG5jb25zdCBWQUxJRF9XSURUSF9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkK3dcXHMqKCx8JCkpezEsfSkkLztcblxuLyoqXG4gKiBSZWdFeHByIHRvIGRldGVybWluZSB3aGV0aGVyIGEgc3JjIGluIGEgc3Jjc2V0IGlzIHVzaW5nIGRlbnNpdHkgZGVzY3JpcHRvcnMuXG4gKiBTaG91bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2U6IFwiMXgsIDJ4LCA1MHhcIi4gQWxzbyBzdXBwb3J0cyBkZWNpbWFscyBsaWtlIFwiMS41eCwgMS41MHhcIi5cbiAqL1xuY29uc3QgVkFMSURfREVOU0lUWV9ERVNDUklQVE9SX1NSQ1NFVCA9IC9eKChcXHMqXFxkKyhcXC5cXGQrKT94XFxzKigsfCQpKXsxLH0pJC87XG5cbi8qKlxuICogU3Jjc2V0IHZhbHVlcyB3aXRoIGEgZGVuc2l0eSBkZXNjcmlwdG9yIGhpZ2hlciB0aGFuIHRoaXMgdmFsdWUgd2lsbCBhY3RpdmVseVxuICogdGhyb3cgYW4gZXJyb3IuIFN1Y2ggZGVuc2l0aWVzIGFyZSBub3QgcGVybWl0dGVkIGFzIHRoZXkgY2F1c2UgaW1hZ2Ugc2l6ZXNcbiAqIHRvIGJlIHVucmVhc29uYWJseSBsYXJnZSBhbmQgc2xvdyBkb3duIExDUC5cbiAqL1xuZXhwb3J0IGNvbnN0IEFCU09MVVRFX1NSQ1NFVF9ERU5TSVRZX0NBUCA9IDM7XG5cbi8qKlxuICogVXNlZCBvbmx5IGluIGVycm9yIG1lc3NhZ2UgdGV4dCB0byBjb21tdW5pY2F0ZSBiZXN0IHByYWN0aWNlcywgYXMgd2Ugd2lsbFxuICogb25seSB0aHJvdyBiYXNlZCBvbiB0aGUgc2xpZ2h0bHkgbW9yZSBjb25zZXJ2YXRpdmUgQUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQLlxuICovXG5leHBvcnQgY29uc3QgUkVDT01NRU5ERURfU1JDU0VUX0RFTlNJVFlfQ0FQID0gMjtcblxuLyoqXG4gKiBVc2VkIGluIGdlbmVyYXRpbmcgYXV0b21hdGljIGRlbnNpdHktYmFzZWQgc3Jjc2V0c1xuICovXG5jb25zdCBERU5TSVRZX1NSQ1NFVF9NVUxUSVBMSUVSUyA9IFsxLCAyXTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGljaCBicmVha3BvaW50cyB0byB1c2Ugb24gZnVsbC13aWR0aCBpbWFnZXNcbiAqL1xuY29uc3QgVklFV1BPUlRfQlJFQUtQT0lOVF9DVVRPRkYgPSA2NDA7XG4vKipcbiAqIFVzZWQgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgdHdvIGFzcGVjdCByYXRpb3MgYXJlIHNpbWlsYXIgaW4gdmFsdWUuXG4gKi9cbmNvbnN0IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0UgPSAuMTtcblxuLyoqXG4gKiBVc2VkIHRvIGRldGVybWluZSB3aGV0aGVyIHRoZSBpbWFnZSBoYXMgYmVlbiByZXF1ZXN0ZWQgYXQgYW4gb3Zlcmx5XG4gKiBsYXJnZSBzaXplIGNvbXBhcmVkIHRvIHRoZSBhY3R1YWwgcmVuZGVyZWQgaW1hZ2Ugc2l6ZSAoYWZ0ZXIgdGFraW5nXG4gKiBpbnRvIGFjY291bnQgYSB0eXBpY2FsIGRldmljZSBwaXhlbCByYXRpbykuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRSA9IDEwMDA7XG5cbi8qKlxuICogVXNlZCB0byBsaW1pdCBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gb2YgdmVyeSBsYXJnZSBzb3VyY2VzIGZvclxuICogZml4ZWQtc2l6ZSBpbWFnZXMuIEluIHBpeGVscy5cbiAqL1xuY29uc3QgRklYRURfU1JDU0VUX1dJRFRIX0xJTUlUID0gMTkyMDtcbmNvbnN0IEZJWEVEX1NSQ1NFVF9IRUlHSFRfTElNSVQgPSAxMDgwO1xuXG5cbi8qKiBJbmZvIGFib3V0IGJ1aWx0LWluIGxvYWRlcnMgd2UgY2FuIHRlc3QgZm9yLiAqL1xuZXhwb3J0IGNvbnN0IEJVSUxUX0lOX0xPQURFUlMgPSBbaW1naXhMb2FkZXJJbmZvLCBpbWFnZUtpdExvYWRlckluZm8sIGNsb3VkaW5hcnlMb2FkZXJJbmZvXTtcblxuLyoqXG4gKiBEaXJlY3RpdmUgdGhhdCBpbXByb3ZlcyBpbWFnZSBsb2FkaW5nIHBlcmZvcm1hbmNlIGJ5IGVuZm9yY2luZyBiZXN0IHByYWN0aWNlcy5cbiAqXG4gKiBgTmdPcHRpbWl6ZWRJbWFnZWAgZW5zdXJlcyB0aGF0IHRoZSBsb2FkaW5nIG9mIHRoZSBMYXJnZXN0IENvbnRlbnRmdWwgUGFpbnQgKExDUCkgaW1hZ2UgaXNcbiAqIHByaW9yaXRpemVkIGJ5OlxuICogLSBBdXRvbWF0aWNhbGx5IHNldHRpbmcgdGhlIGBmZXRjaHByaW9yaXR5YCBhdHRyaWJ1dGUgb24gdGhlIGA8aW1nPmAgdGFnXG4gKiAtIExhenkgbG9hZGluZyBub24tcHJpb3JpdHkgaW1hZ2VzIGJ5IGRlZmF1bHRcbiAqIC0gQXV0b21hdGljYWxseSBnZW5lcmF0aW5nIGEgcHJlY29ubmVjdCBsaW5rIHRhZyBpbiB0aGUgZG9jdW1lbnQgaGVhZFxuICpcbiAqIEluIGFkZGl0aW9uLCB0aGUgZGlyZWN0aXZlOlxuICogLSBHZW5lcmF0ZXMgYXBwcm9wcmlhdGUgYXNzZXQgVVJMcyBpZiBhIGNvcnJlc3BvbmRpbmcgYEltYWdlTG9hZGVyYCBmdW5jdGlvbiBpcyBwcm92aWRlZFxuICogLSBBdXRvbWF0aWNhbGx5IGdlbmVyYXRlcyBhIHNyY3NldFxuICogLSBSZXF1aXJlcyB0aGF0IGB3aWR0aGAgYW5kIGBoZWlnaHRgIGFyZSBzZXRcbiAqIC0gV2FybnMgaWYgYHdpZHRoYCBvciBgaGVpZ2h0YCBoYXZlIGJlZW4gc2V0IGluY29ycmVjdGx5XG4gKiAtIFdhcm5zIGlmIHRoZSBpbWFnZSB3aWxsIGJlIHZpc3VhbGx5IGRpc3RvcnRlZCB3aGVuIHJlbmRlcmVkXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIFRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlIGlzIG1hcmtlZCBhcyBbc3RhbmRhbG9uZV0oZ3VpZGUvc3RhbmRhbG9uZS1jb21wb25lbnRzKSBhbmQgY2FuXG4gKiBiZSBpbXBvcnRlZCBkaXJlY3RseS5cbiAqXG4gKiBGb2xsb3cgdGhlIHN0ZXBzIGJlbG93IHRvIGVuYWJsZSBhbmQgdXNlIHRoZSBkaXJlY3RpdmU6XG4gKiAxLiBJbXBvcnQgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnQuXG4gKiAyLiBPcHRpb25hbGx5IHByb3ZpZGUgYW4gYEltYWdlTG9hZGVyYCBpZiB5b3UgdXNlIGFuIGltYWdlIGhvc3Rpbmcgc2VydmljZS5cbiAqIDMuIFVwZGF0ZSB0aGUgbmVjZXNzYXJ5IGA8aW1nPmAgdGFncyBpbiB0ZW1wbGF0ZXMgYW5kIHJlcGxhY2UgYHNyY2AgYXR0cmlidXRlcyB3aXRoIGBuZ1NyY2AuXG4gKiBVc2luZyBhIGBuZ1NyY2AgYWxsb3dzIHRoZSBkaXJlY3RpdmUgdG8gY29udHJvbCB3aGVuIHRoZSBgc3JjYCBnZXRzIHNldCwgd2hpY2ggdHJpZ2dlcnMgYW4gaW1hZ2VcbiAqIGRvd25sb2FkLlxuICpcbiAqIFN0ZXAgMTogaW1wb3J0IHRoZSBgTmdPcHRpbWl6ZWRJbWFnZWAgZGlyZWN0aXZlLlxuICpcbiAqIGBgYHR5cGVzY3JpcHRcbiAqIGltcG9ydCB7IE5nT3B0aW1pemVkSW1hZ2UgfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuICpcbiAqIC8vIEluY2x1ZGUgaXQgaW50byB0aGUgbmVjZXNzYXJ5IE5nTW9kdWxlXG4gKiBATmdNb2R1bGUoe1xuICogICBpbXBvcnRzOiBbTmdPcHRpbWl6ZWRJbWFnZV0sXG4gKiB9KVxuICogY2xhc3MgQXBwTW9kdWxlIHt9XG4gKlxuICogLy8gLi4uIG9yIGEgc3RhbmRhbG9uZSBDb21wb25lbnRcbiAqIEBDb21wb25lbnQoe1xuICogICBzdGFuZGFsb25lOiB0cnVlXG4gKiAgIGltcG9ydHM6IFtOZ09wdGltaXplZEltYWdlXSxcbiAqIH0pXG4gKiBjbGFzcyBNeVN0YW5kYWxvbmVDb21wb25lbnQge31cbiAqIGBgYFxuICpcbiAqIFN0ZXAgMjogY29uZmlndXJlIGEgbG9hZGVyLlxuICpcbiAqIFRvIHVzZSB0aGUgKipkZWZhdWx0IGxvYWRlcioqOiBubyBhZGRpdGlvbmFsIGNvZGUgY2hhbmdlcyBhcmUgbmVjZXNzYXJ5LiBUaGUgVVJMIHJldHVybmVkIGJ5IHRoZVxuICogZ2VuZXJpYyBsb2FkZXIgd2lsbCBhbHdheXMgbWF0Y2ggdGhlIHZhbHVlIG9mIFwic3JjXCIuIEluIG90aGVyIHdvcmRzLCB0aGlzIGxvYWRlciBhcHBsaWVzIG5vXG4gKiB0cmFuc2Zvcm1hdGlvbnMgdG8gdGhlIHJlc291cmNlIFVSTCBhbmQgdGhlIHZhbHVlIG9mIHRoZSBgbmdTcmNgIGF0dHJpYnV0ZSB3aWxsIGJlIHVzZWQgYXMgaXMuXG4gKlxuICogVG8gdXNlIGFuIGV4aXN0aW5nIGxvYWRlciBmb3IgYSAqKnRoaXJkLXBhcnR5IGltYWdlIHNlcnZpY2UqKjogYWRkIHRoZSBwcm92aWRlciBmYWN0b3J5IGZvciB5b3VyXG4gKiBjaG9zZW4gc2VydmljZSB0byB0aGUgYHByb3ZpZGVyc2AgYXJyYXkuIEluIHRoZSBleGFtcGxlIGJlbG93LCB0aGUgSW1naXggbG9hZGVyIGlzIHVzZWQ6XG4gKlxuICogYGBgdHlwZXNjcmlwdFxuICogaW1wb3J0IHtwcm92aWRlSW1naXhMb2FkZXJ9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ2FsbCB0aGUgZnVuY3Rpb24gYW5kIGFkZCB0aGUgcmVzdWx0IHRvIHRoZSBgcHJvdmlkZXJzYCBhcnJheTpcbiAqIHByb3ZpZGVyczogW1xuICogICBwcm92aWRlSW1naXhMb2FkZXIoXCJodHRwczovL215LmJhc2UudXJsL1wiKSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBUaGUgYE5nT3B0aW1pemVkSW1hZ2VgIGRpcmVjdGl2ZSBwcm92aWRlcyB0aGUgZm9sbG93aW5nIGZ1bmN0aW9uczpcbiAqIC0gYHByb3ZpZGVDbG91ZGZsYXJlTG9hZGVyYFxuICogLSBgcHJvdmlkZUNsb3VkaW5hcnlMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1hZ2VLaXRMb2FkZXJgXG4gKiAtIGBwcm92aWRlSW1naXhMb2FkZXJgXG4gKlxuICogSWYgeW91IHVzZSBhIGRpZmZlcmVudCBpbWFnZSBwcm92aWRlciwgeW91IGNhbiBjcmVhdGUgYSBjdXN0b20gbG9hZGVyIGZ1bmN0aW9uIGFzIGRlc2NyaWJlZFxuICogYmVsb3cuXG4gKlxuICogVG8gdXNlIGEgKipjdXN0b20gbG9hZGVyKio6IHByb3ZpZGUgeW91ciBsb2FkZXIgZnVuY3Rpb24gYXMgYSB2YWx1ZSBmb3IgdGhlIGBJTUFHRV9MT0FERVJgIERJXG4gKiB0b2tlbi5cbiAqXG4gKiBgYGB0eXBlc2NyaXB0XG4gKiBpbXBvcnQge0lNQUdFX0xPQURFUiwgSW1hZ2VMb2FkZXJDb25maWd9IGZyb20gJ0Bhbmd1bGFyL2NvbW1vbic7XG4gKlxuICogLy8gQ29uZmlndXJlIHRoZSBsb2FkZXIgdXNpbmcgdGhlIGBJTUFHRV9MT0FERVJgIHRva2VuLlxuICogcHJvdmlkZXJzOiBbXG4gKiAgIHtcbiAqICAgICAgcHJvdmlkZTogSU1BR0VfTE9BREVSLFxuICogICAgICB1c2VWYWx1ZTogKGNvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcpID0+IHtcbiAqICAgICAgICByZXR1cm4gYGh0dHBzOi8vZXhhbXBsZS5jb20vJHtjb25maWcuc3JjfS0ke2NvbmZpZy53aWR0aH0uanBnfWA7XG4gKiAgICAgIH1cbiAqICAgfSxcbiAqIF0sXG4gKiBgYGBcbiAqXG4gKiBTdGVwIDM6IHVwZGF0ZSBgPGltZz5gIHRhZ3MgaW4gdGVtcGxhdGVzIHRvIHVzZSBgbmdTcmNgIGluc3RlYWQgb2YgYHNyY2AuXG4gKlxuICogYGBgXG4gKiA8aW1nIG5nU3JjPVwibG9nby5wbmdcIiB3aWR0aD1cIjIwMFwiIGhlaWdodD1cIjEwMFwiPlxuICogYGBgXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtcbiAgc3RhbmRhbG9uZTogdHJ1ZSxcbiAgc2VsZWN0b3I6ICdpbWdbbmdTcmNdJyxcbiAgaG9zdDoge1xuICAgICdbc3R5bGUucG9zaXRpb25dJzogJ2ZpbGwgPyBcImFic29sdXRlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLndpZHRoXSc6ICdmaWxsID8gXCIxMDAlXCIgOiBudWxsJyxcbiAgICAnW3N0eWxlLmhlaWdodF0nOiAnZmlsbCA/IFwiMTAwJVwiIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5pbnNldF0nOiAnZmlsbCA/IFwiMHB4XCIgOiBudWxsJ1xuICB9XG59KVxuZXhwb3J0IGNsYXNzIE5nT3B0aW1pemVkSW1hZ2UgaW1wbGVtZW50cyBPbkluaXQsIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBpbWFnZUxvYWRlciA9IGluamVjdChJTUFHRV9MT0FERVIpO1xuICBwcml2YXRlIGNvbmZpZzogSW1hZ2VDb25maWcgPSBwcm9jZXNzQ29uZmlnKGluamVjdChJTUFHRV9DT05GSUcpKTtcbiAgcHJpdmF0ZSByZW5kZXJlciA9IGluamVjdChSZW5kZXJlcjIpO1xuICBwcml2YXRlIGltZ0VsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQgPSBpbmplY3QoRWxlbWVudFJlZikubmF0aXZlRWxlbWVudDtcbiAgcHJpdmF0ZSBpbmplY3RvciA9IGluamVjdChJbmplY3Rvcik7XG4gIHByaXZhdGUgcmVhZG9ubHkgaXNTZXJ2ZXIgPSBpc1BsYXRmb3JtU2VydmVyKGluamVjdChQTEFURk9STV9JRCkpO1xuICBwcml2YXRlIHJlYWRvbmx5IHByZWxvYWRMaW5rQ3JlYXRvciA9IGluamVjdChQcmVsb2FkTGlua0NyZWF0b3IpO1xuXG4gIC8vIGEgTENQIGltYWdlIG9ic2VydmVyIC0gc2hvdWxkIGJlIGluamVjdGVkIG9ubHkgaW4gdGhlIGRldiBtb2RlXG4gIHByaXZhdGUgbGNwT2JzZXJ2ZXIgPSBuZ0Rldk1vZGUgPyB0aGlzLmluamVjdG9yLmdldChMQ1BJbWFnZU9ic2VydmVyKSA6IG51bGw7XG5cbiAgLyoqXG4gICAqIENhbGN1bGF0ZSB0aGUgcmV3cml0dGVuIGBzcmNgIG9uY2UgYW5kIHN0b3JlIGl0LlxuICAgKiBUaGlzIGlzIG5lZWRlZCB0byBhdm9pZCByZXBldGl0aXZlIGNhbGN1bGF0aW9ucyBhbmQgbWFrZSBzdXJlIHRoZSBkaXJlY3RpdmUgY2xlYW51cCBpbiB0aGVcbiAgICogYG5nT25EZXN0cm95YCBkb2VzIG5vdCByZWx5IG9uIHRoZSBgSU1BR0VfTE9BREVSYCBsb2dpYyAod2hpY2ggaW4gdHVybiBjYW4gcmVseSBvbiBzb21lIG90aGVyXG4gICAqIGluc3RhbmNlIHRoYXQgbWlnaHQgYmUgYWxyZWFkeSBkZXN0cm95ZWQpLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVuZGVyZWRTcmM6IHN0cmluZ3xudWxsID0gbnVsbDtcblxuICAvKipcbiAgICogTmFtZSBvZiB0aGUgc291cmNlIGltYWdlLlxuICAgKiBJbWFnZSBuYW1lIHdpbGwgYmUgcHJvY2Vzc2VkIGJ5IHRoZSBpbWFnZSBsb2FkZXIgYW5kIHRoZSBmaW5hbCBVUkwgd2lsbCBiZSBhcHBsaWVkIGFzIHRoZSBgc3JjYFxuICAgKiBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoe3JlcXVpcmVkOiB0cnVlLCB0cmFuc2Zvcm06IHVud3JhcFNhZmVVcmx9KSBuZ1NyYyE6IHN0cmluZztcblxuICAvKipcbiAgICogQSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5IGRlc2NyaXB0b3JzLlxuICAgKiBUaGUgaW1hZ2UgbmFtZSB3aWxsIGJlIHRha2VuIGZyb20gYG5nU3JjYCBhbmQgY29tYmluZWQgd2l0aCB0aGUgbGlzdCBvZiB3aWR0aCBvciBkZW5zaXR5XG4gICAqIGRlc2NyaXB0b3JzIHRvIGdlbmVyYXRlIHRoZSBmaW5hbCBgc3Jjc2V0YCBwcm9wZXJ0eSBvZiB0aGUgaW1hZ2UuXG4gICAqXG4gICAqIEV4YW1wbGU6XG4gICAqIGBgYFxuICAgKiA8aW1nIG5nU3JjPVwiaGVsbG8uanBnXCIgbmdTcmNzZXQ9XCIxMDB3LCAyMDB3XCIgLz4gID0+XG4gICAqIDxpbWcgc3JjPVwicGF0aC9oZWxsby5qcGdcIiBzcmNzZXQ9XCJwYXRoL2hlbGxvLmpwZz93PTEwMCAxMDB3LCBwYXRoL2hlbGxvLmpwZz93PTIwMCAyMDB3XCIgLz5cbiAgICogYGBgXG4gICAqL1xuICBASW5wdXQoKSBuZ1NyY3NldCE6IHN0cmluZztcblxuICAvKipcbiAgICogVGhlIGJhc2UgYHNpemVzYCBhdHRyaWJ1dGUgcGFzc2VkIHRocm91Z2ggdG8gdGhlIGA8aW1nPmAgZWxlbWVudC5cbiAgICogUHJvdmlkaW5nIHNpemVzIGNhdXNlcyB0aGUgaW1hZ2UgdG8gY3JlYXRlIGFuIGF1dG9tYXRpYyByZXNwb25zaXZlIHNyY3NldC5cbiAgICovXG4gIEBJbnB1dCgpIHNpemVzPzogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgd2lkdGggb2YgdGhlIGltYWdlIGluIHBpeGVscy5cbiAgICogRm9yIGZpeGVkIHNpemUgaW1hZ2VzOiB0aGUgZGVzaXJlZCByZW5kZXJlZCB3aWR0aCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pIHdpZHRoOiBudW1iZXJ8dW5kZWZpbmVkO1xuXG4gIC8qKlxuICAgKiBGb3IgcmVzcG9uc2l2ZSBpbWFnZXM6IHRoZSBpbnRyaW5zaWMgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuXG4gICAqIEZvciBmaXhlZCBzaXplIGltYWdlczogdGhlIGRlc2lyZWQgcmVuZGVyZWQgaGVpZ2h0IG9mIHRoZSBpbWFnZSBpbiBwaXhlbHMuKiBUaGUgaW50cmluc2ljXG4gICAqIGhlaWdodCBvZiB0aGUgaW1hZ2UgaW4gcGl4ZWxzLlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IG51bWJlckF0dHJpYnV0ZX0pIGhlaWdodDogbnVtYmVyfHVuZGVmaW5lZDtcblxuICAvKipcbiAgICogVGhlIGRlc2lyZWQgbG9hZGluZyBiZWhhdmlvciAobGF6eSwgZWFnZXIsIG9yIGF1dG8pLiBEZWZhdWx0cyB0byBgbGF6eWAsXG4gICAqIHdoaWNoIGlzIHJlY29tbWVuZGVkIGZvciBtb3N0IGltYWdlcy5cbiAgICpcbiAgICogV2FybmluZzogU2V0dGluZyBpbWFnZXMgYXMgbG9hZGluZz1cImVhZ2VyXCIgb3IgbG9hZGluZz1cImF1dG9cIiBtYXJrcyB0aGVtXG4gICAqIGFzIG5vbi1wcmlvcml0eSBpbWFnZXMgYW5kIGNhbiBodXJ0IGxvYWRpbmcgcGVyZm9ybWFuY2UuIEZvciBpbWFnZXMgd2hpY2hcbiAgICogbWF5IGJlIHRoZSBMQ1AgZWxlbWVudCwgdXNlIHRoZSBgcHJpb3JpdHlgIGF0dHJpYnV0ZSBpbnN0ZWFkIG9mIGBsb2FkaW5nYC5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRpbmc/OiAnbGF6eSd8J2VhZ2VyJ3wnYXV0byc7XG5cbiAgLyoqXG4gICAqIEluZGljYXRlcyB3aGV0aGVyIHRoaXMgaW1hZ2Ugc2hvdWxkIGhhdmUgYSBoaWdoIHByaW9yaXR5LlxuICAgKi9cbiAgQElucHV0KHt0cmFuc2Zvcm06IGJvb2xlYW5BdHRyaWJ1dGV9KSBwcmlvcml0eSA9IGZhbHNlO1xuXG4gIC8qKlxuICAgKiBEYXRhIHRvIHBhc3MgdGhyb3VnaCB0byBjdXN0b20gbG9hZGVycy5cbiAgICovXG4gIEBJbnB1dCgpIGxvYWRlclBhcmFtcz86IHtba2V5OiBzdHJpbmddOiBhbnl9O1xuXG4gIC8qKlxuICAgKiBEaXNhYmxlcyBhdXRvbWF0aWMgc3Jjc2V0IGdlbmVyYXRpb24gZm9yIHRoaXMgaW1hZ2UuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGRpc2FibGVPcHRpbWl6ZWRTcmNzZXQgPSBmYWxzZTtcblxuICAvKipcbiAgICogU2V0cyB0aGUgaW1hZ2UgdG8gXCJmaWxsIG1vZGVcIiwgd2hpY2ggZWxpbWluYXRlcyB0aGUgaGVpZ2h0L3dpZHRoIHJlcXVpcmVtZW50IGFuZCBhZGRzXG4gICAqIHN0eWxlcyBzdWNoIHRoYXQgdGhlIGltYWdlIGZpbGxzIGl0cyBjb250YWluaW5nIGVsZW1lbnQuXG4gICAqL1xuICBASW5wdXQoe3RyYW5zZm9ybTogYm9vbGVhbkF0dHJpYnV0ZX0pIGZpbGwgPSBmYWxzZTtcblxuICAvKipcbiAgICogVmFsdWUgb2YgdGhlIGBzcmNgIGF0dHJpYnV0ZSBpZiBzZXQgb24gdGhlIGhvc3QgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIGV4Y2x1c2l2ZWx5IHJlYWQgdG8gYXNzZXJ0IHRoYXQgYHNyY2AgaXMgbm90IHNldCBpbiBjb25mbGljdFxuICAgKiB3aXRoIGBuZ1NyY2AgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyYz86IHN0cmluZztcblxuICAvKipcbiAgICogVmFsdWUgb2YgdGhlIGBzcmNzZXRgIGF0dHJpYnV0ZSBpZiBzZXQgb24gdGhlIGhvc3QgYDxpbWc+YCBlbGVtZW50LlxuICAgKiBUaGlzIGlucHV0IGlzIGV4Y2x1c2l2ZWx5IHJlYWQgdG8gYXNzZXJ0IHRoYXQgYHNyY3NldGAgaXMgbm90IHNldCBpbiBjb25mbGljdFxuICAgKiB3aXRoIGBuZ1NyY3NldGAgYW5kIHRoYXQgaW1hZ2VzIGRvbid0IHN0YXJ0IHRvIGxvYWQgdW50aWwgYSBsYXp5IGxvYWRpbmcgc3RyYXRlZ3kgaXMgc2V0LlxuICAgKiBAaW50ZXJuYWxcbiAgICovXG4gIEBJbnB1dCgpIHNyY3NldD86IHN0cmluZztcblxuICAvKiogQG5vZG9jICovXG4gIG5nT25Jbml0KCkge1xuICAgIHBlcmZvcm1hbmNlTWFya0ZlYXR1cmUoJ05nT3B0aW1pemVkSW1hZ2UnKTtcblxuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGNvbnN0IG5nWm9uZSA9IHRoaXMuaW5qZWN0b3IuZ2V0KE5nWm9uZSk7XG4gICAgICBhc3NlcnROb25FbXB0eUlucHV0KHRoaXMsICduZ1NyYycsIHRoaXMubmdTcmMpO1xuICAgICAgYXNzZXJ0VmFsaWROZ1NyY3NldCh0aGlzLCB0aGlzLm5nU3Jjc2V0KTtcbiAgICAgIGFzc2VydE5vQ29uZmxpY3RpbmdTcmModGhpcyk7XG4gICAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgICBhc3NlcnROb0NvbmZsaWN0aW5nU3Jjc2V0KHRoaXMpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0Tm90QmFzZTY0SW1hZ2UodGhpcyk7XG4gICAgICBhc3NlcnROb3RCbG9iVXJsKHRoaXMpO1xuICAgICAgaWYgKHRoaXMuZmlsbCkge1xuICAgICAgICBhc3NlcnRFbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgICAvLyBUaGlzIGxlYXZlcyB0aGUgQW5ndWxhciB6b25lIHRvIGF2b2lkIHRyaWdnZXJpbmcgdW5uZWNlc3NhcnkgY2hhbmdlIGRldGVjdGlvbiBjeWNsZXMgd2hlblxuICAgICAgICAvLyBgbG9hZGAgdGFza3MgYXJlIGludm9rZWQgb24gaW1hZ2VzLlxuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoXG4gICAgICAgICAgICAoKSA9PiBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQodGhpcywgdGhpcy5pbWdFbGVtZW50LCB0aGlzLnJlbmRlcmVyKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBhc3NlcnROb25FbXB0eVdpZHRoQW5kSGVpZ2h0KHRoaXMpO1xuICAgICAgICBpZiAodGhpcy5oZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGFzc2VydEdyZWF0ZXJUaGFuWmVybyh0aGlzLCB0aGlzLmhlaWdodCwgJ2hlaWdodCcpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLndpZHRoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBhc3NlcnRHcmVhdGVyVGhhblplcm8odGhpcywgdGhpcy53aWR0aCwgJ3dpZHRoJyk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gT25seSBjaGVjayBmb3IgZGlzdG9ydGVkIGltYWdlcyB3aGVuIG5vdCBpbiBmaWxsIG1vZGUsIHdoZXJlXG4gICAgICAgIC8vIGltYWdlcyBtYXkgYmUgaW50ZW50aW9uYWxseSBzdHJldGNoZWQsIGNyb3BwZWQgb3IgbGV0dGVyYm94ZWQuXG4gICAgICAgIG5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhcihcbiAgICAgICAgICAgICgpID0+IGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKHRoaXMsIHRoaXMuaW1nRWxlbWVudCwgdGhpcy5yZW5kZXJlcikpO1xuICAgICAgfVxuICAgICAgYXNzZXJ0VmFsaWRMb2FkaW5nSW5wdXQodGhpcyk7XG4gICAgICBpZiAoIXRoaXMubmdTcmNzZXQpIHtcbiAgICAgICAgYXNzZXJ0Tm9Db21wbGV4U2l6ZXModGhpcyk7XG4gICAgICB9XG4gICAgICBhc3NlcnROb3RNaXNzaW5nQnVpbHRJbkxvYWRlcih0aGlzLm5nU3JjLCB0aGlzLmltYWdlTG9hZGVyKTtcbiAgICAgIGFzc2VydE5vTmdTcmNzZXRXaXRob3V0TG9hZGVyKHRoaXMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuICAgICAgYXNzZXJ0Tm9Mb2FkZXJQYXJhbXNXaXRob3V0TG9hZGVyKHRoaXMsIHRoaXMuaW1hZ2VMb2FkZXIpO1xuXG4gICAgICBpZiAodGhpcy5sY3BPYnNlcnZlciAhPT0gbnVsbCkge1xuICAgICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIhLnJlZ2lzdGVySW1hZ2UodGhpcy5nZXRSZXdyaXR0ZW5TcmMoKSwgdGhpcy5uZ1NyYywgdGhpcy5wcmlvcml0eSk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBpZiAodGhpcy5wcmlvcml0eSkge1xuICAgICAgICBjb25zdCBjaGVja2VyID0gdGhpcy5pbmplY3Rvci5nZXQoUHJlY29ubmVjdExpbmtDaGVja2VyKTtcbiAgICAgICAgY2hlY2tlci5hc3NlcnRQcmVjb25uZWN0KHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHRoaXMubmdTcmMpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGVzKCk7XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGVzKCkge1xuICAgIC8vIE11c3Qgc2V0IHdpZHRoL2hlaWdodCBleHBsaWNpdGx5IGluIGNhc2UgdGhleSBhcmUgYm91bmQgKGluIHdoaWNoIGNhc2UgdGhleSB3aWxsXG4gICAgLy8gb25seSBiZSByZWZsZWN0ZWQgYW5kIG5vdCBmb3VuZCBieSB0aGUgYnJvd3NlcilcbiAgICBpZiAodGhpcy5maWxsKSB7XG4gICAgICBpZiAoIXRoaXMuc2l6ZXMpIHtcbiAgICAgICAgdGhpcy5zaXplcyA9ICcxMDB2dyc7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnd2lkdGgnLCB0aGlzLndpZHRoIS50b1N0cmluZygpKTtcbiAgICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnaGVpZ2h0JywgdGhpcy5oZWlnaHQhLnRvU3RyaW5nKCkpO1xuICAgIH1cblxuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnbG9hZGluZycsIHRoaXMuZ2V0TG9hZGluZ0JlaGF2aW9yKCkpO1xuICAgIHRoaXMuc2V0SG9zdEF0dHJpYnV0ZSgnZmV0Y2hwcmlvcml0eScsIHRoaXMuZ2V0RmV0Y2hQcmlvcml0eSgpKTtcblxuICAgIC8vIFRoZSBgZGF0YS1uZy1pbWdgIGF0dHJpYnV0ZSBmbGFncyBhbiBpbWFnZSBhcyB1c2luZyB0aGUgZGlyZWN0aXZlLCB0byBhbGxvd1xuICAgIC8vIGZvciBhbmFseXNpcyBvZiB0aGUgZGlyZWN0aXZlJ3MgcGVyZm9ybWFuY2UuXG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCduZy1pbWcnLCAndHJ1ZScpO1xuXG4gICAgLy8gVGhlIGBzcmNgIGFuZCBgc3Jjc2V0YCBhdHRyaWJ1dGVzIHNob3VsZCBiZSBzZXQgbGFzdCBzaW5jZSBvdGhlciBhdHRyaWJ1dGVzXG4gICAgLy8gY291bGQgYWZmZWN0IHRoZSBpbWFnZSdzIGxvYWRpbmcgYmVoYXZpb3IuXG4gICAgY29uc3QgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy51cGRhdGVTcmNBbmRTcmNzZXQoKTtcblxuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NpemVzJywgdGhpcy5zaXplcyk7XG4gICAgfVxuICAgIGlmICh0aGlzLmlzU2VydmVyICYmIHRoaXMucHJpb3JpdHkpIHtcbiAgICAgIHRoaXMucHJlbG9hZExpbmtDcmVhdG9yLmNyZWF0ZVByZWxvYWRMaW5rVGFnKFxuICAgICAgICAgIHRoaXMucmVuZGVyZXIsIHRoaXMuZ2V0UmV3cml0dGVuU3JjKCksIHJld3JpdHRlblNyY3NldCwgdGhpcy5zaXplcyk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uQ2hhbmdlcyhjaGFuZ2VzOiBTaW1wbGVDaGFuZ2VzKSB7XG4gICAgaWYgKG5nRGV2TW9kZSkge1xuICAgICAgYXNzZXJ0Tm9Qb3N0SW5pdElucHV0Q2hhbmdlKHRoaXMsIGNoYW5nZXMsIFtcbiAgICAgICAgJ25nU3Jjc2V0JyxcbiAgICAgICAgJ3dpZHRoJyxcbiAgICAgICAgJ2hlaWdodCcsXG4gICAgICAgICdwcmlvcml0eScsXG4gICAgICAgICdmaWxsJyxcbiAgICAgICAgJ2xvYWRpbmcnLFxuICAgICAgICAnc2l6ZXMnLFxuICAgICAgICAnbG9hZGVyUGFyYW1zJyxcbiAgICAgICAgJ2Rpc2FibGVPcHRpbWl6ZWRTcmNzZXQnLFxuICAgICAgXSk7XG4gICAgfVxuICAgIGlmIChjaGFuZ2VzWyduZ1NyYyddICYmICFjaGFuZ2VzWyduZ1NyYyddLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgY29uc3Qgb2xkU3JjID0gdGhpcy5fcmVuZGVyZWRTcmM7XG4gICAgICB0aGlzLnVwZGF0ZVNyY0FuZFNyY3NldCh0cnVlKTtcbiAgICAgIGNvbnN0IG5ld1NyYyA9IHRoaXMuX3JlbmRlcmVkU3JjO1xuICAgICAgaWYgKHRoaXMubGNwT2JzZXJ2ZXIgIT09IG51bGwgJiYgb2xkU3JjICYmIG5ld1NyYyAmJiBvbGRTcmMgIT09IG5ld1NyYykge1xuICAgICAgICBjb25zdCBuZ1pvbmUgPSB0aGlzLmluamVjdG9yLmdldChOZ1pvbmUpO1xuICAgICAgICBuZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoKCkgPT4ge1xuICAgICAgICAgIHRoaXMubGNwT2JzZXJ2ZXI/LnVwZGF0ZUltYWdlKG9sZFNyYywgbmV3U3JjKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBjYWxsSW1hZ2VMb2FkZXIoY29uZmlnV2l0aG91dEN1c3RvbVBhcmFtczogT21pdDxJbWFnZUxvYWRlckNvbmZpZywgJ2xvYWRlclBhcmFtcyc+KTpcbiAgICAgIHN0cmluZyB7XG4gICAgbGV0IGF1Z21lbnRlZENvbmZpZzogSW1hZ2VMb2FkZXJDb25maWcgPSBjb25maWdXaXRob3V0Q3VzdG9tUGFyYW1zO1xuICAgIGlmICh0aGlzLmxvYWRlclBhcmFtcykge1xuICAgICAgYXVnbWVudGVkQ29uZmlnLmxvYWRlclBhcmFtcyA9IHRoaXMubG9hZGVyUGFyYW1zO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5pbWFnZUxvYWRlcihhdWdtZW50ZWRDb25maWcpO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRMb2FkaW5nQmVoYXZpb3IoKTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMucHJpb3JpdHkgJiYgdGhpcy5sb2FkaW5nICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybiB0aGlzLmxvYWRpbmc7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2VhZ2VyJyA6ICdsYXp5JztcbiAgfVxuXG4gIHByaXZhdGUgZ2V0RmV0Y2hQcmlvcml0eSgpOiBzdHJpbmcge1xuICAgIHJldHVybiB0aGlzLnByaW9yaXR5ID8gJ2hpZ2gnIDogJ2F1dG8nO1xuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXdyaXR0ZW5TcmMoKTogc3RyaW5nIHtcbiAgICAvLyBJbWFnZUxvYWRlckNvbmZpZyBzdXBwb3J0cyBzZXR0aW5nIGEgd2lkdGggcHJvcGVydHkuIEhvd2V2ZXIsIHdlJ3JlIG5vdCBzZXR0aW5nIHdpZHRoIGhlcmVcbiAgICAvLyBiZWNhdXNlIGlmIHRoZSBkZXZlbG9wZXIgdXNlcyByZW5kZXJlZCB3aWR0aCBpbnN0ZWFkIG9mIGludHJpbnNpYyB3aWR0aCBpbiB0aGUgSFRNTCB3aWR0aFxuICAgIC8vIGF0dHJpYnV0ZSwgdGhlIGltYWdlIHJlcXVlc3RlZCBtYXkgYmUgdG9vIHNtYWxsIGZvciAyeCsgc2NyZWVucy5cbiAgICBpZiAoIXRoaXMuX3JlbmRlcmVkU3JjKSB7XG4gICAgICBjb25zdCBpbWdDb25maWcgPSB7c3JjOiB0aGlzLm5nU3JjfTtcbiAgICAgIC8vIENhY2hlIGNhbGN1bGF0ZWQgaW1hZ2Ugc3JjIHRvIHJldXNlIGl0IGxhdGVyIGluIHRoZSBjb2RlLlxuICAgICAgdGhpcy5fcmVuZGVyZWRTcmMgPSB0aGlzLmNhbGxJbWFnZUxvYWRlcihpbWdDb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fcmVuZGVyZWRTcmM7XG4gIH1cblxuICBwcml2YXRlIGdldFJld3JpdHRlblNyY3NldCgpOiBzdHJpbmcge1xuICAgIGNvbnN0IHdpZHRoU3JjU2V0ID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdCh0aGlzLm5nU3Jjc2V0KTtcbiAgICBjb25zdCBmaW5hbFNyY3MgPSB0aGlzLm5nU3Jjc2V0LnNwbGl0KCcsJykuZmlsdGVyKHNyYyA9PiBzcmMgIT09ICcnKS5tYXAoc3JjU3RyID0+IHtcbiAgICAgIHNyY1N0ciA9IHNyY1N0ci50cmltKCk7XG4gICAgICBjb25zdCB3aWR0aCA9IHdpZHRoU3JjU2V0ID8gcGFyc2VGbG9hdChzcmNTdHIpIDogcGFyc2VGbG9hdChzcmNTdHIpICogdGhpcy53aWR0aCE7XG4gICAgICByZXR1cm4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGh9KX0gJHtzcmNTdHJ9YDtcbiAgICB9KTtcbiAgICByZXR1cm4gZmluYWxTcmNzLmpvaW4oJywgJyk7XG4gIH1cblxuICBwcml2YXRlIGdldEF1dG9tYXRpY1NyY3NldCgpOiBzdHJpbmcge1xuICAgIGlmICh0aGlzLnNpemVzKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZXRSZXNwb25zaXZlU3Jjc2V0KCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiB0aGlzLmdldEZpeGVkU3Jjc2V0KCk7XG4gICAgfVxuICB9XG5cbiAgcHJpdmF0ZSBnZXRSZXNwb25zaXZlU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3Qge2JyZWFrcG9pbnRzfSA9IHRoaXMuY29uZmlnO1xuXG4gICAgbGV0IGZpbHRlcmVkQnJlYWtwb2ludHMgPSBicmVha3BvaW50cyE7XG4gICAgaWYgKHRoaXMuc2l6ZXM/LnRyaW0oKSA9PT0gJzEwMHZ3Jykge1xuICAgICAgLy8gU2luY2UgdGhpcyBpcyBhIGZ1bGwtc2NyZWVuLXdpZHRoIGltYWdlLCBvdXIgc3Jjc2V0IG9ubHkgbmVlZHMgdG8gaW5jbHVkZVxuICAgICAgLy8gYnJlYWtwb2ludHMgd2l0aCBmdWxsIHZpZXdwb3J0IHdpZHRocy5cbiAgICAgIGZpbHRlcmVkQnJlYWtwb2ludHMgPSBicmVha3BvaW50cyEuZmlsdGVyKGJwID0+IGJwID49IFZJRVdQT1JUX0JSRUFLUE9JTlRfQ1VUT0ZGKTtcbiAgICB9XG5cbiAgICBjb25zdCBmaW5hbFNyY3MgPSBmaWx0ZXJlZEJyZWFrcG9pbnRzLm1hcChcbiAgICAgICAgYnAgPT4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe3NyYzogdGhpcy5uZ1NyYywgd2lkdGg6IGJwfSl9ICR7YnB9d2ApO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgdXBkYXRlU3JjQW5kU3Jjc2V0KGZvcmNlU3JjUmVjYWxjID0gZmFsc2UpOiBzdHJpbmd8dW5kZWZpbmVkIHtcbiAgICBpZiAoZm9yY2VTcmNSZWNhbGMpIHtcbiAgICAgIC8vIFJlc2V0IGNhY2hlZCB2YWx1ZSwgc28gdGhhdCB0aGUgZm9sbG93dXAgYGdldFJld3JpdHRlblNyYygpYCBjYWxsXG4gICAgICAvLyB3aWxsIHJlY2FsY3VsYXRlIGl0IGFuZCB1cGRhdGUgdGhlIGNhY2hlLlxuICAgICAgdGhpcy5fcmVuZGVyZWRTcmMgPSBudWxsO1xuICAgIH1cblxuICAgIGNvbnN0IHJld3JpdHRlblNyYyA9IHRoaXMuZ2V0UmV3cml0dGVuU3JjKCk7XG4gICAgdGhpcy5zZXRIb3N0QXR0cmlidXRlKCdzcmMnLCByZXdyaXR0ZW5TcmMpO1xuXG4gICAgbGV0IHJld3JpdHRlblNyY3NldDogc3RyaW5nfHVuZGVmaW5lZCA9IHVuZGVmaW5lZDtcbiAgICBpZiAodGhpcy5uZ1NyY3NldCkge1xuICAgICAgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy5nZXRSZXdyaXR0ZW5TcmNzZXQoKTtcbiAgICB9IGVsc2UgaWYgKHRoaXMuc2hvdWxkR2VuZXJhdGVBdXRvbWF0aWNTcmNzZXQoKSkge1xuICAgICAgcmV3cml0dGVuU3Jjc2V0ID0gdGhpcy5nZXRBdXRvbWF0aWNTcmNzZXQoKTtcbiAgICB9XG5cbiAgICBpZiAocmV3cml0dGVuU3Jjc2V0KSB7XG4gICAgICB0aGlzLnNldEhvc3RBdHRyaWJ1dGUoJ3NyY3NldCcsIHJld3JpdHRlblNyY3NldCk7XG4gICAgfVxuICAgIHJldHVybiByZXdyaXR0ZW5TcmNzZXQ7XG4gIH1cblxuICBwcml2YXRlIGdldEZpeGVkU3Jjc2V0KCk6IHN0cmluZyB7XG4gICAgY29uc3QgZmluYWxTcmNzID0gREVOU0lUWV9TUkNTRVRfTVVMVElQTElFUlMubWFwKG11bHRpcGxpZXIgPT4gYCR7dGhpcy5jYWxsSW1hZ2VMb2FkZXIoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogdGhpcy5uZ1NyYyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB3aWR0aDogdGhpcy53aWR0aCEgKiBtdWx0aXBsaWVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pfSAke211bHRpcGxpZXJ9eGApO1xuICAgIHJldHVybiBmaW5hbFNyY3Muam9pbignLCAnKTtcbiAgfVxuXG4gIHByaXZhdGUgc2hvdWxkR2VuZXJhdGVBdXRvbWF0aWNTcmNzZXQoKTogYm9vbGVhbiB7XG4gICAgbGV0IG92ZXJzaXplZEltYWdlID0gZmFsc2U7XG4gICAgaWYgKCF0aGlzLnNpemVzKSB7XG4gICAgICBvdmVyc2l6ZWRJbWFnZSA9XG4gICAgICAgICAgdGhpcy53aWR0aCEgPiBGSVhFRF9TUkNTRVRfV0lEVEhfTElNSVQgfHwgdGhpcy5oZWlnaHQhID4gRklYRURfU1JDU0VUX0hFSUdIVF9MSU1JVDtcbiAgICB9XG4gICAgcmV0dXJuICF0aGlzLmRpc2FibGVPcHRpbWl6ZWRTcmNzZXQgJiYgIXRoaXMuc3Jjc2V0ICYmIHRoaXMuaW1hZ2VMb2FkZXIgIT09IG5vb3BJbWFnZUxvYWRlciAmJlxuICAgICAgICAhb3ZlcnNpemVkSW1hZ2U7XG4gIH1cblxuICAvKiogQG5vZG9jICovXG4gIG5nT25EZXN0cm95KCkge1xuICAgIGlmIChuZ0Rldk1vZGUpIHtcbiAgICAgIGlmICghdGhpcy5wcmlvcml0eSAmJiB0aGlzLl9yZW5kZXJlZFNyYyAhPT0gbnVsbCAmJiB0aGlzLmxjcE9ic2VydmVyICE9PSBudWxsKSB7XG4gICAgICAgIHRoaXMubGNwT2JzZXJ2ZXIudW5yZWdpc3RlckltYWdlKHRoaXMuX3JlbmRlcmVkU3JjKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIHNldEhvc3RBdHRyaWJ1dGUobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZCB7XG4gICAgdGhpcy5yZW5kZXJlci5zZXRBdHRyaWJ1dGUodGhpcy5pbWdFbGVtZW50LCBuYW1lLCB2YWx1ZSk7XG4gIH1cbn1cblxuLyoqKioqIEhlbHBlcnMgKioqKiovXG5cbi8qKlxuICogU29ydHMgcHJvdmlkZWQgY29uZmlnIGJyZWFrcG9pbnRzIGFuZCB1c2VzIGRlZmF1bHRzLlxuICovXG5mdW5jdGlvbiBwcm9jZXNzQ29uZmlnKGNvbmZpZzogSW1hZ2VDb25maWcpOiBJbWFnZUNvbmZpZyB7XG4gIGxldCBzb3J0ZWRCcmVha3BvaW50czoge2JyZWFrcG9pbnRzPzogbnVtYmVyW119ID0ge307XG4gIGlmIChjb25maWcuYnJlYWtwb2ludHMpIHtcbiAgICBzb3J0ZWRCcmVha3BvaW50cy5icmVha3BvaW50cyA9IGNvbmZpZy5icmVha3BvaW50cy5zb3J0KChhLCBiKSA9PiBhIC0gYik7XG4gIH1cbiAgcmV0dXJuIE9iamVjdC5hc3NpZ24oe30sIElNQUdFX0NPTkZJR19ERUZBVUxUUywgY29uZmlnLCBzb3J0ZWRCcmVha3BvaW50cyk7XG59XG5cbi8qKioqKiBBc3NlcnQgZnVuY3Rpb25zICoqKioqL1xuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlcmUgaXMgbm8gYHNyY2Agc2V0IG9uIGEgaG9zdCBlbGVtZW50LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb0NvbmZsaWN0aW5nU3JjKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBpZiAoZGlyLnNyYykge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9TUkNfQVRUUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBib3RoIFxcYHNyY1xcYCBhbmQgXFxgbmdTcmNcXGAgaGF2ZSBiZWVuIHNldC4gYCArXG4gICAgICAgICAgICBgU3VwcGx5aW5nIGJvdGggb2YgdGhlc2UgYXR0cmlidXRlcyBicmVha3MgbGF6eSBsb2FkaW5nLiBgICtcbiAgICAgICAgICAgIGBUaGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgc2V0cyBcXGBzcmNcXGAgaXRzZWxmIGJhc2VkIG9uIHRoZSB2YWx1ZSBvZiBcXGBuZ1NyY1xcYC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHBsZWFzZSByZW1vdmUgdGhlIFxcYHNyY1xcYCBhdHRyaWJ1dGUuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZXJlIGlzIG5vIGBzcmNzZXRgIHNldCBvbiBhIGhvc3QgZWxlbWVudC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Db25mbGljdGluZ1NyY3NldChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5zcmNzZXQpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLlVORVhQRUNURURfU1JDU0VUX0FUVFIsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gYm90aCBcXGBzcmNzZXRcXGAgYW5kIFxcYG5nU3Jjc2V0XFxgIGhhdmUgYmVlbiBzZXQuIGAgK1xuICAgICAgICAgICAgYFN1cHBseWluZyBib3RoIG9mIHRoZXNlIGF0dHJpYnV0ZXMgYnJlYWtzIGxhenkgbG9hZGluZy4gYCArXG4gICAgICAgICAgICBgVGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIHNldHMgXFxgc3Jjc2V0XFxgIGl0c2VsZiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgYCArXG4gICAgICAgICAgICBgXFxgbmdTcmNzZXRcXGAuIFRvIGZpeCB0aGlzLCBwbGVhc2UgcmVtb3ZlIHRoZSBcXGBzcmNzZXRcXGAgYXR0cmlidXRlLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCYXNlNjQtZW5jb2RlZCBpbWFnZS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmFzZTY0SW1hZ2UoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGxldCBuZ1NyYyA9IGRpci5uZ1NyYy50cmltKCk7XG4gIGlmIChuZ1NyYy5zdGFydHNXaXRoKCdkYXRhOicpKSB7XG4gICAgaWYgKG5nU3JjLmxlbmd0aCA+IEJBU0U2NF9JTUdfTUFYX0xFTkdUSF9JTl9FUlJPUikge1xuICAgICAgbmdTcmMgPSBuZ1NyYy5zdWJzdHJpbmcoMCwgQkFTRTY0X0lNR19NQVhfTEVOR1RIX0lOX0VSUk9SKSArICcuLi4nO1xuICAgIH1cbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYG5nU3JjXFxgIGlzIGEgQmFzZTY0LWVuY29kZWQgc3RyaW5nIGAgK1xuICAgICAgICAgICAgYCgke25nU3JjfSkuIE5nT3B0aW1pemVkSW1hZ2UgZG9lcyBub3Qgc3VwcG9ydCBCYXNlNjQtZW5jb2RlZCBzdHJpbmdzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgZGlzYWJsZSB0aGUgTmdPcHRpbWl6ZWRJbWFnZSBkaXJlY3RpdmUgZm9yIHRoaXMgZWxlbWVudCBgICtcbiAgICAgICAgICAgIGBieSByZW1vdmluZyBcXGBuZ1NyY1xcYCBhbmQgdXNpbmcgYSBzdGFuZGFyZCBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSAnc2l6ZXMnIG9ubHkgaW5jbHVkZXMgcmVzcG9uc2l2ZSB2YWx1ZXMuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vQ29tcGxleFNpemVzKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSkge1xuICBsZXQgc2l6ZXMgPSBkaXIuc2l6ZXM7XG4gIGlmIChzaXplcz8ubWF0Y2goLygoXFwpfCwpXFxzfF4pXFxkK3B4LykpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjLCBmYWxzZSl9IFxcYHNpemVzXFxgIHdhcyBzZXQgdG8gYSBzdHJpbmcgaW5jbHVkaW5nIGAgK1xuICAgICAgICAgICAgYHBpeGVsIHZhbHVlcy4gRm9yIGF1dG9tYXRpYyBcXGBzcmNzZXRcXGAgZ2VuZXJhdGlvbiwgXFxgc2l6ZXNcXGAgbXVzdCBvbmx5IGluY2x1ZGUgcmVzcG9uc2l2ZSBgICtcbiAgICAgICAgICAgIGB2YWx1ZXMsIHN1Y2ggYXMgXFxgc2l6ZXM9XCI1MHZ3XCJcXGAgb3IgXFxgc2l6ZXM9XCIobWluLXdpZHRoOiA3NjhweCkgNTB2dywgMTAwdndcIlxcYC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIG1vZGlmeSB0aGUgXFxgc2l6ZXNcXGAgYXR0cmlidXRlLCBvciBwcm92aWRlIHlvdXIgb3duIFxcYG5nU3Jjc2V0XFxgIHZhbHVlIGRpcmVjdGx5LmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgYG5nU3JjYCBpcyBub3QgYSBCbG9iIFVSTC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm90QmxvYlVybChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgY29uc3QgbmdTcmMgPSBkaXIubmdTcmMudHJpbSgpO1xuICBpZiAobmdTcmMuc3RhcnRzV2l0aCgnYmxvYjonKSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSBcXGBuZ1NyY1xcYCB3YXMgc2V0IHRvIGEgYmxvYiBVUkwgKCR7bmdTcmN9KS4gYCArXG4gICAgICAgICAgICBgQmxvYiBVUkxzIGFyZSBub3Qgc3VwcG9ydGVkIGJ5IHRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZS4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIGRpc2FibGUgdGhlIE5nT3B0aW1pemVkSW1hZ2UgZGlyZWN0aXZlIGZvciB0aGlzIGVsZW1lbnQgYCArXG4gICAgICAgICAgICBgYnkgcmVtb3ZpbmcgXFxgbmdTcmNcXGAgYW5kIHVzaW5nIGEgcmVndWxhciBcXGBzcmNcXGAgYXR0cmlidXRlIGluc3RlYWQuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBpbnB1dCBpcyBzZXQgdG8gYSBub24tZW1wdHkgc3RyaW5nLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25FbXB0eUlucHV0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgbmFtZTogc3RyaW5nLCB2YWx1ZTogdW5rbm93bikge1xuICBjb25zdCBpc1N0cmluZyA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZyc7XG4gIGNvbnN0IGlzRW1wdHlTdHJpbmcgPSBpc1N0cmluZyAmJiB2YWx1ZS50cmltKCkgPT09ICcnO1xuICBpZiAoIWlzU3RyaW5nIHx8IGlzRW1wdHlTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtuYW1lfVxcYCBoYXMgYW4gaW52YWxpZCB2YWx1ZSBgICtcbiAgICAgICAgICAgIGAoXFxgJHt2YWx1ZX1cXGApLiBUbyBmaXggdGhpcywgY2hhbmdlIHRoZSB2YWx1ZSB0byBhIG5vbi1lbXB0eSBzdHJpbmcuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSBgbmdTcmNzZXRgIGlzIGluIGEgdmFsaWQgZm9ybWF0LCBlLmcuIFwiMTAwdywgMjAwd1wiIG9yIFwiMXgsIDJ4XCIuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhc3NlcnRWYWxpZE5nU3Jjc2V0KGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgdmFsdWU6IHVua25vd24pIHtcbiAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybjtcbiAgYXNzZXJ0Tm9uRW1wdHlJbnB1dChkaXIsICduZ1NyY3NldCcsIHZhbHVlKTtcbiAgY29uc3Qgc3RyaW5nVmFsID0gdmFsdWUgYXMgc3RyaW5nO1xuICBjb25zdCBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yID0gVkFMSURfV0lEVEhfREVTQ1JJUFRPUl9TUkNTRVQudGVzdChzdHJpbmdWYWwpO1xuICBjb25zdCBpc1ZhbGlkRGVuc2l0eURlc2NyaXB0b3IgPSBWQUxJRF9ERU5TSVRZX0RFU0NSSVBUT1JfU1JDU0VULnRlc3Qoc3RyaW5nVmFsKTtcblxuICBpZiAoaXNWYWxpZERlbnNpdHlEZXNjcmlwdG9yKSB7XG4gICAgYXNzZXJ0VW5kZXJEZW5zaXR5Q2FwKGRpciwgc3RyaW5nVmFsKTtcbiAgfVxuXG4gIGNvbnN0IGlzVmFsaWRTcmNzZXQgPSBpc1ZhbGlkV2lkdGhEZXNjcmlwdG9yIHx8IGlzVmFsaWREZW5zaXR5RGVzY3JpcHRvcjtcbiAgaWYgKCFpc1ZhbGlkU3Jjc2V0KSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYG5nU3Jjc2V0XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlIChcXGAke3ZhbHVlfVxcYCkuIGAgK1xuICAgICAgICAgICAgYFRvIGZpeCB0aGlzLCBzdXBwbHkgXFxgbmdTcmNzZXRcXGAgdXNpbmcgYSBjb21tYS1zZXBhcmF0ZWQgbGlzdCBvZiBvbmUgb3IgbW9yZSB3aWR0aCBgICtcbiAgICAgICAgICAgIGBkZXNjcmlwdG9ycyAoZS5nLiBcIjEwMHcsIDIwMHdcIikgb3IgZGVuc2l0eSBkZXNjcmlwdG9ycyAoZS5nLiBcIjF4LCAyeFwiKS5gKTtcbiAgfVxufVxuXG5mdW5jdGlvbiBhc3NlcnRVbmRlckRlbnNpdHlDYXAoZGlyOiBOZ09wdGltaXplZEltYWdlLCB2YWx1ZTogc3RyaW5nKSB7XG4gIGNvbnN0IHVuZGVyRGVuc2l0eUNhcCA9XG4gICAgICB2YWx1ZS5zcGxpdCgnLCcpLmV2ZXJ5KG51bSA9PiBudW0gPT09ICcnIHx8IHBhcnNlRmxvYXQobnVtKSA8PSBBQlNPTFVURV9TUkNTRVRfREVOU0lUWV9DQVApO1xuICBpZiAoIXVuZGVyRGVuc2l0eUNhcCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBcXGBuZ1NyY3NldFxcYCBjb250YWlucyBhbiB1bnN1cHBvcnRlZCBpbWFnZSBkZW5zaXR5OmAgK1xuICAgICAgICAgICAgYFxcYCR7dmFsdWV9XFxgLiBOZ09wdGltaXplZEltYWdlIGdlbmVyYWxseSByZWNvbW1lbmRzIGEgbWF4IGltYWdlIGRlbnNpdHkgb2YgYCArXG4gICAgICAgICAgICBgJHtSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVB9eCBidXQgc3VwcG9ydHMgaW1hZ2UgZGVuc2l0aWVzIHVwIHRvIGAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXguIFRoZSBodW1hbiBleWUgY2Fubm90IGRpc3Rpbmd1aXNoIGJldHdlZW4gaW1hZ2UgZGVuc2l0aWVzIGAgK1xuICAgICAgICAgICAgYGdyZWF0ZXIgdGhhbiAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH14IC0gd2hpY2ggbWFrZXMgdGhlbSB1bm5lY2Vzc2FyeSBmb3IgYCArXG4gICAgICAgICAgICBgbW9zdCB1c2UgY2FzZXMuIEltYWdlcyB0aGF0IHdpbGwgYmUgcGluY2gtem9vbWVkIGFyZSB0eXBpY2FsbHkgdGhlIHByaW1hcnkgdXNlIGNhc2UgZm9yIGAgK1xuICAgICAgICAgICAgYCR7QUJTT0xVVEVfU1JDU0VUX0RFTlNJVFlfQ0FQfXggaW1hZ2VzLiBQbGVhc2UgcmVtb3ZlIHRoZSBoaWdoIGRlbnNpdHkgZGVzY3JpcHRvciBhbmQgdHJ5IGFnYWluLmApO1xuICB9XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIGBSdW50aW1lRXJyb3JgIGluc3RhbmNlIHRvIHJlcHJlc2VudCBhIHNpdHVhdGlvbiB3aGVuIGFuIGlucHV0IGlzIHNldCBhZnRlclxuICogdGhlIGRpcmVjdGl2ZSBoYXMgaW5pdGlhbGl6ZWQuXG4gKi9cbmZ1bmN0aW9uIHBvc3RJbml0SW5wdXRDaGFuZ2VFcnJvcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGlucHV0TmFtZTogc3RyaW5nKToge30ge1xuICBsZXQgcmVhc29uITogc3RyaW5nO1xuICBpZiAoaW5wdXROYW1lID09PSAnd2lkdGgnIHx8IGlucHV0TmFtZSA9PT0gJ2hlaWdodCcpIHtcbiAgICByZWFzb24gPSBgQ2hhbmdpbmcgXFxgJHtpbnB1dE5hbWV9XFxgIG1heSByZXN1bHQgaW4gZGlmZmVyZW50IGF0dHJpYnV0ZSB2YWx1ZSBgICtcbiAgICAgICAgYGFwcGxpZWQgdG8gdGhlIHVuZGVybHlpbmcgaW1hZ2UgZWxlbWVudCBhbmQgY2F1c2UgbGF5b3V0IHNoaWZ0cyBvbiBhIHBhZ2UuYDtcbiAgfSBlbHNlIHtcbiAgICByZWFzb24gPSBgQ2hhbmdpbmcgdGhlIFxcYCR7aW5wdXROYW1lfVxcYCB3b3VsZCBoYXZlIG5vIGVmZmVjdCBvbiB0aGUgdW5kZXJseWluZyBgICtcbiAgICAgICAgYGltYWdlIGVsZW1lbnQsIGJlY2F1c2UgdGhlIHJlc291cmNlIGxvYWRpbmcgaGFzIGFscmVhZHkgb2NjdXJyZWQuYDtcbiAgfVxuICByZXR1cm4gbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgIFJ1bnRpbWVFcnJvckNvZGUuVU5FWFBFQ1RFRF9JTlBVVF9DSEFOR0UsXG4gICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IFxcYCR7aW5wdXROYW1lfVxcYCB3YXMgdXBkYXRlZCBhZnRlciBpbml0aWFsaXphdGlvbi4gYCArXG4gICAgICAgICAgYFRoZSBOZ09wdGltaXplZEltYWdlIGRpcmVjdGl2ZSB3aWxsIG5vdCByZWFjdCB0byB0aGlzIGlucHV0IGNoYW5nZS4gJHtyZWFzb259IGAgK1xuICAgICAgICAgIGBUbyBmaXggdGhpcywgZWl0aGVyIHN3aXRjaCBcXGAke2lucHV0TmFtZX1cXGAgdG8gYSBzdGF0aWMgdmFsdWUgYCArXG4gICAgICAgICAgYG9yIHdyYXAgdGhlIGltYWdlIGVsZW1lbnQgaW4gYW4gKm5nSWYgdGhhdCBpcyBnYXRlZCBvbiB0aGUgbmVjZXNzYXJ5IHZhbHVlLmApO1xufVxuXG4vKipcbiAqIFZlcmlmeSB0aGF0IG5vbmUgb2YgdGhlIGxpc3RlZCBpbnB1dHMgaGFzIGNoYW5nZWQuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vUG9zdEluaXRJbnB1dENoYW5nZShcbiAgICBkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGNoYW5nZXM6IFNpbXBsZUNoYW5nZXMsIGlucHV0czogc3RyaW5nW10pIHtcbiAgaW5wdXRzLmZvckVhY2goaW5wdXQgPT4ge1xuICAgIGNvbnN0IGlzVXBkYXRlZCA9IGNoYW5nZXMuaGFzT3duUHJvcGVydHkoaW5wdXQpO1xuICAgIGlmIChpc1VwZGF0ZWQgJiYgIWNoYW5nZXNbaW5wdXRdLmlzRmlyc3RDaGFuZ2UoKSkge1xuICAgICAgaWYgKGlucHV0ID09PSAnbmdTcmMnKSB7XG4gICAgICAgIC8vIFdoZW4gdGhlIGBuZ1NyY2AgaW5wdXQgY2hhbmdlcywgd2UgZGV0ZWN0IHRoYXQgb25seSBpbiB0aGVcbiAgICAgICAgLy8gYG5nT25DaGFuZ2VzYCBob29rLCB0aHVzIHRoZSBgbmdTcmNgIGlzIGFscmVhZHkgc2V0LiBXZSB1c2VcbiAgICAgICAgLy8gYG5nU3JjYCBpbiB0aGUgZXJyb3IgbWVzc2FnZSwgc28gd2UgdXNlIGEgcHJldmlvdXMgdmFsdWUsIGJ1dFxuICAgICAgICAvLyBub3QgdGhlIHVwZGF0ZWQgb25lIGluIGl0LlxuICAgICAgICBkaXIgPSB7bmdTcmM6IGNoYW5nZXNbaW5wdXRdLnByZXZpb3VzVmFsdWV9IGFzIE5nT3B0aW1pemVkSW1hZ2U7XG4gICAgICB9XG4gICAgICB0aHJvdyBwb3N0SW5pdElucHV0Q2hhbmdlRXJyb3IoZGlyLCBpbnB1dCk7XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIGEgbnVtYmVyIGdyZWF0ZXIgdGhhbiAwLlxuICovXG5mdW5jdGlvbiBhc3NlcnRHcmVhdGVyVGhhblplcm8oZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbnB1dFZhbHVlOiB1bmtub3duLCBpbnB1dE5hbWU6IHN0cmluZykge1xuICBjb25zdCB2YWxpZE51bWJlciA9IHR5cGVvZiBpbnB1dFZhbHVlID09PSAnbnVtYmVyJyAmJiBpbnB1dFZhbHVlID4gMDtcbiAgY29uc3QgdmFsaWRTdHJpbmcgPVxuICAgICAgdHlwZW9mIGlucHV0VmFsdWUgPT09ICdzdHJpbmcnICYmIC9eXFxkKyQvLnRlc3QoaW5wdXRWYWx1ZS50cmltKCkpICYmIHBhcnNlSW50KGlucHV0VmFsdWUpID4gMDtcbiAgaWYgKCF2YWxpZE51bWJlciAmJiAhdmFsaWRTdHJpbmcpIHtcbiAgICB0aHJvdyBuZXcgUnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgIGAke2ltZ0RpcmVjdGl2ZURldGFpbHMoZGlyLm5nU3JjKX0gXFxgJHtpbnB1dE5hbWV9XFxgIGhhcyBhbiBpbnZhbGlkIHZhbHVlLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBcXGAke2lucHV0TmFtZX1cXGAgYXMgYSBudW1iZXIgZ3JlYXRlciB0aGFuIDAuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IHRoZSByZW5kZXJlZCBpbWFnZSBpcyBub3QgdmlzdWFsbHkgZGlzdG9ydGVkLiBFZmZlY3RpdmVseSB0aGlzIGlzIGNoZWNraW5nOlxuICogLSBXaGV0aGVyIHRoZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyByZWZsZWN0IHRoZSBhY3R1YWwgZGltZW5zaW9ucyBvZiB0aGUgaW1hZ2UuXG4gKiAtIFdoZXRoZXIgaW1hZ2Ugc3R5bGluZyBpcyBcImNvcnJlY3RcIiAoc2VlIGJlbG93IGZvciBhIGxvbmdlciBleHBsYW5hdGlvbikuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vSW1hZ2VEaXN0b3J0aW9uKFxuICAgIGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1nOiBIVE1MSW1hZ2VFbGVtZW50LCByZW5kZXJlcjogUmVuZGVyZXIyKSB7XG4gIGNvbnN0IHJlbW92ZUxpc3RlbmVyRm4gPSByZW5kZXJlci5saXN0ZW4oaW1nLCAnbG9hZCcsICgpID0+IHtcbiAgICByZW1vdmVMaXN0ZW5lckZuKCk7XG4gICAgY29uc3QgY29tcHV0ZWRTdHlsZSA9IHdpbmRvdy5nZXRDb21wdXRlZFN0eWxlKGltZyk7XG4gICAgbGV0IHJlbmRlcmVkV2lkdGggPSBwYXJzZUZsb2F0KGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgnd2lkdGgnKSk7XG4gICAgbGV0IHJlbmRlcmVkSGVpZ2h0ID0gcGFyc2VGbG9hdChjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2hlaWdodCcpKTtcbiAgICBjb25zdCBib3hTaXppbmcgPSBjb21wdXRlZFN0eWxlLmdldFByb3BlcnR5VmFsdWUoJ2JveC1zaXppbmcnKTtcblxuICAgIGlmIChib3hTaXppbmcgPT09ICdib3JkZXItYm94Jykge1xuICAgICAgY29uc3QgcGFkZGluZ1RvcCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy10b3AnKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdSaWdodCA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1yaWdodCcpO1xuICAgICAgY29uc3QgcGFkZGluZ0JvdHRvbSA9IGNvbXB1dGVkU3R5bGUuZ2V0UHJvcGVydHlWYWx1ZSgncGFkZGluZy1ib3R0b20nKTtcbiAgICAgIGNvbnN0IHBhZGRpbmdMZWZ0ID0gY29tcHV0ZWRTdHlsZS5nZXRQcm9wZXJ0eVZhbHVlKCdwYWRkaW5nLWxlZnQnKTtcbiAgICAgIHJlbmRlcmVkV2lkdGggLT0gcGFyc2VGbG9hdChwYWRkaW5nUmlnaHQpICsgcGFyc2VGbG9hdChwYWRkaW5nTGVmdCk7XG4gICAgICByZW5kZXJlZEhlaWdodCAtPSBwYXJzZUZsb2F0KHBhZGRpbmdUb3ApICsgcGFyc2VGbG9hdChwYWRkaW5nQm90dG9tKTtcbiAgICB9XG5cbiAgICBjb25zdCByZW5kZXJlZEFzcGVjdFJhdGlvID0gcmVuZGVyZWRXaWR0aCAvIHJlbmRlcmVkSGVpZ2h0O1xuICAgIGNvbnN0IG5vblplcm9SZW5kZXJlZERpbWVuc2lvbnMgPSByZW5kZXJlZFdpZHRoICE9PSAwICYmIHJlbmRlcmVkSGVpZ2h0ICE9PSAwO1xuXG4gICAgY29uc3QgaW50cmluc2ljV2lkdGggPSBpbWcubmF0dXJhbFdpZHRoO1xuICAgIGNvbnN0IGludHJpbnNpY0hlaWdodCA9IGltZy5uYXR1cmFsSGVpZ2h0O1xuICAgIGNvbnN0IGludHJpbnNpY0FzcGVjdFJhdGlvID0gaW50cmluc2ljV2lkdGggLyBpbnRyaW5zaWNIZWlnaHQ7XG5cbiAgICBjb25zdCBzdXBwbGllZFdpZHRoID0gZGlyLndpZHRoITtcbiAgICBjb25zdCBzdXBwbGllZEhlaWdodCA9IGRpci5oZWlnaHQhO1xuICAgIGNvbnN0IHN1cHBsaWVkQXNwZWN0UmF0aW8gPSBzdXBwbGllZFdpZHRoIC8gc3VwcGxpZWRIZWlnaHQ7XG5cbiAgICAvLyBUb2xlcmFuY2UgaXMgdXNlZCB0byBhY2NvdW50IGZvciB0aGUgaW1wYWN0IG9mIHN1YnBpeGVsIHJlbmRlcmluZy5cbiAgICAvLyBEdWUgdG8gc3VicGl4ZWwgcmVuZGVyaW5nLCB0aGUgcmVuZGVyZWQsIGludHJpbnNpYywgYW5kIHN1cHBsaWVkXG4gICAgLy8gYXNwZWN0IHJhdGlvcyBvZiBhIGNvcnJlY3RseSBjb25maWd1cmVkIGltYWdlIG1heSBub3QgZXhhY3RseSBtYXRjaC5cbiAgICAvLyBGb3IgZXhhbXBsZSwgYSBgd2lkdGg9NDAzMCBoZWlnaHQ9MzAyMGAgaW1hZ2UgbWlnaHQgaGF2ZSBhIHJlbmRlcmVkXG4gICAgLy8gc2l6ZSBvZiBcIjEwNjJ3LCA3OTYuNDhoXCIuIChBbiBhc3BlY3QgcmF0aW8gb2YgMS4zMzQuLi4gdnMuIDEuMzMzLi4uKVxuICAgIGNvbnN0IGluYWNjdXJhdGVEaW1lbnNpb25zID1cbiAgICAgICAgTWF0aC5hYnMoc3VwcGxpZWRBc3BlY3RSYXRpbyAtIGludHJpbnNpY0FzcGVjdFJhdGlvKSA+IEFTUEVDVF9SQVRJT19UT0xFUkFOQ0U7XG4gICAgY29uc3Qgc3R5bGluZ0Rpc3RvcnRpb24gPSBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zICYmXG4gICAgICAgIE1hdGguYWJzKGludHJpbnNpY0FzcGVjdFJhdGlvIC0gcmVuZGVyZWRBc3BlY3RSYXRpbykgPiBBU1BFQ1RfUkFUSU9fVE9MRVJBTkNFO1xuXG4gICAgaWYgKGluYWNjdXJhdGVEaW1lbnNpb25zKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBhc3BlY3QgcmF0aW8gb2YgdGhlIGltYWdlIGRvZXMgbm90IG1hdGNoIGAgK1xuICAgICAgICAgICAgICBgdGhlIGFzcGVjdCByYXRpbyBpbmRpY2F0ZWQgYnkgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy4gYCArXG4gICAgICAgICAgICAgIGBcXG5JbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtpbnRyaW5zaWNXaWR0aH13IHggJHtpbnRyaW5zaWNIZWlnaHR9aCBgICtcbiAgICAgICAgICAgICAgYChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICByb3VuZChpbnRyaW5zaWNBc3BlY3RSYXRpbyl9KS4gXFxuU3VwcGxpZWQgd2lkdGggYW5kIGhlaWdodCBhdHRyaWJ1dGVzOiBgICtcbiAgICAgICAgICAgICAgYCR7c3VwcGxpZWRXaWR0aH13IHggJHtzdXBwbGllZEhlaWdodH1oIChhc3BlY3QtcmF0aW86ICR7XG4gICAgICAgICAgICAgICAgICByb3VuZChzdXBwbGllZEFzcGVjdFJhdGlvKX0pLiBgICtcbiAgICAgICAgICAgICAgYFxcblRvIGZpeCB0aGlzLCB1cGRhdGUgdGhlIHdpZHRoIGFuZCBoZWlnaHQgYXR0cmlidXRlcy5gKSk7XG4gICAgfSBlbHNlIGlmIChzdHlsaW5nRGlzdG9ydGlvbikge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLklOVkFMSURfSU5QVVQsXG4gICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgYXNwZWN0IHJhdGlvIG9mIHRoZSByZW5kZXJlZCBpbWFnZSBgICtcbiAgICAgICAgICAgICAgYGRvZXMgbm90IG1hdGNoIHRoZSBpbWFnZSdzIGludHJpbnNpYyBhc3BlY3QgcmF0aW8uIGAgK1xuICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWggYCArXG4gICAgICAgICAgICAgIGAoYXNwZWN0LXJhdGlvOiAke3JvdW5kKGludHJpbnNpY0FzcGVjdFJhdGlvKX0pLiBcXG5SZW5kZXJlZCBpbWFnZSBzaXplOiBgICtcbiAgICAgICAgICAgICAgYCR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oIChhc3BlY3QtcmF0aW86IGAgK1xuICAgICAgICAgICAgICBgJHtyb3VuZChyZW5kZXJlZEFzcGVjdFJhdGlvKX0pLiBcXG5UaGlzIGlzc3VlIGNhbiBvY2N1ciBpZiBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYCArXG4gICAgICAgICAgICAgIGBhdHRyaWJ1dGVzIGFyZSBhZGRlZCB0byBhbiBpbWFnZSB3aXRob3V0IHVwZGF0aW5nIHRoZSBjb3JyZXNwb25kaW5nIGAgK1xuICAgICAgICAgICAgICBgaW1hZ2Ugc3R5bGluZy4gVG8gZml4IHRoaXMsIGFkanVzdCBpbWFnZSBzdHlsaW5nLiBJbiBtb3N0IGNhc2VzLCBgICtcbiAgICAgICAgICAgICAgYGFkZGluZyBcImhlaWdodDogYXV0b1wiIG9yIFwid2lkdGg6IGF1dG9cIiB0byB0aGUgaW1hZ2Ugc3R5bGluZyB3aWxsIGZpeCBgICtcbiAgICAgICAgICAgICAgYHRoaXMgaXNzdWUuYCkpO1xuICAgIH0gZWxzZSBpZiAoIWRpci5uZ1NyY3NldCAmJiBub25aZXJvUmVuZGVyZWREaW1lbnNpb25zKSB7XG4gICAgICAvLyBJZiBgbmdTcmNzZXRgIGhhc24ndCBiZWVuIHNldCwgc2FuaXR5IGNoZWNrIHRoZSBpbnRyaW5zaWMgc2l6ZS5cbiAgICAgIGNvbnN0IHJlY29tbWVuZGVkV2lkdGggPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZFdpZHRoO1xuICAgICAgY29uc3QgcmVjb21tZW5kZWRIZWlnaHQgPSBSRUNPTU1FTkRFRF9TUkNTRVRfREVOU0lUWV9DQVAgKiByZW5kZXJlZEhlaWdodDtcbiAgICAgIGNvbnN0IG92ZXJzaXplZFdpZHRoID0gKGludHJpbnNpY1dpZHRoIC0gcmVjb21tZW5kZWRXaWR0aCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGNvbnN0IG92ZXJzaXplZEhlaWdodCA9IChpbnRyaW5zaWNIZWlnaHQgLSByZWNvbW1lbmRlZEhlaWdodCkgPj0gT1ZFUlNJWkVEX0lNQUdFX1RPTEVSQU5DRTtcbiAgICAgIGlmIChvdmVyc2l6ZWRXaWR0aCB8fCBvdmVyc2l6ZWRIZWlnaHQpIHtcbiAgICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuT1ZFUlNJWkVEX0lNQUdFLFxuICAgICAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgaW50cmluc2ljIGltYWdlIGlzIHNpZ25pZmljYW50bHkgYCArXG4gICAgICAgICAgICAgICAgYGxhcmdlciB0aGFuIG5lY2Vzc2FyeS4gYCArXG4gICAgICAgICAgICAgICAgYFxcblJlbmRlcmVkIGltYWdlIHNpemU6ICR7cmVuZGVyZWRXaWR0aH13IHggJHtyZW5kZXJlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuSW50cmluc2ljIGltYWdlIHNpemU6ICR7aW50cmluc2ljV2lkdGh9dyB4ICR7aW50cmluc2ljSGVpZ2h0fWguIGAgK1xuICAgICAgICAgICAgICAgIGBcXG5SZWNvbW1lbmRlZCBpbnRyaW5zaWMgaW1hZ2Ugc2l6ZTogJHtyZWNvbW1lbmRlZFdpZHRofXcgeCAke1xuICAgICAgICAgICAgICAgICAgICByZWNvbW1lbmRlZEhlaWdodH1oLiBgICtcbiAgICAgICAgICAgICAgICBgXFxuTm90ZTogUmVjb21tZW5kZWQgaW50cmluc2ljIGltYWdlIHNpemUgaXMgY2FsY3VsYXRlZCBhc3N1bWluZyBhIG1heGltdW0gRFBSIG9mIGAgK1xuICAgICAgICAgICAgICAgIGAke1JFQ09NTUVOREVEX1NSQ1NFVF9ERU5TSVRZX0NBUH0uIFRvIGltcHJvdmUgbG9hZGluZyB0aW1lLCByZXNpemUgdGhlIGltYWdlIGAgK1xuICAgICAgICAgICAgICAgIGBvciBjb25zaWRlciB1c2luZyB0aGUgXCJuZ1NyY3NldFwiIGFuZCBcInNpemVzXCIgYXR0cmlidXRlcy5gKSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn1cblxuLyoqXG4gKiBWZXJpZmllcyB0aGF0IGEgc3BlY2lmaWVkIGlucHV0IGlzIHNldC5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9uRW1wdHlXaWR0aEFuZEhlaWdodChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgbGV0IG1pc3NpbmdBdHRyaWJ1dGVzID0gW107XG4gIGlmIChkaXIud2lkdGggPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnd2lkdGgnKTtcbiAgaWYgKGRpci5oZWlnaHQgPT09IHVuZGVmaW5lZCkgbWlzc2luZ0F0dHJpYnV0ZXMucHVzaCgnaGVpZ2h0Jyk7XG4gIGlmIChtaXNzaW5nQXR0cmlidXRlcy5sZW5ndGggPiAwKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5SRVFVSVJFRF9JTlBVVF9NSVNTSU5HLFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZXNlIHJlcXVpcmVkIGF0dHJpYnV0ZXMgYCArXG4gICAgICAgICAgICBgYXJlIG1pc3Npbmc6ICR7bWlzc2luZ0F0dHJpYnV0ZXMubWFwKGF0dHIgPT4gYFwiJHthdHRyfVwiYCkuam9pbignLCAnKX0uIGAgK1xuICAgICAgICAgICAgYEluY2x1ZGluZyBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyB3aWxsIHByZXZlbnQgaW1hZ2UtcmVsYXRlZCBsYXlvdXQgc2hpZnRzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgaW5jbHVkZSBcIndpZHRoXCIgYW5kIFwiaGVpZ2h0XCIgYXR0cmlidXRlcyBvbiB0aGUgaW1hZ2UgdGFnIG9yIHR1cm4gb24gYCArXG4gICAgICAgICAgICBgXCJmaWxsXCIgbW9kZSB3aXRoIHRoZSBcXGBmaWxsXFxgIGF0dHJpYnV0ZS5gKTtcbiAgfVxufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgd2lkdGggYW5kIGhlaWdodCBhcmUgbm90IHNldC4gVXNlZCBpbiBmaWxsIG1vZGUsIHdoZXJlIHRob3NlIGF0dHJpYnV0ZXMgZG9uJ3QgbWFrZVxuICogc2Vuc2UuXG4gKi9cbmZ1bmN0aW9uIGFzc2VydEVtcHR5V2lkdGhBbmRIZWlnaHQoZGlyOiBOZ09wdGltaXplZEltYWdlKSB7XG4gIGlmIChkaXIud2lkdGggfHwgZGlyLmhlaWdodCkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7XG4gICAgICAgICAgICBpbWdEaXJlY3RpdmVEZXRhaWxzKFxuICAgICAgICAgICAgICAgIGRpci5uZ1NyYyl9IHRoZSBhdHRyaWJ1dGVzIFxcYGhlaWdodFxcYCBhbmQvb3IgXFxgd2lkdGhcXGAgYXJlIHByZXNlbnQgYCArXG4gICAgICAgICAgICBgYWxvbmcgd2l0aCB0aGUgXFxgZmlsbFxcYCBhdHRyaWJ1dGUuIEJlY2F1c2UgXFxgZmlsbFxcYCBtb2RlIGNhdXNlcyBhbiBpbWFnZSB0byBmaWxsIGl0cyBjb250YWluaW5nIGAgK1xuICAgICAgICAgICAgYGVsZW1lbnQsIHRoZSBzaXplIGF0dHJpYnV0ZXMgaGF2ZSBubyBlZmZlY3QgYW5kIHNob3VsZCBiZSByZW1vdmVkLmApO1xuICB9XG59XG5cbi8qKlxuICogVmVyaWZpZXMgdGhhdCB0aGUgcmVuZGVyZWQgaW1hZ2UgaGFzIGEgbm9uemVybyBoZWlnaHQuIElmIHRoZSBpbWFnZSBpcyBpbiBmaWxsIG1vZGUsIHByb3ZpZGVzXG4gKiBndWlkYW5jZSB0aGF0IHRoaXMgY2FuIGJlIGNhdXNlZCBieSB0aGUgY29udGFpbmluZyBlbGVtZW50J3MgQ1NTIHBvc2l0aW9uIHByb3BlcnR5LlxuICovXG5mdW5jdGlvbiBhc3NlcnROb25aZXJvUmVuZGVyZWRIZWlnaHQoXG4gICAgZGlyOiBOZ09wdGltaXplZEltYWdlLCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQsIHJlbmRlcmVyOiBSZW5kZXJlcjIpIHtcbiAgY29uc3QgcmVtb3ZlTGlzdGVuZXJGbiA9IHJlbmRlcmVyLmxpc3RlbihpbWcsICdsb2FkJywgKCkgPT4ge1xuICAgIHJlbW92ZUxpc3RlbmVyRm4oKTtcbiAgICBjb25zdCByZW5kZXJlZEhlaWdodCA9IGltZy5jbGllbnRIZWlnaHQ7XG4gICAgaWYgKGRpci5maWxsICYmIHJlbmRlcmVkSGVpZ2h0ID09PSAwKSB7XG4gICAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBoZWlnaHQgb2YgdGhlIGZpbGwtbW9kZSBpbWFnZSBpcyB6ZXJvLiBgICtcbiAgICAgICAgICAgICAgYFRoaXMgaXMgbGlrZWx5IGJlY2F1c2UgdGhlIGNvbnRhaW5pbmcgZWxlbWVudCBkb2VzIG5vdCBoYXZlIHRoZSBDU1MgJ3Bvc2l0aW9uJyBgICtcbiAgICAgICAgICAgICAgYHByb3BlcnR5IHNldCB0byBvbmUgb2YgdGhlIGZvbGxvd2luZzogXCJyZWxhdGl2ZVwiLCBcImZpeGVkXCIsIG9yIFwiYWJzb2x1dGVcIi4gYCArXG4gICAgICAgICAgICAgIGBUbyBmaXggdGhpcyBwcm9ibGVtLCBtYWtlIHN1cmUgdGhlIGNvbnRhaW5lciBlbGVtZW50IGhhcyB0aGUgQ1NTICdwb3NpdGlvbicgYCArXG4gICAgICAgICAgICAgIGBwcm9wZXJ0eSBkZWZpbmVkIGFuZCB0aGUgaGVpZ2h0IG9mIHRoZSBlbGVtZW50IGlzIG5vdCB6ZXJvLmApKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vKipcbiAqIFZlcmlmaWVzIHRoYXQgdGhlIGBsb2FkaW5nYCBhdHRyaWJ1dGUgaXMgc2V0IHRvIGEgdmFsaWQgaW5wdXQgJlxuICogaXMgbm90IHVzZWQgb24gcHJpb3JpdHkgaW1hZ2VzLlxuICovXG5mdW5jdGlvbiBhc3NlcnRWYWxpZExvYWRpbmdJbnB1dChkaXI6IE5nT3B0aW1pemVkSW1hZ2UpIHtcbiAgaWYgKGRpci5sb2FkaW5nICYmIGRpci5wcmlvcml0eSkge1xuICAgIHRocm93IG5ldyBSdW50aW1lRXJyb3IoXG4gICAgICAgIFJ1bnRpbWVFcnJvckNvZGUuSU5WQUxJRF9JTlBVVCxcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGluZ1xcYCBhdHRyaWJ1dGUgYCArXG4gICAgICAgICAgICBgd2FzIHVzZWQgb24gYW4gaW1hZ2UgdGhhdCB3YXMgbWFya2VkIFwicHJpb3JpdHlcIi4gYCArXG4gICAgICAgICAgICBgU2V0dGluZyBcXGBsb2FkaW5nXFxgIG9uIHByaW9yaXR5IGltYWdlcyBpcyBub3QgYWxsb3dlZCBgICtcbiAgICAgICAgICAgIGBiZWNhdXNlIHRoZXNlIGltYWdlcyB3aWxsIGFsd2F5cyBiZSBlYWdlcmx5IGxvYWRlZC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHJlbW92ZSB0aGUg4oCcbG9hZGluZ+KAnSBhdHRyaWJ1dGUgZnJvbSB0aGUgcHJpb3JpdHkgaW1hZ2UuYCk7XG4gIH1cbiAgY29uc3QgdmFsaWRJbnB1dHMgPSBbJ2F1dG8nLCAnZWFnZXInLCAnbGF6eSddO1xuICBpZiAodHlwZW9mIGRpci5sb2FkaW5nID09PSAnc3RyaW5nJyAmJiAhdmFsaWRJbnB1dHMuaW5jbHVkZXMoZGlyLmxvYWRpbmcpKSB7XG4gICAgdGhyb3cgbmV3IFJ1bnRpbWVFcnJvcihcbiAgICAgICAgUnVudGltZUVycm9yQ29kZS5JTlZBTElEX0lOUFVULFxuICAgICAgICBgJHtpbWdEaXJlY3RpdmVEZXRhaWxzKGRpci5uZ1NyYyl9IHRoZSBcXGBsb2FkaW5nXFxgIGF0dHJpYnV0ZSBgICtcbiAgICAgICAgICAgIGBoYXMgYW4gaW52YWxpZCB2YWx1ZSAoXFxgJHtkaXIubG9hZGluZ31cXGApLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIHZhbGlkIHZhbHVlIChcImxhenlcIiwgXCJlYWdlclwiLCBvciBcImF1dG9cIikuYCk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBOT1QgdXNpbmcgYSBsb2FkZXIgKGZhbGxpbmcgYmFjayB0byB0aGUgZ2VuZXJpYyBsb2FkZXIpIGFuZFxuICogdGhlIGltYWdlIGFwcGVhcnMgdG8gYmUgaG9zdGVkIG9uIG9uZSBvZiB0aGUgaW1hZ2UgQ0ROcyBmb3Igd2hpY2hcbiAqIHdlIGRvIGhhdmUgYSBidWlsdC1pbiBpbWFnZSBsb2FkZXIuIFN1Z2dlc3RzIHN3aXRjaGluZyB0byB0aGVcbiAqIGJ1aWx0LWluIGxvYWRlci5cbiAqXG4gKiBAcGFyYW0gbmdTcmMgVmFsdWUgb2YgdGhlIG5nU3JjIGF0dHJpYnV0ZVxuICogQHBhcmFtIGltYWdlTG9hZGVyIEltYWdlTG9hZGVyIHByb3ZpZGVkXG4gKi9cbmZ1bmN0aW9uIGFzc2VydE5vdE1pc3NpbmdCdWlsdEluTG9hZGVyKG5nU3JjOiBzdHJpbmcsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoaW1hZ2VMb2FkZXIgPT09IG5vb3BJbWFnZUxvYWRlcikge1xuICAgIGxldCBidWlsdEluTG9hZGVyTmFtZSA9ICcnO1xuICAgIGZvciAoY29uc3QgbG9hZGVyIG9mIEJVSUxUX0lOX0xPQURFUlMpIHtcbiAgICAgIGlmIChsb2FkZXIudGVzdFVybChuZ1NyYykpIHtcbiAgICAgICAgYnVpbHRJbkxvYWRlck5hbWUgPSBsb2FkZXIubmFtZTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChidWlsdEluTG9hZGVyTmFtZSkge1xuICAgICAgY29uc29sZS53YXJuKGZvcm1hdFJ1bnRpbWVFcnJvcihcbiAgICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfQlVJTFRJTl9MT0FERVIsXG4gICAgICAgICAgYE5nT3B0aW1pemVkSW1hZ2U6IEl0IGxvb2tzIGxpa2UgeW91ciBpbWFnZXMgbWF5IGJlIGhvc3RlZCBvbiB0aGUgYCArXG4gICAgICAgICAgICAgIGAke2J1aWx0SW5Mb2FkZXJOYW1lfSBDRE4sIGJ1dCB5b3VyIGFwcCBpcyBub3QgdXNpbmcgQW5ndWxhcidzIGAgK1xuICAgICAgICAgICAgICBgYnVpbHQtaW4gbG9hZGVyIGZvciB0aGF0IENETi4gV2UgcmVjb21tZW5kIHN3aXRjaGluZyB0byB1c2UgYCArXG4gICAgICAgICAgICAgIGB0aGUgYnVpbHQtaW4gYnkgY2FsbGluZyBcXGBwcm92aWRlJHtidWlsdEluTG9hZGVyTmFtZX1Mb2FkZXIoKVxcYCBgICtcbiAgICAgICAgICAgICAgYGluIHlvdXIgXFxgcHJvdmlkZXJzXFxgIGFuZCBwYXNzaW5nIGl0IHlvdXIgaW5zdGFuY2UncyBiYXNlIFVSTC4gYCArXG4gICAgICAgICAgICAgIGBJZiB5b3UgZG9uJ3Qgd2FudCB0byB1c2UgdGhlIGJ1aWx0LWluIGxvYWRlciwgZGVmaW5lIGEgY3VzdG9tIGAgK1xuICAgICAgICAgICAgICBgbG9hZGVyIGZ1bmN0aW9uIHVzaW5nIElNQUdFX0xPQURFUiB0byBzaWxlbmNlIHRoaXMgd2FybmluZy5gKSk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogV2FybnMgaWYgbmdTcmNzZXQgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nIHVzZWQpLlxuICovXG5mdW5jdGlvbiBhc3NlcnROb05nU3Jjc2V0V2l0aG91dExvYWRlcihkaXI6IE5nT3B0aW1pemVkSW1hZ2UsIGltYWdlTG9hZGVyOiBJbWFnZUxvYWRlcikge1xuICBpZiAoZGlyLm5nU3Jjc2V0ICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbmdTcmNzZXRcXGAgYXR0cmlidXRlIGlzIHByZXNlbnQgYnV0IGAgK1xuICAgICAgICAgICAgYG5vIGltYWdlIGxvYWRlciBpcyBjb25maWd1cmVkIChpLmUuIHRoZSBkZWZhdWx0IG9uZSBpcyBiZWluZyB1c2VkKSwgYCArXG4gICAgICAgICAgICBgd2hpY2ggd291bGQgcmVzdWx0IGluIHRoZSBzYW1lIGltYWdlIGJlaW5nIHVzZWQgZm9yIGFsbCBjb25maWd1cmVkIHNpemVzLiBgICtcbiAgICAgICAgICAgIGBUbyBmaXggdGhpcywgcHJvdmlkZSBhIGxvYWRlciBvciByZW1vdmUgdGhlIFxcYG5nU3Jjc2V0XFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gKSk7XG4gIH1cbn1cblxuLyoqXG4gKiBXYXJucyBpZiBsb2FkZXJQYXJhbXMgaXMgcHJlc2VudCBhbmQgbm8gbG9hZGVyIGlzIGNvbmZpZ3VyZWQgKGkuZS4gdGhlIGRlZmF1bHQgb25lIGlzIGJlaW5nXG4gKiB1c2VkKS5cbiAqL1xuZnVuY3Rpb24gYXNzZXJ0Tm9Mb2FkZXJQYXJhbXNXaXRob3V0TG9hZGVyKGRpcjogTmdPcHRpbWl6ZWRJbWFnZSwgaW1hZ2VMb2FkZXI6IEltYWdlTG9hZGVyKSB7XG4gIGlmIChkaXIubG9hZGVyUGFyYW1zICYmIGltYWdlTG9hZGVyID09PSBub29wSW1hZ2VMb2FkZXIpIHtcbiAgICBjb25zb2xlLndhcm4oZm9ybWF0UnVudGltZUVycm9yKFxuICAgICAgICBSdW50aW1lRXJyb3JDb2RlLk1JU1NJTkdfTkVDRVNTQVJZX0xPQURFUixcbiAgICAgICAgYCR7aW1nRGlyZWN0aXZlRGV0YWlscyhkaXIubmdTcmMpfSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBpcyBwcmVzZW50IGJ1dCBgICtcbiAgICAgICAgICAgIGBubyBpbWFnZSBsb2FkZXIgaXMgY29uZmlndXJlZCAoaS5lLiB0aGUgZGVmYXVsdCBvbmUgaXMgYmVpbmcgdXNlZCksIGAgK1xuICAgICAgICAgICAgYHdoaWNoIG1lYW5zIHRoYXQgdGhlIGxvYWRlclBhcmFtcyBkYXRhIHdpbGwgbm90IGJlIGNvbnN1bWVkIGFuZCB3aWxsIG5vdCBhZmZlY3QgdGhlIFVSTC4gYCArXG4gICAgICAgICAgICBgVG8gZml4IHRoaXMsIHByb3ZpZGUgYSBjdXN0b20gbG9hZGVyIG9yIHJlbW92ZSB0aGUgXFxgbG9hZGVyUGFyYW1zXFxgIGF0dHJpYnV0ZSBmcm9tIHRoZSBpbWFnZS5gKSk7XG4gIH1cbn1cblxuXG5mdW5jdGlvbiByb3VuZChpbnB1dDogbnVtYmVyKTogbnVtYmVyfHN0cmluZyB7XG4gIHJldHVybiBOdW1iZXIuaXNJbnRlZ2VyKGlucHV0KSA/IGlucHV0IDogaW5wdXQudG9GaXhlZCgyKTtcbn1cblxuLy8gVHJhbnNmb3JtIGZ1bmN0aW9uIHRvIGhhbmRsZSBTYWZlVmFsdWUgaW5wdXQgZm9yIG5nU3JjLiBUaGlzIGRvZXNuJ3QgZG8gYW55IHNhbml0aXphdGlvbixcbi8vIGFzIHRoYXQgaXMgbm90IG5lZWRlZCBmb3IgaW1nLnNyYyBhbmQgaW1nLnNyY3NldC4gVGhpcyB0cmFuc2Zvcm0gaXMgcHVyZWx5IGZvciBjb21wYXRpYmlsaXR5LlxuZnVuY3Rpb24gdW53cmFwU2FmZVVybCh2YWx1ZTogc3RyaW5nfFNhZmVWYWx1ZSk6IHN0cmluZyB7XG4gIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIHJldHVybiB1bndyYXBTYWZlVmFsdWUodmFsdWUpO1xufVxuIl19