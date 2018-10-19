/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FormStyle, FormatWidth, NumberSymbol, TranslationWidth, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleDayNames, getLocaleDayPeriods, getLocaleEraNames, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocaleId, getLocaleMonthNames, getLocaleNumberSymbol, getLocaleTimeFormat } from './locale_data_api';
export const ISO8601_DATE_REGEX = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
//    1        2       3         4          5          6          7          8  9     10      11
const NAMED_FORMATS = {};
const DATE_FORMATS_SPLIT = /((?:[^GyMLwWdEabBhHmsSzZO']+)|(?:'(?:[^']|'')*')|(?:G{1,5}|y{1,4}|M{1,5}|L{1,5}|w{1,2}|W{1}|d{1,2}|E{1,6}|a{1,5}|b{1,5}|B{1,5}|h{1,2}|H{1,2}|m{1,2}|s{1,2}|S{1,3}|z{1,4}|Z{1,5}|O{1,4}))([\s\S]*)/;
var ZoneWidth;
(function (ZoneWidth) {
    ZoneWidth[ZoneWidth["Short"] = 0] = "Short";
    ZoneWidth[ZoneWidth["ShortGMT"] = 1] = "ShortGMT";
    ZoneWidth[ZoneWidth["Long"] = 2] = "Long";
    ZoneWidth[ZoneWidth["Extended"] = 3] = "Extended";
})(ZoneWidth || (ZoneWidth = {}));
var DateType;
(function (DateType) {
    DateType[DateType["FullYear"] = 0] = "FullYear";
    DateType[DateType["Month"] = 1] = "Month";
    DateType[DateType["Date"] = 2] = "Date";
    DateType[DateType["Hours"] = 3] = "Hours";
    DateType[DateType["Minutes"] = 4] = "Minutes";
    DateType[DateType["Seconds"] = 5] = "Seconds";
    DateType[DateType["FractionalSeconds"] = 6] = "FractionalSeconds";
    DateType[DateType["Day"] = 7] = "Day";
})(DateType || (DateType = {}));
var TranslationType;
(function (TranslationType) {
    TranslationType[TranslationType["DayPeriods"] = 0] = "DayPeriods";
    TranslationType[TranslationType["Days"] = 1] = "Days";
    TranslationType[TranslationType["Months"] = 2] = "Months";
    TranslationType[TranslationType["Eras"] = 3] = "Eras";
})(TranslationType || (TranslationType = {}));
/**
 * @ngModule CommonModule
 * @description
 *
 * Formats a date according to locale rules.
 *
 * Where:
 * - `value` is a Date, a number (milliseconds since UTC epoch) or an ISO string
 *   (https://www.w3.org/TR/NOTE-datetime).
 * - `format` indicates which date/time components to include. See {@link DatePipe} for more
 *   details.
 * - `locale` is a `string` defining the locale to use.
 * - `timezone` to be used for formatting. It understands UTC/GMT and the continental US time zone
 *   abbreviations, but for general use, use a time zone offset (e.g. `'+0430'`).
 *   If not specified, host system settings are used.
 *
 * See {@link DatePipe} for more details.
 *
 * @publicApi
 */
export function formatDate(value, format, locale, timezone) {
    let date = toDate(value);
    const namedFormat = getNamedFormat(locale, format);
    format = namedFormat || format;
    let parts = [];
    let match;
    while (format) {
        match = DATE_FORMATS_SPLIT.exec(format);
        if (match) {
            parts = parts.concat(match.slice(1));
            const part = parts.pop();
            if (!part) {
                break;
            }
            format = part;
        }
        else {
            parts.push(format);
            break;
        }
    }
    let dateTimezoneOffset = date.getTimezoneOffset();
    if (timezone) {
        dateTimezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
        date = convertTimezoneToLocal(date, timezone, true);
    }
    let text = '';
    parts.forEach(value => {
        const dateFormatter = getDateFormatter(value);
        text += dateFormatter ?
            dateFormatter(date, locale, dateTimezoneOffset) :
            value === '\'\'' ? '\'' : value.replace(/(^'|'$)/g, '').replace(/''/g, '\'');
    });
    return text;
}
function getNamedFormat(locale, format) {
    const localeId = getLocaleId(locale);
    NAMED_FORMATS[localeId] = NAMED_FORMATS[localeId] || {};
    if (NAMED_FORMATS[localeId][format]) {
        return NAMED_FORMATS[localeId][format];
    }
    let formatValue = '';
    switch (format) {
        case 'shortDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Short);
            break;
        case 'mediumDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Medium);
            break;
        case 'longDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Long);
            break;
        case 'fullDate':
            formatValue = getLocaleDateFormat(locale, FormatWidth.Full);
            break;
        case 'shortTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Short);
            break;
        case 'mediumTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Medium);
            break;
        case 'longTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Long);
            break;
        case 'fullTime':
            formatValue = getLocaleTimeFormat(locale, FormatWidth.Full);
            break;
        case 'short':
            const shortTime = getNamedFormat(locale, 'shortTime');
            const shortDate = getNamedFormat(locale, 'shortDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Short), [shortTime, shortDate]);
            break;
        case 'medium':
            const mediumTime = getNamedFormat(locale, 'mediumTime');
            const mediumDate = getNamedFormat(locale, 'mediumDate');
            formatValue = formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Medium), [mediumTime, mediumDate]);
            break;
        case 'long':
            const longTime = getNamedFormat(locale, 'longTime');
            const longDate = getNamedFormat(locale, 'longDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Long), [longTime, longDate]);
            break;
        case 'full':
            const fullTime = getNamedFormat(locale, 'fullTime');
            const fullDate = getNamedFormat(locale, 'fullDate');
            formatValue =
                formatDateTime(getLocaleDateTimeFormat(locale, FormatWidth.Full), [fullTime, fullDate]);
            break;
    }
    if (formatValue) {
        NAMED_FORMATS[localeId][format] = formatValue;
    }
    return formatValue;
}
function formatDateTime(str, opt_values) {
    if (opt_values) {
        str = str.replace(/\{([^}]+)}/g, function (match, key) {
            return (opt_values != null && key in opt_values) ? opt_values[key] : match;
        });
    }
    return str;
}
function padNumber(num, digits, minusSign = '-', trim, negWrap) {
    let neg = '';
    if (num < 0 || (negWrap && num <= 0)) {
        if (negWrap) {
            num = -num + 1;
        }
        else {
            num = -num;
            neg = minusSign;
        }
    }
    let strNum = String(num);
    while (strNum.length < digits) {
        strNum = '0' + strNum;
    }
    if (trim) {
        strNum = strNum.substr(strNum.length - digits);
    }
    return neg + strNum;
}
function formatFractionalSeconds(milliseconds, digits) {
    const strMs = padNumber(milliseconds, 3);
    return strMs.substr(0, digits);
}
/**
 * Returns a date formatter that transforms a date into its locale digit representation
 */
function dateGetter(name, size, offset = 0, trim = false, negWrap = false) {
    return function (date, locale) {
        let part = getDatePart(name, date);
        if (offset > 0 || part > -offset) {
            part += offset;
        }
        if (name === DateType.Hours) {
            if (part === 0 && offset === -12) {
                part = 12;
            }
        }
        else if (name === DateType.FractionalSeconds) {
            return formatFractionalSeconds(part, size);
        }
        const localeMinus = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        return padNumber(part, size, localeMinus, trim, negWrap);
    };
}
function getDatePart(part, date) {
    switch (part) {
        case DateType.FullYear:
            return date.getFullYear();
        case DateType.Month:
            return date.getMonth();
        case DateType.Date:
            return date.getDate();
        case DateType.Hours:
            return date.getHours();
        case DateType.Minutes:
            return date.getMinutes();
        case DateType.Seconds:
            return date.getSeconds();
        case DateType.FractionalSeconds:
            return date.getMilliseconds();
        case DateType.Day:
            return date.getDay();
        default:
            throw new Error(`Unknown DateType value "${part}".`);
    }
}
/**
 * Returns a date formatter that transforms a date into its locale string representation
 */
function dateStrGetter(name, width, form = FormStyle.Format, extended = false) {
    return function (date, locale) {
        return getDateTranslation(date, locale, name, width, form, extended);
    };
}
/**
 * Returns the locale translation of a date for a given form, type and width
 */
function getDateTranslation(date, locale, name, width, form, extended) {
    switch (name) {
        case TranslationType.Months:
            return getLocaleMonthNames(locale, form, width)[date.getMonth()];
        case TranslationType.Days:
            return getLocaleDayNames(locale, form, width)[date.getDay()];
        case TranslationType.DayPeriods:
            const currentHours = date.getHours();
            const currentMinutes = date.getMinutes();
            if (extended) {
                const rules = getLocaleExtraDayPeriodRules(locale);
                const dayPeriods = getLocaleExtraDayPeriods(locale, form, width);
                let result;
                rules.forEach((rule, index) => {
                    if (Array.isArray(rule)) {
                        // morning, afternoon, evening, night
                        const { hours: hoursFrom, minutes: minutesFrom } = rule[0];
                        const { hours: hoursTo, minutes: minutesTo } = rule[1];
                        if (currentHours >= hoursFrom && currentMinutes >= minutesFrom &&
                            (currentHours < hoursTo ||
                                (currentHours === hoursTo && currentMinutes < minutesTo))) {
                            result = dayPeriods[index];
                        }
                    }
                    else { // noon or midnight
                        const { hours, minutes } = rule;
                        if (hours === currentHours && minutes === currentMinutes) {
                            result = dayPeriods[index];
                        }
                    }
                });
                if (result) {
                    return result;
                }
            }
            // if no rules for the day periods, we use am/pm by default
            return getLocaleDayPeriods(locale, form, width)[currentHours < 12 ? 0 : 1];
        case TranslationType.Eras:
            return getLocaleEraNames(locale, width)[date.getFullYear() <= 0 ? 0 : 1];
        default:
            // This default case is not needed by TypeScript compiler, as the switch is exhaustive.
            // However Closure Compiler does not understand that and reports an error in typed mode.
            // The `throw new Error` below works around the problem, and the unexpected: never variable
            // makes sure tsc still checks this code is unreachable.
            const unexpected = name;
            throw new Error(`unexpected translation type ${unexpected}`);
    }
}
/**
 * Returns a date formatter that transforms a date and an offset into a timezone with ISO8601 or
 * GMT format depending on the width (eg: short = +0430, short:GMT = GMT+4, long = GMT+04:30,
 * extended = +04:30)
 */
function timeZoneGetter(width) {
    return function (date, locale, offset) {
        const zone = -1 * offset;
        const minusSign = getLocaleNumberSymbol(locale, NumberSymbol.MinusSign);
        const hours = zone > 0 ? Math.floor(zone / 60) : Math.ceil(zone / 60);
        switch (width) {
            case ZoneWidth.Short:
                return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) +
                    padNumber(Math.abs(zone % 60), 2, minusSign);
            case ZoneWidth.ShortGMT:
                return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 1, minusSign);
            case ZoneWidth.Long:
                return 'GMT' + ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
                    padNumber(Math.abs(zone % 60), 2, minusSign);
            case ZoneWidth.Extended:
                if (offset === 0) {
                    return 'Z';
                }
                else {
                    return ((zone >= 0) ? '+' : '') + padNumber(hours, 2, minusSign) + ':' +
                        padNumber(Math.abs(zone % 60), 2, minusSign);
                }
            default:
                throw new Error(`Unknown zone width "${width}"`);
        }
    };
}
const JANUARY = 0;
const THURSDAY = 4;
function getFirstThursdayOfYear(year) {
    const firstDayOfYear = (new Date(year, JANUARY, 1)).getDay();
    return new Date(year, 0, 1 + ((firstDayOfYear <= THURSDAY) ? THURSDAY : THURSDAY + 7) - firstDayOfYear);
}
function getThursdayThisWeek(datetime) {
    return new Date(datetime.getFullYear(), datetime.getMonth(), datetime.getDate() + (THURSDAY - datetime.getDay()));
}
function weekGetter(size, monthBased = false) {
    return function (date, locale) {
        let result;
        if (monthBased) {
            const nbDaysBefore1stDayOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).getDay() - 1;
            const today = date.getDate();
            result = 1 + Math.floor((today + nbDaysBefore1stDayOfMonth) / 7);
        }
        else {
            const firstThurs = getFirstThursdayOfYear(date.getFullYear());
            const thisThurs = getThursdayThisWeek(date);
            const diff = thisThurs.getTime() - firstThurs.getTime();
            result = 1 + Math.round(diff / 6.048e8); // 6.048e8 ms per week
        }
        return padNumber(result, size, getLocaleNumberSymbol(locale, NumberSymbol.MinusSign));
    };
}
const DATE_FORMATS = {};
// Based on CLDR formats:
// See complete list: http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
// See also explanations: http://cldr.unicode.org/translation/date-time
// TODO(ocombe): support all missing cldr formats: Y, U, Q, D, F, e, c, j, J, C, A, v, V, X, x
function getDateFormatter(format) {
    if (DATE_FORMATS[format]) {
        return DATE_FORMATS[format];
    }
    let formatter;
    switch (format) {
        // Era name (AD/BC)
        case 'G':
        case 'GG':
        case 'GGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Abbreviated);
            break;
        case 'GGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Wide);
            break;
        case 'GGGGG':
            formatter = dateStrGetter(TranslationType.Eras, TranslationWidth.Narrow);
            break;
        // 1 digit representation of the year, e.g. (AD 1 => 1, AD 199 => 199)
        case 'y':
            formatter = dateGetter(DateType.FullYear, 1, 0, false, true);
            break;
        // 2 digit representation of the year, padded (00-99). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yy':
            formatter = dateGetter(DateType.FullYear, 2, 0, true, true);
            break;
        // 3 digit representation of the year, padded (000-999). (e.g. AD 2001 => 01, AD 2010 => 10)
        case 'yyy':
            formatter = dateGetter(DateType.FullYear, 3, 0, false, true);
            break;
        // 4 digit representation of the year (e.g. AD 1 => 0001, AD 2010 => 2010)
        case 'yyyy':
            formatter = dateGetter(DateType.FullYear, 4, 0, false, true);
            break;
        // Month of the year (1-12), numeric
        case 'M':
        case 'L':
            formatter = dateGetter(DateType.Month, 1, 1);
            break;
        case 'MM':
        case 'LL':
            formatter = dateGetter(DateType.Month, 2, 1);
            break;
        // Month of the year (January, ...), string, format
        case 'MMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated);
            break;
        case 'MMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Wide);
            break;
        case 'MMMMM':
            formatter = dateStrGetter(TranslationType.Months, TranslationWidth.Narrow);
            break;
        // Month of the year (January, ...), string, standalone
        case 'LLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Abbreviated, FormStyle.Standalone);
            break;
        case 'LLLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Wide, FormStyle.Standalone);
            break;
        case 'LLLLL':
            formatter =
                dateStrGetter(TranslationType.Months, TranslationWidth.Narrow, FormStyle.Standalone);
            break;
        // Week of the year (1, ... 52)
        case 'w':
            formatter = weekGetter(1);
            break;
        case 'ww':
            formatter = weekGetter(2);
            break;
        // Week of the month (1, ...)
        case 'W':
            formatter = weekGetter(1, true);
            break;
        // Day of the month (1-31)
        case 'd':
            formatter = dateGetter(DateType.Date, 1);
            break;
        case 'dd':
            formatter = dateGetter(DateType.Date, 2);
            break;
        // Day of the Week
        case 'E':
        case 'EE':
        case 'EEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Abbreviated);
            break;
        case 'EEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Wide);
            break;
        case 'EEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Narrow);
            break;
        case 'EEEEEE':
            formatter = dateStrGetter(TranslationType.Days, TranslationWidth.Short);
            break;
        // Generic period of the day (am-pm)
        case 'a':
        case 'aa':
        case 'aaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated);
            break;
        case 'aaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide);
            break;
        case 'aaaaa':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow);
            break;
        // Extended period of the day (midnight, at night, ...), standalone
        case 'b':
        case 'bb':
        case 'bbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Standalone, true);
            break;
        case 'bbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Standalone, true);
            break;
        case 'bbbbb':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Standalone, true);
            break;
        // Extended period of the day (midnight, night, ...), standalone
        case 'B':
        case 'BB':
        case 'BBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Abbreviated, FormStyle.Format, true);
            break;
        case 'BBBB':
            formatter =
                dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Wide, FormStyle.Format, true);
            break;
        case 'BBBBB':
            formatter = dateStrGetter(TranslationType.DayPeriods, TranslationWidth.Narrow, FormStyle.Format, true);
            break;
        // Hour in AM/PM, (1-12)
        case 'h':
            formatter = dateGetter(DateType.Hours, 1, -12);
            break;
        case 'hh':
            formatter = dateGetter(DateType.Hours, 2, -12);
            break;
        // Hour of the day (0-23)
        case 'H':
            formatter = dateGetter(DateType.Hours, 1);
            break;
        // Hour in day, padded (00-23)
        case 'HH':
            formatter = dateGetter(DateType.Hours, 2);
            break;
        // Minute of the hour (0-59)
        case 'm':
            formatter = dateGetter(DateType.Minutes, 1);
            break;
        case 'mm':
            formatter = dateGetter(DateType.Minutes, 2);
            break;
        // Second of the minute (0-59)
        case 's':
            formatter = dateGetter(DateType.Seconds, 1);
            break;
        case 'ss':
            formatter = dateGetter(DateType.Seconds, 2);
            break;
        // Fractional second
        case 'S':
            formatter = dateGetter(DateType.FractionalSeconds, 1);
            break;
        case 'SS':
            formatter = dateGetter(DateType.FractionalSeconds, 2);
            break;
        case 'SSS':
            formatter = dateGetter(DateType.FractionalSeconds, 3);
            break;
        // Timezone ISO8601 short format (-0430)
        case 'Z':
        case 'ZZ':
        case 'ZZZ':
            formatter = timeZoneGetter(ZoneWidth.Short);
            break;
        // Timezone ISO8601 extended format (-04:30)
        case 'ZZZZZ':
            formatter = timeZoneGetter(ZoneWidth.Extended);
            break;
        // Timezone GMT short format (GMT+4)
        case 'O':
        case 'OO':
        case 'OOO':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'z':
        case 'zz':
        case 'zzz':
            formatter = timeZoneGetter(ZoneWidth.ShortGMT);
            break;
        // Timezone GMT long format (GMT+0430)
        case 'OOOO':
        case 'ZZZZ':
        // Should be location, but fallback to format O instead because we don't have the data yet
        case 'zzzz':
            formatter = timeZoneGetter(ZoneWidth.Long);
            break;
        default:
            return null;
    }
    DATE_FORMATS[format] = formatter;
    return formatter;
}
function timezoneToOffset(timezone, fallback) {
    // Support: IE 9-11 only, Edge 13-15+
    // IE/Edge do not "understand" colon (`:`) in timezone
    timezone = timezone.replace(/:/g, '');
    const requestedTimezoneOffset = Date.parse('Jan 01, 1970 00:00:00 ' + timezone) / 60000;
    return isNaN(requestedTimezoneOffset) ? fallback : requestedTimezoneOffset;
}
function addDateMinutes(date, minutes) {
    date = new Date(date.getTime());
    date.setMinutes(date.getMinutes() + minutes);
    return date;
}
function convertTimezoneToLocal(date, timezone, reverse) {
    const reverseValue = reverse ? -1 : 1;
    const dateTimezoneOffset = date.getTimezoneOffset();
    const timezoneOffset = timezoneToOffset(timezone, dateTimezoneOffset);
    return addDateMinutes(date, reverseValue * (timezoneOffset - dateTimezoneOffset));
}
/**
 * Converts a value to date.
 *
 * Supported input formats:
 * - `Date`
 * - number: timestamp
 * - string: numeric (e.g. "1234"), ISO and date strings in a format supported by
 *   [Date.parse()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/parse).
 *   Note: ISO strings without time return a date without timeoffset.
 *
 * Throws if unable to convert to a date.
 */
