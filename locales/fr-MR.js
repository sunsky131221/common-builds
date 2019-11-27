/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(null, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define("@angular/common/locales/fr-MR", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === 0 || i === 1)
            return 1;
        return 5;
    }
    exports.default = [
        'fr-MR', [['AM', 'PM'], u, u], u,
        [
            ['D', 'L', 'M', 'M', 'J', 'V', 'S'], ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'],
            ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'],
            ['di', 'lu', 'ma', 'me', 'je', 've', 'sa']
        ],
        u,
        [
            ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
            [
                'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.',
                'déc.'
            ],
            [
                'janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre',
                'octobre', 'novembre', 'décembre'
            ]
        ],
        u, [['av. J.-C.', 'ap. J.-C.'], u, ['avant Jésus-Christ', 'après Jésus-Christ']], 1, [6, 0],
        ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'], ['{1} {0}', '{1} \'à\' {0}', u, u],
        [',', '\u202f', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'UM', 'ouguiya mauritanien', {
            'ARS': ['$AR', '$'],
            'AUD': ['$AU', '$'],
            'BEF': ['FB'],
            'BMD': ['$BM', '$'],
            'BND': ['$BN', '$'],
            'BZD': ['$BZ', '$'],
            'CAD': ['$CA', '$'],
            'CLP': ['$CL', '$'],
            'CNY': [u, '¥'],
            'COP': ['$CO', '$'],
            'CYP': ['£CY'],
            'EGP': [u, '£E'],
            'FJD': ['$FJ', '$'],
            'FKP': ['£FK', '£'],
            'FRF': ['F'],
            'GBP': ['£GB', '£'],
            'GIP': ['£GI', '£'],
            'HKD': [u, '$'],
            'IEP': ['£IE'],
            'ILP': ['£IL'],
            'ITL': ['₤IT'],
            'JPY': [u, '¥'],
            'KMF': [u, 'FC'],
            'LBP': ['£LB', '£L'],
            'MRU': ['UM'],
            'MTP': ['£MT'],
            'MXN': ['$MX', '$'],
            'NAD': ['$NA', '$'],
            'NIO': [u, '$C'],
            'NZD': ['$NZ', '$'],
            'RHD': ['$RH'],
            'RON': [u, 'L'],
            'RWF': [u, 'FR'],
            'SBD': ['$SB', '$'],
            'SGD': ['$SG', '$'],
            'SRD': ['$SR', '$'],
            'TOP': [u, '$T'],
            'TTD': ['$TT', '$'],
            'TWD': [u, 'NT$'],
            'USD': ['$US', '$'],
            'UYU': ['$UY', '$'],
            'WST': ['$WS'],
            'XCD': [u, '$'],
            'XPF': ['FCFP'],
            'ZMW': [u, 'Kw']
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnItTVIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mci1NUi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNoQztZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDN0YsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDekUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7U0FDM0M7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1lBQzVEO2dCQUNFLE9BQU8sRUFBRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE9BQU8sRUFBRSxNQUFNLEVBQUUsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNO2dCQUN6RixNQUFNO2FBQ1A7WUFDRDtnQkFDRSxTQUFTLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsTUFBTSxFQUFFLFdBQVc7Z0JBQ3BGLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVTthQUNsQztTQUNGO1FBQ0QsQ0FBQyxFQUFFLENBQUMsQ0FBQyxXQUFXLEVBQUUsV0FBVyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDM0YsQ0FBQyxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxlQUFlLENBQUM7UUFDbkQsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLGFBQWEsRUFBRSxnQkFBZ0IsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLGVBQWUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQzVGLENBQUMsR0FBRyxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7UUFDbkUsQ0FBQyxXQUFXLEVBQUUsU0FBUyxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUMsRUFBRSxJQUFJLEVBQUUscUJBQXFCLEVBQUU7WUFDMUUsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQztZQUNiLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7WUFDWixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUM7WUFDcEIsS0FBSyxFQUFFLENBQUMsSUFBSSxDQUFDO1lBQ2IsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztZQUNoQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUNqQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1lBQ2QsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLE1BQU0sQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7U0FDakI7UUFDRCxNQUFNO0tBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuICBpZiAoaSA9PT0gMCB8fCBpID09PSAxKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2ZyLU1SJywgW1snQU0nLCAnUE0nXSwgdSwgdV0sIHUsXG4gIFtcbiAgICBbJ0QnLCAnTCcsICdNJywgJ00nLCAnSicsICdWJywgJ1MnXSwgWydkaW0uJywgJ2x1bi4nLCAnbWFyLicsICdtZXIuJywgJ2pldS4nLCAndmVuLicsICdzYW0uJ10sXG4gICAgWydkaW1hbmNoZScsICdsdW5kaScsICdtYXJkaScsICdtZXJjcmVkaScsICdqZXVkaScsICd2ZW5kcmVkaScsICdzYW1lZGknXSxcbiAgICBbJ2RpJywgJ2x1JywgJ21hJywgJ21lJywgJ2plJywgJ3ZlJywgJ3NhJ11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsnSicsICdGJywgJ00nLCAnQScsICdNJywgJ0onLCAnSicsICdBJywgJ1MnLCAnTycsICdOJywgJ0QnXSxcbiAgICBbXG4gICAgICAnamFudi4nLCAnZsOpdnIuJywgJ21hcnMnLCAnYXZyLicsICdtYWknLCAnanVpbicsICdqdWlsLicsICdhb8O7dCcsICdzZXB0LicsICdvY3QuJywgJ25vdi4nLFxuICAgICAgJ2TDqWMuJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ2phbnZpZXInLCAnZsOpdnJpZXInLCAnbWFycycsICdhdnJpbCcsICdtYWknLCAnanVpbicsICdqdWlsbGV0JywgJ2Fvw7t0JywgJ3NlcHRlbWJyZScsXG4gICAgICAnb2N0b2JyZScsICdub3ZlbWJyZScsICdkw6ljZW1icmUnXG4gICAgXVxuICBdLFxuICB1LCBbWydhdi4gSi4tQy4nLCAnYXAuIEouLUMuJ10sIHUsIFsnYXZhbnQgSsOpc3VzLUNocmlzdCcsICdhcHLDqHMgSsOpc3VzLUNocmlzdCddXSwgMSwgWzYsIDBdLFxuICBbJ2RkL01NL3knLCAnZCBNTU0geScsICdkIE1NTU0geScsICdFRUVFIGQgTU1NTSB5J10sXG4gIFsnaDptbSBhJywgJ2g6bW06c3MgYScsICdoOm1tOnNzIGEgeicsICdoOm1tOnNzIGEgenp6eiddLCBbJ3sxfSB7MH0nLCAnezF9IFxcJ8OgXFwnIHswfScsIHUsIHVdLFxuICBbJywnLCAnXFx1MjAyZicsICc7JywgJyUnLCAnKycsICctJywgJ0UnLCAnw5cnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMMKgJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sICdVTScsICdvdWd1aXlhIG1hdXJpdGFuaWVuJywge1xuICAgICdBUlMnOiBbJyRBUicsICckJ10sXG4gICAgJ0FVRCc6IFsnJEFVJywgJyQnXSxcbiAgICAnQkVGJzogWydGQiddLFxuICAgICdCTUQnOiBbJyRCTScsICckJ10sXG4gICAgJ0JORCc6IFsnJEJOJywgJyQnXSxcbiAgICAnQlpEJzogWyckQlonLCAnJCddLFxuICAgICdDQUQnOiBbJyRDQScsICckJ10sXG4gICAgJ0NMUCc6IFsnJENMJywgJyQnXSxcbiAgICAnQ05ZJzogW3UsICfCpSddLFxuICAgICdDT1AnOiBbJyRDTycsICckJ10sXG4gICAgJ0NZUCc6IFsnwqNDWSddLFxuICAgICdFR1AnOiBbdSwgJ8KjRSddLFxuICAgICdGSkQnOiBbJyRGSicsICckJ10sXG4gICAgJ0ZLUCc6IFsnwqNGSycsICfCoyddLFxuICAgICdGUkYnOiBbJ0YnXSxcbiAgICAnR0JQJzogWyfCo0dCJywgJ8KjJ10sXG4gICAgJ0dJUCc6IFsnwqNHSScsICfCoyddLFxuICAgICdIS0QnOiBbdSwgJyQnXSxcbiAgICAnSUVQJzogWyfCo0lFJ10sXG4gICAgJ0lMUCc6IFsnwqNJTCddLFxuICAgICdJVEwnOiBbJ+KCpElUJ10sXG4gICAgJ0pQWSc6IFt1LCAnwqUnXSxcbiAgICAnS01GJzogW3UsICdGQyddLFxuICAgICdMQlAnOiBbJ8KjTEInLCAnwqNMJ10sXG4gICAgJ01SVSc6IFsnVU0nXSxcbiAgICAnTVRQJzogWyfCo01UJ10sXG4gICAgJ01YTic6IFsnJE1YJywgJyQnXSxcbiAgICAnTkFEJzogWyckTkEnLCAnJCddLFxuICAgICdOSU8nOiBbdSwgJyRDJ10sXG4gICAgJ05aRCc6IFsnJE5aJywgJyQnXSxcbiAgICAnUkhEJzogWyckUkgnXSxcbiAgICAnUk9OJzogW3UsICdMJ10sXG4gICAgJ1JXRic6IFt1LCAnRlInXSxcbiAgICAnU0JEJzogWyckU0InLCAnJCddLFxuICAgICdTR0QnOiBbJyRTRycsICckJ10sXG4gICAgJ1NSRCc6IFsnJFNSJywgJyQnXSxcbiAgICAnVE9QJzogW3UsICckVCddLFxuICAgICdUVEQnOiBbJyRUVCcsICckJ10sXG4gICAgJ1RXRCc6IFt1LCAnTlQkJ10sXG4gICAgJ1VTRCc6IFsnJFVTJywgJyQnXSxcbiAgICAnVVlVJzogWyckVVknLCAnJCddLFxuICAgICdXU1QnOiBbJyRXUyddLFxuICAgICdYQ0QnOiBbdSwgJyQnXSxcbiAgICAnWFBGJzogWydGQ0ZQJ10sXG4gICAgJ1pNVyc6IFt1LCAnS3cnXVxuICB9LFxuICBwbHVyYWxcbl07XG4iXX0=