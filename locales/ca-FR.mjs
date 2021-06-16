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
    'ca-FR',
    [['a. m.', 'p. m.'], u, u],
    u,
    [
        ['dg', 'dl', 'dt', 'dc', 'dj', 'dv', 'ds'], ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.'],
        ['diumenge', 'dilluns', 'dimarts', 'dimecres', 'dijous', 'divendres', 'dissabte'],
        ['dg.', 'dl.', 'dt.', 'dc.', 'dj.', 'dv.', 'ds.']
    ],
    u,
    [
        ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS'],
        [
            'de gen.', 'de febr.', 'de març', 'd’abr.', 'de maig', 'de juny', 'de jul.', 'd’ag.',
            'de set.', 'd’oct.', 'de nov.', 'de des.'
        ],
        [
            'de gener', 'de febrer', 'de març', 'd’abril', 'de maig', 'de juny', 'de juliol', 'd’agost',
            'de setembre', 'd’octubre', 'de novembre', 'de desembre'
        ]
    ],
    [
        ['GN', 'FB', 'MÇ', 'AB', 'MG', 'JN', 'JL', 'AG', 'ST', 'OC', 'NV', 'DS'],
        [
            'gen.', 'febr.', 'març', 'abr.', 'maig', 'juny', 'jul.', 'ag.', 'set.', 'oct.', 'nov.', 'des.'
        ],
        [
            'gener', 'febrer', 'març', 'abril', 'maig', 'juny', 'juliol', 'agost', 'setembre', 'octubre',
            'novembre', 'desembre'
        ]
    ],
    [['aC', 'dC'], u, ['abans de Crist', 'després de Crist']],
    1,
    [6, 0],
    ['d/M/yy', 'd MMM y', 'd MMMM \'de\' y', 'EEEE, d MMMM \'de\' y'],
    ['H:mm', 'H:mm:ss', 'H:mm:ss z', 'H:mm:ss zzzz'],
    ['{1} {0}', '{1}, {0}', '{1} \'a\' \'les\' {0}', u],
    [',', '.', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'],
    'EUR',
    '€',
    'euro',
    {
        'AUD': ['AU$', '$'],
        'BRL': [u, 'R$'],
        'CAD': [u, '$'],
        'CNY': [u, '¥'],
        'ESP': ['₧'],
        'FRF': ['F'],
        'MXN': [u, '$'],
        'THB': ['฿'],
        'USD': [u, '$'],
        'VEF': [u, 'Bs F'],
        'XCD': [u, '$'],
        'XXX': []
    },
    'ltr',
    plural
];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2EtRlIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9jYS1GUi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCx5Q0FBeUM7QUFDekMsK0NBQStDO0FBRS9DLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUVwQixTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBQ3ZCLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUM7SUFDbEYsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1FBQUUsT0FBTyxDQUFDLENBQUM7SUFDakMsT0FBTyxDQUFDLENBQUM7QUFDWCxDQUFDO0FBRUQsZUFBZTtJQUNiLE9BQU87SUFDUCxDQUFDLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUIsQ0FBQztJQUNEO1FBQ0UsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztRQUM3RixDQUFDLFVBQVUsRUFBRSxTQUFTLEVBQUUsU0FBUyxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUUsV0FBVyxFQUFFLFVBQVUsQ0FBQztRQUNqRixDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtB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QyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSksIHYgPSBuLnRvU3RyaW5nKCkucmVwbGFjZSgvXlteLl0qXFwuPy8sICcnKS5sZW5ndGg7XG4gIGlmIChpID09PSAxICYmIHYgPT09IDApIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnY2EtRlInLFxuICBbWydhLsKgbS4nLCAncC7CoG0uJ10sIHUsIHVdLFxuICB1LFxuICBbXG4gICAgWydkZycsICdkbCcsICdkdCcsICdkYycsICdkaicsICdkdicsICdkcyddLCBbJ2RnLicsICdkbC4nLCAnZHQuJywgJ2RjLicsICdkai4nLCAnZHYuJywgJ2RzLiddLFxuICAgIFsnZGl1bWVuZ2UnLCAnZGlsbHVucycsICdkaW1hcnRzJywgJ2RpbWVjcmVzJywgJ2Rpam91cycsICdkaXZlbmRyZXMnLCAnZGlzc2FidGUnXSxcbiAgICBbJ2RnLicsICdkbC4nLCAnZHQuJywgJ2RjLicsICdkai4nLCAnZHYuJywgJ2RzLiddXG4gIF0sXG4gIHUsXG4gIFtcbiAgICBbJ0dOJywgJ0ZCJywgJ03DhycsICdBQicsICdNRycsICdKTicsICdKTCcsICdBRycsICdTVCcsICdPQycsICdOVicsICdEUyddLFxuICAgIFtcbiAgICAgICdkZSBnZW4uJywgJ2RlIGZlYnIuJywgJ2RlIG1hcsOnJywgJ2TigJlhYnIuJywgJ2RlIG1haWcnLCAnZGUganVueScsICdkZSBqdWwuJywgJ2TigJlhZy4nLFxuICAgICAgJ2RlIHNldC4nLCAnZOKAmW9jdC4nLCAnZGUgbm92LicsICdkZSBkZXMuJ1xuICAgIF0sXG4gICAgW1xuICAgICAgJ2RlIGdlbmVyJywgJ2RlIGZlYnJlcicsICdkZSBtYXLDpycsICdk4oCZYWJyaWwnLCAnZGUgbWFpZycsICdkZSBqdW55JywgJ2RlIGp1bGlvbCcsICdk4oCZYWdvc3QnLFxuICAgICAgJ2RlIHNldGVtYnJlJywgJ2TigJlvY3R1YnJlJywgJ2RlIG5vdmVtYnJlJywgJ2RlIGRlc2VtYnJlJ1xuICAgIF1cbiAgXSxcbiAgW1xuICAgIFsnR04nLCAnRkInLCAnTcOHJywgJ0FCJywgJ01HJywgJ0pOJywgJ0pMJywgJ0FHJywgJ1NUJywgJ09DJywgJ05WJywgJ0RTJ10sXG4gICAgW1xuICAgICAgJ2dlbi4nLCAnZmVici4nLCAnbWFyw6cnLCAnYWJyLicsICdtYWlnJywgJ2p1bnknLCAnanVsLicsICdhZy4nLCAnc2V0LicsICdvY3QuJywgJ25vdi4nLCAnZGVzLidcbiAgICBdLFxuICAgIFtcbiAgICAgICdnZW5lcicsICdmZWJyZXInLCAnbWFyw6cnLCAnYWJyaWwnLCAnbWFpZycsICdqdW55JywgJ2p1bGlvbCcsICdhZ29zdCcsICdzZXRlbWJyZScsICdvY3R1YnJlJyxcbiAgICAgICdub3ZlbWJyZScsICdkZXNlbWJyZSdcbiAgICBdXG4gIF0sXG4gIFtbJ2FDJywgJ2RDJ10sIHUsIFsnYWJhbnMgZGUgQ3Jpc3QnLCAnZGVzcHLDqXMgZGUgQ3Jpc3QnXV0sXG4gIDEsXG4gIFs2LCAwXSxcbiAgWydkL00veXknLCAnZCBNTU0geScsICdkIE1NTU0gXFwnZGVcXCcgeScsICdFRUVFLCBkIE1NTU0gXFwnZGVcXCcgeSddLFxuICBbJ0g6bW0nLCAnSDptbTpzcycsICdIOm1tOnNzIHonLCAnSDptbTpzcyB6enp6J10sXG4gIFsnezF9IHswfScsICd7MX0sIHswfScsICd7MX0gXFwnYVxcJyBcXCdsZXNcXCcgezB9JywgdV0sXG4gIFsnLCcsICcuJywgJzsnLCAnJScsICcrJywgJy0nLCAnRScsICfDlycsICfigLAnLCAn4oieJywgJ05hTicsICc6J10sXG4gIFsnIywjIzAuIyMjJywgJyMsIyMwJScsICcjLCMjMC4wMMKgwqQnLCAnI0UwJ10sXG4gICdFVVInLFxuICAn4oKsJyxcbiAgJ2V1cm8nLFxuICB7XG4gICAgJ0FVRCc6IFsnQVUkJywgJyQnXSxcbiAgICAnQlJMJzogW3UsICdSJCddLFxuICAgICdDQUQnOiBbdSwgJyQnXSxcbiAgICAnQ05ZJzogW3UsICfCpSddLFxuICAgICdFU1AnOiBbJ+KCpyddLFxuICAgICdGUkYnOiBbJ0YnXSxcbiAgICAnTVhOJzogW3UsICckJ10sXG4gICAgJ1RIQic6IFsn4Li/J10sXG4gICAgJ1VTRCc6IFt1LCAnJCddLFxuICAgICdWRUYnOiBbdSwgJ0JzIEYnXSxcbiAgICAnWENEJzogW3UsICckJ10sXG4gICAgJ1hYWCc6IFtdXG4gIH0sXG4gICdsdHInLFxuICBwbHVyYWxcbl07XG4iXX0=