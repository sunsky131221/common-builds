/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, Injectable, LOCALE_ID } from '@angular/core';
import { getLocalePluralCase, Plural } from './locale_data_api';
import * as i0 from "@angular/core";
/**
 * @publicApi
 */
export class NgLocalization {
}
/**
 * Returns the plural category for a given value.
 * - "=value" when the case exists,
 * - the plural category otherwise
 */
export function getPluralCategory(value, cases, ngLocalization, locale) {
    let key = `=${value}`;
    if (cases.indexOf(key) > -1) {
        return key;
    }
    key = ngLocalization.getPluralCategory(value, locale);
    if (cases.indexOf(key) > -1) {
        return key;
    }
    if (cases.indexOf('other') > -1) {
        return 'other';
    }
    throw new Error(`No plural message found for value "${value}"`);
}
/**
 * Returns the plural case based on the locale
 *
 * @publicApi
 */
let NgLocaleLocalization = /** @class */ (() => {
    class NgLocaleLocalization extends NgLocalization {
        constructor(locale) {
            super();
            this.locale = locale;
        }
        getPluralCategory(value, locale) {
            const plural = getLocalePluralCase(locale || this.locale)(value);
            switch (plural) {
                case Plural.Zero:
                    return 'zero';
                case Plural.One:
                    return 'one';
                case Plural.Two:
                    return 'two';
                case Plural.Few:
                    return 'few';
                case Plural.Many:
                    return 'many';
                default:
                    return 'other';
            }
        }
    }
    NgLocaleLocalization.ɵfac = function NgLocaleLocalization_Factory(t) { return new (t || NgLocaleLocalization)(i0.ɵɵinject(LOCALE_ID)); };
    NgLocaleLocalization.ɵprov = i0.ɵɵdefineInjectable({ token: NgLocaleLocalization, factory: NgLocaleLocalization.ɵfac });
    return NgLocaleLocalization;
})();
export { NgLocaleLocalization };
/*@__PURE__*/ (function () { i0.ɵsetClassMetadata(NgLocaleLocalization, [{
        type: Injectable
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null); })();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYWxpemF0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9pMThuL2xvY2FsaXphdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFFNUQsT0FBTyxFQUFDLG1CQUFtQixFQUFFLE1BQU0sRUFBQyxNQUFNLG1CQUFtQixDQUFDOztBQUc5RDs7R0FFRztBQUNILE1BQU0sT0FBZ0IsY0FBYztDQUVuQztBQUdEOzs7O0dBSUc7QUFDSCxNQUFNLFVBQVUsaUJBQWlCLENBQzdCLEtBQWEsRUFBRSxLQUFlLEVBQUUsY0FBOEIsRUFBRSxNQUFlO0lBQ2pGLElBQUksR0FBRyxHQUFHLElBQUksS0FBSyxFQUFFLENBQUM7SUFFdEIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFO1FBQzNCLE9BQU8sR0FBRyxDQUFDO0tBQ1o7SUFFRCxHQUFHLEdBQUcsY0FBYyxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztJQUV0RCxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUU7UUFDM0IsT0FBTyxHQUFHLENBQUM7S0FDWjtJQUVELElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRTtRQUMvQixPQUFPLE9BQU8sQ0FBQztLQUNoQjtJQUVELE1BQU0sSUFBSSxLQUFLLENBQUMsc0NBQXNDLEtBQUssR0FBRyxDQUFDLENBQUM7QUFDbEUsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSDtJQUFBLE1BQ2Esb0JBQXFCLFNBQVEsY0FBYztRQUN0RCxZQUF5QyxNQUFjO1lBQ3JELEtBQUssRUFBRSxDQUFDO1lBRCtCLFdBQU0sR0FBTixNQUFNLENBQVE7UUFFdkQsQ0FBQztRQUVELGlCQUFpQixDQUFDLEtBQVUsRUFBRSxNQUFlO1lBQzNDLE1BQU0sTUFBTSxHQUFHLG1CQUFtQixDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFFakUsUUFBUSxNQUFNLEVBQUU7Z0JBQ2QsS0FBSyxNQUFNLENBQUMsSUFBSTtvQkFDZCxPQUFPLE1BQU0sQ0FBQztnQkFDaEIsS0FBSyxNQUFNLENBQUMsR0FBRztvQkFDYixPQUFPLEtBQUssQ0FBQztnQkFDZixLQUFLLE1BQU0sQ0FBQyxHQUFHO29CQUNiLE9BQU8sS0FBSyxDQUFDO2dCQUNmLEtBQUssTUFBTSxDQUFDLEdBQUc7b0JBQ2IsT0FBTyxLQUFLLENBQUM7Z0JBQ2YsS0FBSyxNQUFNLENBQUMsSUFBSTtvQkFDZCxPQUFPLE1BQU0sQ0FBQztnQkFDaEI7b0JBQ0UsT0FBTyxPQUFPLENBQUM7YUFDbEI7UUFDSCxDQUFDOzs0RkF0QlUsb0JBQW9CLGNBQ1gsU0FBUztnRUFEbEIsb0JBQW9CLFdBQXBCLG9CQUFvQjsrQkFyRGpDO0tBNEVDO1NBdkJZLG9CQUFvQjtrREFBcEIsb0JBQW9CO2NBRGhDLFVBQVU7O3NCQUVJLE1BQU07dUJBQUMsU0FBUyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIExPQ0FMRV9JRH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7Z2V0TG9jYWxlUGx1cmFsQ2FzZSwgUGx1cmFsfSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cblxuLyoqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0xvY2FsaXphdGlvbiB7XG4gIGFic3RyYWN0IGdldFBsdXJhbENhdGVnb3J5KHZhbHVlOiBhbnksIGxvY2FsZT86IHN0cmluZyk6IHN0cmluZztcbn1cblxuXG4vKipcbiAqIFJldHVybnMgdGhlIHBsdXJhbCBjYXRlZ29yeSBmb3IgYSBnaXZlbiB2YWx1ZS5cbiAqIC0gXCI9dmFsdWVcIiB3aGVuIHRoZSBjYXNlIGV4aXN0cyxcbiAqIC0gdGhlIHBsdXJhbCBjYXRlZ29yeSBvdGhlcndpc2VcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFBsdXJhbENhdGVnb3J5KFxuICAgIHZhbHVlOiBudW1iZXIsIGNhc2VzOiBzdHJpbmdbXSwgbmdMb2NhbGl6YXRpb246IE5nTG9jYWxpemF0aW9uLCBsb2NhbGU/OiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQga2V5ID0gYD0ke3ZhbHVlfWA7XG5cbiAgaWYgKGNhc2VzLmluZGV4T2Yoa2V5KSA+IC0xKSB7XG4gICAgcmV0dXJuIGtleTtcbiAgfVxuXG4gIGtleSA9IG5nTG9jYWxpemF0aW9uLmdldFBsdXJhbENhdGVnb3J5KHZhbHVlLCBsb2NhbGUpO1xuXG4gIGlmIChjYXNlcy5pbmRleE9mKGtleSkgPiAtMSkge1xuICAgIHJldHVybiBrZXk7XG4gIH1cblxuICBpZiAoY2FzZXMuaW5kZXhPZignb3RoZXInKSA+IC0xKSB7XG4gICAgcmV0dXJuICdvdGhlcic7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoYE5vIHBsdXJhbCBtZXNzYWdlIGZvdW5kIGZvciB2YWx1ZSBcIiR7dmFsdWV9XCJgKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBwbHVyYWwgY2FzZSBiYXNlZCBvbiB0aGUgbG9jYWxlXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdMb2NhbGVMb2NhbGl6YXRpb24gZXh0ZW5kcyBOZ0xvY2FsaXphdGlvbiB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcm90ZWN0ZWQgbG9jYWxlOiBzdHJpbmcpIHtcbiAgICBzdXBlcigpO1xuICB9XG5cbiAgZ2V0UGx1cmFsQ2F0ZWdvcnkodmFsdWU6IGFueSwgbG9jYWxlPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBjb25zdCBwbHVyYWwgPSBnZXRMb2NhbGVQbHVyYWxDYXNlKGxvY2FsZSB8fCB0aGlzLmxvY2FsZSkodmFsdWUpO1xuXG4gICAgc3dpdGNoIChwbHVyYWwpIHtcbiAgICAgIGNhc2UgUGx1cmFsLlplcm86XG4gICAgICAgIHJldHVybiAnemVybyc7XG4gICAgICBjYXNlIFBsdXJhbC5PbmU6XG4gICAgICAgIHJldHVybiAnb25lJztcbiAgICAgIGNhc2UgUGx1cmFsLlR3bzpcbiAgICAgICAgcmV0dXJuICd0d28nO1xuICAgICAgY2FzZSBQbHVyYWwuRmV3OlxuICAgICAgICByZXR1cm4gJ2Zldyc7XG4gICAgICBjYXNlIFBsdXJhbC5NYW55OlxuICAgICAgICByZXR1cm4gJ21hbnknO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgcmV0dXJuICdvdGhlcic7XG4gICAgfVxuICB9XG59XG4iXX0=