/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { NumberFormatStyle } from '../../i18n/locale_data_api';
export class NumberFormatter {
    /**
     * @param {?} num
     * @param {?} locale
     * @param {?} style
     * @param {?=} opts
     * @return {?}
     */
    static format(num, locale, style, opts = {}) {
        const { minimumIntegerDigits, minimumFractionDigits, maximumFractionDigits, currency, currencyAsSymbol = false } = opts;
        /** @type {?} */
        const options = {
            minimumIntegerDigits,
            minimumFractionDigits,
            maximumFractionDigits,
            style: NumberFormatStyle[style].toLowerCase()
        };
        if (style == NumberFormatStyle.Currency) {
            options.currency = typeof currency == 'string' ? currency : undefined;
            options.currencyDisplay = currencyAsSymbol ? 'symbol' : 'code';
        }
        return new Intl.NumberFormat(locale, options).format(num);
    }
}
/** @type {?} */
const DATE_FORMATS_SPLIT = /((?:[^yMLdHhmsazZEwGjJ']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|L+|d+|H+|h+|J+|j+|m+|s+|a|z|Z|G+|w+))(.*)/;
/** @type {?} */
const PATTERN_ALIASES = {
    // Keys are quoted so they do not get renamed during closure compilation.
    'yMMMdjms': datePartGetterFactory(combine([
        digitCondition('year', 1),
        nameCondition('month', 3),
        digitCondition('day', 1),
        digitCondition('hour', 1),
        digitCondition('minute', 1),
        digitCondition('second', 1),
    ])),
    'yMdjm': datePartGetterFactory(combine([
        digitCondition('year', 1), digitCondition('month', 1), digitCondition('day', 1),
        digitCondition('hour', 1), digitCondition('minute', 1)
    ])),
    'yMMMMEEEEd': datePartGetterFactory(combine([
        digitCondition('year', 1), nameCondition('month', 4), nameCondition('weekday', 4),
        digitCondition('day', 1)
    ])),
    'yMMMMd': datePartGetterFactory(combine([digitCondition('year', 1), nameCondition('month', 4), digitCondition('day', 1)])),
    'yMMMd': datePartGetterFactory(combine([digitCondition('year', 1), nameCondition('month', 3), digitCondition('day', 1)])),
    'yMd': datePartGetterFactory(combine([digitCondition('year', 1), digitCondition('month', 1), digitCondition('day', 1)])),
    'jms': datePartGetterFactory(combine([digitCondition('hour', 1), digitCondition('second', 1), digitCondition('minute', 1)])),
    'jm': datePartGetterFactory(combine([digitCondition('hour', 1), digitCondition('minute', 1)]))
};
/** @type {?} */
const DATE_FORMATS = {
    // Keys are quoted so they do not get renamed.
    'yyyy': datePartGetterFactory(digitCondition('year', 4)),
    'yy': datePartGetterFactory(digitCondition('year', 2)),
    'y': datePartGetterFactory(digitCondition('year', 1)),
    'MMMM': datePartGetterFactory(nameCondition('month', 4)),
    'MMM': datePartGetterFactory(nameCondition('month', 3)),
    'MM': datePartGetterFactory(digitCondition('month', 2)),
    'M': datePartGetterFactory(digitCondition('month', 1)),
    'LLLL': datePartGetterFactory(nameCondition('month', 4)),
    'L': datePartGetterFactory(nameCondition('month', 1)),
    'dd': datePartGetterFactory(digitCondition('day', 2)),
    'd': datePartGetterFactory(digitCondition('day', 1)),
    'HH': digitModifier(hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 2), false)))),
    'H': hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 1), false))),
    'hh': digitModifier(hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 2), true)))),
    'h': hourExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 1), true))),
    'jj': datePartGetterFactory(digitCondition('hour', 2)),
    'j': datePartGetterFactory(digitCondition('hour', 1)),
    'mm': digitModifier(datePartGetterFactory(digitCondition('minute', 2))),
    'm': datePartGetterFactory(digitCondition('minute', 1)),
    'ss': digitModifier(datePartGetterFactory(digitCondition('second', 2))),
    's': datePartGetterFactory(digitCondition('second', 1)),
    // while ISO 8601 requires fractions to be prefixed with `.` or `,`
    // we can be just safely rely on using `sss` since we currently don't support single or two digit
    // fractions
    'sss': datePartGetterFactory(digitCondition('second', 3)),
    'EEEE': datePartGetterFactory(nameCondition('weekday', 4)),
    'EEE': datePartGetterFactory(nameCondition('weekday', 3)),
    'EE': datePartGetterFactory(nameCondition('weekday', 2)),
    'E': datePartGetterFactory(nameCondition('weekday', 1)),
    'a': hourClockExtractor(datePartGetterFactory(hour12Modify(digitCondition('hour', 1), true))),
    'Z': timeZoneGetter('short'),
    'z': timeZoneGetter('long'),
    'ww': datePartGetterFactory({}),
    // Week of year, padded (00-53). Week 01 is the week with the
    // first Thursday of the year. not support ?
    'w': datePartGetterFactory({}),
    // Week of year (0-53). Week 1 is the week with the first Thursday
    // of the year not support ?
    'G': datePartGetterFactory(nameCondition('era', 1)),
    'GG': datePartGetterFactory(nameCondition('era', 2)),
    'GGG': datePartGetterFactory(nameCondition('era', 3)),
    'GGGG': datePartGetterFactory(nameCondition('era', 4))
};
/**
 * @param {?} inner
 * @return {?}
 */
