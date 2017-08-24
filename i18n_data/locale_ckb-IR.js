/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// THIS CODE IS GENERATED - DO NOT MODIFY
// See angular/tools/gulp-tasks/cldr/extract.js
import { Plural } from '@angular/common';
export default [
    'ckb-IR',
    [
        ['ب.ن', 'د.ن'],
        ,
    ],
    ,
    [
        ['ی', 'د', 'س', 'چ', 'پ', 'ھ', 'ش'],
        ['یەکشەممە', 'دووشەممە', 'سێشەممە', 'چوارشەممە', 'پێنجشەممە', 'ھەینی', 'شەممە'], ,
        ['١ش', '٢ش', '٣ش', '٤ش', '٥ش', 'ھ', 'ش']
    ],
    ,
    [
        ['ک', 'ش', 'ئ', 'ن', 'ئ', 'ح', 'ت', 'ئ', 'ئ', 'ت', 'ت', 'ک'],
        [
            'کانوونی دووەم', 'شوبات', 'ئازار', 'نیسان', 'ئایار', 'حوزەیران', 'تەمووز', 'ئاب', 'ئەیلوول',
            'تشرینی یەکەم', 'تشرینی دووەم', 'کانونی یەکەم'
        ],
    ],
    ,
    [
        ['پێش زایین', 'زایینی'],
        ,
    ],
    6, [5, 5], ['y-MM-dd', 'y MMM d', 'dی MMMMی y', 'y MMMM d, EEEE'],
    ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'],
    [
        '{1} {0}',
        ,
        ,
    ],
    ['.', ',', ';', '%', '‎+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
    ['#,##0.###', '#,##0%', '¤ #,##0.00', '#E0'], 'IRR', 'IRR', function (n) {
        if (n === 1)
            return Plural.One;
        return Plural.Other;
    }
];
//# sourceMappingURL=locale_ckb-IR.js.map