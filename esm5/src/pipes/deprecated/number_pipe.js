/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Inject, LOCALE_ID, Pipe } from '@angular/core';
import { NUMBER_FORMAT_REGEXP, parseIntAutoRadix } from '../../i18n/format_number';
import { NumberFormatStyle } from '../../i18n/locale_data_api';
import { invalidPipeArgumentError } from '../invalid_pipe_argument_error';
import { NumberFormatter } from './intl';
import * as i0 from "@angular/core";
function formatNumber(pipe, locale, value, style, digits, currency, currencyAsSymbol) {
    if (currency === void 0) { currency = null; }
    if (currencyAsSymbol === void 0) { currencyAsSymbol = false; }
    if (value == null)
        return null;
    // Convert strings to numbers
    value = typeof value === 'string' && !isNaN(+value - parseFloat(value)) ? +value : value;
    if (typeof value !== 'number') {
        throw invalidPipeArgumentError(pipe, value);
    }
    var minInt;
    var minFraction;
    var maxFraction;
    if (style !== NumberFormatStyle.Currency) {
        // rely on Intl default for currency
        minInt = 1;
        minFraction = 0;
        maxFraction = 3;
    }
    if (digits) {
        var parts = digits.match(NUMBER_FORMAT_REGEXP);
        if (parts === null) {
            throw new Error(digits + " is not a valid digit info for number pipes");
        }
        if (parts[1] != null) { // min integer digits
            minInt = parseIntAutoRadix(parts[1]);
        }
        if (parts[3] != null) { // min fraction digits
            minFraction = parseIntAutoRadix(parts[3]);
        }
        if (parts[5] != null) { // max fraction digits
            maxFraction = parseIntAutoRadix(parts[5]);
        }
    }
    return NumberFormatter.format(value, locale, style, {
        minimumIntegerDigits: minInt,
        minimumFractionDigits: minFraction,
        maximumFractionDigits: maxFraction,
        currency: currency,
        currencyAsSymbol: currencyAsSymbol,
    });
}
/**
 * Formats a number as text. Group sizing and separator and other locale-specific
 * configurations are based on the active locale.
 *
 * where `expression` is a number:
 *  - `digitInfo` is a `string` which has a following format: <br>
 *     <code>{minIntegerDigits}.{minFractionDigits}-{maxFractionDigits}</code>
 *   - `minIntegerDigits` is the minimum number of integer digits to use. Defaults to `1`.
 *   - `minFractionDigits` is the minimum number of digits after fraction. Defaults to `0`.
 *   - `maxFractionDigits` is the maximum number of digits after fraction. Defaults to `3`.
 *
 * For more information on the acceptable range for each of these numbers and other
 * details see your native internationalization library.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/number_pipe.ts region='DeprecatedNumberPipe'}
 *
 * @ngModule CommonModule
 * @publicApi
 */