function digitModifier(inner) {
    return function (date, locale) {
        /** @type {?} */
        const result = inner(date, locale);
        return result.length == 1 ? '0' + result : result;
    };
}
/**
 * @param {?} inner
 * @return {?}
 */
function hourClockExtractor(inner) {
    return function (date, locale) { return inner(date, locale).split(' ')[1]; };
}
/**
 * @param {?} inner
 * @return {?}
 */
function hourExtractor(inner) {
    return function (date, locale) { return inner(date, locale).split(' ')[0]; };
}
/**
 * @param {?} date
 * @param {?} locale
 * @param {?} options
 * @return {?}
 */
function intlDateFormat(date, locale, options) {
    return new Intl.DateTimeFormat(locale, options).format(date).replace(/[\u200e\u200f]/g, '');
}
/**
 * @param {?} timezone
 * @return {?}
 */
function timeZoneGetter(timezone) {
    // To workaround `Intl` API restriction for single timezone let format with 24 hours
    /** @type {?} */
    const options = { hour: '2-digit', hour12: false, timeZoneName: timezone };
    return function (date, locale) {
        /** @type {?} */
        const result = intlDateFormat(date, locale, options);
        // Then extract first 3 letters that related to hours
        return result ? result.substring(3) : '';
    };
}
/**
 * @param {?} options
 * @param {?} value
 * @return {?}
 */
function hour12Modify(options, value) {
    options.hour12 = value;
    return options;
}
/**
 * @param {?} prop
 * @param {?} len
 * @return {?}
 */
function digitCondition(prop, len) {
    /** @type {?} */
    const result = {};
    result[prop] = len === 2 ? '2-digit' : 'numeric';
    return result;
}
/**
 * @param {?} prop
 * @param {?} len
 * @return {?}
 */
function nameCondition(prop, len) {
    /** @type {?} */
    const result = {};
    if (len < 4) {
        result[prop] = len > 1 ? 'short' : 'narrow';
    }
    else {
        result[prop] = 'long';
    }
    return result;
}
/**
 * @param {?} options
 * @return {?}
 */
function combine(options) {
    return options.reduce((merged, opt) => (Object.assign({}, merged, opt)), {});
}
/**
 * @param {?} ret
 * @return {?}
 */
function datePartGetterFactory(ret) {
    return (date, locale) => intlDateFormat(date, locale, ret);
}
/** @type {?} */
const DATE_FORMATTER_CACHE = new Map();
/**
 * @param {?} format
 * @param {?} date
 * @param {?} locale
 * @return {?}
 */
function dateFormatter(format, date, locale) {
    /** @type {?} */
    const fn = PATTERN_ALIASES[format];
    if (fn)
        return fn(date, locale);
    /** @type {?} */
    const cacheKey = format;
    /** @type {?} */
    let parts = DATE_FORMATTER_CACHE.get(cacheKey);
    if (!parts) {
        parts = [];
        /** @type {?} */
        let match;
        DATE_FORMATS_SPLIT.exec(format);
        /** @type {?} */
        let _format = format;
        while (_format) {
            match = DATE_FORMATS_SPLIT.exec(_format);
            if (match) {
                parts = parts.concat(match.slice(1));
                _format = (/** @type {?} */ (parts.pop()));
            }
            else {
                parts.push(_format);
                _format = null;
            }
        }
        DATE_FORMATTER_CACHE.set(cacheKey, parts);
    }
    return parts.reduce((text, part) => {
        /** @type {?} */
        const fn = DATE_FORMATS[part];
        return text + (fn ? fn(date, locale) : partToTime(part));
    }, '');
}
/**
 * @param {?} part
 * @return {?}
 */
