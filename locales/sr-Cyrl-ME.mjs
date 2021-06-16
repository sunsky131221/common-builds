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
    let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
    if (v === 0 && i % 10 === 1 && !(i % 100 === 11) || f % 10 === 1 && !(f % 100 === 11))
        return 1;
    if (v === 0 && i % 10 === Math.floor(i % 10) && i % 10 >= 2 && i % 10 <= 4 &&
        !(i % 100 >= 12 && i % 100 <= 14) ||
        f % 10 === Math.floor(f % 10) && f % 10 >= 2 && f % 10 <= 4 &&
            !(f % 100 >= 12 && f % 100 <= 14))
        return 3;
    return 5;
}
export default [
    'sr-Cyrl-ME',
    [['a', 'p'], ['прије подне', 'по подне'], u],
    u,
    [
        ['н', 'п', 'у', 'с', 'ч', 'п', 'с'], ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
        ['недјеља', 'понедељак', 'уторак', 'сриједа', 'четвртак', 'петак', 'субота'],
        ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су']
    ],
    u,
    [
        ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        ['јан', 'феб', 'март', 'апр', 'мај', 'јун', 'јул', 'авг', 'септ', 'окт', 'нов', 'дец'],
        [
            'јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар',
            'новембар', 'децембар'
        ]
    ],
    u,
    [['п.н.е.', 'н.е.'], ['п. н. е.', 'н. е.'], ['прије нове ере', 'нове ере']],
    1,
    [6, 0],
    ['d.M.yy.', 'dd.MM.y.', 'dd. MMMM y.', 'EEEE, dd. MMMM y.'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'Евро',
    {
        'AUD': [u, '$'],
        'BAM': ['КМ', 'KM'],
        'GEL': [u, 'ლ'],
        'KRW': [u, '₩'],
        'NZD': [u, '$'],
        'TWD': ['NT$'],
        'USD': ['US$', '$'],
        'VND': [u, '₫']
    },
    'ltr',
    plural
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ItQ3lybC1NRS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9sb2NhbGVzL3NyLUN5cmwtTUUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgseUNBQXlDO0FBQ3pDLCtDQUErQztBQUUvQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7QUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztJQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUM3RSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNyQyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDdkMsT0FBTyxDQUFDLENBQUM7SUFDWCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxlQUFlO0lBQ2IsWUFBWTtJQUNaLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxhQUFhLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzVDLENBQUM7SUFDRDtRQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdEYsQ0FBQyxTQUFTLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUM7UUFDNUUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7S0FDM0M7SUFDRCxDQUFDO0lBQ0Q7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQzVELENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdEY7WUFDRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTO1lBQzNGLFVBQVUsRUFBRSxVQUFVO1NBQ3ZCO0tBQ0Y7SUFDRCxDQUFDO0lBQ0QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFVBQVUsQ0FBQyxDQUFDO0lBQzNFLENBQUM7SUFDRCxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDTixDQUFDLFNBQVMsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLG1CQUFtQixDQUFDO0lBQzNELENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO0lBQ3BELENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ3BCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUM7SUFDNUMsS0FBSztJQUNMLEdBQUc7SUFDSCxNQUFNO0lBQ047UUFDRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQztRQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7UUFDZixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7UUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1FBQ25CLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7S0FDaEI7SUFDRCxLQUFLO0lBQ0wsTUFBTTtDQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpLCB2ID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoLFxuICAgICAgZiA9IHBhcnNlSW50KG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLCAxMCkgfHwgMDtcbiAgaWYgKHYgPT09IDAgJiYgaSAlIDEwID09PSAxICYmICEoaSAlIDEwMCA9PT0gMTEpIHx8IGYgJSAxMCA9PT0gMSAmJiAhKGYgJSAxMDAgPT09IDExKSkgcmV0dXJuIDE7XG4gIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gTWF0aC5mbG9vcihpICUgMTApICYmIGkgJSAxMCA+PSAyICYmIGkgJSAxMCA8PSA0ICYmXG4gICAgICAgICAgIShpICUgMTAwID49IDEyICYmIGkgJSAxMDAgPD0gMTQpIHx8XG4gICAgICBmICUgMTAgPT09IE1hdGguZmxvb3IoZiAlIDEwKSAmJiBmICUgMTAgPj0gMiAmJiBmICUgMTAgPD0gNCAmJlxuICAgICAgICAgICEoZiAlIDEwMCA+PSAxMiAmJiBmICUgMTAwIDw9IDE0KSlcbiAgICByZXR1cm4gMztcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ3NyLUN5cmwtTUUnLFxuICBbWydhJywgJ3AnXSwgWyfQv9GA0LjRmNC1INC/0L7QtNC90LUnLCAn0L/QviDQv9C+0LTQvdC1J10sIHVdLFxuICB1LFxuICBbXG4gICAgWyfQvScsICfQvycsICfRgycsICfRgScsICfRhycsICfQvycsICfRgSddLCBbJ9C90LXQtCcsICfQv9C+0L0nLCAn0YPRgtC+JywgJ9GB0YDQtScsICfRh9C10YInLCAn0L/QtdGCJywgJ9GB0YPQsSddLFxuICAgIFsn0L3QtdC00ZjQtdGZ0LAnLCAn0L/QvtC90LXQtNC10ZnQsNC6JywgJ9GD0YLQvtGA0LDQuicsICfRgdGA0LjRmNC10LTQsCcsICfRh9C10YLQstGA0YLQsNC6JywgJ9C/0LXRgtCw0LonLCAn0YHRg9Cx0L7RgtCwJ10sXG4gICAgWyfQvdC1JywgJ9C/0L4nLCAn0YPRgicsICfRgdGAJywgJ9GH0LUnLCAn0L/QtScsICfRgdGDJ11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsn0ZgnLCAn0YQnLCAn0LwnLCAn0LAnLCAn0LwnLCAn0ZgnLCAn0ZgnLCAn0LAnLCAn0YEnLCAn0L4nLCAn0L0nLCAn0LQnXSxcbiAgICBbJ9GY0LDQvScsICfRhNC10LEnLCAn0LzQsNGA0YInLCAn0LDQv9GAJywgJ9C80LDRmCcsICfRmNGD0L0nLCAn0ZjRg9C7JywgJ9Cw0LLQsycsICfRgdC10L/RgicsICfQvtC60YInLCAn0L3QvtCyJywgJ9C00LXRhiddLFxuICAgIFtcbiAgICAgICfRmNCw0L3Rg9Cw0YAnLCAn0YTQtdCx0YDRg9Cw0YAnLCAn0LzQsNGA0YInLCAn0LDQv9GA0LjQuycsICfQvNCw0ZgnLCAn0ZjRg9C9JywgJ9GY0YPQuycsICfQsNCy0LPRg9GB0YInLCAn0YHQtdC/0YLQtdC80LHQsNGAJywgJ9C+0LrRgtC+0LHQsNGAJyxcbiAgICAgICfQvdC+0LLQtdC80LHQsNGAJywgJ9C00LXRhtC10LzQsdCw0YAnXG4gICAgXVxuICBdLFxuICB1LFxuICBbWyfQvy7QvS7QtS4nLCAn0L0u0LUuJ10sIFsn0L8uINC9LiDQtS4nLCAn0L0uINC1LiddLCBbJ9C/0YDQuNGY0LUg0L3QvtCy0LUg0LXRgNC1JywgJ9C90L7QstC1INC10YDQtSddXSxcbiAgMSxcbiAgWzYsIDBdLFxuICBbJ2QuTS55eS4nLCAnZGQuTU0ueS4nLCAnZGQuIE1NTU0geS4nLCAnRUVFRSwgZGQuIE1NTU0geS4nXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICcuJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdFVVInLFxuICAn4oKsJyxcbiAgJ9CV0LLRgNC+JyxcbiAge1xuICAgICdBVUQnOiBbdSwgJyQnXSxcbiAgICAnQkFNJzogWyfQmtCcJywgJ0tNJ10sXG4gICAgJ0dFTCc6IFt1LCAn4YOaJ10sXG4gICAgJ0tSVyc6IFt1LCAn4oKpJ10sXG4gICAgJ05aRCc6IFt1LCAnJCddLFxuICAgICdUV0QnOiBbJ05UJCddLFxuICAgICdVU0QnOiBbJ1VTJCcsICckJ10sXG4gICAgJ1ZORCc6IFt1LCAn4oKrJ11cbiAgfSxcbiAgJ2x0cicsXG4gIHBsdXJhbFxuXTtcbiJdfQ==