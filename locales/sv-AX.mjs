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
    let i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
    if (i === 1 && v === 0)
        return 1;
    return 5;
}
export default [
    'sv-AX',
    [['fm', 'em'], u, u],
    [['fm', 'em'], ['f.m.', 'e.m.'], ['förmiddag', 'eftermiddag']],
    [
        ['S', 'M', 'T', 'O', 'T', 'F', 'L'], ['sön', 'mån', 'tis', 'ons', 'tors', 'fre', 'lör'],
        ['söndag', 'måndag', 'tisdag', 'onsdag', 'torsdag', 'fredag', 'lördag'],
        ['sö', 'må', 'ti', 'on', 'to', 'fr', 'lö']
    ],
    u,
    [
        ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        ['jan.', 'feb.', 'mars', 'apr.', 'maj', 'juni', 'juli', 'aug.', 'sep.', 'okt.', 'nov.', 'dec.'],
        [
            'januari', 'februari', 'mars', 'april', 'maj', 'juni', 'juli', 'augusti', 'september',
            'oktober', 'november', 'december'
        ]
    ],
    u,
    [['f.Kr.', 'e.Kr.'], u, ['före Kristus', 'efter Kristus']],
    1,
    [6, 0],
    ['y-MM-dd', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', '\'kl\'. HH:mm:ss zzzz'],
    ['{1} {0}', u, u, u],
    [',', ' ', ';', '%', '+', '−', '×10^', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'euro',
    {
        'AUD': [u, '$'],
        'BBD': ['Bds$', '$'],
        'BMD': ['BM$', '$'],
        'BRL': ['BR$', 'R$'],
        'BSD': ['BS$', '$'],
        'BZD': ['BZ$', '$'],
        'CNY': [u, '¥'],
        'DKK': ['Dkr', 'kr'],
        'DOP': ['RD$', '$'],
        'EEK': ['Ekr'],
        'EGP': ['EG£', 'E£'],
        'ESP': [],
        'GBP': [u, '£'],
        'HKD': [u, '$'],
        'IEP': ['IE£'],
        'INR': [u, '₹'],
        'ISK': ['Ikr', 'kr'],
        'JMD': ['JM$', '$'],
        'JPY': [u, '¥'],
        'KRW': [u, '₩'],
        'NOK': ['Nkr', 'kr'],
        'NZD': [u, '$'],
        'RON': [u, 'L'],
        'SEK': ['kr'],
        'TWD': [u, 'NT$'],
        'USD': ['US$', '$'],
        'VND': [u, '₫']
    },
    'ltr',
    plural
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3YtQVguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9zdi1BWC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCx5Q0FBeUM7QUFDekMsK0NBQStDO0FBRS9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUVwQixTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDakMsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsZUFBZTtJQUNiLE9BQU87SUFDUCxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDcEIsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLFdBQVcsRUFBRSxhQUFhLENBQUMsQ0FBQztJQUM5RDtRQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxLQUFLLENBQUM7UUFDdkYsQ0FBQyxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFFB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SyxFQUFFLENBQUMsS0FBSyxFQUFFLElBQUksQ0FBQztRQUNwQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLElBQUksQ0FBQztRQUNiLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUM7UUFDakIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztRQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO0tBQ2hCO0lBQ0QsS0FBSztJQUNMLE1BQU07Q0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbi8vIFRISVMgQ09ERSBJUyBHRU5FUkFURUQgLSBETyBOT1QgTU9ESUZZXG4vLyBTZWUgYW5ndWxhci90b29scy9ndWxwLXRhc2tzL2NsZHIvZXh0cmFjdC5qc1xuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbiAgbGV0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgdiA9IG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLmxlbmd0aDtcbiAgaWYgKGkgPT09IDEgJiYgdiA9PT0gMCkgcmV0dXJuIDE7XG4gIHJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXG4gICdzdi1BWCcsXG4gIFtbJ2ZtJywgJ2VtJ10sIHUsIHVdLFxuICBbWydmbScsICdlbSddLCBbJ2YubS4nLCAnZS5tLiddLCBbJ2bDtnJtaWRkYWcnLCAnZWZ0ZXJtaWRkYWcnXV0sXG4gIFtcbiAgICBbJ1MnLCAnTScsICdUJywgJ08nLCAnVCcsICdGJywgJ0wnXSwgWydzw7ZuJywgJ23DpW4nLCAndGlzJywgJ29ucycsICd0b3JzJywgJ2ZyZScsICdsw7ZyJ10sXG4gICAgWydzw7ZuZGFnJywgJ23DpW5kYWcnLCAndGlzZGFnJywgJ29uc2RhZycsICd0b3JzZGFnJywgJ2ZyZWRhZycsICdsw7ZyZGFnJ10sXG4gICAgWydzw7YnLCAnbcOlJywgJ3RpJywgJ29uJywgJ3RvJywgJ2ZyJywgJ2zDtiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ0onLCAnRicsICdNJywgJ0EnLCAnTScsICdKJywgJ0onLCAnQScsICdTJywgJ08nLCAnTicsICdEJ10sXG4gICAgWydqYW4uJywgJ2ZlYi4nLCAnbWFycycsICdhcHIuJywgJ21haicsICdqdW5pJywgJ2p1bGknLCAnYXVnLicsICdzZXAuJywgJ29rdC4nLCAnbm92LicsICdkZWMuJ10sXG4gICAgW1xuICAgICAgJ2phbnVhcmknLCAnZmVicnVhcmknLCAnbWFycycsICdhcHJpbCcsICdtYWonLCAnanVuaScsICdqdWxpJywgJ2F1Z3VzdGknLCAnc2VwdGVtYmVyJyxcbiAgICAgICdva3RvYmVyJywgJ25vdmVtYmVyJywgJ2RlY2VtYmVyJ1xuICAgIF1cbiAgXSxcbiAgdSxcbiAgW1snZi5Lci4nLCAnZS5Lci4nXSwgdSwgWydmw7ZyZSBLcmlzdHVzJywgJ2VmdGVyIEtyaXN0dXMnXV0sXG4gIDEsXG4gIFs2LCAwXSxcbiAgWyd5LU1NLWRkJywgJ2QgTU1NIHknLCAnZCBNTU1NIHknLCAnRUVFRSBkIE1NTU0geSddLFxuICBbJ0hIOm1tJywgJ0hIOm1tOnNzJywgJ0hIOm1tOnNzIHonLCAnXFwna2xcXCcuIEhIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0gezB9JywgdSwgdSwgdV0sXG4gIFsnLCcsICfCoCcsICc7JywgJyUnLCAnKycsICfiiJInLCAnw5cxMF4nLCAnw5cnLCAn4oCwJywgJ+KInicsICdOYU4nLCAnOiddLFxuICBbJyMsIyMwLiMjIycsICcjLCMjMMKgJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdFVVInLFxuICAn4oKsJyxcbiAgJ2V1cm8nLFxuICB7XG4gICAgJ0FVRCc6IFt1LCAnJCddLFxuICAgICdCQkQnOiBbJ0JkcyQnLCAnJCddLFxuICAgICdCTUQnOiBbJ0JNJCcsICckJ10sXG4gICAgJ0JSTCc6IFsnQlIkJywgJ1IkJ10sXG4gICAgJ0JTRCc6IFsnQlMkJywgJyQnXSxcbiAgICAnQlpEJzogWydCWiQnLCAnJCddLFxuICAgICdDTlknOiBbdSwgJ8KlJ10sXG4gICAgJ0RLSyc6IFsnRGtyJywgJ2tyJ10sXG4gICAgJ0RPUCc6IFsnUkQkJywgJyQnXSxcbiAgICAnRUVLJzogWydFa3InXSxcbiAgICAnRUdQJzogWydFR8KjJywgJ0XCoyddLFxuICAgICdFU1AnOiBbXSxcbiAgICAnR0JQJzogW3UsICfCoyddLFxuICAgICdIS0QnOiBbdSwgJyQnXSxcbiAgICAnSUVQJzogWydJRcKjJ10sXG4gICAgJ0lOUic6IFt1LCAn4oK5J10sXG4gICAgJ0lTSyc6IFsnSWtyJywgJ2tyJ10sXG4gICAgJ0pNRCc6IFsnSk0kJywgJyQnXSxcbiAgICAnSlBZJzogW3UsICfCpSddLFxuICAgICdLUlcnOiBbdSwgJ+KCqSddLFxuICAgICdOT0snOiBbJ05rcicsICdrciddLFxuICAgICdOWkQnOiBbdSwgJyQnXSxcbiAgICAnUk9OJzogW3UsICdMJ10sXG4gICAgJ1NFSyc6IFsna3InXSxcbiAgICAnVFdEJzogW3UsICdOVCQnXSxcbiAgICAnVVNEJzogWydVUyQnLCAnJCddLFxuICAgICdWTkQnOiBbdSwgJ+KCqyddXG4gIH0sXG4gICdsdHInLFxuICBwbHVyYWxcbl07XG4iXX0=