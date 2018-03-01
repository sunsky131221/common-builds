/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js
function plural(n) {
    var i = Math.floor(Math.abs(n));
    if (i === Math.floor(i) && i >= 0 && i <= 1)
        return 1;
    return 5;
}
export default [
    'pt-MO', [['a.m.', 'p.m.'], , ['da manhã', 'da tarde']],
    [['a.m.', 'p.m.'], , ['manhã', 'tarde']],
    [
        ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'],
        ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'],
        [
            'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira',
            'sábado'
        ],
        ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb']
    ],
    ,
    [
        ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
        ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'],
        [
            'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro',
            'outubro', 'novembro', 'dezembro'
        ]
    ],
    ,
    [['a.C.', 'd.C.'], , ['antes de Cristo', 'depois de Cristo']], 0, [6, 0],
    ['dd/MM/yy', 'dd/MM/y', 'd \'de\' MMMM \'de\' y', 'EEEE, d \'de\' MMMM \'de\' y'],
    ['h:mm a', 'h:mm:ss a', 'h:mm:ss a z', 'h:mm:ss a zzzz'],
    [
        '{1}, {0}',
        ,
        '{1} \'às\' {0}',
    ],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '#,##0.00 ¤', '#E0'], 'MOP$', 'Pataca de Macau', {
        'AUD': ['AU$', '$'],
        'JPY': ['JP¥', '¥'],
        'MOP': ['MOP$'],
        'PTE': ['​'],
        'RON': [, 'L'],
        'THB': ['฿'],
        'TWD': ['NT$'],
        'USD': ['US$', '$']
    },
    plural
];
//# sourceMappingURL=pt-MO.js.map