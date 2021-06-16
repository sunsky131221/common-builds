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
    'sr-Cyrl',
    [['a', 'p'], ['пре подне', 'по подне'], u],
    [['пре подне', 'по подне'], u, u],
    [
        ['н', 'п', 'у', 'с', 'ч', 'п', 'с'], ['нед', 'пон', 'уто', 'сре', 'чет', 'пет', 'суб'],
        ['недеља', 'понедељак', 'уторак', 'среда', 'четвртак', 'петак', 'субота'],
        ['не', 'по', 'ут', 'ср', 'че', 'пе', 'су']
    ],
    u,
    [
        ['ј', 'ф', 'м', 'а', 'м', 'ј', 'ј', 'а', 'с', 'о', 'н', 'д'],
        ['јан', 'феб', 'мар', 'апр', 'мај', 'јун', 'јул', 'авг', 'сеп', 'окт', 'нов', 'дец'],
        [
            'јануар', 'фебруар', 'март', 'април', 'мај', 'јун', 'јул', 'август', 'септембар', 'октобар',
            'новембар', 'децембар'
        ]
    ],
    u,
    [['п.н.е.', 'н.е.'], ['п. н. е.', 'н. е.'], ['пре нове ере', 'нове ере']],
    1,
    [6, 0],
    ['d.M.yy.', 'dd.MM.y.', 'dd. MMMM y.', 'EEEE, dd. MMMM y.'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'RSD',
    'RSD',
    'Српски динар',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ItQ3lybC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9sb2NhbGVzL3NyLUN5cmwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgseUNBQXlDO0FBQ3pDLCtDQUErQztBQUUvQyxNQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7QUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztJQUN2QixJQUFJLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUM3RSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUNqRSxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDaEcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDO1FBQ2xFLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNyQyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQztZQUN2RCxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDdkMsT0FBTyxDQUFDLENBQUM7SUFDWCxPQUFPLENBQUMsQ0FBQztBQUNYLENBQUM7QUFFRCxlQUFlO0lBQ2IsU0FBUztJQUNULENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQzFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsVUFBVSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNqQztRQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdEYsQ0FBQyxRQUFRLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsVUFBVSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUM7UUFDekUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7S0FDM0M7SUFDRCxDQUFDO0lBQ0Q7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDO1FBQzVELENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDcEY7WUFDRSxRQUFRLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFdBQVcsRUFBRSxTQUFTO1lBQzNGLFVBQVUsRUFBRSxVQUFVO1NBQ3ZCO0tBQ0Y7SUFDRCxDQUFDO0lBQ0QsQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLGNBQWMsRUFBRSxVQUFVLENBQUMsQ0FBQztJQUN6RSxDQUFDO0lBQ0QsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ04sQ0FBQyxTQUFTLEVBQUUsVUFBVSxFQUFFLGFBQWEsRUFBRSxtQkFBbUIsQ0FBQztJQUMzRCxDQUFDLE9BQU8sRUFBRSxVQUFVLEVBQUUsWUFBWSxFQUFFLGVBQWUsQ0FBQztJQUNwRCxDQUFDLFNBQVMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNwQixDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDO0lBQzlELENBQUMsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsS0FBSyxDQUFDO0lBQzVDLEtBQUs7SUFDTCxLQUFLO0lBQ0wsY0FBYztJQUNkO1FBQ0UsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUM7UUFDbkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7UUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsS0FBSyxDQUFDO1FBQ2QsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0tBQ2hCO0lBQ0QsS0FBSztJQUNMLE1BQU07Q0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgdiA9IG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLmxlbmd0aCxcbiAgICAgIGYgPSBwYXJzZUludChuLnRvU3RyaW5nKCkucmVwbGFjZSgvXlteLl0qXFwuPy8sICcnKSwgMTApIHx8IDA7XG4gIGlmICh2ID09PSAwICYmIGkgJSAxMCA9PT0gMSAmJiAhKGkgJSAxMDAgPT09IDExKSB8fCBmICUgMTAgPT09IDEgJiYgIShmICUgMTAwID09PSAxMSkpIHJldHVybiAxO1xuICBpZiAodiA9PT0gMCAmJiBpICUgMTAgPT09IE1hdGguZmxvb3IoaSAlIDEwKSAmJiBpICUgMTAgPj0gMiAmJiBpICUgMTAgPD0gNCAmJlxuICAgICAgICAgICEoaSAlIDEwMCA+PSAxMiAmJiBpICUgMTAwIDw9IDE0KSB8fFxuICAgICAgZiAlIDEwID09PSBNYXRoLmZsb29yKGYgJSAxMCkgJiYgZiAlIDEwID49IDIgJiYgZiAlIDEwIDw9IDQgJiZcbiAgICAgICAgICAhKGYgJSAxMDAgPj0gMTIgJiYgZiAlIDEwMCA8PSAxNCkpXG4gICAgcmV0dXJuIDM7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdzci1DeXJsJyxcbiAgW1snYScsICdwJ10sIFsn0L/RgNC1INC/0L7QtNC90LUnLCAn0L/QviDQv9C+0LTQvdC1J10sIHVdLFxuICBbWyfQv9GA0LUg0L/QvtC00L3QtScsICfQv9C+INC/0L7QtNC90LUnXSwgdSwgdV0sXG4gIFtcbiAgICBbJ9C9JywgJ9C/JywgJ9GDJywgJ9GBJywgJ9GHJywgJ9C/JywgJ9GBJ10sIFsn0L3QtdC0JywgJ9C/0L7QvScsICfRg9GC0L4nLCAn0YHRgNC1JywgJ9GH0LXRgicsICfQv9C10YInLCAn0YHRg9CxJ10sXG4gICAgWyfQvdC10LTQtdGZ0LAnLCAn0L/QvtC90LXQtNC10ZnQsNC6JywgJ9GD0YLQvtGA0LDQuicsICfRgdGA0LXQtNCwJywgJ9GH0LXRgtCy0YDRgtCw0LonLCAn0L/QtdGC0LDQuicsICfRgdGD0LHQvtGC0LAnXSxcbiAgICBbJ9C90LUnLCAn0L/QvicsICfRg9GCJywgJ9GB0YAnLCAn0YfQtScsICfQv9C1JywgJ9GB0YMnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWyfRmCcsICfRhCcsICfQvCcsICfQsCcsICfQvCcsICfRmCcsICfRmCcsICfQsCcsICfRgScsICfQvicsICfQvScsICfQtCddLFxuICAgIFsn0ZjQsNC9JywgJ9GE0LXQsScsICfQvNCw0YAnLCAn0LDQv9GAJywgJ9C80LDRmCcsICfRmNGD0L0nLCAn0ZjRg9C7JywgJ9Cw0LLQsycsICfRgdC10L8nLCAn0L7QutGCJywgJ9C90L7QsicsICfQtNC10YYnXSxcbiAgICBbXG4gICAgICAn0ZjQsNC90YPQsNGAJywgJ9GE0LXQsdGA0YPQsNGAJywgJ9C80LDRgNGCJywgJ9Cw0L/RgNC40LsnLCAn0LzQsNGYJywgJ9GY0YPQvScsICfRmNGD0LsnLCAn0LDQstCz0YPRgdGCJywgJ9GB0LXQv9GC0LXQvNCx0LDRgCcsICfQvtC60YLQvtCx0LDRgCcsXG4gICAgICAn0L3QvtCy0LXQvNCx0LDRgCcsICfQtNC10YbQtdC80LHQsNGAJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1sn0L8u0L0u0LUuJywgJ9C9LtC1LiddLCBbJ9C/LiDQvS4g0LUuJywgJ9C9LiDQtS4nXSwgWyfQv9GA0LUg0L3QvtCy0LUg0LXRgNC1JywgJ9C90L7QstC1INC10YDQtSddXSxcbiAgMSxcbiAgWzYsIDBdLFxuICBbJ2QuTS55eS4nLCAnZGQuTU0ueS4nLCAnZGQuIE1NTU0geS4nLCAnRUVFRSwgZGQuIE1NTU0geS4nXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICcuJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdSU0QnLFxuICAnUlNEJyxcbiAgJ9Ch0YDQv9GB0LrQuCDQtNC40L3QsNGAJyxcbiAge1xuICAgICdBVUQnOiBbdSwgJyQnXSxcbiAgICAnQkFNJzogWyfQmtCcJywgJ0tNJ10sXG4gICAgJ0dFTCc6IFt1LCAn4YOaJ10sXG4gICAgJ0tSVyc6IFt1LCAn4oKpJ10sXG4gICAgJ05aRCc6IFt1LCAnJCddLFxuICAgICdUV0QnOiBbJ05UJCddLFxuICAgICdVU0QnOiBbJ1VTJCcsICckJ10sXG4gICAgJ1ZORCc6IFt1LCAn4oKrJ11cbiAgfSxcbiAgJ2x0cicsXG4gIHBsdXJhbFxuXTtcbiJdfQ==