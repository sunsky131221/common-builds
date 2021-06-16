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
    'ar-MA',
    [['ص', 'م'], u, u],
    [['ص', 'م'], u, ['صباحًا', 'مساءً']],
    [
        ['ح', 'ن', 'ث', 'ر', 'خ', 'ج', 'س'],
        ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'], u,
        ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
    ],
    u,
    [
        ['ي', 'ف', 'م', 'أ', 'م', 'ن', 'ل', 'غ', 'ش', 'ك', 'ب', 'د'],
        [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو', 'يوليوز', 'غشت', 'شتنبر', 'أكتوبر',
            'نونبر', 'دجنبر'
        ],
        u
    ],
    u,
    [['ق.م', 'م'], u, ['قبل الميلاد', 'ميلادي']],
    1,
    [6, 0],
    ['d\u200f/M\u200f/y', 'dd\u200f/MM\u200f/y', 'd MMMM y', 'EEEE، d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', '.', ';', '\u200e%\u200e', '\u200e+', '\u200e-', 'E', '×', '‰', '∞', 'ليس رقمًا', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'],
    'MAD',
    'د.م.\u200f',
    'درهم مغربي',
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
        'GBP': ['UK£'],
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXItTUEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9hci1NQS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCx5Q0FBeUM7QUFDekMsK0NBQStDO0FBRS9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUVwQixTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBQ3ZCLElBQUksQ0FBQyxLQUFLLENBQUM7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0QixJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDdEIsSUFBSSxDQUFDLEtBQUssQ0FBQztRQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3RCLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUU7UUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvRSxJQUFJLENBQUMsR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEYsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsZUFBZTtJQUNiLE9BQU87SUFDUCxDQUFDLENBQUMsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDbEIsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEM7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUNuQyxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUM7UUFDNUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLENBQUM7S0FDNUQ7SUFDRCxDQUFDO0lBQ0Q7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQzVEO1lBQ0UsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUTtZQUN0RixPQUFPLEVBQUUsT0FBTztTQUNqQjtRQUNELENBQUM7S0FDRjtJQUNELENBQUM7SUFDRCxDQUFDLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLGFBQWEsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1QyxDQUFDO0lBQ0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ04sQ0FBQyxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxVQUFVLEVBQUUsZ0JBQWdCLENBQUM7SUFDMUUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxFQUFFLFlBQVksRUFBRSxlQUFlLENBQUM7SUFDcEQsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxlQUFlLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsV0FBVyxFQUFFLEdBQUcsQ0FBQztJQUM1RixDQUFDLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLEtBQUssQ0FBQztJQUM1QyxLQUFLO0lBQ0wsWUFBWTtJQUNaLFlBQVk7SUFDWjtRQUNFLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2QsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDckIsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLElBQUksQ0FBQztRQUMzQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2QsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLFlBQVksRUFBRSxJQUFJLENBQUM7UUFDM0IsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDckIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztRQUNyQixLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDckIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsWUFBWSxDQUFDO1FBQ3JCLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsWUFBWSxFQUFFLEdBQUcsQ0FBQztRQUMxQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixLQUFLLEVBQUUsQ0FBQyxZQUFZLENBQUM7UUFDckIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztRQUNkLEtBQUssRUFBRSxDQUFDLFlBQVksQ0FBQztLQUN0QjtJQUNELEtBQUs7SUFDTCxNQUFNO0NBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGlmIChuID09PSAwKSByZXR1cm4gMDtcbiAgaWYgKG4gPT09IDEpIHJldHVybiAxO1xuICBpZiAobiA9PT0gMikgcmV0dXJuIDI7XG4gIGlmIChuICUgMTAwID09PSBNYXRoLmZsb29yKG4gJSAxMDApICYmIG4gJSAxMDAgPj0gMyAmJiBuICUgMTAwIDw9IDEwKSByZXR1cm4gMztcbiAgaWYgKG4gJSAxMDAgPT09IE1hdGguZmxvb3IobiAlIDEwMCkgJiYgbiAlIDEwMCA+PSAxMSAmJiBuICUgMTAwIDw9IDk5KSByZXR1cm4gNDtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2FyLU1BJyxcbiAgW1sn2LUnLCAn2YUnXSwgdSwgdV0sXG4gIFtbJ9i1JywgJ9mFJ10sIHUsIFsn2LXYqNin2K3Zi9inJywgJ9mF2LPYp9ih2YsnXV0sXG4gIFtcbiAgICBbJ9itJywgJ9mGJywgJ9irJywgJ9ixJywgJ9iuJywgJ9isJywgJ9izJ10sXG4gICAgWyfYp9mE2KPYrdivJywgJ9in2YTYp9ir2YbZitmGJywgJ9in2YTYq9mE2KfYq9in2KEnLCAn2KfZhNij2LHYqNi52KfYoScsICfYp9mE2K7ZhdmK2LMnLCAn2KfZhNis2YXYudipJywgJ9in2YTYs9io2KonXSwgdSxcbiAgICBbJ9ij2K3YrycsICfYpdir2YbZitmGJywgJ9ir2YTYp9ir2KfYoScsICfYo9ix2KjYudin2KEnLCAn2K7ZhdmK2LMnLCAn2KzZhdi52KknLCAn2LPYqNiqJ11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn2YonLCAn2YEnLCAn2YUnLCAn2KMnLCAn2YUnLCAn2YYnLCAn2YQnLCAn2LonLCAn2LQnLCAn2YMnLCAn2KgnLCAn2K8nXSxcbiAgICBbXG4gICAgICAn2YrZhtin2YrYsScsICfZgdio2LHYp9mK2LEnLCAn2YXYp9ix2LMnLCAn2KPYqNix2YrZhCcsICfZhdin2YonLCAn2YrZiNmG2YrZiCcsICfZitmI2YTZitmI2LInLCAn2LrYtNiqJywgJ9i02KrZhtio2LEnLCAn2KPZg9iq2YjYqNixJyxcbiAgICAgICfZhtmI2YbYqNixJywgJ9iv2KzZhtio2LEnXG4gICAgXSxcbiAgICB1XG4gIF0sXG4gIHUsXG4gIFtbJ9mCLtmFJywgJ9mFJ10sIHUsIFsn2YLYqNmEINin2YTZhdmK2YTYp9ivJywgJ9mF2YrZhNin2K/ZiiddXSxcbiAgMSxcbiAgWzYsIDBdLFxuICBbJ2RcXHUyMDBmL01cXHUyMDBmL3knLCAnZGRcXHUyMDBmL01NXFx1MjAwZi95JywgJ2QgTU1NTSB5JywgJ0VFRUXYjCBkIE1NTU0geSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLFxuICBbJ3sxfSB7MH0nLCB1LCB1LCB1XSxcbiAgWycsJywgJy4nLCAnOycsICdcXHUyMDBlJVxcdTIwMGUnLCAnXFx1MjAwZSsnLCAnXFx1MjAwZS0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ9mE2YrYs8Kg2LHZgtmF2YvYpycsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICfCpMKgIywjIzAuMDAnLCAnI0UwJ10sXG4gICdNQUQnLFxuICAn2K8u2YUuXFx1MjAwZicsXG4gICfYr9ix2YfZhSDZhdi62LHYqNmKJyxcbiAge1xuICAgICdBRUQnOiBbJ9ivLtilLlxcdTIwMGYnXSxcbiAgICAnQVJTJzogW3UsICdBUiQnXSxcbiAgICAnQVVEJzogWydBVSQnXSxcbiAgICAnQkJEJzogW3UsICdCQiQnXSxcbiAgICAnQkhEJzogWyfYry7YqC5cXHUyMDBmJ10sXG4gICAgJ0JNRCc6IFt1LCAnQk0kJ10sXG4gICAgJ0JORCc6IFt1LCAnQk4kJ10sXG4gICAgJ0JTRCc6IFt1LCAnQlMkJ10sXG4gICAgJ0JaRCc6IFt1LCAnQlokJ10sXG4gICAgJ0NBRCc6IFsnQ0EkJ10sXG4gICAgJ0NMUCc6IFt1LCAnQ0wkJ10sXG4gICAgJ0NOWSc6IFsnQ07CpSddLFxuICAgICdDT1AnOiBbdSwgJ0NPJCddLFxuICAgICdDVVAnOiBbdSwgJ0NVJCddLFxuICAgICdET1AnOiBbdSwgJ0RPJCddLFxuICAgICdEWkQnOiBbJ9ivLtisLlxcdTIwMGYnXSxcbiAgICAnRUdQJzogWyfYrC7ZhS5cXHUyMDBmJywgJ0XCoyddLFxuICAgICdGSkQnOiBbdSwgJ0ZKJCddLFxuICAgICdHQlAnOiBbJ1VLwqMnXSxcbiAgICAnR1lEJzogW3UsICdHWSQnXSxcbiAgICAnSEtEJzogWydISyQnXSxcbiAgICAnSVFEJzogWyfYry7YuS5cXHUyMDBmJ10sXG4gICAgJ0lSUic6IFsn2LEu2KUuJ10sXG4gICAgJ0pNRCc6IFt1LCAnSk0kJ10sXG4gICAgJ0pPRCc6IFsn2K8u2KMuXFx1MjAwZiddLFxuICAgICdKUFknOiBbJ0pQwqUnXSxcbiAgICAnS1dEJzogWyfYry7Zgy5cXHUyMDBmJ10sXG4gICAgJ0tZRCc6IFt1LCAnS1kkJ10sXG4gICAgJ0xCUCc6IFsn2YQu2YQuXFx1MjAwZicsICdMwqMnXSxcbiAgICAnTFJEJzogW3UsICckTFInXSxcbiAgICAnTFlEJzogWyfYry7ZhC5cXHUyMDBmJ10sXG4gICAgJ01BRCc6IFsn2K8u2YUuXFx1MjAwZiddLFxuICAgICdNUlUnOiBbJ9ijLtmFLiddLFxuICAgICdNWE4nOiBbJ01YJCddLFxuICAgICdOWkQnOiBbJ05aJCddLFxuICAgICdPTVInOiBbJ9ixLti5LlxcdTIwMGYnXSxcbiAgICAnUUFSJzogWyfYsS7Zgi5cXHUyMDBmJ10sXG4gICAgJ1NBUic6IFsn2LEu2LMuXFx1MjAwZiddLFxuICAgICdTQkQnOiBbdSwgJ1NCJCddLFxuICAgICdTREQnOiBbJ9ivLtizLlxcdTIwMGYnXSxcbiAgICAnU0RHJzogWyfYrC7Ysy4nXSxcbiAgICAnU1JEJzogW3UsICdTUiQnXSxcbiAgICAnU1lQJzogWyfZhC7Ysy5cXHUyMDBmJywgJ8KjJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1RORCc6IFsn2K8u2KouXFx1MjAwZiddLFxuICAgICdUVEQnOiBbdSwgJ1RUJCddLFxuICAgICdUV0QnOiBbJ05UJCddLFxuICAgICdVU0QnOiBbJ1VTJCddLFxuICAgICdVWVUnOiBbdSwgJ1VZJCddLFxuICAgICdYWFgnOiBbJyoqKiddLFxuICAgICdZRVInOiBbJ9ixLtmKLlxcdTIwMGYnXVxuICB9LFxuICAncnRsJyxcbiAgcGx1cmFsXG5dO1xuIl19