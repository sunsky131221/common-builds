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
        define("@angular/common/locales/fr-PF", ["require", "exports"], factory);
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
        'fr-PF', [['AM', 'PM'], u, u], u,
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
        ['HH:mm', 'HH:mm:ss', 'HH:mm:ss z', 'HH:mm:ss zzzz'], ['{1} {0}', '{1} \'à\' {0}', u, u],
        [',', '\u202f', ';', '%', '+', '-', 'E', '×', '‰', '∞', 'NaN', ':'],
        ['#,##0.###', '#,##0 %', '#,##0.00 ¤', '#E0'], 'FCFP', 'franc CFP', {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZnItUEYuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9mci1QRi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILHlDQUF5QztJQUN6QywrQ0FBK0M7SUFFL0MsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7UUFDdkIsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDaEMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDO1lBQUUsT0FBTyxDQUFDLENBQUM7UUFDakMsT0FBTyxDQUFDLENBQUM7SUFDWCxDQUFDO0lBRUQsa0JBQWU7UUFDYixPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUNoQztZQUNFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxNQUFNLENBQUM7WUFDN0YsQ0FBQyxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFVBQVUsRUFBRSxRQUFRLENBQUM7WUFDekUsQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLENBQUM7U0FDM0M7UUFDRCxDQUFDO1FBQ0Q7WUFDRSxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFF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QUM7WUFDZCxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztZQUNoQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQztZQUNkLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUM7WUFDZixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO1lBQ2hCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsR0FBRyxDQUFDO1lBQ25CLEtBQUssRUFBRSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUM7WUFDaEIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxDQUFDO1lBQ2pCLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUM7WUFDbkIsS0FBSyxFQUFFLENBQUMsS0FBSyxFQUFFLEdBQUcsQ0FBQztZQUNuQixLQUFLLEVBQUUsQ0FBQyxLQUFLLENBQUM7WUFDZCxLQUFLLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsTUFBTSxDQUFDO1lBQ2YsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztTQUNqQjtRQUNELE1BQU07S0FDUCxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWVxuLy8gU2VlIGFuZ3VsYXIvdG9vbHMvZ3VscC10YXNrcy9jbGRyL2V4dHJhY3QuanNcblxuY29uc3QgdSA9IHVuZGVmaW5lZDtcblxuZnVuY3Rpb24gcGx1cmFsKG46IG51bWJlcik6IG51bWJlciB7XG4gIGxldCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyhuKSk7XG4gIGlmIChpID09PSAwIHx8IGkgPT09IDEpIHJldHVybiAxO1xuICByZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1xuICAnZnItUEYnLCBbWydBTScsICdQTSddLCB1LCB1XSwgdSxcbiAgW1xuICAgIFsnRCcsICdMJywgJ00nLCAnTScsICdKJywgJ1YnLCAnUyddLCBbJ2RpbS4nLCAnbHVuLicsICdtYXIuJywgJ21lci4nLCAnamV1LicsICd2ZW4uJywgJ3NhbS4nXSxcbiAgICBbJ2RpbWFuY2hlJywgJ2x1bmRpJywgJ21hcmRpJywgJ21lcmNyZWRpJywgJ2pldWRpJywgJ3ZlbmRyZWRpJywgJ3NhbWVkaSddLFxuICAgIFsnZGknLCAnbHUnLCAnbWEnLCAnbWUnLCAnamUnLCAndmUnLCAnc2EnXVxuICBdLFxuICB1LFxuICBbXG4gICAgWydKJywgJ0YnLCAnTScsICdBJywgJ00nLCAnSicsICdKJywgJ0EnLCAnUycsICdPJywgJ04nLCAnRCddLFxuICAgIFtcbiAgICAgICdqYW52LicsICdmw6l2ci4nLCAnbWFycycsICdhdnIuJywgJ21haScsICdqdWluJywgJ2p1aWwuJywgJ2Fvw7t0JywgJ3NlcHQuJywgJ29jdC4nLCAnbm92LicsXG4gICAgICAnZMOpYy4nXG4gICAgXSxcbiAgICBbXG4gICAgICAnamFudmllcicsICdmw6l2cmllcicsICdtYXJzJywgJ2F2cmlsJywgJ21haScsICdqdWluJywgJ2p1aWxsZXQnLCAnYW/Du3QnLCAnc2VwdGVtYnJlJyxcbiAgICAgICdvY3RvYnJlJywgJ25vdmVtYnJlJywgJ2TDqWNlbWJyZSdcbiAgICBdXG4gIF0sXG4gIHUsIFtbJ2F2LiBKLi1DLicsICdhcC4gSi4tQy4nXSwgdSwgWydhdmFudCBKw6lzdXMtQ2hyaXN0JywgJ2FwcsOocyBKw6lzdXMtQ2hyaXN0J11dLCAxLCBbNiwgMF0sXG4gIFsnZGQvTU0veScsICdkIE1NTSB5JywgJ2QgTU1NTSB5JywgJ0VFRUUgZCBNTU1NIHknXSxcbiAgWydISDptbScsICdISDptbTpzcycsICdISDptbTpzcyB6JywgJ0hIOm1tOnNzIHp6enonXSwgWyd7MX0gezB9JywgJ3sxfSBcXCfDoFxcJyB7MH0nLCB1LCB1XSxcbiAgWycsJywgJ1xcdTIwMmYnLCAnOycsICclJywgJysnLCAnLScsICdFJywgJ8OXJywgJ+KAsCcsICfiiJ4nLCAnTmFOJywgJzonXSxcbiAgWycjLCMjMC4jIyMnLCAnIywjIzDCoCUnLCAnIywjIzAuMDDCoMKkJywgJyNFMCddLCAnRkNGUCcsICdmcmFuYyBDRlAnLCB7XG4gICAgJ0FSUyc6IFsnJEFSJywgJyQnXSxcbiAgICAnQVVEJzogWyckQVUnLCAnJCddLFxuICAgICdCRUYnOiBbJ0ZCJ10sXG4gICAgJ0JNRCc6IFsnJEJNJywgJyQnXSxcbiAgICAnQk5EJzogWyckQk4nLCAnJCddLFxuICAgICdCWkQnOiBbJyRCWicsICckJ10sXG4gICAgJ0NBRCc6IFsnJENBJywgJyQnXSxcbiAgICAnQ0xQJzogWyckQ0wnLCAnJCddLFxuICAgICdDTlknOiBbdSwgJ8KlJ10sXG4gICAgJ0NPUCc6IFsnJENPJywgJyQnXSxcbiAgICAnQ1lQJzogWyfCo0NZJ10sXG4gICAgJ0VHUCc6IFt1LCAnwqNFJ10sXG4gICAgJ0ZKRCc6IFsnJEZKJywgJyQnXSxcbiAgICAnRktQJzogWyfCo0ZLJywgJ8KjJ10sXG4gICAgJ0ZSRic6IFsnRiddLFxuICAgICdHQlAnOiBbJ8KjR0InLCAnwqMnXSxcbiAgICAnR0lQJzogWyfCo0dJJywgJ8KjJ10sXG4gICAgJ0hLRCc6IFt1LCAnJCddLFxuICAgICdJRVAnOiBbJ8KjSUUnXSxcbiAgICAnSUxQJzogWyfCo0lMJ10sXG4gICAgJ0lUTCc6IFsn4oKkSVQnXSxcbiAgICAnSlBZJzogW3UsICfCpSddLFxuICAgICdLTUYnOiBbdSwgJ0ZDJ10sXG4gICAgJ0xCUCc6IFsnwqNMQicsICfCo0wnXSxcbiAgICAnTVRQJzogWyfCo01UJ10sXG4gICAgJ01YTic6IFsnJE1YJywgJyQnXSxcbiAgICAnTkFEJzogWyckTkEnLCAnJCddLFxuICAgICdOSU8nOiBbdSwgJyRDJ10sXG4gICAgJ05aRCc6IFsnJE5aJywgJyQnXSxcbiAgICAnUkhEJzogWyckUkgnXSxcbiAgICAnUk9OJzogW3UsICdMJ10sXG4gICAgJ1JXRic6IFt1LCAnRlInXSxcbiAgICAnU0JEJzogWyckU0InLCAnJCddLFxuICAgICdTR0QnOiBbJyRTRycsICckJ10sXG4gICAgJ1NSRCc6IFsnJFNSJywgJyQnXSxcbiAgICAnVE9QJzogW3UsICckVCddLFxuICAgICdUVEQnOiBbJyRUVCcsICckJ10sXG4gICAgJ1RXRCc6IFt1LCAnTlQkJ10sXG4gICAgJ1VTRCc6IFsnJFVTJywgJyQnXSxcbiAgICAnVVlVJzogWyckVVknLCAnJCddLFxuICAgICdXU1QnOiBbJyRXUyddLFxuICAgICdYQ0QnOiBbdSwgJyQnXSxcbiAgICAnWFBGJzogWydGQ0ZQJ10sXG4gICAgJ1pNVyc6IFt1LCAnS3cnXVxuICB9LFxuICBwbHVyYWxcbl07XG4iXX0=