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
    'it-SM',
    [['m.', 'p.'], ['AM', 'PM'], u],
    u,
    [
        ['D', 'L', 'M', 'M', 'G', 'V', 'S'], ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'],
        ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'],
        ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab']
    ],
    u,
    [
        ['G', 'F', 'M', 'A', 'M', 'G', 'L', 'A', 'S', 'O', 'N', 'D'],
        ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'],
        [
            'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre',
            'ottobre', 'novembre', 'dicembre'
        ]
    ],
    u,
    [['aC', 'dC'], ['a.C.', 'd.C.'], ['avanti Cristo', 'dopo Cristo']],
    1,
    [6, 0],
    ['dd/MM/yy', 'd MMM y', 'd MMMM y', 'EEEE d MMMM y'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    ['{1}, {0}', u, '{1} {0}', u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'euro',
    {
        'BRL': [u, 'R$'],
        'BYN': [u, 'Br'],
        'EGP': [u, '£E'],
        'HKD': [u, '$'],
        'JPY': [u, '¥'],
        'KRW': [u, '₩'],
        'MXN': [u, '$'],
        'NOK': [u, 'NKr'],
        'THB': ['฿'],
        'TWD': [u, 'NT$'],
        'USD': [u, '$']
    },
    'ltr',
    plural
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaXQtU00uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9pdC1TTS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCx5Q0FBeUM7QUFDekMsK0NBQStDO0FBRS9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUVwQixTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDakMsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsZUFBZTtJQUNiLE9BQU87SUFDUCxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvQixDQUFDO0lBQ0Q7UUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3RGLENBQUMsVUFBVSxFQUFFLFFBQVEsRUFBRSxTQUFTLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsUUFBUSxDQUFDO1FBQzlFLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO0tBQ2xEO0lBQ0QsQ0FBQztJQUNEO1FBQ0UsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQztRQUM1RCxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDO1FBQ3BGO1lBQ0UsU0FBUyxFQUFFLFVBQVUsRUFBRSxPQUFPLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxXQUFXO1lBQzdGLFNBQVMsRUFBRSxVQUFVLEVBQUUsVUFBVTtTQUNsQztLQUNGO0lBQ0QsQ0FBQztJQUNELENBQUMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxDQUFDLEVBQUUsQ0FBQyxlQUFlLEVBQUUsYUFBYSxDQUFDLENBQUM7SUFDbEUsQ0FBQztJQUNELENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNOLENBQUMsVUFBVSxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQUUsZUFBZSxDQUFDO0lBQ3BELENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxZQUFZLEVBQUUsZUFBZSxDQUFDO0lBQ3BELENBQUMsVUFBVSxFQUFFLENBQUMsRUFBRSxTQUFTLEVBQUUsQ0FBQyxDQUFDO0lBQzdCLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLENBQUM7SUFDOUQsQ0FBQyxXQUFXLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxLQUFLLENBQUM7SUFDNUMsS0FBSztJQUNMLEdBQUc7SUFDSCxNQUFNO0lBQ047UUFDRSxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1FBQ2hCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7UUFDaEIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztRQUNoQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQztRQUNmLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7UUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQztRQUNqQixLQUFLLEVBQUUsQ0FBQyxHQUFHLENBQUM7UUFDWixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1FBQ2pCLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7S0FDaEI7SUFDRCxLQUFLO0lBQ0wsTUFBTTtDQUNQLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRllcbi8vIFNlZSBhbmd1bGFyL3Rvb2xzL2d1bHAtdGFza3MvY2xkci9leHRyYWN0LmpzXG5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuICBsZXQgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpLCB2ID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoO1xuICBpZiAoaSA9PT0gMSAmJiB2ID09PSAwKSByZXR1cm4gMTtcbiAgcmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcbiAgJ2l0LVNNJyxcbiAgW1snbS4nLCAncC4nXSwgWydBTScsICdQTSddLCB1XSxcbiAgdSxcbiAgW1xuICAgIFsnRCcsICdMJywgJ00nLCAnTScsICdHJywgJ1YnLCAnUyddLCBbJ2RvbScsICdsdW4nLCAnbWFyJywgJ21lcicsICdnaW8nLCAndmVuJywgJ3NhYiddLFxuICAgIFsnZG9tZW5pY2EnLCAnbHVuZWTDrCcsICdtYXJ0ZWTDrCcsICdtZXJjb2xlZMOsJywgJ2dpb3ZlZMOsJywgJ3ZlbmVyZMOsJywgJ3NhYmF0byddLFxuICAgIFsnZG9tJywgJ2x1bicsICdtYXInLCAnbWVyJywgJ2dpbycsICd2ZW4nLCAnc2FiJ11cbiAgXSxcbiAgdSxcbiAgW1xuICAgIFsnRycsICdGJywgJ00nLCAnQScsICdNJywgJ0cnLCAnTCcsICdBJywgJ1MnLCAnTycsICdOJywgJ0QnXSxcbiAgICBbJ2dlbicsICdmZWInLCAnbWFyJywgJ2FwcicsICdtYWcnLCAnZ2l1JywgJ2x1ZycsICdhZ28nLCAnc2V0JywgJ290dCcsICdub3YnLCAnZGljJ10sXG4gICAgW1xuICAgICAgJ2dlbm5haW8nLCAnZmViYnJhaW8nLCAnbWFyem8nLCAnYXByaWxlJywgJ21hZ2dpbycsICdnaXVnbm8nLCAnbHVnbGlvJywgJ2Fnb3N0bycsICdzZXR0ZW1icmUnLFxuICAgICAgJ290dG9icmUnLCAnbm92ZW1icmUnLCAnZGljZW1icmUnXG4gICAgXVxuICBdLFxuICB1LFxuICBbWydhQycsICdkQyddLCBbJ2EuQy4nLCAnZC5DLiddLCBbJ2F2YW50aSBDcmlzdG8nLCAnZG9wbyBDcmlzdG8nXV0sXG4gIDEsXG4gIFs2LCAwXSxcbiAgWydkZC9NTS95eScsICdkIE1NTSB5JywgJ2QgTU1NTSB5JywgJ0VFRUUgZCBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSxcbiAgWyd7MX0sIHswfScsIHUsICd7MX0gezB9JywgdV0sXG4gIFsnLCcsICcuJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdFVVInLFxuICAn4oKsJyxcbiAgJ2V1cm8nLFxuICB7XG4gICAgJ0JSTCc6IFt1LCAnUiQnXSxcbiAgICAnQllOJzogW3UsICdCciddLFxuICAgICdFR1AnOiBbdSwgJ8KjRSddLFxuICAgICdIS0QnOiBbdSwgJyQnXSxcbiAgICAnSlBZJzogW3UsICfCpSddLFxuICAgICdLUlcnOiBbdSwgJ+KCqSddLFxuICAgICdNWE4nOiBbdSwgJyQnXSxcbiAgICAnTk9LJzogW3UsICdOS3InXSxcbiAgICAnVEhCJzogWyfguL8nXSxcbiAgICAnVFdEJzogW3UsICdOVCQnXSxcbiAgICAnVVNEJzogW3UsICckJ11cbiAgfSxcbiAgJ2x0cicsXG4gIHBsdXJhbFxuXTtcbiJdfQ==