export function toDate(value) {
    if (isDate(value)) {
        return value;
    }
    if (typeof value === 'number' && !isNaN(value)) {
        return new Date(value);
    }
    if (typeof value === 'string') {
        value = value.trim();
        const parsedNb = parseFloat(value);
        // any string that only contains numbers, like "1234" but not like "1234hello"
        if (!isNaN(value - parsedNb)) {
            return new Date(parsedNb);
        }
        if (/^(\d{4}-\d{1,2}-\d{1,2})$/.test(value)) {
            /* For ISO Strings without time the day, month and year must be extracted from the ISO String
            before Date creation to avoid time offset and errors in the new Date.
            If we only replace '-' with ',' in the ISO String ("2015,01,01"), and try to create a new
            date, some browsers (e.g. IE 9) will throw an invalid Date error.
            If we leave the '-' ("2015-01-01") and try to create a new Date("2015-01-01") the timeoffset
            is applied.
            Note: ISO months are 0 for January, 1 for February, ... */
            const [y, m, d] = value.split('-').map((val) => +val);
            return new Date(y, m - 1, d);
        }
        let match;
        if (match = value.match(ISO8601_DATE_REGEX)) {
            return isoStringToDate(match);
        }
    }
    const date = new Date(value);
    if (!isDate(date)) {
        throw new Error(`Unable to convert "${value}" into a date`);
    }
    return date;
}
/**
 * Converts a date in ISO8601 to a Date.
 * Used instead of `Date.parse` because of browser discrepancies.
 */
