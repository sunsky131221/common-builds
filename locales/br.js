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
        define("@angular/common/locales/br", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY
    // See angular/tools/gulp-tasks/cldr/extract.js
    var u = undefined;
    function plural(n) {
        if (n % 10 === 1 && !(n % 100 === 11 || n % 100 === 71 || n % 100 === 91))
            return 1;
        if (n % 10 === 2 && !(n % 100 === 12 || n % 100 === 72 || n % 100 === 92))
            return 2;
        if (n % 10 === Math.floor(n % 10) && (n % 10 >= 3 && n % 10 <= 4 || n % 10 === 9) &&
            !(n % 100 >= 10 && n % 100 <= 19 || n % 100 >= 70 && n % 100 <= 79 ||
                n % 100 >= 90 && n % 100 <= 99))
            return 3;
        if (!(n === 0) && n % 1e6 === 0)
            return 4;
        return 5;
    }
    exports.default = [
        'br', [['am', 'gm'], ['A.M.', 'G.M.'], u], [['A.M.', 'G.M.'], u, u],
        [
            ['Su', 'L', 'Mz', 'Mc', 'Y', 'G', 'Sa'], ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yaou', 'Gwe.', 'Sad.'],
            ['Sul', 'Lun', 'Meurzh', 'Mercʼher', 'Yaou', 'Gwener', 'Sadorn'],
            ['Sul', 'Lun', 'Meu.', 'Mer.', 'Yaou', 'Gwe.', 'Sad.']
        ],
        u,
        [
            ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'],
            [
                'Gen.', 'Cʼhwe.', 'Meur.', 'Ebr.', 'Mae', 'Mezh.', 'Goue.', 'Eost', 'Gwen.', 'Here', 'Du',
                'Kzu.'
            ],
            [
                'Genver', 'Cʼhwevrer', 'Meurzh', 'Ebrel', 'Mae', 'Mezheven', 'Gouere', 'Eost', 'Gwengolo',
                'Here', 'Du', 'Kerzu'
            ]
        ],
        u, [['a-raok J.K.', 'goude J.K.'], u, ['a-raok Jezuz-Krist', 'goude Jezuz-Krist']], 1, [6, 0],
        ['dd/MM/y', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
        ['{1} {0}', '{1}, {0}', '{1} \'da\' {0}', u],
        [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], '€', 'euro', {
            'AUD': ['$A', '$'],
            'BRL': [u, 'R$'],
            'CAD': ['$CA', '$'],
            'CNY': [u, '¥'],
            'EGP': [u, '£ E'],
            'GBP': ['£ RU', '£'],
            'HKD': ['$ HK', '$'],
            'ILS': [u, '₪'],
            'JPY': [u, '¥'],
            'KRW': [u, '₩'],
            'LBP': [u, '£L'],
            'NZD': ['$ ZN', '$'],
            'TOP': [u, '$ T'],
            'TWD': [u, '$'],
            'USD': ['$ SU', '$'],
            'VND': [u, '₫'],
            'XCD': [u, '$'],
            'XXX': []
        },
        plural
    ];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9ici50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUM7WUFBRSxPQUFPLENBQUMsQ0FBQztRQUNwRixJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQztZQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3BGLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQzdFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUU7Z0JBQ2hFLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxJQUFJLENB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QUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7WUFDcEIsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztZQUNwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7WUFDcEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztZQUNqQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsTUFBTSxFQUFFLEdBQUcsQ0FBQztZQUNwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztZQUNmLEtBQUssRUFBRSxFQUFFO1NBQ1Y7UUFDRCxNQUFNO0tBQ1AsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgSW5jLiBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBpZiAobiAlIDEwID09PSAxICYmICEobiAlIDEwMCA9PT0gMTEgfHwgbiAlIDEwMCA9PT0gNzEgfHwgbiAlIDEwMCA9PT0gOTEpKSByZXR1cm4gMTtcbiAgaWYgKG4gJSAxMCA9PT0gMiAmJiAhKG4gJSAxMDAgPT09IDEyIHx8IG4gJSAxMDAgPT09IDcyIHx8IG4gJSAxMDAgPT09IDkyKSkgcmV0dXJuIDI7XG4gIGlmIChuICUgMTAgPT09IE1hdGguZmxvb3IobiAlIDEwKSAmJiAobiAlIDEwID49IDMgJiYgbiAlIDEwIDw9IDQgfHwgbiAlIDEwID09PSA5KSAmJlxuICAgICAgIShuICUgMTAwID49IDEwICYmIG4gJSAxMDAgPD0gMTkgfHwgbiAlIDEwMCA+PSA3MCAmJiBuICUgMTAwIDw9IDc5IHx8XG4gICAgICAgIG4gJSAxMDAgPj0gOTAgJiYgbiAlIDEwMCA8PSA5OSkpXG4gICAgcmV0dXJuIDM7XG4gIGlmICghKG4gPT09IDApICYmIG4gJSAxZTYgPT09IDApIHJldHVybiA0O1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnYnInLCBbWydhbScsICdnbSddLCBbJ0EuTS4nLCAnRy5NLiddLCB1XSwgW1snQS5NLicsICdHLk0uJ10sIHUsIHVdLFxuICBbXG4gICAgWydTdScsICdMJywgJ016JywgJ01jJywgJ1knLCAnRycsICdTYSddLCBbJ1N1bCcsICdMdW4nLCAnTWV1LicsICdNZXIuJywgJ1lhb3UnLCAnR3dlLicsICdTYWQuJ10sXG4gICAgWydTdWwnLCAnTHVuJywgJ01ldXJ6aCcsICdNZXJjyrxoZXInLCAnWWFvdScsICdHd2VuZXInLCAnU2Fkb3JuJ10sXG4gICAgWydTdWwnLCAnTHVuJywgJ01ldS4nLCAnTWVyLicsICdZYW91JywgJ0d3ZS4nLCAnU2FkLiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJzAxJywgJzAyJywgJzAzJywgJzA0JywgJzA1JywgJzA2JywgJzA3JywgJzA4JywgJzA5JywgJzEwJywgJzExJywgJzEyJ10sXG4gICAgW1xuICAgICAgJ0dlbi4nLCAnQ8q8aHdlLicsICdNZXVyLicsICdFYnIuJywgJ01hZScsICdNZXpoLicsICdHb3VlLicsICdFb3N0JywgJ0d3ZW4uJywgJ0hlcmUnLCAnRHUnLFxuICAgICAgJ0t6dS4nXG4gICAgXSxcbiAgICBbXG4gICAgICAnR2VudmVyJywgJ0PKvGh3ZXZyZXInLCAnTWV1cnpoJywgJ0VicmVsJywgJ01hZScsICdNZXpoZXZlbicsICdHb3VlcmUnLCAnRW9zdCcsICdHd2VuZ29sbycsXG4gICAgICAnSGVyZScsICdEdScsICdLZXJ6dSdcbiAgICBdXG4gIF0sXG4gIHUsIFtbJ2EtcmFvayBKLksuJywgJ2dvdWRlIEouSy4nXSwgdSwgWydhLXJhb2sgSmV6dXotS3Jpc3QnLCAnZ291ZGUgSmV6dXotS3Jpc3QnXV0sIDEsIFs2LCAwXSxcbiAgWydkZC9NTS95JywgJ2QgTU1NIHknLCAnZCBNTU1NIHknLCAnRUVFRSBkIE1NTU0geSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnSEg6bW06c3Mgenp6eiddLFxuICBbJ3sxfSB7MH0nLCAnezF9LCB7MH0nLCAnezF9IFxcJ2RhXFwnIHswfScsIHVdLFxuICBbJywnLCAnwqAnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzDCoCUnLCAnIywjIzAuMDDCoMKkJywgJyNFMCddLCAn4oKsJywgJ2V1cm8nLCB7XG4gICAgJ0FVRCc6IFsnJEEnLCAnJCddLFxuICAgICdCUkwnOiBbdSwgJ1IkJ10sXG4gICAgJ0NBRCc6IFsnJENBJywgJyQnXSxcbiAgICAnQ05ZJzogW3UsICfCpSddLFxuICAgICdFR1AnOiBbdSwgJ8KjIEUnXSxcbiAgICAnR0JQJzogWyfCoyBSVScsICfCoyddLFxuICAgICdIS0QnOiBbJyQgSEsnLCAnJCddLFxuICAgICdJTFMnOiBbdSwgJ+KCqiddLFxuICAgICdKUFknOiBbdSwgJ8KlJ10sXG4gICAgJ0tSVyc6IFt1LCAn4oKpJ10sXG4gICAgJ0xCUCc6IFt1LCAnwqNMJ10sXG4gICAgJ05aRCc6IFsnJCBaTicsICckJ10sXG4gICAgJ1RPUCc6IFt1LCAnJCBUJ10sXG4gICAgJ1RXRCc6IFt1LCAnJCddLFxuICAgICdVU0QnOiBbJyQgU1UnLCAnJCddLFxuICAgICdWTkQnOiBbdSwgJ+KCqyddLFxuICAgICdYQ0QnOiBbdSwgJyQnXSxcbiAgICAnWFhYJzogW11cbiAgfSxcbiAgcGx1cmFsXG5dO1xuIl19