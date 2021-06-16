/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js
const u = undefined;
function plural(n) {
    if (n === 0)
        return 0;
    if (n === 1)
        return 1;
    if (n === 2)
        return 2;
    if (n % 100 === Math.floor(n % 100) && n % 100 >= 3 && n % 100 <= 10)
        return 3;
    if (n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 99)
        return 4;
    return 5;
}
export default [
    'ar-SS',
    [['ص', 'م'], u, u],
    [['ص', 'م'], u, ['صباحًا', 'مساءً']],
    [
        ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
        ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], u,
        ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    ],
    u,
    [
        ['ي', 'ف', 'م', 'أ', 'و', 'ن', 'ل', 'غ', 'س', 'ك', 'ب', 'د'],
        [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر',
            'نوفمبر', 'ديسمبر'
        ],
        u
    ],
    u,
    [['ق.م', 'م'], u, ['قبل الميلاد', 'ميلادي']],
    1,
    [6, 0],
    ['d\u200f/M\u200f/y', 'dd\u200f/MM\u200f/y', 'd MMMM y', 'EEEE، d MMMM y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    ['{1} {0}', u, u, u],
    ['.', ',', ';', '\u200e%\u200e', '\u200e+', '\u200e-', 'E', '×', '‰', '∞', 'ليس رقمًا', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
    'SSP',
    '£',
    'جنيه جنوب السودان',
    {
        'AED': ['د.إ.\u200f'],
        'ARS': [u, 'AR$'],
        'AUD': ['AU$'],
        'BBD': [u, 'BB$'],
        'BHD': ['د.ب.\u200f'],
        'BMD': [u, 'BM$'],
        'BND': [u, 'BN$'],
        'BSD': [u, 'BS$'],
        'BZD': [u, 'BZ$'],
        'CAD': ['CA$'],
        'CLP': [u, 'CL$'],
        'CNY': ['CN¥'],
        'COP': [u, 'CO$'],
        'CUP': [u, 'CU$'],
        'DOP': [u, 'DO$'],
        'DZD': ['د.ج.\u200f'],
        'EGP': ['ج.م.\u200f', 'E£'],
        'FJD': [u, 'FJ$'],
        'GBP': ['GB£', 'UK£'],
        'GYD': [u, 'GY$'],
        'HKD': ['HK$'],
        'IQD': ['د.ع.\u200f'],
        'IRR': ['ر.إ.'],
        'JMD': [u, 'JM$'],
        'JOD': ['د.أ.\u200f'],
        'JPY': ['JP¥'],
        'KWD': ['د.ك.\u200f'],
        'KYD': [u, 'KY$'],
        'LBP': ['ل.ل.\u200f', 'L£'],
        'LRD': [u, '$LR'],
        'LYD': ['د.ل.\u200f'],
        'MAD': ['د.م.\u200f'],
        'MRU': ['أ.م.'],
        'MXN': ['MX$'],
        'NZD': ['NZ$'],
        'OMR': ['ر.ع.\u200f'],
        'QAR': ['ر.ق.\u200f'],
        'SAR': ['ر.س.\u200f'],
        'SBD': [u, 'SB$'],
        'SDD': ['د.س.\u200f'],
        'SDG': ['ج.س.'],
        'SRD': [u, 'SR$'],
        'SSP': ['£'],
        'SYP': ['ل.س.\u200f', '£'],
        'THB': ['฿'],
        'TND': ['د.ت.\u200f'],
        'TTD': [u, 'TT$'],
        'TWD': ['NT$'],
        'USD': ['US$'],
        'UYU': [u, 'UY$'],
        'XXX': ['***'],
        'YER': ['ر.ي.\u200f']
    },
    'rtl',
    plural
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXItU1MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9hci1TUy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCx5Q0FBeUM7QUFDekMsK0NBQStDO0FBRS9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUVwQixTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUU7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRSxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEYsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsZUFBZTtJQUNiLE9BQU87SUFDUCxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEM7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUs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RUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDckIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxZQUFZLEVBQUUsSUFBSSxDQUFDO1FBQzNCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDZixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDckIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxNQUFNLENBQUM7UUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQztRQUNaLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxHQUFHLENBQUM7UUFDMUIsS0FBSyxFQUFFLENBQUMsR0FBRyxDQUFDO1FBQ1osS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2QsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2QsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7S0FDdEI7SUFDRCxLQUFLO0lBQ0wsTUFBTTtDQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAobiA9PT0gMCkgcmV0dXJuIDA7XG4gIGlmIChuID09PSAxKSByZXR1cm4gMTtcbiAgaWYgKG4gPT09IDIpIHJldHVybiAyO1xuICBpZiAobiAlIDEwMCA9PT0gTWF0aC5mbG9vcihuICUgMTAwKSAmJiBuICUgMTAwID49IDMgJiYgbiAlIDEwMCA8PSAxMCkgcmV0dXJuIDM7XG4gIGlmIChuICUgMTAwID09PSBNYXRoLmZsb29yKG4gJSAxMDApICYmIG4gJSAxMDAgPj0gMTEgJiYgbiAlIDEwMCA8PSA5OSkgcmV0dXJuIDQ7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdhci1TUycsXG4gIFtbJ9i1JywgJ9mFJ10sIHUsIHVdLFxuICBbWyfYtScsICfZhSddLCB1LCBbJ9i12KjYp9it2YvYpycsICfZhdiz2KfYodmLJ11dLFxuICBbXG4gICAgWyfYrScsICfZhicsICfYqycsICfYsScsICfYricsICfYrCcsICfYsyddLFxuICAgIFsn2KfZhNij2K3YrycsICfYp9mE2KfYq9mG2YrZhicsICfYp9mE2KvZhNin2KvYp9ihJywgJ9in2YTYo9ix2KjYudin2KEnLCAn2KfZhNiu2YXZitizJywgJ9in2YTYrNmF2LnYqScsICfYp9mE2LPYqNiqJ10sIHUsXG4gICAgWyfYo9it2K8nLCAn2KXYq9mG2YrZhicsICfYq9mE2KfYq9in2KEnLCAn2KPYsdio2LnYp9ihJywgJ9iu2YXZitizJywgJ9is2YXYudipJywgJ9iz2KjYqiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ9mKJywgJ9mBJywgJ9mFJywgJ9ijJywgJ9mIJywgJ9mGJywgJ9mEJywgJ9i6JywgJ9izJywgJ9mDJywgJ9ioJywgJ9ivJ10sXG4gICAgW1xuICAgICAgJ9mK2YbYp9mK2LEnLCAn2YHYqNix2KfZitixJywgJ9mF2KfYsdizJywgJ9ij2KjYsdmK2YQnLCAn2YXYp9mK2YgnLCAn2YrZiNmG2YrZiCcsICfZitmI2YTZitmIJywgJ9ij2LrYs9i32LMnLCAn2LPYqNiq2YXYqNixJywgJ9ij2YPYqtmI2KjYsScsXG4gICAgICAn2YbZiNmB2YXYqNixJywgJ9iv2YrYs9mF2KjYsSdcbiAgICBdLFxuICAgIHVcbiAgXSxcbiAgdSxcbiAgW1sn2YIu2YUnLCAn2YUnXSwgdSwgWyfZgtio2YQg2KfZhNmF2YrZhNin2K8nLCAn2YXZitmE2KfYr9mKJ11dLFxuICAxLFxuICBbNiwgMF0sXG4gIFsnZFxcdTIwMGYvTVxcdTIwMGYveScsICdkZFxcdTIwMGYvTU1cXHUyMDBmL3knLCAnZCBNTU1NIHknLCAnRUVFRdiMIGQgTU1NTSB5J10sXG4gIFsnaDptbSBhJywgJ2g6bW06c3MgYScsICdoOm1tOnNzIGEgeicsICdoOm1tOnNzIGEgenp6eiddLFxuICBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycuJywgJywnLCAnOycsICdcXHUyMDBlJVxcdTIwMGUnLCAnXFx1MjAwZSsnLCAnXFx1MjAwZS0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ9mE2YrYs8Kg2LHZgtmF2YvYpycsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICfCpMKgIywjIzAuMDAnLCAnI0UwJ10sXG4gICdTU1AnLFxuICAnwqMnLFxuICAn2KzZhtmK2Ycg2KzZhtmI2Kgg2KfZhNiz2YjYr9in2YYnLFxuICB7XG4gICAgJ0FFRCc6IFsn2K8u2KUuXFx1MjAwZiddLFxuICAgICdBUlMnOiBbdSwgJ0FSJCddLFxuICAgICdBVUQnOiBbJ0FVJCddLFxuICAgICdCQkQnOiBbdSwgJ0JCJCddLFxuICAgICdCSEQnOiBbJ9ivLtioLlxcdTIwMGYnXSxcbiAgICAnQk1EJzogW3UsICdCTSQnXSxcbiAgICAnQk5EJzogW3UsICdCTiQnXSxcbiAgICAnQlNEJzogW3UsICdCUyQnXSxcbiAgICAnQlpEJzogW3UsICdCWiQnXSxcbiAgICAnQ0FEJzogWydDQSQnXSxcbiAgICAnQ0xQJzogW3UsICdDTCQnXSxcbiAgICAnQ05ZJzogWydDTsKlJ10sXG4gICAgJ0NPUCc6IFt1LCAnQ08kJ10sXG4gICAgJ0NVUCc6IFt1LCAnQ1UkJ10sXG4gICAgJ0RPUCc6IFt1LCAnRE8kJ10sXG4gICAgJ0RaRCc6IFsn2K8u2KwuXFx1MjAwZiddLFxuICAgICdFR1AnOiBbJ9isLtmFLlxcdTIwMGYnLCAnRcKjJ10sXG4gICAgJ0ZKRCc6IFt1LCAnRkokJ10sXG4gICAgJ0dCUCc6IFsnR0LCoycsICdVS8KjJ10sXG4gICAgJ0dZRCc6IFt1LCAnR1kkJ10sXG4gICAgJ0hLRCc6IFsnSEskJ10sXG4gICAgJ0lRRCc6IFsn2K8u2LkuXFx1MjAwZiddLFxuICAgICdJUlInOiBbJ9ixLtilLiddLFxuICAgICdKTUQnOiBbdSwgJ0pNJCddLFxuICAgICdKT0QnOiBbJ9ivLtijLlxcdTIwMGYnXSxcbiAgICAnSlBZJzogWydKUMKlJ10sXG4gICAgJ0tXRCc6IFsn2K8u2YMuXFx1MjAwZiddLFxuICAgICdLWUQnOiBbdSwgJ0tZJCddLFxuICAgICdMQlAnOiBbJ9mELtmELlxcdTIwMGYnLCAnTMKjJ10sXG4gICAgJ0xSRCc6IFt1LCAnJExSJ10sXG4gICAgJ0xZRCc6IFsn2K8u2YQuXFx1MjAwZiddLFxuICAgICdNQUQnOiBbJ9ivLtmFLlxcdTIwMGYnXSxcbiAgICAnTVJVJzogWyfYoy7ZhS4nXSxcbiAgICAnTVhOJzogWydNWCQnXSxcbiAgICAnTlpEJzogWydOWiQnXSxcbiAgICAnT01SJzogWyfYsS7YuS5cXHUyMDBmJ10sXG4gICAgJ1FBUic6IFsn2LEu2YIuXFx1MjAwZiddLFxuICAgICdTQVInOiBbJ9ixLtizLlxcdTIwMGYnXSxcbiAgICAnU0JEJzogW3UsICdTQiQnXSxcbiAgICAnU0REJzogWyfYry7Ysy5cXHUyMDBmJ10sXG4gICAgJ1NERyc6IFsn2Kwu2LMuJ10sXG4gICAgJ1NSRCc6IFt1LCAnU1IkJ10sXG4gICAgJ1NTUCc6IFsnwqMnXSxcbiAgICAnU1lQJzogWyfZhC7Ysy5cXHUyMDBmJywgJ8KjJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1RORCc6IFsn2K8u2KouXFx1MjAwZiddLFxuICAgICdUVEQnOiBbdSwgJ1RUJCddLFxuICAgICdUV0QnOiBbJ05UJCddLFxuICAgICdVU0QnOiBbJ1VTJCddLFxuICAgICdVWVUnOiBbdSwgJ1VZJCddLFxuICAgICdYWFgnOiBbJyoqKiddLFxuICAgICdZRVInOiBbJ9ixLtmKLlxcdTIwMGYnXVxuICB9LFxuICAncnRsJyxcbiAgcGx1cmFsXG5dO1xuIl19