function partToTime(part) {
    return part === '\'\'' ? '\'' : part.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
}
export class DateFormatter {
    /**
     * @param {?} date
     * @param {?} locale
     * @param {?} pattern
     * @return {?}
     */
    static format(date, locale, pattern) {
        return dateFormatter(pattern, date, locale);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50bC5qcyIsInNvdXJjZVJvb3QiOiIuLi8uLi8iLCJzb3VyY2VzIjpbInBhY2thZ2VzL2NvbW1vbi9zcmMvcGlwZXMvZGVwcmVjYXRlZC9pbnRsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sNEJBQTRCLENBQUM7QUFFN0QsTUFBTSxPQUFPLGVBQWU7Ozs7Ozs7O0lBQzFCLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBVyxFQUFFLE1BQWMsRUFBRSxLQUF3QixFQUFFLE9BTWpFLEVBQUU7Y0FDRSxFQUFDLG9CQUFvQixFQUFFLHFCQUFxQixFQUFFLHFCQUFxQixFQUFFLFFBQVEsRUFDNUUsZ0JBQWdCLEdBQUcsS0FBSyxFQUFDLEdBQUcsSUFBSTs7Y0FDakMsT0FBTyxHQUE2QjtZQUN4QyxvQkFBb0I7WUFDcEIscUJBQXFCO1lBQ3JCLHFCQUFxQjtZQUNyQixLQUFLLEVBQUUsaUJBQWlCLENBQUMsS0FBSyxDQUFDLENBQUMsV0FBVyxFQUFFO1NBQzlDO1FBRUQsSUFBSSxLQUFLLElBQUksaUJBQWlCLENBQUMsUUFBUSxFQUFFO1lBQ3ZDLE9BQU8sQ0FBQyxRQUFRLEdBQUcsT0FBTyxRQUFRLElBQUksUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQztZQUN0RSxPQUFPLENBQUMsZUFBZSxHQUFHLGdCQUFnQixDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztTQUNoRTtRQUNELE9BQU8sSUFBSSxJQUFJLENBQUMsWUFBWSxDQUFDLE1BQU0sRUFBRSxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDNUQsQ0FBQztDQUNGOztNQUlLLGtCQUFrQixHQUNwQixxR0FBcUc7O01BRW5HLGVBQWUsR0FBd0M7O0lBRTNELFVBQVUsRUFBRSxxQkFBcUIsQ0FBQyxPQUFPLENBQUM7UUFDeEMsY0FB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QUNyQyxPQUFPLEdBQUcsbUJBQUEsS0FBSyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQUM7YUFDekI7aUJBQU07Z0JBQ0wsS0FBSyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztnQkFDcEIsT0FBTyxHQUFHLElBQUksQ0FBQzthQUNoQjtTQUNGO1FBRUQsb0JBQW9CLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxLQUFLLENBQUMsQ0FBQztLQUMzQztJQUVELE9BQU8sS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsRUFBRTs7Y0FDM0IsRUFBRSxHQUFHLFlBQVksQ0FBQyxJQUFJLENBQUM7UUFDN0IsT0FBTyxJQUFJLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQzNELENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUNULENBQUM7Ozs7O0FBRUQsU0FBUyxVQUFVLENBQUMsSUFBWTtJQUM5QixPQUFPLElBQUksS0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxVQUFVLEVBQUUsRUFBRSxDQUFDLENBQUMsT0FBTyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBRUQsTUFBTSxPQUFPLGFBQWE7Ozs7Ozs7SUFDeEIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFVLEVBQUUsTUFBYyxFQUFFLE9BQWU7UUFDdkQsT0FBTyxhQUFhLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztJQUM5QyxDQUFDO0NBQ0YiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge051bWJlckZvcm1hdFN0eWxlfSBmcm9tICcuLi8uLi9pMThuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbmV4cG9ydCBjbGFzcyBOdW1iZXJGb3JtYXR0ZXIge1xuICBzdGF0aWMgZm9ybWF0KG51bTogbnVtYmVyLCBsb2NhbGU6IHN0cmluZywgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlLCBvcHRzOiB7XG4gICAgbWluaW11bUludGVnZXJEaWdpdHM/OiBudW1iZXIsXG4gICAgbWluaW11bUZyYWN0aW9uRGlnaXRzPzogbnVtYmVyLFxuICAgIG1heGltdW1GcmFjdGlvbkRpZ2l0cz86IG51bWJlcixcbiAgICBjdXJyZW5jeT86IHN0cmluZ3xudWxsLFxuICAgIGN1cnJlbmN5QXNTeW1ib2w/OiBib29sZWFuXG4gIH0gPSB7fSk6IHN0cmluZyB7XG4gICAgY29uc3Qge21pbmltdW1JbnRlZ2VyRGlnaXRzLCBtaW5pbXVtRnJhY3Rpb25EaWdpdHMsIG1heGltdW1GcmFjdGlvbkRpZ2l0cywgY3VycmVuY3ksXG4gICAgICAgICAgIGN1cnJlbmN5QXNTeW1ib2wgPSBmYWxzZX0gPSBvcHRzO1xuICAgIGNvbnN0IG9wdGlvbnM6IEludGwuTnVtYmVyRm9ybWF0T3B0aW9ucyA9IHtcbiAgICAgIG1pbmltdW1JbnRlZ2VyRGlnaXRzLFxuICAgICAgbWluaW11bUZyYWN0aW9uRGlnaXRzLFxuICAgICAgbWF4aW11bUZyYWN0aW9uRGlnaXRzLFxuICAgICAgc3R5bGU6IE51bWJlckZvcm1hdFN0eWxlW3N0eWxlXS50b0xvd2VyQ2FzZSgpXG4gICAgfTtcblxuICAgIGlmIChzdHlsZSA9PSBOdW1iZXJGb3JtYXRTdHlsZS5DdXJyZW5jeSkge1xuICAgICAgb3B0aW9ucy5jdXJyZW5jeSA9IHR5cGVvZiBjdXJyZW5jeSA9PSAnc3RyaW5nJyA/IGN1cnJlbmN5IDogdW5kZWZpbmVkO1xuICAgICAgb3B0aW9ucy5jdXJyZW5jeURpc3BsYXkgPSBjdXJyZW5jeUFzU3ltYm9sID8gJ3N5bWJvbCcgOiAnY29kZSc7XG4gICAgfVxuICAgIHJldHVybiBuZXcgSW50bC5OdW1iZXJGb3JtYXQobG9jYWxlLCBvcHRpb25zKS5mb3JtYXQobnVtKTtcbiAgfVxufVxuXG50eXBlIERhdGVGb3JtYXR0ZXJGbiA9IChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZykgPT4gc3RyaW5nO1xuXG5jb25zdCBEQVRFX0ZPUk1BVFNfU1BMSVQgPVxuICAgIC8oKD86W155TUxkSGhtc2F6WkV3R2pKJ10rKXwoPzonKD86W14nXXwnJykqJyl8KD86RSt8eSt8TSt8TCt8ZCt8SCt8aCt8Sit8ait8bSt8cyt8YXx6fFp8Ryt8dyspKSguKikvO1xuXG5jb25zdCBQQVRURVJOX0FMSUFTRVM6IHtbZm9ybWF0OiBzdHJpbmddOiBEYXRlRm9ybWF0dGVyRm59ID0ge1xuICAvLyBLZXlzIGFyZSBxdW90ZWQgc28gdGhleSBkbyBub3QgZ2V0IHJlbmFtZWQgZHVyaW5nIGNsb3N1cmUgY29tcGlsYXRpb24uXG4gICd5TU1NZGptcyc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShjb21iaW5lKFtcbiAgICBkaWdpdENvbmRpdGlvbigneWVhcicsIDEpLFxuICAgIG5hbWVDb25kaXRpb24oJ21vbnRoJywgMyksXG4gICAgZGlnaXRDb25kaXRpb24oJ2RheScsIDEpLFxuICAgIGRpZ2l0Q29uZGl0aW9uKCdob3VyJywgMSksXG4gICAgZGlnaXRDb25kaXRpb24oJ21pbnV0ZScsIDEpLFxuICAgIGRpZ2l0Q29uZGl0aW9uKCdzZWNvbmQnLCAxKSxcbiAgXSkpLFxuICAneU1kam0nOiBkYXRlUGFydEdldHRlckZhY3RvcnkoY29tYmluZShbXG4gICAgZGlnaXRDb25kaXRpb24oJ3llYXInLCAxKSwgZGlnaXRDb25kaXRpb24oJ21vbnRoJywgMSksIGRpZ2l0Q29uZGl0aW9uKCdkYXknLCAxKSxcbiAgICBkaWdpdENvbmRpdGlvbignaG91cicsIDEpLCBkaWdpdENvbmRpdGlvbignbWludXRlJywgMSlcbiAgXSkpLFxuICAneU1NTU1FRUVFZCc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShjb21iaW5lKFtcbiAgICBkaWdpdENvbmRpdGlvbigneWVhcicsIDEpLCBuYW1lQ29uZGl0aW9uKCdtb250aCcsIDQpLCBuYW1lQ29uZGl0aW9uKCd3ZWVrZGF5JywgNCksXG4gICAgZGlnaXRDb25kaXRpb24oJ2RheScsIDEpXG4gIF0pKSxcbiAgJ3lNTU1NZCc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShcbiAgICAgIGNvbWJpbmUoW2RpZ2l0Q29uZGl0aW9uKCd5ZWFyJywgMSksIG5hbWVDb25kaXRpb24oJ21vbnRoJywgNCksIGRpZ2l0Q29uZGl0aW9uKCdkYXknLCAxKV0pKSxcbiAgJ3lNTU1kJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KFxuICAgICAgY29tYmluZShbZGlnaXRDb25kaXRpb24oJ3llYXInLCAxKSwgbmFtZUNvbmRpdGlvbignbW9udGgnLCAzKSwgZGlnaXRDb25kaXRpb24oJ2RheScsIDEpXSkpLFxuICAneU1kJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KFxuICAgICAgY29tYmluZShbZGlnaXRDb25kaXRpb24oJ3llYXInLCAxKSwgZGlnaXRDb25kaXRpb24oJ21vbnRoJywgMSksIGRpZ2l0Q29uZGl0aW9uKCdkYXknLCAxKV0pKSxcbiAgJ2ptcyc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShjb21iaW5lKFxuICAgICAgW2RpZ2l0Q29uZGl0aW9uKCdob3VyJywgMSksIGRpZ2l0Q29uZGl0aW9uKCdzZWNvbmQnLCAxKSwgZGlnaXRDb25kaXRpb24oJ21pbnV0ZScsIDEpXSkpLFxuICAnam0nOiBkYXRlUGFydEdldHRlckZhY3RvcnkoY29tYmluZShbZGlnaXRDb25kaXRpb24oJ2hvdXInLCAxKSwgZGlnaXRDb25kaXRpb24oJ21pbnV0ZScsIDEpXSkpXG59O1xuXG5jb25zdCBEQVRFX0ZPUk1BVFM6IHtbZm9ybWF0OiBzdHJpbmddOiBEYXRlRm9ybWF0dGVyRm59ID0ge1xuICAvLyBLZXlzIGFyZSBxdW90ZWQgc28gdGhleSBkbyBub3QgZ2V0IHJlbmFtZWQuXG4gICd5eXl5JzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KGRpZ2l0Q29uZGl0aW9uKCd5ZWFyJywgNCkpLFxuICAneXknOiBkYXRlUGFydEdldHRlckZhY3RvcnkoZGlnaXRDb25kaXRpb24oJ3llYXInLCAyKSksXG4gICd5JzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KGRpZ2l0Q29uZGl0aW9uKCd5ZWFyJywgMSkpLFxuICAnTU1NTSc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShuYW1lQ29uZGl0aW9uKCdtb250aCcsIDQpKSxcbiAgJ01NTSc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShuYW1lQ29uZGl0aW9uKCdtb250aCcsIDMpKSxcbiAgJ01NJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KGRpZ2l0Q29uZGl0aW9uKCdtb250aCcsIDIpKSxcbiAgJ00nOiBkYXRlUGFydEdldHRlckZhY3RvcnkoZGlnaXRDb25kaXRpb24oJ21vbnRoJywgMSkpLFxuICAnTExMTCc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShuYW1lQ29uZGl0aW9uKCdtb250aCcsIDQpKSxcbiAgJ0wnOiBkYXRlUGFydEdldHRlckZhY3RvcnkobmFtZUNvbmRpdGlvbignbW9udGgnLCAxKSksXG4gICdkZCc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShkaWdpdENvbmRpdGlvbignZGF5JywgMikpLFxuICAnZCc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShkaWdpdENvbmRpdGlvbignZGF5JywgMSkpLFxuICAnSEgnOiBkaWdpdE1vZGlmaWVyKFxuICAgICAgaG91ckV4dHJhY3RvcihkYXRlUGFydEdldHRlckZhY3RvcnkoaG91cjEyTW9kaWZ5KGRpZ2l0Q29uZGl0aW9uKCdob3VyJywgMiksIGZhbHNlKSkpKSxcbiAgJ0gnOiBob3VyRXh0cmFjdG9yKGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShob3VyMTJNb2RpZnkoZGlnaXRDb25kaXRpb24oJ2hvdXInLCAxKSwgZmFsc2UpKSksXG4gICdoaCc6IGRpZ2l0TW9kaWZpZXIoXG4gICAgICBob3VyRXh0cmFjdG9yKGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShob3VyMTJNb2RpZnkoZGlnaXRDb25kaXRpb24oJ2hvdXInLCAyKSwgdHJ1ZSkpKSksXG4gICdoJzogaG91ckV4dHJhY3RvcihkYXRlUGFydEdldHRlckZhY3RvcnkoaG91cjEyTW9kaWZ5KGRpZ2l0Q29uZGl0aW9uKCdob3VyJywgMSksIHRydWUpKSksXG4gICdqaic6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShkaWdpdENvbmRpdGlvbignaG91cicsIDIpKSxcbiAgJ2onOiBkYXRlUGFydEdldHRlckZhY3RvcnkoZGlnaXRDb25kaXRpb24oJ2hvdXInLCAxKSksXG4gICdtbSc6IGRpZ2l0TW9kaWZpZXIoZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KGRpZ2l0Q29uZGl0aW9uKCdtaW51dGUnLCAyKSkpLFxuICAnbSc6IGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShkaWdpdENvbmRpdGlvbignbWludXRlJywgMSkpLFxuICAnc3MnOiBkaWdpdE1vZGlmaWVyKGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShkaWdpdENvbmRpdGlvbignc2Vjb25kJywgMikpKSxcbiAgJ3MnOiBkYXRlUGFydEdldHRlckZhY3RvcnkoZGlnaXRDb25kaXRpb24oJ3NlY29uZCcsIDEpKSxcbiAgLy8gd2hpbGUgSVNPIDg2MDEgcmVxdWlyZXMgZnJhY3Rpb25zIHRvIGJlIHByZWZpeGVkIHdpdGggYC5gIG9yIGAsYFxuICAvLyB3ZSBjYW4gYmUganVzdCBzYWZlbHkgcmVseSBvbiB1c2luZyBgc3NzYCBzaW5jZSB3ZSBjdXJyZW50bHkgZG9uJ3Qgc3VwcG9ydCBzaW5nbGUgb3IgdHdvIGRpZ2l0XG4gIC8vIGZyYWN0aW9uc1xuICAnc3NzJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KGRpZ2l0Q29uZGl0aW9uKCdzZWNvbmQnLCAzKSksXG4gICdFRUVFJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KG5hbWVDb25kaXRpb24oJ3dlZWtkYXknLCA0KSksXG4gICdFRUUnOiBkYXRlUGFydEdldHRlckZhY3RvcnkobmFtZUNvbmRpdGlvbignd2Vla2RheScsIDMpKSxcbiAgJ0VFJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KG5hbWVDb25kaXRpb24oJ3dlZWtkYXknLCAyKSksXG4gICdFJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KG5hbWVDb25kaXRpb24oJ3dlZWtkYXknLCAxKSksXG4gICdhJzogaG91ckNsb2NrRXh0cmFjdG9yKGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShob3VyMTJNb2RpZnkoZGlnaXRDb25kaXRpb24oJ2hvdXInLCAxKSwgdHJ1ZSkpKSxcbiAgJ1onOiB0aW1lWm9uZUdldHRlcignc2hvcnQnKSxcbiAgJ3onOiB0aW1lWm9uZUdldHRlcignbG9uZycpLFxuICAnd3cnOiBkYXRlUGFydEdldHRlckZhY3Rvcnkoe30pLCAgLy8gV2VlayBvZiB5ZWFyLCBwYWRkZWQgKDAwLTUzKS4gV2VlayAwMSBpcyB0aGUgd2VlayB3aXRoIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gZmlyc3QgVGh1cnNkYXkgb2YgdGhlIHllYXIuIG5vdCBzdXBwb3J0ID9cbiAgJ3cnOlxuICAgICAgZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KHt9KSwgIC8vIFdlZWsgb2YgeWVhciAoMC01MykuIFdlZWsgMSBpcyB0aGUgd2VlayB3aXRoIHRoZSBmaXJzdCBUaHVyc2RheVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIG9mIHRoZSB5ZWFyIG5vdCBzdXBwb3J0ID9cbiAgJ0cnOiBkYXRlUGFydEdldHRlckZhY3RvcnkobmFtZUNvbmRpdGlvbignZXJhJywgMSkpLFxuICAnR0cnOiBkYXRlUGFydEdldHRlckZhY3RvcnkobmFtZUNvbmRpdGlvbignZXJhJywgMikpLFxuICAnR0dHJzogZGF0ZVBhcnRHZXR0ZXJGYWN0b3J5KG5hbWVDb25kaXRpb24oJ2VyYScsIDMpKSxcbiAgJ0dHR0cnOiBkYXRlUGFydEdldHRlckZhY3RvcnkobmFtZUNvbmRpdGlvbignZXJhJywgNCkpXG59O1xuXG5cbmZ1bmN0aW9uIGRpZ2l0TW9kaWZpZXIoaW5uZXI6IERhdGVGb3JtYXR0ZXJGbik6IERhdGVGb3JtYXR0ZXJGbiB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzdWx0ID0gaW5uZXIoZGF0ZSwgbG9jYWxlKTtcbiAgICByZXR1cm4gcmVzdWx0Lmxlbmd0aCA9PSAxID8gJzAnICsgcmVzdWx0IDogcmVzdWx0O1xuICB9O1xufVxuXG5mdW5jdGlvbiBob3VyQ2xvY2tFeHRyYWN0b3IoaW5uZXI6IERhdGVGb3JtYXR0ZXJGbik6IERhdGVGb3JtYXR0ZXJGbiB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBpbm5lcihkYXRlLCBsb2NhbGUpLnNwbGl0KCcgJylbMV07IH07XG59XG5cbmZ1bmN0aW9uIGhvdXJFeHRyYWN0b3IoaW5uZXI6IERhdGVGb3JtYXR0ZXJGbik6IERhdGVGb3JtYXR0ZXJGbiB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7IHJldHVybiBpbm5lcihkYXRlLCBsb2NhbGUpLnNwbGl0KCcgJylbMF07IH07XG59XG5cbmZ1bmN0aW9uIGludGxEYXRlRm9ybWF0KGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBvcHRpb25zOiBJbnRsLkRhdGVUaW1lRm9ybWF0T3B0aW9ucyk6IHN0cmluZyB7XG4gIHJldHVybiBuZXcgSW50bC5EYXRlVGltZUZvcm1hdChsb2NhbGUsIG9wdGlvbnMpLmZvcm1hdChkYXRlKS5yZXBsYWNlKC9bXFx1MjAwZVxcdTIwMGZdL2csICcnKTtcbn1cblxuZnVuY3Rpb24gdGltZVpvbmVHZXR0ZXIodGltZXpvbmU6IHN0cmluZyk6IERhdGVGb3JtYXR0ZXJGbiB7XG4gIC8vIFRvIHdvcmthcm91bmQgYEludGxgIEFQSSByZXN0cmljdGlvbiBmb3Igc2luZ2xlIHRpbWV6b25lIGxldCBmb3JtYXQgd2l0aCAyNCBob3Vyc1xuICBjb25zdCBvcHRpb25zID0ge2hvdXI6ICcyLWRpZ2l0JywgaG91cjEyOiBmYWxzZSwgdGltZVpvbmVOYW1lOiB0aW1lem9uZX07XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gICAgY29uc3QgcmVzdWx0ID0gaW50bERhdGVGb3JtYXQoZGF0ZSwgbG9jYWxlLCBvcHRpb25zKTtcbiAgICAvLyBUaGVuIGV4dHJhY3QgZmlyc3QgMyBsZXR0ZXJzIHRoYXQgcmVsYXRlZCB0byBob3Vyc1xuICAgIHJldHVybiByZXN1bHQgPyByZXN1bHQuc3Vic3RyaW5nKDMpIDogJyc7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhvdXIxMk1vZGlmeShcbiAgICBvcHRpb25zOiBJbnRsLkRhdGVUaW1lRm9ybWF0T3B0aW9ucywgdmFsdWU6IGJvb2xlYW4pOiBJbnRsLkRhdGVUaW1lRm9ybWF0T3B0aW9ucyB7XG4gIG9wdGlvbnMuaG91cjEyID0gdmFsdWU7XG4gIHJldHVybiBvcHRpb25zO1xufVxuXG5mdW5jdGlvbiBkaWdpdENvbmRpdGlvbihwcm9wOiBzdHJpbmcsIGxlbjogbnVtYmVyKTogSW50bC5EYXRlVGltZUZvcm1hdE9wdGlvbnMge1xuICBjb25zdCByZXN1bHQ6IHtbazogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICByZXN1bHRbcHJvcF0gPSBsZW4gPT09IDIgPyAnMi1kaWdpdCcgOiAnbnVtZXJpYyc7XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIG5hbWVDb25kaXRpb24ocHJvcDogc3RyaW5nLCBsZW46IG51bWJlcik6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zIHtcbiAgY29uc3QgcmVzdWx0OiB7W2s6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgaWYgKGxlbiA8IDQpIHtcbiAgICByZXN1bHRbcHJvcF0gPSBsZW4gPiAxID8gJ3Nob3J0JyA6ICduYXJyb3cnO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdFtwcm9wXSA9ICdsb25nJztcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGNvbWJpbmUob3B0aW9uczogSW50bC5EYXRlVGltZUZvcm1hdE9wdGlvbnNbXSk6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zIHtcbiAgcmV0dXJuIG9wdGlvbnMucmVkdWNlKChtZXJnZWQsIG9wdCkgPT4gKHsuLi5tZXJnZWQsIC4uLm9wdH0pLCB7fSk7XG59XG5cbmZ1bmN0aW9uIGRhdGVQYXJ0R2V0dGVyRmFjdG9yeShyZXQ6IEludGwuRGF0ZVRpbWVGb3JtYXRPcHRpb25zKTogRGF0ZUZvcm1hdHRlckZuIHtcbiAgcmV0dXJuIChkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyA9PiBpbnRsRGF0ZUZvcm1hdChkYXRlLCBsb2NhbGUsIHJldCk7XG59XG5cbmNvbnN0IERBVEVfRk9STUFUVEVSX0NBQ0hFID0gbmV3IE1hcDxzdHJpbmcsIHN0cmluZ1tdPigpO1xuXG5mdW5jdGlvbiBkYXRlRm9ybWF0dGVyKGZvcm1hdDogc3RyaW5nLCBkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGZuID0gUEFUVEVSTl9BTElBU0VTW2Zvcm1hdF07XG5cbiAgaWYgKGZuKSByZXR1cm4gZm4oZGF0ZSwgbG9jYWxlKTtcblxuICBjb25zdCBjYWNoZUtleSA9IGZvcm1hdDtcbiAgbGV0IHBhcnRzID0gREFURV9GT1JNQVRURVJfQ0FDSEUuZ2V0KGNhY2hlS2V5KTtcblxuICBpZiAoIXBhcnRzKSB7XG4gICAgcGFydHMgPSBbXTtcbiAgICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheXxudWxsO1xuICAgIERBVEVfRk9STUFUU19TUExJVC5leGVjKGZvcm1hdCk7XG5cbiAgICBsZXQgX2Zvcm1hdDogc3RyaW5nfG51bGwgPSBmb3JtYXQ7XG4gICAgd2hpbGUgKF9mb3JtYXQpIHtcbiAgICAgIG1hdGNoID0gREFURV9GT1JNQVRTX1NQTElULmV4ZWMoX2Zvcm1hdCk7XG4gICAgICBpZiAobWF0Y2gpIHtcbiAgICAgICAgcGFydHMgPSBwYXJ0cy5jb25jYXQobWF0Y2guc2xpY2UoMSkpO1xuICAgICAgICBfZm9ybWF0ID0gcGFydHMucG9wKCkgITtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhcnRzLnB1c2goX2Zvcm1hdCk7XG4gICAgICAgIF9mb3JtYXQgPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIERBVEVfRk9STUFUVEVSX0NBQ0hFLnNldChjYWNoZUtleSwgcGFydHMpO1xuICB9XG5cbiAgcmV0dXJuIHBhcnRzLnJlZHVjZSgodGV4dCwgcGFydCkgPT4ge1xuICAgIGNvbnN0IGZuID0gREFURV9GT1JNQVRTW3BhcnRdO1xuICAgIHJldHVybiB0ZXh0ICsgKGZuID8gZm4oZGF0ZSwgbG9jYWxlKSA6IHBhcnRUb1RpbWUocGFydCkpO1xuICB9LCAnJyk7XG59XG5cbmZ1bmN0aW9uIHBhcnRUb1RpbWUocGFydDogc3RyaW5nKTogc3RyaW5nIHtcbiAgcmV0dXJuIHBhcnQgPT09ICdcXCdcXCcnID8gJ1xcJycgOiBwYXJ0LnJlcGxhY2UoLyheJ3wnJCkvZywgJycpLnJlcGxhY2UoLycnL2csICdcXCcnKTtcbn1cblxuZXhwb3J0IGNsYXNzIERhdGVGb3JtYXR0ZXIge1xuICBzdGF0aWMgZm9ybWF0KGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBwYXR0ZXJuOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBkYXRlRm9ybWF0dGVyKHBhdHRlcm4sIGRhdGUsIGxvY2FsZSk7XG4gIH1cbn1cbiJdfQ==