export function isoStringToDate(match) {
    const date = new Date(0);
    let tzHour = 0;
    let tzMin = 0;
    // match[8] means that the string contains "Z" (UTC) or a timezone like "+01:00" or "+0100"
    const dateSetter = match[8] ? date.setUTCFullYear : date.setFullYear;
    const timeSetter = match[8] ? date.setUTCHours : date.setHours;
    // if there is a timezone defined like "+01:00" or "+0100"
    if (match[9]) {
        tzHour = Number(match[9] + match[10]);
        tzMin = Number(match[9] + match[11]);
    }
    dateSetter.call(date, Number(match[1]), Number(match[2]) - 1, Number(match[3]));
    const h = Number(match[4] || 0) - tzHour;
    const m = Number(match[5] || 0) - tzMin;
    const s = Number(match[6] || 0);
    const ms = Math.round(parseFloat('0.' + (match[7] || 0)) * 1000);
    timeSetter.call(date, h, m, s, ms);
    return date;
}
export function isDate(value) {
    return value instanceof Date && !isNaN(value.valueOf());
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZm9ybWF0X2RhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vc3JjL2kxOG4vZm9ybWF0X2RhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFRLGdCQUFnQixFQUFFLG1CQUFtQixFQUFFLHVCQUF1QixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLDRCQUE0QixFQUFFLHdCQUF3QixFQUFFLFdBQVcsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxtQkFBbUIsRUFBQyxNQUFNLG1CQUFtQixDQUFDO0FBRTlVLE1BQU0sQ0FBQyxNQUFNLGtCQUFrQixHQUMzQixzR0FBc0csQ0FBQztBQUMzRyxnR0FBZ0c7QUFDaEcsTUFBTSxhQUFhLEdBQXFELEVBQUUsQ0FBQztBQUMzRSxNQUFNLGtCQUFrQixHQUNwQixtTUFBbU0sQ0FBQztBQUV4TSxJQUFLLFNBS0o7QUFMRCxXQUFLLFNBQVM7SUFDWiwyQ0FBSyxDQUFBO0lBQ0wsaURBQVEsQ0FBQTtJQUNSLHlDQUFJLENBQUE7SUFDSixpREFBUSxDQUFBO0FBQ1YsQ0FBQyxFQUxJLFNBQVMsS0FBVCxTQUFTLFFBS2I7QUFFRCxJQUFLLFFBU0o7QUFURCxXQUFLLFFBQVE7SUFDWCwrQ0FBUSxDQUFBO0lBQ1IseUNBQUssQ0FBQTtJQUNMLHVDQUFJLENBQUE7SUFDSix5Q0FBSyxDQUFBO0lBQ0wsNkNBQU8sQ0FBQTtJQUNQLDZDQUFPLENBQUE7SUFDUCxpRUFBaUIsQ0FBQTtJQUNqQixxQ0FBRyxDQUFBO0FBQ0wsQ0FBQyxFQVRJLFFBQVEsS0FBUixRQUFRLFFBU1o7QUFFRCxJQUFLLGVBS0o7QUFMRCxXQUFLLGVBQWU7SUFDbEIsaUVBQVUsQ0FBQTtJQUNWLHFEQUFJLENBQUE7SUFDSix5REFBTSxDQUFBO0lBQ04scURBQUksQ0FBQTtBQUNOLENBQUMsRUFMSSxlQUFlLEtBQWYsZUFBZSxRQUtuQjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBbUJHO0FBQ0gsTUFBTSxVQUFVLFVBQVUsQ0FDdEIsS0FBNkIsRUFBRSxNQUFjLEVBQUUsTUFBYyxFQUFFLFFBQWlCO0lBQ2xGLElBQUksSUFBSSxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQztJQUN6QixNQUFNLFdBQVcsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQ25ELE1BQU0sR0FBRyxXQUFXLElBQUksTUFBTSxDQUFDO0lBRS9CLElBQUksS0FBSyxHQUFhLEVBQUUsQ0FBQztJQUN6QixJQUFJLEtBQUssQ0FBQztJQUNWLE9BQU8sTUFBTSxFQUFFO1FBQ2IsS0FBSyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztRQUN4QyxJQUFJLEtBQUssRUFBRTtZQUNULEtBQUssR0FBRyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNyQyxNQUFNLElBQUksR0FBRyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDekIsSUFBSSxDQUFDLElBQUksRUFBRTtnQkFDVCxNQUFNO2FBQ1A7WUFDRCxNQUFNLEdBQUcsSUFBSSxDQUFDO1NBQ2Y7YUFBTTtZQUNMLEtBQUssQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbkIsTUFBTTtTQUNQO0tBQ0Y7SUFFRCxJQUFJLGtCQUFrQixHQUFHLElBQUksQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ2xELElBQUksUUFBUSxFQUFFO1FBQ1osa0JBQWtCLEdBQUcsZ0JBQWdCLENBQUMsUUFBUSxFQUFFLGtCQUFrQixDQUFDLENBQUM7UUFDcEUsSUFBSSxHQUFHLHNCQUFzQixDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsSUFBSSxDQUFDLENBQUM7S0FDckQ7SUFFRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7SUFDZCxLQUFLLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ3BCLE1BQU0sYUFBYSxHQUFHLGdCQUFnQixDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzlDLElBQUksSUFBSSxhQUFhLENBQUMsQ0FBQztZQUNuQixhQUFhLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7WUFDakQsS0FBSyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFVBQVUsRUFBRSxFQUFFLENBQUMsQ0FBQyxPQUFPLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ25GLENBQUMsQ0FBQyxDQUFDO0lBRUgsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxjQUFjLENBQUMsTUFBYyxFQUFFLE1BQWM7SUFDcEQsTUFBTSxRQUFRLEdBQUcsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0lBQ3JDLGFBQWEsQ0FBQyxRQUFRLENBQUMsR0FBRyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDO0lBRXhELElBQUksYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxFQUFFO1FBQ25DLE9BQU8sYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3hDO0lBRUQsSUFBSSxXQUFXLEdBQUcsRUFBRSxDQUFDO0lBQ3JCLFFBQVEsTUFBTSxFQUFFO1FBQ2QsS0FBSyxXQUFXO1lBQ2QsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDN0QsTUFBTTtRQUNSLEtBQUssWUFBWTtZQUNmLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzlELE1BQU07UUFDUixLQUFLLFVBQVU7WUFDYixXQUFXLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM1RCxNQUFNO1FBQ1IsS0FBSyxVQUFVO1lBQ2IsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsTUFBTTtRQUNSLEtBQUssV0FBVztZQUNkLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzdELE1BQU07UUFDUixLQUFLLFlBQVk7WUFDZixXQUFXLEdBQUcsbUJBQW1CLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQztZQUM5RCxNQUFNO1FBQ1IsS0FBSyxVQUFVO1lBQ2IsV0FBVyxHQUFHLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDNUQsTUFBTTtRQUNSLEtBQUssVUFBVTtZQUNiLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVELE1BQU07UUFDUixLQUFLLE9BQU87WUFDVixNQUFNLFNBQVMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1lBQ3RELE1BQU0sU0FBUyxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsV0FBVyxDQUFDLENBQUM7WUFDdEQsV0FBVyxHQUFHLGNBQWMsQ0FDeEIsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFNBQVMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDO1lBQ2hGLE1BQU07UUFDUixLQUFLLFFBQVE7WUFDWCxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxDQUFDO1lBQ3hELE1BQU0sVUFBVSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLENBQUM7WUFDeEQsV0FBVyxHQUFHLGNBQWMsQ0FDeEIsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQyxDQUFDO1lBQ25GLE1BQU07UUFDUixLQUFLLE1BQU07WUFDVCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEQsV0FBVztnQkFDUCxjQUFjLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzVGLE1BQU07UUFDUixLQUFLLE1BQU07WUFDVCxNQUFNLFFBQVEsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLFVBQVUsQ0FBQyxDQUFDO1lBQ3BELE1BQU0sUUFBUSxHQUFHLGNBQWMsQ0FBQyxNQUFNLEVBQUUsVUFBVSxDQUFDLENBQUM7WUFDcEQsV0FBVztnQkFDUCxjQUFjLENBQUMsdUJBQXVCLENBQUMsTUFBTSxFQUFFLFdBQVcsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1lBQzVGLE1BQU07S0FDVDtJQUNELElBQUksV0FBVyxFQUFFO1FBQ2YsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLFdBQVcsQ0FBQztLQUMvQztJQUNELE9BQU8sV0FBVyxDQUFDO0FBQ3JCLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxHQUFXLEVBQUUsVUFBb0I7SUFDdkQsSUFBSSxVQUFVLEVBQUU7UUFDZCxHQUFHLEdBQUcsR0FBRyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBUyxLQUFLLEVBQUUsR0FBRztZQUNsRCxPQUFPLENBQUMsVUFBVSxJQUFJLElBQUksSUFBSSxHQUFHLElBQUksVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBQzdFLENBQUMsQ0FBQyxDQUFDO0tBQ0o7SUFDRCxPQUFPLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FDZCxHQUFXLEVBQUUsTUFBYyxFQUFFLFNBQVMsR0FBRyxHQUFHLEVBQUUsSUFBYyxFQUFFLE9BQWlCO0lBQ2pGLElBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQztJQUNiLElBQUksR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxHQUFHLElBQUksQ0FBQyxDQUFDLEVBQUU7UUFDcEMsSUFBSSxPQUFPLEVBQUU7WUFDWCxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDO1NBQ2hCO2FBQU07WUFDTCxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUM7WUFDWCxHQUFHLEdBQUcsU0FBUyxDQUFDO1NBQ2pCO0tBQ0Y7SUFDRCxJQUFJLE1BQU0sR0FBRyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDekIsT0FBTyxNQUFNLENBQUMsTUFBTSxHQUFHLE1BQU0sRUFBRTtRQUM3QixNQUFNLEdBQUcsR0FBRyxHQUFHLE1BQU0sQ0FBQztLQUN2QjtJQUNELElBQUksSUFBSSxFQUFFO1FBQ1IsTUFBTSxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUMsQ0FBQztLQUNoRDtJQUNELE9BQU8sR0FBRyxHQUFHLE1BQU0sQ0FBQztBQUN0QixDQUFDO0FBRUQsU0FBUyx1QkFBdUIsQ0FBQyxZQUFvQixFQUFFLE1BQWM7SUFDbkUsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLFlBQVksRUFBRSxDQUFDLENBQUMsQ0FBQztJQUN6QyxPQUFPLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0FBQ2pDLENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsVUFBVSxDQUNmLElBQWMsRUFBRSxJQUFZLEVBQUUsU0FBaUIsQ0FBQyxFQUFFLElBQUksR0FBRyxLQUFLLEVBQzlELE9BQU8sR0FBRyxLQUFLO0lBQ2pCLE9BQU8sVUFBUyxJQUFVLEVBQUUsTUFBYztRQUN4QyxJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQ25DLElBQUksTUFBTSxHQUFHLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxNQUFNLEVBQUU7WUFDaEMsSUFBSSxJQUFJLE1BQU0sQ0FBQztTQUNoQjtRQUVELElBQUksSUFBSSxLQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUU7WUFDM0IsSUFBSSxJQUFJLEtBQUssQ0FBQyxJQUFJLE1BQU0sS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxHQUFHLEVBQUUsQ0FBQzthQUNYO1NBQ0Y7YUFBTSxJQUFJLElBQUksS0FBSyxRQUFRLENBQUMsaUJBQWlCLEVBQUU7WUFDOUMsT0FBTyx1QkFBdUIsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDNUM7UUFFRCxNQUFNLFdBQVcsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQzFFLE9BQU8sU0FBUyxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMzRCxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQsU0FBUyxXQUFXLENBQUMsSUFBYyxFQUFFLElBQVU7SUFDN0MsUUFBUSxJQUFJLEVBQUU7UUFDWixLQUFLLFFBQVEsQ0FBQyxRQUFRO1lBQ3BCLE9BQU8sSUFBSSxDQUFDLFdBQVcsRUFBRSxDQUFDO1FBQzVCLEtBQUssUUFBUSxDQUFDLEtBQUs7WUFDakIsT0FBTyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekIsS0FBSyxRQUFRLENBQUMsSUFBSTtZQUNoQixPQUFPLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUN4QixLQUFLLFFBQVEsQ0FBQyxLQUFLO1lBQ2pCLE9BQU8sSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1FBQ3pCLEtBQUssUUFBUSxDQUFDLE9BQU87WUFDbkIsT0FBTyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7UUFDM0IsS0FBSyxRQUFRLENBQUMsT0FBTztZQUNuQixPQUFPLElBQUksQ0FBQyxVQUFVLEVBQUUsQ0FBQztRQUMzQixLQUFLLFFBQVEsQ0FBQyxpQkFBaUI7WUFDN0IsT0FBTyxJQUFJLENBQUMsZUFBZSxFQUFFLENBQUM7UUFDaEMsS0FBSyxRQUFRLENBQUMsR0FBRztZQUNmLE9BQU8sSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO1FBQ3ZCO1lBQ0UsTUFBTSxJQUFJLEtBQUssQ0FBQywyQkFBMkIsSUFBSSxJQUFJLENBQUMsQ0FBQztLQUN4RDtBQUNILENBQUM7QUFFRDs7R0FFRztBQUNILFNBQVMsYUFBYSxDQUNsQixJQUFxQixFQUFFLEtBQXVCLEVBQUUsT0FBa0IsU0FBUyxDQUFDLE1BQU0sRUFDbEYsUUFBUSxHQUFHLEtBQUs7SUFDbEIsT0FBTyxVQUFTLElBQVUsRUFBRSxNQUFjO1FBQ3hDLE9BQU8sa0JBQWtCLENBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLElBQUksRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN2RSxDQUFDLENBQUM7QUFDSixDQUFDO0FBRUQ7O0dBRUc7QUFDSCxTQUFTLGtCQUFrQixDQUN2QixJQUFVLEVBQUUsTUFBYyxFQUFFLElBQXFCLEVBQUUsS0FBdUIsRUFBRSxJQUFlLEVBQzNGLFFBQWlCO0lBQ25CLFFBQVEsSUFBSSxFQUFFO1FBQ1osS0FBSyxlQUFlLENBQUMsTUFBTTtZQUN6QixPQUFPLG1CQUFtQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDLENBQUM7UUFDbkUsS0FBSyxlQUFlLENBQUMsSUFBSTtZQUN2QixPQUFPLGlCQUFpQixDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUM7UUFDL0QsS0FBSyxlQUFlLENBQUMsVUFBVTtZQUM3QixNQUFNLFlBQVksR0FBRyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUM7WUFDckMsTUFBTSxjQUFjLEdBQUcsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ3pDLElBQUksUUFBUSxFQUFFO2dCQUNaLE1BQU0sS0FBSyxHQUFHLDRCQUE0QixDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUNuRCxNQUFNLFVBQVUsR0FBRyx3QkFBd0IsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUssQ0FBQyxDQUFDO2dCQUNqRSxJQUFJLE1BQU0sQ0FBQztnQkFDWCxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBeUIsRUFBRSxLQUFhLEVBQUUsRUFBRTtvQkFDekQsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxFQUFFO3dCQUN2QixxQ0FBcUM7d0JBQ3JDLE1BQU0sRUFBQyxLQUFLLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3pELE1BQU0sRUFBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxTQUFTLEVBQUMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7d0JBQ3JELElBQUksWUFBWSxJQUFJLFNBQVMsSUFBSSxjQUFjLElBQUksV0FBVzs0QkFDMUQsQ0FBQyxZQUFZLEdBQUcsT0FBTztnQ0FDdEIsQ0FBQyxZQUFZLEtBQUssT0FBTyxJQUFJLGNBQWMsR0FBRyxTQUFTLENBQUMsQ0FBQyxFQUFFOzRCQUM5RCxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUM1QjtxQkFDRjt5QkFBTSxFQUFHLG1CQUFtQjt3QkFDM0IsTUFBTSxFQUFDLEtBQUssRUFBRSxPQUFPLEVBQUMsR0FBRyxJQUFJLENBQUM7d0JBQzlCLElBQUksS0FBSyxLQUFLLFlBQVksSUFBSSxPQUFPLEtBQUssY0FBYyxFQUFFOzRCQUN4RCxNQUFNLEdBQUcsVUFBVSxDQUFDLEtBQUssQ0FBQyxDQUFDO3lCQUM1QjtxQkFDRjtnQkFDSCxDQUFDLENBQUMsQ0FBQztnQkFDSCxJQUFJLE1BQU0sRUFBRTtvQkFDVixPQUFPLE1BQU0sQ0FBQztpQkFDZjthQUNGO1lBQ0QsMkRBQTJEO1lBQzNELE9BQU8sbUJBQW1CLENBQUMsTUFBTSxFQUFFLElBQUksRUFBb0IsS0FBSyxDQUFDLENBQUMsWUFBWSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUMvRixLQUFLLGVBQWUsQ0FBQyxJQUFJO1lBQ3ZCLE9BQU8saUJBQWlCLENBQUMsTUFBTSxFQUFvQixLQUFLLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzdGO1lBQ0UsdUZBQXVGO1lBQ3ZGLHdGQUF3RjtZQUN4RiwyRkFBMkY7WUFDM0Ysd0RBQXdEO1lBQ3hELE1BQU0sVUFBVSxHQUFVLElBQUksQ0FBQztZQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixVQUFVLEVBQUUsQ0FBQyxDQUFDO0tBQ2hFO0FBQ0gsQ0FBQztBQUVEOzs7O0dBSUc7QUFDSCxTQUFTLGNBQWMsQ0FBQyxLQUFnQjtJQUN0QyxPQUFPLFVBQVMsSUFBVSxFQUFFLE1BQWMsRUFBRSxNQUFjO1FBQ3hELE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQztRQUN6QixNQUFNLFNBQVMsR0FBRyxxQkFBcUIsQ0FBQyxNQUFNLEVBQUUsWUFBWSxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ3hFLE1BQU0sS0FBSyxHQUFHLElBQUksR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztRQUN0RSxRQUFRLEtBQUssRUFBRTtZQUNiLEtBQUssU0FBUyxDQUFDLEtBQUs7Z0JBQ2xCLE9BQU8sQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUM7b0JBQzVELFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbkQsS0FBSyxTQUFTLENBQUMsUUFBUTtnQkFDckIsT0FBTyxLQUFLLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztZQUMzRSxLQUFLLFNBQVMsQ0FBQyxJQUFJO2dCQUNqQixPQUFPLEtBQUssR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxHQUFHLEdBQUc7b0JBQzFFLFNBQVMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksR0FBRyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUM7WUFDbkQsS0FBSyxTQUFTLENBQUMsUUFBUTtnQkFDckIsSUFBSSxNQUFNLEtBQUssQ0FBQyxFQUFFO29CQUNoQixPQUFPLEdBQUcsQ0FBQztpQkFDWjtxQkFBTTtvQkFDTCxPQUFPLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsU0FBUyxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsU0FBUyxDQUFDLEdBQUcsR0FBRzt3QkFDbEUsU0FBUyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQztpQkFDbEQ7WUFDSDtnQkFDRSxNQUFNLElBQUksS0FBSyxDQUFDLHVCQUF1QixLQUFLLEdBQUcsQ0FBQyxDQUFDO1NBQ3BEO0lBQ0gsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsQ0FBQztBQUNsQixNQUFNLFFBQVEsR0FBRyxDQUFDLENBQUM7QUFDbkIsU0FBUyxzQkFBc0IsQ0FBQyxJQUFZO0lBQzFDLE1BQU0sY0FBYyxHQUFHLENBQUMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDO0lBQzdELE9BQU8sSUFBSSxJQUFJLENBQ1gsSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLGNBQWMsSUFBSSxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEdBQUcsQ0FBQyxDQUFDLEdBQUcsY0FBYyxDQUFDLENBQUM7QUFDOUYsQ0FBQztBQUVELFNBQVMsbUJBQW1CLENBQUMsUUFBYztJQUN6QyxPQUFPLElBQUksSUFBSSxDQUNYLFFBQVEsQ0FBQyxXQUFXLEVBQUUsRUFBRSxRQUFRLENBQUMsUUFBUSxFQUFFLEVBQzNDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFFRCxTQUFTLFVBQVUsQ0FBQyxJQUFZLEVBQUUsVUFBVSxHQUFHLEtBQUs7SUFDbEQsT0FBTyxVQUFTLElBQVUsRUFBRSxNQUFjO1FBQ3hDLElBQUksTUFBTSxDQUFDO1FBQ1gsSUFBSSxVQUFVLEVBQUU7WUFDZCxNQUFNLHlCQUF5QixHQUMzQixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztZQUNsRSxNQUFNLEtBQUssR0FBRyxJQUFJLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDN0IsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsS0FBSyxHQUFHLHlCQUF5QixDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7U0FDbEU7YUFBTTtZQUNMLE1BQU0sVUFBVSxHQUFHLHNCQUFzQixDQUFDLElBQUksQ0FBQyxXQUFXLEVBQUUsQ0FBQyxDQUFDO1lBQzlELE1BQU0sU0FBUyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzVDLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7WUFDeEQsTUFBTSxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFFLHNCQUFzQjtTQUNqRTtRQUVELE9BQU8sU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUscUJBQXFCLENBQUMsTUFBTSxFQUFFLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBQ3hGLENBQUMsQ0FBQztBQUNKLENBQUM7QUFJRCxNQUFNLFlBQVksR0FBc0MsRUFBRSxDQUFDO0FBRTNELHlCQUF5QjtBQUN6QixpR0FBaUc7QUFDakcsdUVBQXVFO0FBQ3ZFLDhGQUE4RjtBQUM5RixTQUFTLGdCQUFnQixDQUFDLE1BQWM7SUFDdEMsSUFBSSxZQUFZLENBQUMsTUFBTSxDQUFDLEVBQUU7UUFDeEIsT0FBTyxZQUFZLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDN0I7SUFDRCxJQUFJLFNBQVMsQ0FBQztJQUNkLFFBQVEsTUFBTSxFQUFFO1FBQ2QsbUJBQW1CO1FBQ25CLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDOUUsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN2RSxNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQ3pFLE1BQU07UUFFUixzRUFBc0U7UUFDdEUsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU07UUFDUiwwRkFBMEY7UUFDMUYsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzVELE1BQU07UUFDUiw0RkFBNEY7UUFDNUYsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU07UUFDUiwwRUFBMEU7UUFDMUUsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxFQUFFLElBQUksQ0FBQyxDQUFDO1lBQzdELE1BQU07UUFFUixvQ0FBb0M7UUFDcEMsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzdDLE1BQU07UUFDUixLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssSUFBSTtZQUNQLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDN0MsTUFBTTtRQUVSLG1EQUFtRDtRQUNuRCxLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDaEYsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN6RSxNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzNFLE1BQU07UUFFUix1REFBdUQ7UUFDdkQsS0FBSyxLQUFLO1lBQ1IsU0FBUztnQkFDTCxhQUFhLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzlGLE1BQU07UUFDUixLQUFLLE1BQU07WUFDVCxTQUFTO2dCQUNMLGFBQWEsQ0FBQyxlQUFlLENBQUMsTUFBTSxFQUFFLGdCQUFnQixDQUFDLElBQUksRUFBRSxTQUFTLENBQUMsVUFBVSxDQUFDLENBQUM7WUFDdkYsTUFBTTtRQUNSLEtBQUssT0FBTztZQUNWLFNBQVM7Z0JBQ0wsYUFBYSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUN6RixNQUFNO1FBRVIsK0JBQStCO1FBQy9CLEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTTtRQUNSLEtBQUssSUFBSTtZQUNQLFNBQVMsR0FBRyxVQUFVLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDMUIsTUFBTTtRQUVSLDZCQUE2QjtRQUM3QixLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNoQyxNQUFNO1FBRVIsMEJBQTBCO1FBQzFCLEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN6QyxNQUFNO1FBQ1IsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3pDLE1BQU07UUFFUixrQkFBa0I7UUFDbEIsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSztZQUNSLFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLENBQUMsQ0FBQztZQUM5RSxNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3ZFLE1BQU07UUFDUixLQUFLLE9BQU87WUFDVixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDekUsTUFBTTtRQUNSLEtBQUssUUFBUTtZQUNYLFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUN4RSxNQUFNO1FBRVIsb0NBQW9DO1FBQ3BDLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUs7WUFDUixTQUFTLEdBQUcsYUFBYSxDQUFDLGVBQWUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxDQUFDLENBQUM7WUFDcEYsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxhQUFhLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUM3RSxNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsU0FBUyxHQUFHLGFBQWEsQ0FBQyxlQUFlLENBQUMsVUFBVSxFQUFFLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQy9FLE1BQU07UUFFUixtRUFBbUU7UUFDbkUsS0FBSyxHQUFHLENBQUM7UUFDVCxLQUFLLElBQUksQ0FBQztRQUNWLEtBQUssS0FBSztZQUNSLFNBQVMsR0FBRyxhQUFhLENBQ3JCLGVBQWUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsV0FBVyxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUYsTUFBTTtRQUNSLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxhQUFhLENBQ3JCLGVBQWUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsSUFBSSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbkYsTUFBTTtRQUNSLEtBQUssT0FBTztZQUNWLFNBQVMsR0FBRyxhQUFhLENBQ3JCLGVBQWUsQ0FBQyxVQUFVLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxVQUFVLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDckYsTUFBTTtRQUVSLGdFQUFnRTtRQUNoRSxLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLGFBQWEsQ0FDckIsZUFBZSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxXQUFXLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUN0RixNQUFNO1FBQ1IsS0FBSyxNQUFNO1lBQ1QsU0FBUztnQkFDTCxhQUFhLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUM3RixNQUFNO1FBQ1IsS0FBSyxPQUFPO1lBQ1YsU0FBUyxHQUFHLGFBQWEsQ0FDckIsZUFBZSxDQUFDLFVBQVUsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLE1BQU0sRUFBRSxJQUFJLENBQUMsQ0FBQztZQUNqRixNQUFNO1FBRVIsd0JBQXdCO1FBQ3hCLEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLEtBQUssRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztZQUMvQyxNQUFNO1FBQ1IsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1lBQy9DLE1BQU07UUFFUix5QkFBeUI7UUFDekIsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU07UUFDUiw4QkFBOEI7UUFDOUIsS0FBSyxJQUFJO1lBQ1AsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzFDLE1BQU07UUFFUiw0QkFBNEI7UUFDNUIsS0FBSyxHQUFHO1lBQ04sU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQzVDLE1BQU07UUFDUixLQUFLLElBQUk7WUFDUCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTTtRQUVSLDhCQUE4QjtRQUM5QixLQUFLLEdBQUc7WUFDTixTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDNUMsTUFBTTtRQUNSLEtBQUssSUFBSTtZQUNQLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUMsQ0FBQztZQUM1QyxNQUFNO1FBRVIsb0JBQW9CO1FBQ3BCLEtBQUssR0FBRztZQUNOLFNBQVMsR0FBRyxVQUFVLENBQUMsUUFBUSxDQUFDLGlCQUFpQixFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3RELE1BQU07UUFDUixLQUFLLElBQUk7WUFDUCxTQUFTLEdBQUcsVUFBVSxDQUFDLFFBQVEsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN0RCxNQUFNO1FBQ1IsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLFVBQVUsQ0FBQyxRQUFRLENBQUMsaUJBQWlCLEVBQUUsQ0FBQyxDQUFDLENBQUM7WUFDdEQsTUFBTTtRQUdSLHdDQUF3QztRQUN4QyxLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDNUMsTUFBTTtRQUNSLDRDQUE0QztRQUM1QyxLQUFLLE9BQU87WUFDVixTQUFTLEdBQUcsY0FBYyxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUMvQyxNQUFNO1FBRVIsb0NBQW9DO1FBQ3BDLEtBQUssR0FBRyxDQUFDO1FBQ1QsS0FBSyxJQUFJLENBQUM7UUFDVixLQUFLLEtBQUssQ0FBQztRQUNYLDBGQUEwRjtRQUMxRixLQUFLLEdBQUcsQ0FBQztRQUNULEtBQUssSUFBSSxDQUFDO1FBQ1YsS0FBSyxLQUFLO1lBQ1IsU0FBUyxHQUFHLGNBQWMsQ0FBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUM7WUFDL0MsTUFBTTtRQUNSLHNDQUFzQztRQUN0QyxLQUFLLE1BQU0sQ0FBQztRQUNaLEtBQUssTUFBTSxDQUFDO1FBQ1osMEZBQTBGO1FBQzFGLEtBQUssTUFBTTtZQUNULFNBQVMsR0FBRyxjQUFjLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQzNDLE1BQU07UUFDUjtZQUNFLE9BQU8sSUFBSSxDQUFDO0tBQ2Y7SUFDRCxZQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ2pDLE9BQU8sU0FBUyxDQUFDO0FBQ25CLENBQUM7QUFFRCxTQUFTLGdCQUFnQixDQUFDLFFBQWdCLEVBQUUsUUFBZ0I7SUFDMUQscUNBQXFDO0lBQ3JDLHNEQUFzRDtJQUN0RCxRQUFRLEdBQUcsUUFBUSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDdEMsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLHdCQUF3QixHQUFHLFFBQVEsQ0FBQyxHQUFHLEtBQUssQ0FBQztJQUN4RixPQUFPLEtBQUssQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLHVCQUF1QixDQUFDO0FBQzdFLENBQUM7QUFFRCxTQUFTLGNBQWMsQ0FBQyxJQUFVLEVBQUUsT0FBZTtJQUNqRCxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7SUFDaEMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLEdBQUcsT0FBTyxDQUFDLENBQUM7SUFDN0MsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsU0FBUyxzQkFBc0IsQ0FBQyxJQUFVLEVBQUUsUUFBZ0IsRUFBRSxPQUFnQjtJQUM1RSxNQUFNLFlBQVksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDdEMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLENBQUMsaUJBQWlCLEVBQUUsQ0FBQztJQUNwRCxNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxRQUFRLEVBQUUsa0JBQWtCLENBQUMsQ0FBQztJQUN0RSxPQUFPLGNBQWMsQ0FBQyxJQUFJLEVBQUUsWUFBWSxHQUFHLENBQUMsY0FBYyxHQUFHLGtCQUFrQixDQUFDLENBQUMsQ0FBQztBQUNwRixDQUFDO0FBRUQ7Ozs7Ozs7Ozs7O0dBV0c7QUFDSCxNQUFNLFVBQVUsTUFBTSxDQUFDLEtBQTZCO0lBQ2xELElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxFQUFFO1FBQ2pCLE9BQU8sS0FBSyxDQUFDO0tBQ2Q7SUFFRCxJQUFJLE9BQU8sS0FBSyxLQUFLLFFBQVEsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUM5QyxPQUFPLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDO0tBQ3hCO0lBRUQsSUFBSSxPQUFPLEtBQUssS0FBSyxRQUFRLEVBQUU7UUFDN0IsS0FBSyxHQUFHLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUVyQixNQUFNLFFBQVEsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFbkMsOEVBQThFO1FBQzlFLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBWSxHQUFHLFFBQVEsQ0FBQyxFQUFFO1lBQ25DLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7U0FDM0I7UUFFRCxJQUFJLDJCQUEyQixDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRTtZQUMzQzs7Ozs7O3NFQU0wRDtZQUMxRCxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUM5RCxPQUFPLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQzlCO1FBRUQsSUFBSSxLQUE0QixDQUFDO1FBQ2pDLElBQUksS0FBSyxHQUFHLEtBQUssQ0FBQyxLQUFLLENBQUMsa0JBQWtCLENBQUMsRUFBRTtZQUMzQyxPQUFPLGVBQWUsQ0FBQyxLQUFLLENBQUMsQ0FBQztTQUMvQjtLQUNGO0lBRUQsTUFBTSxJQUFJLEdBQUcsSUFBSSxJQUFJLENBQUMsS0FBWSxDQUFDLENBQUM7SUFDcEMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNqQixNQUFNLElBQUksS0FBSyxDQUFDLHNCQUFzQixLQUFLLGVBQWUsQ0FBQyxDQUFDO0tBQzdEO0lBQ0QsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQ7OztHQUdHO0FBQ0gsTUFBTSxVQUFVLGVBQWUsQ0FBQyxLQUF1QjtJQUNyRCxNQUFNLElBQUksR0FBRyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUN6QixJQUFJLE1BQU0sR0FBRyxDQUFDLENBQUM7SUFDZixJQUFJLEtBQUssR0FBRyxDQUFDLENBQUM7SUFFZCwyRkFBMkY7SUFDM0YsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDO0lBQ3JFLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQztJQUUvRCwwREFBMEQ7SUFDMUQsSUFBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUU7UUFDWixNQUFNLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUN0QyxLQUFLLEdBQUcsTUFBTSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztLQUN0QztJQUNELFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2hGLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDO0lBQ3pDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsS0FBSyxDQUFDO0lBQ3hDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7SUFDaEMsTUFBTSxFQUFFLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxVQUFVLENBQUMsSUFBSSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDakUsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDbkMsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBRUQsTUFBTSxVQUFVLE1BQU0sQ0FBQyxLQUFVO0lBQy9CLE9BQU8sS0FBSyxZQUFZLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsT0FBTyxFQUFFLENBQUMsQ0FBQztBQUMxRCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0Zvcm1TdHlsZSwgRm9ybWF0V2lkdGgsIE51bWJlclN5bWJvbCwgVGltZSwgVHJhbnNsYXRpb25XaWR0aCwgZ2V0TG9jYWxlRGF0ZUZvcm1hdCwgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQsIGdldExvY2FsZURheU5hbWVzLCBnZXRMb2NhbGVEYXlQZXJpb2RzLCBnZXRMb2NhbGVFcmFOYW1lcywgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcywgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzLCBnZXRMb2NhbGVJZCwgZ2V0TG9jYWxlTW9udGhOYW1lcywgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sLCBnZXRMb2NhbGVUaW1lRm9ybWF0fSBmcm9tICcuL2xvY2FsZV9kYXRhX2FwaSc7XG5cbmV4cG9ydCBjb25zdCBJU084NjAxX0RBVEVfUkVHRVggPVxuICAgIC9eKFxcZHs0fSktPyhcXGRcXGQpLT8oXFxkXFxkKSg/OlQoXFxkXFxkKSg/Ojo/KFxcZFxcZCkoPzo6PyhcXGRcXGQpKD86XFwuKFxcZCspKT8pPyk/KFp8KFsrLV0pKFxcZFxcZCk6PyhcXGRcXGQpKT8pPyQvO1xuLy8gICAgMSAgICAgICAgMiAgICAgICAzICAgICAgICAgNCAgICAgICAgICA1ICAgICAgICAgIDYgICAgICAgICAgNyAgICAgICAgICA4ICA5ICAgICAxMCAgICAgIDExXG5jb25zdCBOQU1FRF9GT1JNQVRTOiB7W2xvY2FsZUlkOiBzdHJpbmddOiB7W2Zvcm1hdDogc3RyaW5nXTogc3RyaW5nfX0gPSB7fTtcbmNvbnN0IERBVEVfRk9STUFUU19TUExJVCA9XG4gICAgLygoPzpbXkd5TUx3V2RFYWJCaEhtc1N6Wk8nXSspfCg/OicoPzpbXiddfCcnKSonKXwoPzpHezEsNX18eXsxLDR9fE17MSw1fXxMezEsNX18d3sxLDJ9fFd7MX18ZHsxLDJ9fEV7MSw2fXxhezEsNX18YnsxLDV9fEJ7MSw1fXxoezEsMn18SHsxLDJ9fG17MSwyfXxzezEsMn18U3sxLDN9fHp7MSw0fXxaezEsNX18T3sxLDR9KSkoW1xcc1xcU10qKS87XG5cbmVudW0gWm9uZVdpZHRoIHtcbiAgU2hvcnQsXG4gIFNob3J0R01ULFxuICBMb25nLFxuICBFeHRlbmRlZFxufVxuXG5lbnVtIERhdGVUeXBlIHtcbiAgRnVsbFllYXIsXG4gIE1vbnRoLFxuICBEYXRlLFxuICBIb3VycyxcbiAgTWludXRlcyxcbiAgU2Vjb25kcyxcbiAgRnJhY3Rpb25hbFNlY29uZHMsXG4gIERheVxufVxuXG5lbnVtIFRyYW5zbGF0aW9uVHlwZSB7XG4gIERheVBlcmlvZHMsXG4gIERheXMsXG4gIE1vbnRocyxcbiAgRXJhc1xufVxuXG4vKipcbiAqIEBuZ01vZHVsZSBDb21tb25Nb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIEZvcm1hdHMgYSBkYXRlIGFjY29yZGluZyB0byBsb2NhbGUgcnVsZXMuXG4gKlxuICogV2hlcmU6XG4gKiAtIGB2YWx1ZWAgaXMgYSBEYXRlLCBhIG51bWJlciAobWlsbGlzZWNvbmRzIHNpbmNlIFVUQyBlcG9jaCkgb3IgYW4gSVNPIHN0cmluZ1xuICogICAoaHR0cHM6Ly93d3cudzMub3JnL1RSL05PVEUtZGF0ZXRpbWUpLlxuICogLSBgZm9ybWF0YCBpbmRpY2F0ZXMgd2hpY2ggZGF0ZS90aW1lIGNvbXBvbmVudHMgdG8gaW5jbHVkZS4gU2VlIHtAbGluayBEYXRlUGlwZX0gZm9yIG1vcmVcbiAqICAgZGV0YWlscy5cbiAqIC0gYGxvY2FsZWAgaXMgYSBgc3RyaW5nYCBkZWZpbmluZyB0aGUgbG9jYWxlIHRvIHVzZS5cbiAqIC0gYHRpbWV6b25lYCB0byBiZSB1c2VkIGZvciBmb3JtYXR0aW5nLiBJdCB1bmRlcnN0YW5kcyBVVEMvR01UIGFuZCB0aGUgY29udGluZW50YWwgVVMgdGltZSB6b25lXG4gKiAgIGFiYnJldmlhdGlvbnMsIGJ1dCBmb3IgZ2VuZXJhbCB1c2UsIHVzZSBhIHRpbWUgem9uZSBvZmZzZXQgKGUuZy4gYCcrMDQzMCdgKS5cbiAqICAgSWYgbm90IHNwZWNpZmllZCwgaG9zdCBzeXN0ZW0gc2V0dGluZ3MgYXJlIHVzZWQuXG4gKlxuICogU2VlIHtAbGluayBEYXRlUGlwZX0gZm9yIG1vcmUgZGV0YWlscy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmb3JtYXREYXRlKFxuICAgIHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlLCBmb3JtYXQ6IHN0cmluZywgbG9jYWxlOiBzdHJpbmcsIHRpbWV6b25lPzogc3RyaW5nKTogc3RyaW5nIHtcbiAgbGV0IGRhdGUgPSB0b0RhdGUodmFsdWUpO1xuICBjb25zdCBuYW1lZEZvcm1hdCA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgZm9ybWF0KTtcbiAgZm9ybWF0ID0gbmFtZWRGb3JtYXQgfHwgZm9ybWF0O1xuXG4gIGxldCBwYXJ0czogc3RyaW5nW10gPSBbXTtcbiAgbGV0IG1hdGNoO1xuICB3aGlsZSAoZm9ybWF0KSB7XG4gICAgbWF0Y2ggPSBEQVRFX0ZPUk1BVFNfU1BMSVQuZXhlYyhmb3JtYXQpO1xuICAgIGlmIChtYXRjaCkge1xuICAgICAgcGFydHMgPSBwYXJ0cy5jb25jYXQobWF0Y2guc2xpY2UoMSkpO1xuICAgICAgY29uc3QgcGFydCA9IHBhcnRzLnBvcCgpO1xuICAgICAgaWYgKCFwYXJ0KSB7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgZm9ybWF0ID0gcGFydDtcbiAgICB9IGVsc2Uge1xuICAgICAgcGFydHMucHVzaChmb3JtYXQpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgbGV0IGRhdGVUaW1lem9uZU9mZnNldCA9IGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKTtcbiAgaWYgKHRpbWV6b25lKSB7XG4gICAgZGF0ZVRpbWV6b25lT2Zmc2V0ID0gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZSwgZGF0ZVRpbWV6b25lT2Zmc2V0KTtcbiAgICBkYXRlID0gY29udmVydFRpbWV6b25lVG9Mb2NhbChkYXRlLCB0aW1lem9uZSwgdHJ1ZSk7XG4gIH1cblxuICBsZXQgdGV4dCA9ICcnO1xuICBwYXJ0cy5mb3JFYWNoKHZhbHVlID0+IHtcbiAgICBjb25zdCBkYXRlRm9ybWF0dGVyID0gZ2V0RGF0ZUZvcm1hdHRlcih2YWx1ZSk7XG4gICAgdGV4dCArPSBkYXRlRm9ybWF0dGVyID9cbiAgICAgICAgZGF0ZUZvcm1hdHRlcihkYXRlLCBsb2NhbGUsIGRhdGVUaW1lem9uZU9mZnNldCkgOlxuICAgICAgICB2YWx1ZSA9PT0gJ1xcJ1xcJycgPyAnXFwnJyA6IHZhbHVlLnJlcGxhY2UoLyheJ3wnJCkvZywgJycpLnJlcGxhY2UoLycnL2csICdcXCcnKTtcbiAgfSk7XG5cbiAgcmV0dXJuIHRleHQ7XG59XG5cbmZ1bmN0aW9uIGdldE5hbWVkRm9ybWF0KGxvY2FsZTogc3RyaW5nLCBmb3JtYXQ6IHN0cmluZyk6IHN0cmluZyB7XG4gIGNvbnN0IGxvY2FsZUlkID0gZ2V0TG9jYWxlSWQobG9jYWxlKTtcbiAgTkFNRURfRk9STUFUU1tsb2NhbGVJZF0gPSBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXSB8fCB7fTtcblxuICBpZiAoTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XSkge1xuICAgIHJldHVybiBOQU1FRF9GT1JNQVRTW2xvY2FsZUlkXVtmb3JtYXRdO1xuICB9XG5cbiAgbGV0IGZvcm1hdFZhbHVlID0gJyc7XG4gIHN3aXRjaCAoZm9ybWF0KSB7XG4gICAgY2FzZSAnc2hvcnREYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bURhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTWVkaXVtKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2xvbmdEYXRlJzpcbiAgICAgIGZvcm1hdFZhbHVlID0gZ2V0TG9jYWxlRGF0ZUZvcm1hdChsb2NhbGUsIEZvcm1hdFdpZHRoLkxvbmcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbERhdGUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVEYXRlRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguRnVsbCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdzaG9ydFRpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbWVkaXVtVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZ1RpbWUnOlxuICAgICAgZm9ybWF0VmFsdWUgPSBnZXRMb2NhbGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguTG9uZyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdmdWxsVGltZSc6XG4gICAgICBmb3JtYXRWYWx1ZSA9IGdldExvY2FsZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3Nob3J0JzpcbiAgICAgIGNvbnN0IHNob3J0VGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ3Nob3J0VGltZScpO1xuICAgICAgY29uc3Qgc2hvcnREYXRlID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnc2hvcnREYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9IGZvcm1hdERhdGVUaW1lKFxuICAgICAgICAgIGdldExvY2FsZURhdGVUaW1lRm9ybWF0KGxvY2FsZSwgRm9ybWF0V2lkdGguU2hvcnQpLCBbc2hvcnRUaW1lLCBzaG9ydERhdGVdKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ21lZGl1bSc6XG4gICAgICBjb25zdCBtZWRpdW1UaW1lID0gZ2V0TmFtZWRGb3JtYXQobG9jYWxlLCAnbWVkaXVtVGltZScpO1xuICAgICAgY29uc3QgbWVkaXVtRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ21lZGl1bURhdGUnKTtcbiAgICAgIGZvcm1hdFZhbHVlID0gZm9ybWF0RGF0ZVRpbWUoXG4gICAgICAgICAgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5NZWRpdW0pLCBbbWVkaXVtVGltZSwgbWVkaXVtRGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbG9uZyc6XG4gICAgICBjb25zdCBsb25nVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2xvbmdUaW1lJyk7XG4gICAgICBjb25zdCBsb25nRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2xvbmdEYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9XG4gICAgICAgICAgZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5Mb25nKSwgW2xvbmdUaW1lLCBsb25nRGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZnVsbCc6XG4gICAgICBjb25zdCBmdWxsVGltZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2Z1bGxUaW1lJyk7XG4gICAgICBjb25zdCBmdWxsRGF0ZSA9IGdldE5hbWVkRm9ybWF0KGxvY2FsZSwgJ2Z1bGxEYXRlJyk7XG4gICAgICBmb3JtYXRWYWx1ZSA9XG4gICAgICAgICAgZm9ybWF0RGF0ZVRpbWUoZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQobG9jYWxlLCBGb3JtYXRXaWR0aC5GdWxsKSwgW2Z1bGxUaW1lLCBmdWxsRGF0ZV0pO1xuICAgICAgYnJlYWs7XG4gIH1cbiAgaWYgKGZvcm1hdFZhbHVlKSB7XG4gICAgTkFNRURfRk9STUFUU1tsb2NhbGVJZF1bZm9ybWF0XSA9IGZvcm1hdFZhbHVlO1xuICB9XG4gIHJldHVybiBmb3JtYXRWYWx1ZTtcbn1cblxuZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoc3RyOiBzdHJpbmcsIG9wdF92YWx1ZXM6IHN0cmluZ1tdKSB7XG4gIGlmIChvcHRfdmFsdWVzKSB7XG4gICAgc3RyID0gc3RyLnJlcGxhY2UoL1xceyhbXn1dKyl9L2csIGZ1bmN0aW9uKG1hdGNoLCBrZXkpIHtcbiAgICAgIHJldHVybiAob3B0X3ZhbHVlcyAhPSBudWxsICYmIGtleSBpbiBvcHRfdmFsdWVzKSA/IG9wdF92YWx1ZXNba2V5XSA6IG1hdGNoO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiBzdHI7XG59XG5cbmZ1bmN0aW9uIHBhZE51bWJlcihcbiAgICBudW06IG51bWJlciwgZGlnaXRzOiBudW1iZXIsIG1pbnVzU2lnbiA9ICctJywgdHJpbT86IGJvb2xlYW4sIG5lZ1dyYXA/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgbGV0IG5lZyA9ICcnO1xuICBpZiAobnVtIDwgMCB8fCAobmVnV3JhcCAmJiBudW0gPD0gMCkpIHtcbiAgICBpZiAobmVnV3JhcCkge1xuICAgICAgbnVtID0gLW51bSArIDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIG51bSA9IC1udW07XG4gICAgICBuZWcgPSBtaW51c1NpZ247XG4gICAgfVxuICB9XG4gIGxldCBzdHJOdW0gPSBTdHJpbmcobnVtKTtcbiAgd2hpbGUgKHN0ck51bS5sZW5ndGggPCBkaWdpdHMpIHtcbiAgICBzdHJOdW0gPSAnMCcgKyBzdHJOdW07XG4gIH1cbiAgaWYgKHRyaW0pIHtcbiAgICBzdHJOdW0gPSBzdHJOdW0uc3Vic3RyKHN0ck51bS5sZW5ndGggLSBkaWdpdHMpO1xuICB9XG4gIHJldHVybiBuZWcgKyBzdHJOdW07XG59XG5cbmZ1bmN0aW9uIGZvcm1hdEZyYWN0aW9uYWxTZWNvbmRzKG1pbGxpc2Vjb25kczogbnVtYmVyLCBkaWdpdHM6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IHN0ck1zID0gcGFkTnVtYmVyKG1pbGxpc2Vjb25kcywgMyk7XG4gIHJldHVybiBzdHJNcy5zdWJzdHIoMCwgZGlnaXRzKTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgZGF0ZSBmb3JtYXR0ZXIgdGhhdCB0cmFuc2Zvcm1zIGEgZGF0ZSBpbnRvIGl0cyBsb2NhbGUgZGlnaXQgcmVwcmVzZW50YXRpb25cbiAqL1xuZnVuY3Rpb24gZGF0ZUdldHRlcihcbiAgICBuYW1lOiBEYXRlVHlwZSwgc2l6ZTogbnVtYmVyLCBvZmZzZXQ6IG51bWJlciA9IDAsIHRyaW0gPSBmYWxzZSxcbiAgICBuZWdXcmFwID0gZmFsc2UpOiBEYXRlRm9ybWF0dGVyIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBsZXQgcGFydCA9IGdldERhdGVQYXJ0KG5hbWUsIGRhdGUpO1xuICAgIGlmIChvZmZzZXQgPiAwIHx8IHBhcnQgPiAtb2Zmc2V0KSB7XG4gICAgICBwYXJ0ICs9IG9mZnNldDtcbiAgICB9XG5cbiAgICBpZiAobmFtZSA9PT0gRGF0ZVR5cGUuSG91cnMpIHtcbiAgICAgIGlmIChwYXJ0ID09PSAwICYmIG9mZnNldCA9PT0gLTEyKSB7XG4gICAgICAgIHBhcnQgPSAxMjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKG5hbWUgPT09IERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzKSB7XG4gICAgICByZXR1cm4gZm9ybWF0RnJhY3Rpb25hbFNlY29uZHMocGFydCwgc2l6ZSk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9jYWxlTWludXMgPSBnZXRMb2NhbGVOdW1iZXJTeW1ib2wobG9jYWxlLCBOdW1iZXJTeW1ib2wuTWludXNTaWduKTtcbiAgICByZXR1cm4gcGFkTnVtYmVyKHBhcnQsIHNpemUsIGxvY2FsZU1pbnVzLCB0cmltLCBuZWdXcmFwKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gZ2V0RGF0ZVBhcnQocGFydDogRGF0ZVR5cGUsIGRhdGU6IERhdGUpOiBudW1iZXIge1xuICBzd2l0Y2ggKHBhcnQpIHtcbiAgICBjYXNlIERhdGVUeXBlLkZ1bGxZZWFyOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0RnVsbFllYXIoKTtcbiAgICBjYXNlIERhdGVUeXBlLk1vbnRoOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TW9udGgoKTtcbiAgICBjYXNlIERhdGVUeXBlLkRhdGU6XG4gICAgICByZXR1cm4gZGF0ZS5nZXREYXRlKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5Ib3VyczpcbiAgICAgIHJldHVybiBkYXRlLmdldEhvdXJzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5NaW51dGVzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TWludXRlcygpO1xuICAgIGNhc2UgRGF0ZVR5cGUuU2Vjb25kczpcbiAgICAgIHJldHVybiBkYXRlLmdldFNlY29uZHMoKTtcbiAgICBjYXNlIERhdGVUeXBlLkZyYWN0aW9uYWxTZWNvbmRzOlxuICAgICAgcmV0dXJuIGRhdGUuZ2V0TWlsbGlzZWNvbmRzKCk7XG4gICAgY2FzZSBEYXRlVHlwZS5EYXk6XG4gICAgICByZXR1cm4gZGF0ZS5nZXREYXkoKTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbmtub3duIERhdGVUeXBlIHZhbHVlIFwiJHtwYXJ0fVwiLmApO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRhdGUgZm9ybWF0dGVyIHRoYXQgdHJhbnNmb3JtcyBhIGRhdGUgaW50byBpdHMgbG9jYWxlIHN0cmluZyByZXByZXNlbnRhdGlvblxuICovXG5mdW5jdGlvbiBkYXRlU3RyR2V0dGVyKFxuICAgIG5hbWU6IFRyYW5zbGF0aW9uVHlwZSwgd2lkdGg6IFRyYW5zbGF0aW9uV2lkdGgsIGZvcm06IEZvcm1TdHlsZSA9IEZvcm1TdHlsZS5Gb3JtYXQsXG4gICAgZXh0ZW5kZWQgPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBnZXREYXRlVHJhbnNsYXRpb24oZGF0ZSwgbG9jYWxlLCBuYW1lLCB3aWR0aCwgZm9ybSwgZXh0ZW5kZWQpO1xuICB9O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGxvY2FsZSB0cmFuc2xhdGlvbiBvZiBhIGRhdGUgZm9yIGEgZ2l2ZW4gZm9ybSwgdHlwZSBhbmQgd2lkdGhcbiAqL1xuZnVuY3Rpb24gZ2V0RGF0ZVRyYW5zbGF0aW9uKFxuICAgIGRhdGU6IERhdGUsIGxvY2FsZTogc3RyaW5nLCBuYW1lOiBUcmFuc2xhdGlvblR5cGUsIHdpZHRoOiBUcmFuc2xhdGlvbldpZHRoLCBmb3JtOiBGb3JtU3R5bGUsXG4gICAgZXh0ZW5kZWQ6IGJvb2xlYW4pIHtcbiAgc3dpdGNoIChuYW1lKSB7XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuTW9udGhzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZU1vbnRoTmFtZXMobG9jYWxlLCBmb3JtLCB3aWR0aClbZGF0ZS5nZXRNb250aCgpXTtcbiAgICBjYXNlIFRyYW5zbGF0aW9uVHlwZS5EYXlzOlxuICAgICAgcmV0dXJuIGdldExvY2FsZURheU5hbWVzKGxvY2FsZSwgZm9ybSwgd2lkdGgpW2RhdGUuZ2V0RGF5KCldO1xuICAgIGNhc2UgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHM6XG4gICAgICBjb25zdCBjdXJyZW50SG91cnMgPSBkYXRlLmdldEhvdXJzKCk7XG4gICAgICBjb25zdCBjdXJyZW50TWludXRlcyA9IGRhdGUuZ2V0TWludXRlcygpO1xuICAgICAgaWYgKGV4dGVuZGVkKSB7XG4gICAgICAgIGNvbnN0IHJ1bGVzID0gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcyhsb2NhbGUpO1xuICAgICAgICBjb25zdCBkYXlQZXJpb2RzID0gZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzKGxvY2FsZSwgZm9ybSwgd2lkdGgpO1xuICAgICAgICBsZXQgcmVzdWx0O1xuICAgICAgICBydWxlcy5mb3JFYWNoKChydWxlOiBUaW1lIHwgW1RpbWUsIFRpbWVdLCBpbmRleDogbnVtYmVyKSA9PiB7XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkocnVsZSkpIHtcbiAgICAgICAgICAgIC8vIG1vcm5pbmcsIGFmdGVybm9vbiwgZXZlbmluZywgbmlnaHRcbiAgICAgICAgICAgIGNvbnN0IHtob3VyczogaG91cnNGcm9tLCBtaW51dGVzOiBtaW51dGVzRnJvbX0gPSBydWxlWzBdO1xuICAgICAgICAgICAgY29uc3Qge2hvdXJzOiBob3Vyc1RvLCBtaW51dGVzOiBtaW51dGVzVG99ID0gcnVsZVsxXTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50SG91cnMgPj0gaG91cnNGcm9tICYmIGN1cnJlbnRNaW51dGVzID49IG1pbnV0ZXNGcm9tICYmXG4gICAgICAgICAgICAgICAgKGN1cnJlbnRIb3VycyA8IGhvdXJzVG8gfHxcbiAgICAgICAgICAgICAgICAgKGN1cnJlbnRIb3VycyA9PT0gaG91cnNUbyAmJiBjdXJyZW50TWludXRlcyA8IG1pbnV0ZXNUbykpKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGRheVBlcmlvZHNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7ICAvLyBub29uIG9yIG1pZG5pZ2h0XG4gICAgICAgICAgICBjb25zdCB7aG91cnMsIG1pbnV0ZXN9ID0gcnVsZTtcbiAgICAgICAgICAgIGlmIChob3VycyA9PT0gY3VycmVudEhvdXJzICYmIG1pbnV0ZXMgPT09IGN1cnJlbnRNaW51dGVzKSB7XG4gICAgICAgICAgICAgIHJlc3VsdCA9IGRheVBlcmlvZHNbaW5kZXhdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChyZXN1bHQpIHtcbiAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBpZiBubyBydWxlcyBmb3IgdGhlIGRheSBwZXJpb2RzLCB3ZSB1c2UgYW0vcG0gYnkgZGVmYXVsdFxuICAgICAgcmV0dXJuIGdldExvY2FsZURheVBlcmlvZHMobG9jYWxlLCBmb3JtLCA8VHJhbnNsYXRpb25XaWR0aD53aWR0aClbY3VycmVudEhvdXJzIDwgMTIgPyAwIDogMV07XG4gICAgY2FzZSBUcmFuc2xhdGlvblR5cGUuRXJhczpcbiAgICAgIHJldHVybiBnZXRMb2NhbGVFcmFOYW1lcyhsb2NhbGUsIDxUcmFuc2xhdGlvbldpZHRoPndpZHRoKVtkYXRlLmdldEZ1bGxZZWFyKCkgPD0gMCA/IDAgOiAxXTtcbiAgICBkZWZhdWx0OlxuICAgICAgLy8gVGhpcyBkZWZhdWx0IGNhc2UgaXMgbm90IG5lZWRlZCBieSBUeXBlU2NyaXB0IGNvbXBpbGVyLCBhcyB0aGUgc3dpdGNoIGlzIGV4aGF1c3RpdmUuXG4gICAgICAvLyBIb3dldmVyIENsb3N1cmUgQ29tcGlsZXIgZG9lcyBub3QgdW5kZXJzdGFuZCB0aGF0IGFuZCByZXBvcnRzIGFuIGVycm9yIGluIHR5cGVkIG1vZGUuXG4gICAgICAvLyBUaGUgYHRocm93IG5ldyBFcnJvcmAgYmVsb3cgd29ya3MgYXJvdW5kIHRoZSBwcm9ibGVtLCBhbmQgdGhlIHVuZXhwZWN0ZWQ6IG5ldmVyIHZhcmlhYmxlXG4gICAgICAvLyBtYWtlcyBzdXJlIHRzYyBzdGlsbCBjaGVja3MgdGhpcyBjb2RlIGlzIHVucmVhY2hhYmxlLlxuICAgICAgY29uc3QgdW5leHBlY3RlZDogbmV2ZXIgPSBuYW1lO1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bmV4cGVjdGVkIHRyYW5zbGF0aW9uIHR5cGUgJHt1bmV4cGVjdGVkfWApO1xuICB9XG59XG5cbi8qKlxuICogUmV0dXJucyBhIGRhdGUgZm9ybWF0dGVyIHRoYXQgdHJhbnNmb3JtcyBhIGRhdGUgYW5kIGFuIG9mZnNldCBpbnRvIGEgdGltZXpvbmUgd2l0aCBJU084NjAxIG9yXG4gKiBHTVQgZm9ybWF0IGRlcGVuZGluZyBvbiB0aGUgd2lkdGggKGVnOiBzaG9ydCA9ICswNDMwLCBzaG9ydDpHTVQgPSBHTVQrNCwgbG9uZyA9IEdNVCswNDozMCxcbiAqIGV4dGVuZGVkID0gKzA0OjMwKVxuICovXG5mdW5jdGlvbiB0aW1lWm9uZUdldHRlcih3aWR0aDogWm9uZVdpZHRoKTogRGF0ZUZvcm1hdHRlciB7XG4gIHJldHVybiBmdW5jdGlvbihkYXRlOiBEYXRlLCBsb2NhbGU6IHN0cmluZywgb2Zmc2V0OiBudW1iZXIpIHtcbiAgICBjb25zdCB6b25lID0gLTEgKiBvZmZzZXQ7XG4gICAgY29uc3QgbWludXNTaWduID0gZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbik7XG4gICAgY29uc3QgaG91cnMgPSB6b25lID4gMCA/IE1hdGguZmxvb3Ioem9uZSAvIDYwKSA6IE1hdGguY2VpbCh6b25lIC8gNjApO1xuICAgIHN3aXRjaCAod2lkdGgpIHtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLlNob3J0OlxuICAgICAgICByZXR1cm4gKCh6b25lID49IDApID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAyLCBtaW51c1NpZ24pICtcbiAgICAgICAgICAgIHBhZE51bWJlcihNYXRoLmFicyh6b25lICUgNjApLCAyLCBtaW51c1NpZ24pO1xuICAgICAgY2FzZSBab25lV2lkdGguU2hvcnRHTVQ6XG4gICAgICAgIHJldHVybiAnR01UJyArICgoem9uZSA+PSAwKSA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMSwgbWludXNTaWduKTtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLkxvbmc6XG4gICAgICAgIHJldHVybiAnR01UJyArICgoem9uZSA+PSAwKSA/ICcrJyA6ICcnKSArIHBhZE51bWJlcihob3VycywgMiwgbWludXNTaWduKSArICc6JyArXG4gICAgICAgICAgICBwYWROdW1iZXIoTWF0aC5hYnMoem9uZSAlIDYwKSwgMiwgbWludXNTaWduKTtcbiAgICAgIGNhc2UgWm9uZVdpZHRoLkV4dGVuZGVkOlxuICAgICAgICBpZiAob2Zmc2V0ID09PSAwKSB7XG4gICAgICAgICAgcmV0dXJuICdaJztcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gKCh6b25lID49IDApID8gJysnIDogJycpICsgcGFkTnVtYmVyKGhvdXJzLCAyLCBtaW51c1NpZ24pICsgJzonICtcbiAgICAgICAgICAgICAgcGFkTnVtYmVyKE1hdGguYWJzKHpvbmUgJSA2MCksIDIsIG1pbnVzU2lnbik7XG4gICAgICAgIH1cbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5rbm93biB6b25lIHdpZHRoIFwiJHt3aWR0aH1cImApO1xuICAgIH1cbiAgfTtcbn1cblxuY29uc3QgSkFOVUFSWSA9IDA7XG5jb25zdCBUSFVSU0RBWSA9IDQ7XG5mdW5jdGlvbiBnZXRGaXJzdFRodXJzZGF5T2ZZZWFyKHllYXI6IG51bWJlcikge1xuICBjb25zdCBmaXJzdERheU9mWWVhciA9IChuZXcgRGF0ZSh5ZWFyLCBKQU5VQVJZLCAxKSkuZ2V0RGF5KCk7XG4gIHJldHVybiBuZXcgRGF0ZShcbiAgICAgIHllYXIsIDAsIDEgKyAoKGZpcnN0RGF5T2ZZZWFyIDw9IFRIVVJTREFZKSA/IFRIVVJTREFZIDogVEhVUlNEQVkgKyA3KSAtIGZpcnN0RGF5T2ZZZWFyKTtcbn1cblxuZnVuY3Rpb24gZ2V0VGh1cnNkYXlUaGlzV2VlayhkYXRldGltZTogRGF0ZSkge1xuICByZXR1cm4gbmV3IERhdGUoXG4gICAgICBkYXRldGltZS5nZXRGdWxsWWVhcigpLCBkYXRldGltZS5nZXRNb250aCgpLFxuICAgICAgZGF0ZXRpbWUuZ2V0RGF0ZSgpICsgKFRIVVJTREFZIC0gZGF0ZXRpbWUuZ2V0RGF5KCkpKTtcbn1cblxuZnVuY3Rpb24gd2Vla0dldHRlcihzaXplOiBudW1iZXIsIG1vbnRoQmFzZWQgPSBmYWxzZSk6IERhdGVGb3JtYXR0ZXIge1xuICByZXR1cm4gZnVuY3Rpb24oZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcpIHtcbiAgICBsZXQgcmVzdWx0O1xuICAgIGlmIChtb250aEJhc2VkKSB7XG4gICAgICBjb25zdCBuYkRheXNCZWZvcmUxc3REYXlPZk1vbnRoID1cbiAgICAgICAgICBuZXcgRGF0ZShkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgMSkuZ2V0RGF5KCkgLSAxO1xuICAgICAgY29uc3QgdG9kYXkgPSBkYXRlLmdldERhdGUoKTtcbiAgICAgIHJlc3VsdCA9IDEgKyBNYXRoLmZsb29yKCh0b2RheSArIG5iRGF5c0JlZm9yZTFzdERheU9mTW9udGgpIC8gNyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZpcnN0VGh1cnMgPSBnZXRGaXJzdFRodXJzZGF5T2ZZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSk7XG4gICAgICBjb25zdCB0aGlzVGh1cnMgPSBnZXRUaHVyc2RheVRoaXNXZWVrKGRhdGUpO1xuICAgICAgY29uc3QgZGlmZiA9IHRoaXNUaHVycy5nZXRUaW1lKCkgLSBmaXJzdFRodXJzLmdldFRpbWUoKTtcbiAgICAgIHJlc3VsdCA9IDEgKyBNYXRoLnJvdW5kKGRpZmYgLyA2LjA0OGU4KTsgIC8vIDYuMDQ4ZTggbXMgcGVyIHdlZWtcbiAgICB9XG5cbiAgICByZXR1cm4gcGFkTnVtYmVyKHJlc3VsdCwgc2l6ZSwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sKGxvY2FsZSwgTnVtYmVyU3ltYm9sLk1pbnVzU2lnbikpO1xuICB9O1xufVxuXG50eXBlIERhdGVGb3JtYXR0ZXIgPSAoZGF0ZTogRGF0ZSwgbG9jYWxlOiBzdHJpbmcsIG9mZnNldD86IG51bWJlcikgPT4gc3RyaW5nO1xuXG5jb25zdCBEQVRFX0ZPUk1BVFM6IHtbZm9ybWF0OiBzdHJpbmddOiBEYXRlRm9ybWF0dGVyfSA9IHt9O1xuXG4vLyBCYXNlZCBvbiBDTERSIGZvcm1hdHM6XG4vLyBTZWUgY29tcGxldGUgbGlzdDogaHR0cDovL3d3dy51bmljb2RlLm9yZy9yZXBvcnRzL3RyMzUvdHIzNS1kYXRlcy5odG1sI0RhdGVfRmllbGRfU3ltYm9sX1RhYmxlXG4vLyBTZWUgYWxzbyBleHBsYW5hdGlvbnM6IGh0dHA6Ly9jbGRyLnVuaWNvZGUub3JnL3RyYW5zbGF0aW9uL2RhdGUtdGltZVxuLy8gVE9ETyhvY29tYmUpOiBzdXBwb3J0IGFsbCBtaXNzaW5nIGNsZHIgZm9ybWF0czogWSwgVSwgUSwgRCwgRiwgZSwgYywgaiwgSiwgQywgQSwgdiwgViwgWCwgeFxuZnVuY3Rpb24gZ2V0RGF0ZUZvcm1hdHRlcihmb3JtYXQ6IHN0cmluZyk6IERhdGVGb3JtYXR0ZXJ8bnVsbCB7XG4gIGlmIChEQVRFX0ZPUk1BVFNbZm9ybWF0XSkge1xuICAgIHJldHVybiBEQVRFX0ZPUk1BVFNbZm9ybWF0XTtcbiAgfVxuICBsZXQgZm9ybWF0dGVyO1xuICBzd2l0Y2ggKGZvcm1hdCkge1xuICAgIC8vIEVyYSBuYW1lIChBRC9CQylcbiAgICBjYXNlICdHJzpcbiAgICBjYXNlICdHRyc6XG4gICAgY2FzZSAnR0dHJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkVyYXMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnR0dHRyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5FcmFzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnR0dHR0cnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRXJhcywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3cpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyAxIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyLCBlLmcuIChBRCAxID0+IDEsIEFEIDE5OSA9PiAxOTkpXG4gICAgY2FzZSAneSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZ1bGxZZWFyLCAxLCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICAvLyAyIGRpZ2l0IHJlcHJlc2VudGF0aW9uIG9mIHRoZSB5ZWFyLCBwYWRkZWQgKDAwLTk5KS4gKGUuZy4gQUQgMjAwMSA9PiAwMSwgQUQgMjAxMCA9PiAxMClcbiAgICBjYXNlICd5eSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZ1bGxZZWFyLCAyLCAwLCB0cnVlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDMgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIsIHBhZGRlZCAoMDAwLTk5OSkuIChlLmcuIEFEIDIwMDEgPT4gMDEsIEFEIDIwMTAgPT4gMTApXG4gICAgY2FzZSAneXl5JzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnVsbFllYXIsIDMsIDAsIGZhbHNlLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIDQgZGlnaXQgcmVwcmVzZW50YXRpb24gb2YgdGhlIHllYXIgKGUuZy4gQUQgMSA9PiAwMDAxLCBBRCAyMDEwID0+IDIwMTApXG4gICAgY2FzZSAneXl5eSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkZ1bGxZZWFyLCA0LCAwLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1vbnRoIG9mIHRoZSB5ZWFyICgxLTEyKSwgbnVtZXJpY1xuICAgIGNhc2UgJ00nOlxuICAgIGNhc2UgJ0wnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Nb250aCwgMSwgMSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNTSc6XG4gICAgY2FzZSAnTEwnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5Nb250aCwgMiwgMSk7XG4gICAgICBicmVhaztcblxuICAgIC8vIE1vbnRoIG9mIHRoZSB5ZWFyIChKYW51YXJ5LCAuLi4pLCBzdHJpbmcsIGZvcm1hdFxuICAgIGNhc2UgJ01NTSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTU1NTSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdNTU1NTSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5Nb250aHMsIFRyYW5zbGF0aW9uV2lkdGguTmFycm93KTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gTW9udGggb2YgdGhlIHllYXIgKEphbnVhcnksIC4uLiksIHN0cmluZywgc3RhbmRhbG9uZVxuICAgIGNhc2UgJ0xMTCc6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCwgRm9ybVN0eWxlLlN0YW5kYWxvbmUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnTExMTCc6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5XaWRlLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdMTExMTCc6XG4gICAgICBmb3JtYXR0ZXIgPVxuICAgICAgICAgIGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLk1vbnRocywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3csIEZvcm1TdHlsZS5TdGFuZGFsb25lKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gV2VlayBvZiB0aGUgeWVhciAoMSwgLi4uIDUyKVxuICAgIGNhc2UgJ3cnOlxuICAgICAgZm9ybWF0dGVyID0gd2Vla0dldHRlcigxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3d3JzpcbiAgICAgIGZvcm1hdHRlciA9IHdlZWtHZXR0ZXIoMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIFdlZWsgb2YgdGhlIG1vbnRoICgxLCAuLi4pXG4gICAgY2FzZSAnVyc6XG4gICAgICBmb3JtYXR0ZXIgPSB3ZWVrR2V0dGVyKDEsIHRydWUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBEYXkgb2YgdGhlIG1vbnRoICgxLTMxKVxuICAgIGNhc2UgJ2QnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5EYXRlLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2RkJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRGF0ZSwgMik7XG4gICAgICBicmVhaztcblxuICAgIC8vIERheSBvZiB0aGUgV2Vla1xuICAgIGNhc2UgJ0UnOlxuICAgIGNhc2UgJ0VFJzpcbiAgICBjYXNlICdFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFRUVFJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheXMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFRUVFRSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdFRUVFRUUnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5cywgVHJhbnNsYXRpb25XaWR0aC5TaG9ydCk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEdlbmVyaWMgcGVyaW9kIG9mIHRoZSBkYXkgKGFtLXBtKVxuICAgIGNhc2UgJ2EnOlxuICAgIGNhc2UgJ2FhJzpcbiAgICBjYXNlICdhYWEnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5BYmJyZXZpYXRlZCk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhYWFhJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguV2lkZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdhYWFhYSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdyk7XG4gICAgICBicmVhaztcblxuICAgIC8vIEV4dGVuZGVkIHBlcmlvZCBvZiB0aGUgZGF5IChtaWRuaWdodCwgYXQgbmlnaHQsIC4uLiksIHN0YW5kYWxvbmVcbiAgICBjYXNlICdiJzpcbiAgICBjYXNlICdiYic6XG4gICAgY2FzZSAnYmJiJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVTdHJHZXR0ZXIoXG4gICAgICAgICAgVHJhbnNsYXRpb25UeXBlLkRheVBlcmlvZHMsIFRyYW5zbGF0aW9uV2lkdGguQWJicmV2aWF0ZWQsIEZvcm1TdHlsZS5TdGFuZGFsb25lLCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2JiYmInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5XaWRlLCBGb3JtU3R5bGUuU3RhbmRhbG9uZSwgdHJ1ZSk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdiYmJiYic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLk5hcnJvdywgRm9ybVN0eWxlLlN0YW5kYWxvbmUsIHRydWUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBFeHRlbmRlZCBwZXJpb2Qgb2YgdGhlIGRheSAobWlkbmlnaHQsIG5pZ2h0LCAuLi4pLCBzdGFuZGFsb25lXG4gICAgY2FzZSAnQic6XG4gICAgY2FzZSAnQkInOlxuICAgIGNhc2UgJ0JCQic6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlU3RyR2V0dGVyKFxuICAgICAgICAgIFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLkFiYnJldmlhdGVkLCBGb3JtU3R5bGUuRm9ybWF0LCB0cnVlKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ0JCQkInOlxuICAgICAgZm9ybWF0dGVyID1cbiAgICAgICAgICBkYXRlU3RyR2V0dGVyKFRyYW5zbGF0aW9uVHlwZS5EYXlQZXJpb2RzLCBUcmFuc2xhdGlvbldpZHRoLldpZGUsIEZvcm1TdHlsZS5Gb3JtYXQsIHRydWUpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnQkJCQkInOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZVN0ckdldHRlcihcbiAgICAgICAgICBUcmFuc2xhdGlvblR5cGUuRGF5UGVyaW9kcywgVHJhbnNsYXRpb25XaWR0aC5OYXJyb3csIEZvcm1TdHlsZS5Gb3JtYXQsIHRydWUpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBIb3VyIGluIEFNL1BNLCAoMS0xMilcbiAgICBjYXNlICdoJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDEsIC0xMik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdoaCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAyLCAtMTIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBIb3VyIG9mIHRoZSBkYXkgKDAtMjMpXG4gICAgY2FzZSAnSCc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLkhvdXJzLCAxKTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIEhvdXIgaW4gZGF5LCBwYWRkZWQgKDAwLTIzKVxuICAgIGNhc2UgJ0hIJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuSG91cnMsIDIpO1xuICAgICAgYnJlYWs7XG5cbiAgICAvLyBNaW51dGUgb2YgdGhlIGhvdXIgKDAtNTkpXG4gICAgY2FzZSAnbSc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLk1pbnV0ZXMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnbW0nOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5NaW51dGVzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gU2Vjb25kIG9mIHRoZSBtaW51dGUgKDAtNTkpXG4gICAgY2FzZSAncyc6XG4gICAgICBmb3JtYXR0ZXIgPSBkYXRlR2V0dGVyKERhdGVUeXBlLlNlY29uZHMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnc3MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5TZWNvbmRzLCAyKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gRnJhY3Rpb25hbCBzZWNvbmRcbiAgICBjYXNlICdTJzpcbiAgICAgIGZvcm1hdHRlciA9IGRhdGVHZXR0ZXIoRGF0ZVR5cGUuRnJhY3Rpb25hbFNlY29uZHMsIDEpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnU1MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kcywgMik7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdTU1MnOlxuICAgICAgZm9ybWF0dGVyID0gZGF0ZUdldHRlcihEYXRlVHlwZS5GcmFjdGlvbmFsU2Vjb25kcywgMyk7XG4gICAgICBicmVhaztcblxuXG4gICAgLy8gVGltZXpvbmUgSVNPODYwMSBzaG9ydCBmb3JtYXQgKC0wNDMwKVxuICAgIGNhc2UgJ1onOlxuICAgIGNhc2UgJ1paJzpcbiAgICBjYXNlICdaWlonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLlNob3J0KTtcbiAgICAgIGJyZWFrO1xuICAgIC8vIFRpbWV6b25lIElTTzg2MDEgZXh0ZW5kZWQgZm9ybWF0ICgtMDQ6MzApXG4gICAgY2FzZSAnWlpaWlonOlxuICAgICAgZm9ybWF0dGVyID0gdGltZVpvbmVHZXR0ZXIoWm9uZVdpZHRoLkV4dGVuZGVkKTtcbiAgICAgIGJyZWFrO1xuXG4gICAgLy8gVGltZXpvbmUgR01UIHNob3J0IGZvcm1hdCAoR01UKzQpXG4gICAgY2FzZSAnTyc6XG4gICAgY2FzZSAnT08nOlxuICAgIGNhc2UgJ09PTyc6XG4gICAgLy8gU2hvdWxkIGJlIGxvY2F0aW9uLCBidXQgZmFsbGJhY2sgdG8gZm9ybWF0IE8gaW5zdGVhZCBiZWNhdXNlIHdlIGRvbid0IGhhdmUgdGhlIGRhdGEgeWV0XG4gICAgY2FzZSAneic6XG4gICAgY2FzZSAnenonOlxuICAgIGNhc2UgJ3p6eic6XG4gICAgICBmb3JtYXR0ZXIgPSB0aW1lWm9uZUdldHRlcihab25lV2lkdGguU2hvcnRHTVQpO1xuICAgICAgYnJlYWs7XG4gICAgLy8gVGltZXpvbmUgR01UIGxvbmcgZm9ybWF0IChHTVQrMDQzMClcbiAgICBjYXNlICdPT09PJzpcbiAgICBjYXNlICdaWlpaJzpcbiAgICAvLyBTaG91bGQgYmUgbG9jYXRpb24sIGJ1dCBmYWxsYmFjayB0byBmb3JtYXQgTyBpbnN0ZWFkIGJlY2F1c2Ugd2UgZG9uJ3QgaGF2ZSB0aGUgZGF0YSB5ZXRcbiAgICBjYXNlICd6enp6JzpcbiAgICAgIGZvcm1hdHRlciA9IHRpbWVab25lR2V0dGVyKFpvbmVXaWR0aC5Mb25nKTtcbiAgICAgIGJyZWFrO1xuICAgIGRlZmF1bHQ6XG4gICAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBEQVRFX0ZPUk1BVFNbZm9ybWF0XSA9IGZvcm1hdHRlcjtcbiAgcmV0dXJuIGZvcm1hdHRlcjtcbn1cblxuZnVuY3Rpb24gdGltZXpvbmVUb09mZnNldCh0aW1lem9uZTogc3RyaW5nLCBmYWxsYmFjazogbnVtYmVyKTogbnVtYmVyIHtcbiAgLy8gU3VwcG9ydDogSUUgOS0xMSBvbmx5LCBFZGdlIDEzLTE1K1xuICAvLyBJRS9FZGdlIGRvIG5vdCBcInVuZGVyc3RhbmRcIiBjb2xvbiAoYDpgKSBpbiB0aW1lem9uZVxuICB0aW1lem9uZSA9IHRpbWV6b25lLnJlcGxhY2UoLzovZywgJycpO1xuICBjb25zdCByZXF1ZXN0ZWRUaW1lem9uZU9mZnNldCA9IERhdGUucGFyc2UoJ0phbiAwMSwgMTk3MCAwMDowMDowMCAnICsgdGltZXpvbmUpIC8gNjAwMDA7XG4gIHJldHVybiBpc05hTihyZXF1ZXN0ZWRUaW1lem9uZU9mZnNldCkgPyBmYWxsYmFjayA6IHJlcXVlc3RlZFRpbWV6b25lT2Zmc2V0O1xufVxuXG5mdW5jdGlvbiBhZGREYXRlTWludXRlcyhkYXRlOiBEYXRlLCBtaW51dGVzOiBudW1iZXIpIHtcbiAgZGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcbiAgZGF0ZS5zZXRNaW51dGVzKGRhdGUuZ2V0TWludXRlcygpICsgbWludXRlcyk7XG4gIHJldHVybiBkYXRlO1xufVxuXG5mdW5jdGlvbiBjb252ZXJ0VGltZXpvbmVUb0xvY2FsKGRhdGU6IERhdGUsIHRpbWV6b25lOiBzdHJpbmcsIHJldmVyc2U6IGJvb2xlYW4pOiBEYXRlIHtcbiAgY29uc3QgcmV2ZXJzZVZhbHVlID0gcmV2ZXJzZSA/IC0xIDogMTtcbiAgY29uc3QgZGF0ZVRpbWV6b25lT2Zmc2V0ID0gZGF0ZS5nZXRUaW1lem9uZU9mZnNldCgpO1xuICBjb25zdCB0aW1lem9uZU9mZnNldCA9IHRpbWV6b25lVG9PZmZzZXQodGltZXpvbmUsIGRhdGVUaW1lem9uZU9mZnNldCk7XG4gIHJldHVybiBhZGREYXRlTWludXRlcyhkYXRlLCByZXZlcnNlVmFsdWUgKiAodGltZXpvbmVPZmZzZXQgLSBkYXRlVGltZXpvbmVPZmZzZXQpKTtcbn1cblxuLyoqXG4gKiBDb252ZXJ0cyBhIHZhbHVlIHRvIGRhdGUuXG4gKlxuICogU3VwcG9ydGVkIGlucHV0IGZvcm1hdHM6XG4gKiAtIGBEYXRlYFxuICogLSBudW1iZXI6IHRpbWVzdGFtcFxuICogLSBzdHJpbmc6IG51bWVyaWMgKGUuZy4gXCIxMjM0XCIpLCBJU08gYW5kIGRhdGUgc3RyaW5ncyBpbiBhIGZvcm1hdCBzdXBwb3J0ZWQgYnlcbiAqICAgW0RhdGUucGFyc2UoKV0oaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvRGF0ZS9wYXJzZSkuXG4gKiAgIE5vdGU6IElTTyBzdHJpbmdzIHdpdGhvdXQgdGltZSByZXR1cm4gYSBkYXRlIHdpdGhvdXQgdGltZW9mZnNldC5cbiAqXG4gKiBUaHJvd3MgaWYgdW5hYmxlIHRvIGNvbnZlcnQgdG8gYSBkYXRlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9EYXRlKHZhbHVlOiBzdHJpbmcgfCBudW1iZXIgfCBEYXRlKTogRGF0ZSB7XG4gIGlmIChpc0RhdGUodmFsdWUpKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicgJiYgIWlzTmFOKHZhbHVlKSkge1xuICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSk7XG4gIH1cblxuICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgIHZhbHVlID0gdmFsdWUudHJpbSgpO1xuXG4gICAgY29uc3QgcGFyc2VkTmIgPSBwYXJzZUZsb2F0KHZhbHVlKTtcblxuICAgIC8vIGFueSBzdHJpbmcgdGhhdCBvbmx5IGNvbnRhaW5zIG51bWJlcnMsIGxpa2UgXCIxMjM0XCIgYnV0IG5vdCBsaWtlIFwiMTIzNGhlbGxvXCJcbiAgICBpZiAoIWlzTmFOKHZhbHVlIGFzIGFueSAtIHBhcnNlZE5iKSkge1xuICAgICAgcmV0dXJuIG5ldyBEYXRlKHBhcnNlZE5iKTtcbiAgICB9XG5cbiAgICBpZiAoL14oXFxkezR9LVxcZHsxLDJ9LVxcZHsxLDJ9KSQvLnRlc3QodmFsdWUpKSB7XG4gICAgICAvKiBGb3IgSVNPIFN0cmluZ3Mgd2l0aG91dCB0aW1lIHRoZSBkYXksIG1vbnRoIGFuZCB5ZWFyIG11c3QgYmUgZXh0cmFjdGVkIGZyb20gdGhlIElTTyBTdHJpbmdcbiAgICAgIGJlZm9yZSBEYXRlIGNyZWF0aW9uIHRvIGF2b2lkIHRpbWUgb2Zmc2V0IGFuZCBlcnJvcnMgaW4gdGhlIG5ldyBEYXRlLlxuICAgICAgSWYgd2Ugb25seSByZXBsYWNlICctJyB3aXRoICcsJyBpbiB0aGUgSVNPIFN0cmluZyAoXCIyMDE1LDAxLDAxXCIpLCBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ld1xuICAgICAgZGF0ZSwgc29tZSBicm93c2VycyAoZS5nLiBJRSA5KSB3aWxsIHRocm93IGFuIGludmFsaWQgRGF0ZSBlcnJvci5cbiAgICAgIElmIHdlIGxlYXZlIHRoZSAnLScgKFwiMjAxNS0wMS0wMVwiKSBhbmQgdHJ5IHRvIGNyZWF0ZSBhIG5ldyBEYXRlKFwiMjAxNS0wMS0wMVwiKSB0aGUgdGltZW9mZnNldFxuICAgICAgaXMgYXBwbGllZC5cbiAgICAgIE5vdGU6IElTTyBtb250aHMgYXJlIDAgZm9yIEphbnVhcnksIDEgZm9yIEZlYnJ1YXJ5LCAuLi4gKi9cbiAgICAgIGNvbnN0IFt5LCBtLCBkXSA9IHZhbHVlLnNwbGl0KCctJykubWFwKCh2YWw6IHN0cmluZykgPT4gK3ZhbCk7XG4gICAgICByZXR1cm4gbmV3IERhdGUoeSwgbSAtIDEsIGQpO1xuICAgIH1cblxuICAgIGxldCBtYXRjaDogUmVnRXhwTWF0Y2hBcnJheXxudWxsO1xuICAgIGlmIChtYXRjaCA9IHZhbHVlLm1hdGNoKElTTzg2MDFfREFURV9SRUdFWCkpIHtcbiAgICAgIHJldHVybiBpc29TdHJpbmdUb0RhdGUobWF0Y2gpO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSBhcyBhbnkpO1xuICBpZiAoIWlzRGF0ZShkYXRlKSkge1xuICAgIHRocm93IG5ldyBFcnJvcihgVW5hYmxlIHRvIGNvbnZlcnQgXCIke3ZhbHVlfVwiIGludG8gYSBkYXRlYCk7XG4gIH1cbiAgcmV0dXJuIGRhdGU7XG59XG5cbi8qKlxuICogQ29udmVydHMgYSBkYXRlIGluIElTTzg2MDEgdG8gYSBEYXRlLlxuICogVXNlZCBpbnN0ZWFkIG9mIGBEYXRlLnBhcnNlYCBiZWNhdXNlIG9mIGJyb3dzZXIgZGlzY3JlcGFuY2llcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzb1N0cmluZ1RvRGF0ZShtYXRjaDogUmVnRXhwTWF0Y2hBcnJheSk6IERhdGUge1xuICBjb25zdCBkYXRlID0gbmV3IERhdGUoMCk7XG4gIGxldCB0ekhvdXIgPSAwO1xuICBsZXQgdHpNaW4gPSAwO1xuXG4gIC8vIG1hdGNoWzhdIG1lYW5zIHRoYXQgdGhlIHN0cmluZyBjb250YWlucyBcIlpcIiAoVVRDKSBvciBhIHRpbWV6b25lIGxpa2UgXCIrMDE6MDBcIiBvciBcIiswMTAwXCJcbiAgY29uc3QgZGF0ZVNldHRlciA9IG1hdGNoWzhdID8gZGF0ZS5zZXRVVENGdWxsWWVhciA6IGRhdGUuc2V0RnVsbFllYXI7XG4gIGNvbnN0IHRpbWVTZXR0ZXIgPSBtYXRjaFs4XSA/IGRhdGUuc2V0VVRDSG91cnMgOiBkYXRlLnNldEhvdXJzO1xuXG4gIC8vIGlmIHRoZXJlIGlzIGEgdGltZXpvbmUgZGVmaW5lZCBsaWtlIFwiKzAxOjAwXCIgb3IgXCIrMDEwMFwiXG4gIGlmIChtYXRjaFs5XSkge1xuICAgIHR6SG91ciA9IE51bWJlcihtYXRjaFs5XSArIG1hdGNoWzEwXSk7XG4gICAgdHpNaW4gPSBOdW1iZXIobWF0Y2hbOV0gKyBtYXRjaFsxMV0pO1xuICB9XG4gIGRhdGVTZXR0ZXIuY2FsbChkYXRlLCBOdW1iZXIobWF0Y2hbMV0pLCBOdW1iZXIobWF0Y2hbMl0pIC0gMSwgTnVtYmVyKG1hdGNoWzNdKSk7XG4gIGNvbnN0IGggPSBOdW1iZXIobWF0Y2hbNF0gfHwgMCkgLSB0ekhvdXI7XG4gIGNvbnN0IG0gPSBOdW1iZXIobWF0Y2hbNV0gfHwgMCkgLSB0ek1pbjtcbiAgY29uc3QgcyA9IE51bWJlcihtYXRjaFs2XSB8fCAwKTtcbiAgY29uc3QgbXMgPSBNYXRoLnJvdW5kKHBhcnNlRmxvYXQoJzAuJyArIChtYXRjaFs3XSB8fCAwKSkgKiAxMDAwKTtcbiAgdGltZVNldHRlci5jYWxsKGRhdGUsIGgsIG0sIHMsIG1zKTtcbiAgcmV0dXJuIGRhdGU7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpc0RhdGUodmFsdWU6IGFueSk6IHZhbHVlIGlzIERhdGUge1xuICByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBEYXRlICYmICFpc05hTih2YWx1ZS52YWx1ZU9mKCkpO1xufVxuIl19