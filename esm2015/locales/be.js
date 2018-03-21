"use strict";
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js
function plural(n) {
    if (n % 10 === 1 && !(n % 100 === 11))
        return 1;
    if (n % 10 === Math.floor(n % 10) && n % 10 >= 2 && n % 10 <= 4 &&
        !(n % 100 >= 12 && n % 100 <= 14))
        return 3;
    if (n % 10 === 0 || n % 10 === Math.floor(n % 10) && n % 10 >= 5 && n % 10 <= 9 ||
        n % 100 === Math.floor(n % 100) && n % 100 >= 11 && n % 100 <= 14)
        return 4;
    return 5;
}
exports.default = [
    'be',
    [
        ['am', 'pm'],
        ['AM', 'PM'],
    ],
    [
        ['AM', 'PM'],
        ,
    ],
    [
        ['н', 'п', 'а', 'с', 'ч', 'п', 'с'],
        ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб'],
        [
            'нядзеля', 'панядзелак', 'аўторак', 'серада', 'чацвер',
            'пятніца', 'субота'
        ],
        ['нд', 'пн', 'аў', 'ср', 'чц', 'пт', 'сб']
    ],
    ,
    [
        ['с', 'л', 'с', 'к', 'м', 'ч', 'л', 'ж', 'в', 'к', 'л', 'с'],
        [
            'сту', 'лют', 'сак', 'кра', 'мая', 'чэр', 'ліп', 'жні', 'вер',
            'кас', 'ліс', 'сне'
        ],
        [
            'студзеня', 'лютага', 'сакавіка', 'красавіка', 'мая',
            'чэрвеня', 'ліпеня', 'жніўня', 'верасня', 'кастрычніка',
            'лістапада', 'снежня'
        ]
    ],
    [
        ['с', 'л', 'с', 'к', 'м', 'ч', 'л', 'ж', 'в', 'к', 'л', 'с'],
        [
            'сту', 'лют', 'сак', 'кра', 'май', 'чэр', 'ліп', 'жні', 'вер',
            'кас', 'ліс', 'сне'
        ],
        [
            'студзень', 'люты', 'сакавік', 'красавік', 'май',
            'чэрвень', 'ліпень', 'жнівень', 'верасень',
            'кастрычнік', 'лістапад', 'снежань'
        ]
    ],
    [
        ['да н.э.', 'н.э.'], ,
        ['да нараджэння Хрыстова', 'ад нараджэння Хрыстова']
    ],
    1, [6, 0], ['d.MM.yy', 'd.MM.y', 'd MMMM y \'г\'.', 'EEEE, d MMMM y \'г\'.'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss, zzzz'],
    [
        '{1}, {0}',
        ,
        '{1} \'у\' {0}',
    ],
    [',', ' ', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'Br', 'беларускі рубель', {
        'AUD': ['A$'],
        'BBD': [, 'Bds$'],
        'BMD': [, 'BD$'],
        'BRL': [, 'R$'],
        'BSD': [, 'B$'],
        'BYN': ['Br'],
        'BZD': [, 'BZ$'],
        'CAD': [, 'CA$'],
        'CUC': [, 'CUC$'],
        'CUP': [, '$MN'],
        'DOP': [, 'RD$'],
        'FJD': [, 'FJ$'],
        'FKP': [, 'FK£'],
        'GYD': [, 'G$'],
        'ISK': [, 'Íkr'],
        'JMD': [, 'J$'],
        'KYD': [, 'CI$'],
        'LRD': [, 'L$'],
        'MXN': ['MX$'],
        'NAD': [, 'N$'],
        'NZD': [, 'NZ$'],
        'RUB': ['₽', 'руб.'],
        'SBD': [, 'SI$'],
        'SGD': [, 'S$'],
        'TTD': [, 'TT$'],
        'UYU': [, '$U'],
        'XCD': ['EC$']
    },
    plural
];
//# sourceMappingURL=be.js.map