var DeprecatedDecimalPipe = /** @class */ (function () {
    function DeprecatedDecimalPipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedDecimalPipe.prototype.transform = function (value, digits) {
        return formatNumber(DeprecatedDecimalPipe, this._locale, value, NumberFormatStyle.Decimal, digits);
    };
    DeprecatedDecimalPipe.ngFactoryDef = function DeprecatedDecimalPipe_Factory(t) { return new (t || DeprecatedDecimalPipe)(i0.ɵɵdirectiveInject(LOCALE_ID)); };
    DeprecatedDecimalPipe.ngPipeDef = i0.ɵɵdefinePipe({ name: "number", type: DeprecatedDecimalPipe, pure: true });
    return DeprecatedDecimalPipe;
}());
export { DeprecatedDecimalPipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedDecimalPipe, [{
        type: Pipe,
        args: [{ name: 'number' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Formats a number as percentage according to locale rules.
 *
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/percent_pipe.ts region='DeprecatedPercentPipe'}
 *
 * @publicApi
 */
var DeprecatedPercentPipe = /** @class */ (function () {
    function DeprecatedPercentPipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedPercentPipe.prototype.transform = function (value, digits) {
        return formatNumber(DeprecatedPercentPipe, this._locale, value, NumberFormatStyle.Percent, digits);
    };
    DeprecatedPercentPipe.ngFactoryDef = function DeprecatedPercentPipe_Factory(t) { return new (t || DeprecatedPercentPipe)(i0.ɵɵdirectiveInject(LOCALE_ID)); };
    DeprecatedPercentPipe.ngPipeDef = i0.ɵɵdefinePipe({ name: "percent", type: DeprecatedPercentPipe, pure: true });
    return DeprecatedPercentPipe;
}());
export { DeprecatedPercentPipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedPercentPipe, [{
        type: Pipe,
        args: [{ name: 'percent' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a number as currency using locale rules.
 *
 * Use `currency` to format a number as currency.
 *
 * - `currencyCode` is the [ISO 4217](https://en.wikipedia.org/wiki/ISO_4217) currency code, such
 *    as `USD` for the US dollar and `EUR` for the euro.
 * - `symbolDisplay` is a boolean indicating whether to use the currency symbol or code.
 *   - `true`: use symbol (e.g. `$`).
 *   - `false`(default): use code (e.g. `USD`).
 * - `digitInfo` See {@link DecimalPipe} for detailed description.
 *
 * WARNING: this pipe uses the Internationalization API which is not yet available in all browsers
 * and may require a polyfill. See [Browser Support](guide/browser-support) for details.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/pipes/ts/currency_pipe.ts region='DeprecatedCurrencyPipe'}
 *
 * @publicApi
 */
var DeprecatedCurrencyPipe = /** @class */ (function () {
    function DeprecatedCurrencyPipe(_locale) {
        this._locale = _locale;
    }
    DeprecatedCurrencyPipe.prototype.transform = function (value, currencyCode, symbolDisplay, digits) {
        if (currencyCode === void 0) { currencyCode = 'USD'; }
        if (symbolDisplay === void 0) { symbolDisplay = false; }
        return formatNumber(DeprecatedCurrencyPipe, this._locale, value, NumberFormatStyle.Currency, digits, currencyCode, symbolDisplay);
    };
    DeprecatedCurrencyPipe.ngFactoryDef = function DeprecatedCurrencyPipe_Factory(t) { return new (t || DeprecatedCurrencyPipe)(i0.ɵɵdirectiveInject(LOCALE_ID)); };
    DeprecatedCurrencyPipe.ngPipeDef = i0.ɵɵdefinePipe({ name: "currency", type: DeprecatedCurrencyPipe, pure: true });
    return DeprecatedCurrencyPipe;
}());
export { DeprecatedCurrencyPipe };
/*@__PURE__*/ i0.ɵsetClassMetadata(DeprecatedCurrencyPipe, [{
        type: Pipe,
        args: [{ name: 'currency' }]
    }], function () { return [{ type: undefined, decorators: [{
                type: Inject,
                args: [LOCALE_ID]
            }] }]; }, null);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnVtYmVyX3BpcGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL3BpcGVzL2RlcHJlY2F0ZWQvbnVtYmVyX3BpcGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFzQixNQUFNLGVBQWUsQ0FBQztBQUMzRSxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsaUJBQWlCLEVBQUMsTUFBTSwwQkFBMEIsQ0FBQztBQUNqRixPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSw0QkFBNEIsQ0FBQztBQUM3RCxPQUFPLEVBQUMsd0JBQXdCLEVBQUMsTUFBTSxnQ0FBZ0MsQ0FBQztBQUN4RSxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0sUUFBUSxDQUFDOztBQUV2QyxTQUFTLFlBQVksQ0FDakIsSUFBZSxFQUFFLE1BQWMsRUFBRSxLQUFzQixFQUFFLEtBQXdCLEVBQ2pGLE1BQXNCLEVBQUUsUUFBOEIsRUFDdEQsZ0JBQWlDO0lBRFQseUJBQUEsRUFBQSxlQUE4QjtJQUN0RCxpQ0FBQSxFQUFBLHdCQUFpQztJQUNuQyxJQUFJLEtBQUssSUFBSSxJQUFJO1FBQUUsT0FBTyxJQUFJLENBQUM7SUFFL0IsNkJBQTZCO0lBQzdCLEtBQUssR0FBRyxPQUFPLEtBQUssS0FBSyxRQUFRLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxLQUFLLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7SUFDekYsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsTUFBTSx3QkFBd0IsQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7S0FDN0M7SUFFRCxJQUFJLE1BQXdCLENBQUM7SUFD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VCxVQUNJLEtBQVUsRUFBRSxZQUE0QixFQUFFLGFBQThCLEVBQ3hFLE1BQWU7UUFESCw2QkFBQSxFQUFBLG9CQUE0QjtRQUFFLDhCQUFBLEVBQUEscUJBQThCO1FBRTFFLE9BQU8sWUFBWSxDQUNmLHNCQUFzQixFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLGlCQUFpQixDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQy9FLFlBQVksRUFBRSxhQUFhLENBQUMsQ0FBQztJQUNuQyxDQUFDO3dHQVRVLHNCQUFzQix1QkFDYixTQUFTO2lGQURsQixzQkFBc0I7aUNBMUpuQztDQW9LQyxBQVhELElBV0M7U0FWWSxzQkFBc0I7bUNBQXRCLHNCQUFzQjtjQURsQyxJQUFJO2VBQUMsRUFBQyxJQUFJLEVBQUUsVUFBVSxFQUFDOztzQkFFVCxNQUFNO3VCQUFDLFNBQVMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7SW5qZWN0LCBMT0NBTEVfSUQsIFBpcGUsIFBpcGVUcmFuc2Zvcm0sIFR5cGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtOVU1CRVJfRk9STUFUX1JFR0VYUCwgcGFyc2VJbnRBdXRvUmFkaXh9IGZyb20gJy4uLy4uL2kxOG4vZm9ybWF0X251bWJlcic7XG5pbXBvcnQge051bWJlckZvcm1hdFN0eWxlfSBmcm9tICcuLi8uLi9pMThuL2xvY2FsZV9kYXRhX2FwaSc7XG5pbXBvcnQge2ludmFsaWRQaXBlQXJndW1lbnRFcnJvcn0gZnJvbSAnLi4vaW52YWxpZF9waXBlX2FyZ3VtZW50X2Vycm9yJztcbmltcG9ydCB7TnVtYmVyRm9ybWF0dGVyfSBmcm9tICcuL2ludGwnO1xuXG5mdW5jdGlvbiBmb3JtYXROdW1iZXIoXG4gICAgcGlwZTogVHlwZTxhbnk+LCBsb2NhbGU6IHN0cmluZywgdmFsdWU6IG51bWJlciB8IHN0cmluZywgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlLFxuICAgIGRpZ2l0cz86IHN0cmluZyB8IG51bGwsIGN1cnJlbmN5OiBzdHJpbmcgfCBudWxsID0gbnVsbCxcbiAgICBjdXJyZW5jeUFzU3ltYm9sOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmd8bnVsbCB7XG4gIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gbnVsbDtcblxuICAvLyBDb252ZXJ0IHN0cmluZ3MgdG8gbnVtYmVyc1xuICB2YWx1ZSA9IHR5cGVvZiB2YWx1ZSA9PT0gJ3N0cmluZycgJiYgIWlzTmFOKCt2YWx1ZSAtIHBhcnNlRmxvYXQodmFsdWUpKSA/ICt2YWx1ZSA6IHZhbHVlO1xuICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJykge1xuICAgIHRocm93IGludmFsaWRQaXBlQXJndW1lbnRFcnJvcihwaXBlLCB2YWx1ZSk7XG4gIH1cblxuICBsZXQgbWluSW50OiBudW1iZXJ8dW5kZWZpbmVkO1xuICBsZXQgbWluRnJhY3Rpb246IG51bWJlcnx1bmRlZmluZWQ7XG4gIGxldCBtYXhGcmFjdGlvbjogbnVtYmVyfHVuZGVmaW5lZDtcbiAgaWYgKHN0eWxlICE9PSBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSkge1xuICAgIC8vIHJlbHkgb24gSW50bCBkZWZhdWx0IGZvciBjdXJyZW5jeVxuICAgIG1pbkludCA9IDE7XG4gICAgbWluRnJhY3Rpb24gPSAwO1xuICAgIG1heEZyYWN0aW9uID0gMztcbiAgfVxuXG4gIGlmIChkaWdpdHMpIHtcbiAgICBjb25zdCBwYXJ0cyA9IGRpZ2l0cy5tYXRjaChOVU1CRVJfRk9STUFUX1JFR0VYUCk7XG4gICAgaWYgKHBhcnRzID09PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7ZGlnaXRzfSBpcyBub3QgYSB2YWxpZCBkaWdpdCBpbmZvIGZvciBudW1iZXIgcGlwZXNgKTtcbiAgICB9XG4gICAgaWYgKHBhcnRzWzFdICE9IG51bGwpIHsgIC8vIG1pbiBpbnRlZ2VyIGRpZ2l0c1xuICAgICAgbWluSW50ID0gcGFyc2VJbnRBdXRvUmFkaXgocGFydHNbMV0pO1xuICAgIH1cbiAgICBpZiAocGFydHNbM10gIT0gbnVsbCkgeyAgLy8gbWluIGZyYWN0aW9uIGRpZ2l0c1xuICAgICAgbWluRnJhY3Rpb24gPSBwYXJzZUludEF1dG9SYWRpeChwYXJ0c1szXSk7XG4gICAgfVxuICAgIGlmIChwYXJ0c1s1XSAhPSBudWxsKSB7ICAvLyBtYXggZnJhY3Rpb24gZGlnaXRzXG4gICAgICBtYXhGcmFjdGlvbiA9IHBhcnNlSW50QXV0b1JhZGl4KHBhcnRzWzVdKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gTnVtYmVyRm9ybWF0dGVyLmZvcm1hdCh2YWx1ZSBhcyBudW1iZXIsIGxvY2FsZSwgc3R5bGUsIHtcbiAgICBtaW5pbXVtSW50ZWdlckRpZ2l0czogbWluSW50LFxuICAgIG1pbmltdW1GcmFjdGlvbkRpZ2l0czogbWluRnJhY3Rpb24sXG4gICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzOiBtYXhGcmFjdGlvbixcbiAgICBjdXJyZW5jeTogY3VycmVuY3ksXG4gICAgY3VycmVuY3lBc1N5bWJvbDogY3VycmVuY3lBc1N5bWJvbCxcbiAgfSk7XG59XG5cbi8qKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyB0ZXh0LiBHcm91cCBzaXppbmcgYW5kIHNlcGFyYXRvciBhbmQgb3RoZXIgbG9jYWxlLXNwZWNpZmljXG4gKiBjb25maWd1cmF0aW9ucyBhcmUgYmFzZWQgb24gdGhlIGFjdGl2ZSBsb2NhbGUuXG4gKlxuICogd2hlcmUgYGV4cHJlc3Npb25gIGlzIGEgbnVtYmVyOlxuICogIC0gYGRpZ2l0SW5mb2AgaXMgYSBgc3RyaW5nYCB3aGljaCBoYXMgYSBmb2xsb3dpbmcgZm9ybWF0OiA8YnI+XG4gKiAgICAgPGNvZGU+e21pbkludGVnZXJEaWdpdHN9LnttaW5GcmFjdGlvbkRpZ2l0c30te21heEZyYWN0aW9uRGlnaXRzfTwvY29kZT5cbiAqICAgLSBgbWluSW50ZWdlckRpZ2l0c2AgaXMgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGludGVnZXIgZGlnaXRzIHRvIHVzZS4gRGVmYXVsdHMgdG8gYDFgLlxuICogICAtIGBtaW5GcmFjdGlvbkRpZ2l0c2AgaXMgdGhlIG1pbmltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbi4gRGVmYXVsdHMgdG8gYDBgLlxuICogICAtIGBtYXhGcmFjdGlvbkRpZ2l0c2AgaXMgdGhlIG1heGltdW0gbnVtYmVyIG9mIGRpZ2l0cyBhZnRlciBmcmFjdGlvbi4gRGVmYXVsdHMgdG8gYDNgLlxuICpcbiAqIEZvciBtb3JlIGluZm9ybWF0aW9uIG9uIHRoZSBhY2NlcHRhYmxlIHJhbmdlIGZvciBlYWNoIG9mIHRoZXNlIG51bWJlcnMgYW5kIG90aGVyXG4gKiBkZXRhaWxzIHNlZSB5b3VyIG5hdGl2ZSBpbnRlcm5hdGlvbmFsaXphdGlvbiBsaWJyYXJ5LlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvbnVtYmVyX3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkTnVtYmVyUGlwZSd9XG4gKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQHB1YmxpY0FwaVxuICovXG5AUGlwZSh7bmFtZTogJ251bWJlcid9KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWREZWNpbWFsUGlwZSBpbXBsZW1lbnRzIFBpcGVUcmFuc2Zvcm0ge1xuICBjb25zdHJ1Y3RvcihASW5qZWN0KExPQ0FMRV9JRCkgcHJpdmF0ZSBfbG9jYWxlOiBzdHJpbmcpIHt9XG5cbiAgdHJhbnNmb3JtKHZhbHVlOiBhbnksIGRpZ2l0cz86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gZm9ybWF0TnVtYmVyKFxuICAgICAgICBEZXByZWNhdGVkRGVjaW1hbFBpcGUsIHRoaXMuX2xvY2FsZSwgdmFsdWUsIE51bWJlckZvcm1hdFN0eWxlLkRlY2ltYWwsIGRpZ2l0cyk7XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogRm9ybWF0cyBhIG51bWJlciBhcyBwZXJjZW50YWdlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogLSBgZGlnaXRJbmZvYCBTZWUge0BsaW5rIERlY2ltYWxQaXBlfSBmb3IgZGV0YWlsZWQgZGVzY3JpcHRpb24uXG4gKlxuICogV0FSTklORzogdGhpcyBwaXBlIHVzZXMgdGhlIEludGVybmF0aW9uYWxpemF0aW9uIEFQSSB3aGljaCBpcyBub3QgeWV0IGF2YWlsYWJsZSBpbiBhbGwgYnJvd3NlcnNcbiAqIGFuZCBtYXkgcmVxdWlyZSBhIHBvbHlmaWxsLiBTZWUgW0Jyb3dzZXIgU3VwcG9ydF0oZ3VpZGUvYnJvd3Nlci1zdXBwb3J0KSBmb3IgZGV0YWlscy5cbiAqXG4gKiBAdXNhZ2VOb3Rlc1xuICpcbiAqICMjIyBFeGFtcGxlXG4gKlxuICoge0BleGFtcGxlIGNvbW1vbi9waXBlcy90cy9wZXJjZW50X3BpcGUudHMgcmVnaW9uPSdEZXByZWNhdGVkUGVyY2VudFBpcGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdwZXJjZW50J30pXG5leHBvcnQgY2xhc3MgRGVwcmVjYXRlZFBlcmNlbnRQaXBlIGltcGxlbWVudHMgUGlwZVRyYW5zZm9ybSB7XG4gIGNvbnN0cnVjdG9yKEBJbmplY3QoTE9DQUxFX0lEKSBwcml2YXRlIF9sb2NhbGU6IHN0cmluZykge31cblxuICB0cmFuc2Zvcm0odmFsdWU6IGFueSwgZGlnaXRzPzogc3RyaW5nKTogc3RyaW5nfG51bGwge1xuICAgIHJldHVybiBmb3JtYXROdW1iZXIoXG4gICAgICAgIERlcHJlY2F0ZWRQZXJjZW50UGlwZSwgdGhpcy5fbG9jYWxlLCB2YWx1ZSwgTnVtYmVyRm9ybWF0U3R5bGUuUGVyY2VudCwgZGlnaXRzKTtcbiAgfVxufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBudW1iZXIgYXMgY3VycmVuY3kgdXNpbmcgbG9jYWxlIHJ1bGVzLlxuICpcbiAqIFVzZSBgY3VycmVuY3lgIHRvIGZvcm1hdCBhIG51bWJlciBhcyBjdXJyZW5jeS5cbiAqXG4gKiAtIGBjdXJyZW5jeUNvZGVgIGlzIHRoZSBbSVNPIDQyMTddKGh0dHBzOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0lTT180MjE3KSBjdXJyZW5jeSBjb2RlLCBzdWNoXG4gKiAgICBhcyBgVVNEYCBmb3IgdGhlIFVTIGRvbGxhciBhbmQgYEVVUmAgZm9yIHRoZSBldXJvLlxuICogLSBgc3ltYm9sRGlzcGxheWAgaXMgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciB0byB1c2UgdGhlIGN1cnJlbmN5IHN5bWJvbCBvciBjb2RlLlxuICogICAtIGB0cnVlYDogdXNlIHN5bWJvbCAoZS5nLiBgJGApLlxuICogICAtIGBmYWxzZWAoZGVmYXVsdCk6IHVzZSBjb2RlIChlLmcuIGBVU0RgKS5cbiAqIC0gYGRpZ2l0SW5mb2AgU2VlIHtAbGluayBEZWNpbWFsUGlwZX0gZm9yIGRldGFpbGVkIGRlc2NyaXB0aW9uLlxuICpcbiAqIFdBUk5JTkc6IHRoaXMgcGlwZSB1c2VzIHRoZSBJbnRlcm5hdGlvbmFsaXphdGlvbiBBUEkgd2hpY2ggaXMgbm90IHlldCBhdmFpbGFibGUgaW4gYWxsIGJyb3dzZXJzXG4gKiBhbmQgbWF5IHJlcXVpcmUgYSBwb2x5ZmlsbC4gU2VlIFtCcm93c2VyIFN1cHBvcnRdKGd1aWRlL2Jyb3dzZXItc3VwcG9ydCkgZm9yIGRldGFpbHMuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRXhhbXBsZVxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vcGlwZXMvdHMvY3VycmVuY3lfcGlwZS50cyByZWdpb249J0RlcHJlY2F0ZWRDdXJyZW5jeVBpcGUnfVxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQFBpcGUoe25hbWU6ICdjdXJyZW5jeSd9KVxuZXhwb3J0IGNsYXNzIERlcHJlY2F0ZWRDdXJyZW5jeVBpcGUgaW1wbGVtZW50cyBQaXBlVHJhbnNmb3JtIHtcbiAgY29uc3RydWN0b3IoQEluamVjdChMT0NBTEVfSUQpIHByaXZhdGUgX2xvY2FsZTogc3RyaW5nKSB7fVxuXG4gIHRyYW5zZm9ybShcbiAgICAgIHZhbHVlOiBhbnksIGN1cnJlbmN5Q29kZTogc3RyaW5nID0gJ1VTRCcsIHN5bWJvbERpc3BsYXk6IGJvb2xlYW4gPSBmYWxzZSxcbiAgICAgIGRpZ2l0cz86IHN0cmluZyk6IHN0cmluZ3xudWxsIHtcbiAgICByZXR1cm4gZm9ybWF0TnVtYmVyKFxuICAgICAgICBEZXByZWNhdGVkQ3VycmVuY3lQaXBlLCB0aGlzLl9sb2NhbGUsIHZhbHVlLCBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSwgZGlnaXRzLFxuICAgICAgICBjdXJyZW5jeUNvZGUsIHN5bWJvbERpc3BsYXkpO1xuICB9XG59XG4iXX0=