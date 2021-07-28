/**
 * @license
 * Copyright Google LLC All Rights Reserved.
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
        define("@angular/common/locales/pt-ST", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY.
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n));
        if (i === Math.floor(i) && (i >= 0 && i <= 1))
            return 1;
        return 5;
    }
    exports.default = ["pt-ST", [["a.m.", "p.m."], u, ["da manhã", "da tarde"]], [["a.m.", "p.m."], u, ["manhã", "tarde"]], [["D", "S", "T", "Q", "Q", "S", "S"], ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"], ["domingo", "segunda-feira", "terça-feira", "quarta-feira", "quinta-feira", "sexta-feira", "sábado"], ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"]], u, [["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."], ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]], u, [["a.C.", "d.C."], u, ["antes de Cristo", "depois de Cristo"]], 1, [6, 0], ["dd/MM/yy", "dd/MM/y", "d 'de' MMMM 'de' y", "EEEE, d 'de' MMMM 'de' y"], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1}, {0}", u, "{1} 'às' {0}", u], [",", " ", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0%", "#,##0.00 ¤", "#E0"], "STN", "Db", "dobra de São Tomé e Príncipe", { "AUD": ["AU$", "$"], "JPY": ["JP¥", "¥"], "PTE": ["​"], "RON": [u, "L"], "STN": ["Db"], "THB": ["฿"], "TWD": ["NT$"], "USD": ["US$", "$"] }, "ltr", plural];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHQtU1QuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9wdC1TVC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDBDQUEwQztJQUMxQyxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztRQUN6QixJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVsQyxJQUFJLENBQUMsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3pDLE9BQU8sQ0FBQyxDQUFDO1FBQ2IsT0FBTyxDQUFDLENBQUM7SUFDVCxDQUFDO0lBRUQsa0JBQWUsQ0FBQyxPQUFPLEVBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBQyxNQUFNLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsTUFBTSxFQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLE9BQU8sRUFBQyxPQUFPLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsU0FBUyxFQUFDLGVBQWUsRUFBQyxhQUFhLEVBQUMsY0FBYyxFQUFDLGNBQWMsRUFBQyxhQUFhLEVBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxTQUFTLEVBQUMsU0FBUyxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxRQUFRLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxTQUFTLEVBQUMsV0FBVyxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsUUFBUSxFQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsaUJBQWlCLEVBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsb0JBQW9CLEVBQUMsMEJBQTBCLENBQUMsRUFBQyxDQUFDLE9BQU8sRUFBQyxVQUFVLEVBQUMsWUFBWSxFQUFDLGVBQWUsQ0FBQyxFQUFDLENBQUMsVUFBVSxFQUFDLENBQUMsRUFBQyxjQUFjLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsV0FBVyxFQUFDLFFBQVEsRUFBQyxZQUFZLEVBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFDLElBQUksRUFBQyw4QkFBOEIsRUFBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsRUFBQyxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWS5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuY29uc3QgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpO1xuXG5pZiAoaSA9PT0gTWF0aC5mbG9vcihpKSAmJiAoaSA+PSAwICYmIGkgPD0gMSkpXG4gICAgcmV0dXJuIDE7XG5yZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1wicHQtU1RcIixbW1wiYS5tLlwiLFwicC5tLlwiXSx1LFtcImRhIG1hbmjDo1wiLFwiZGEgdGFyZGVcIl1dLFtbXCJhLm0uXCIsXCJwLm0uXCJdLHUsW1wibWFuaMOjXCIsXCJ0YXJkZVwiXV0sW1tcIkRcIixcIlNcIixcIlRcIixcIlFcIixcIlFcIixcIlNcIixcIlNcIl0sW1wiZG9taW5nb1wiLFwic2VndW5kYVwiLFwidGVyw6dhXCIsXCJxdWFydGFcIixcInF1aW50YVwiLFwic2V4dGFcIixcInPDoWJhZG9cIl0sW1wiZG9taW5nb1wiLFwic2VndW5kYS1mZWlyYVwiLFwidGVyw6dhLWZlaXJhXCIsXCJxdWFydGEtZmVpcmFcIixcInF1aW50YS1mZWlyYVwiLFwic2V4dGEtZmVpcmFcIixcInPDoWJhZG9cIl0sW1wiZG9taW5nb1wiLFwic2VndW5kYVwiLFwidGVyw6dhXCIsXCJxdWFydGFcIixcInF1aW50YVwiLFwic2V4dGFcIixcInPDoWJhZG9cIl1dLHUsW1tcIkpcIixcIkZcIixcIk1cIixcIkFcIixcIk1cIixcIkpcIixcIkpcIixcIkFcIixcIlNcIixcIk9cIixcIk5cIixcIkRcIl0sW1wiamFuLlwiLFwiZmV2LlwiLFwibWFyLlwiLFwiYWJyLlwiLFwibWFpLlwiLFwianVuLlwiLFwianVsLlwiLFwiYWdvLlwiLFwic2V0LlwiLFwib3V0LlwiLFwibm92LlwiLFwiZGV6LlwiXSxbXCJqYW5laXJvXCIsXCJmZXZlcmVpcm9cIixcIm1hcsOnb1wiLFwiYWJyaWxcIixcIm1haW9cIixcImp1bmhvXCIsXCJqdWxob1wiLFwiYWdvc3RvXCIsXCJzZXRlbWJyb1wiLFwib3V0dWJyb1wiLFwibm92ZW1icm9cIixcImRlemVtYnJvXCJdXSx1LFtbXCJhLkMuXCIsXCJkLkMuXCJdLHUsW1wiYW50ZXMgZGUgQ3Jpc3RvXCIsXCJkZXBvaXMgZGUgQ3Jpc3RvXCJdXSwxLFs2LDBdLFtcImRkL01NL3l5XCIsXCJkZC9NTS95XCIsXCJkICdkZScgTU1NTSAnZGUnIHlcIixcIkVFRUUsIGQgJ2RlJyBNTU1NICdkZScgeVwiXSxbXCJISDptbVwiLFwiSEg6bW06c3NcIixcIkhIOm1tOnNzIHpcIixcIkhIOm1tOnNzIHp6enpcIl0sW1wiezF9LCB7MH1cIix1LFwiezF9ICfDoHMnIHswfVwiLHVdLFtcIixcIixcIsKgXCIsXCI7XCIsXCIlXCIsXCIrXCIsXCItXCIsXCJFXCIsXCLDl1wiLFwi4oCwXCIsXCLiiJ5cIixcIk5hTlwiLFwiOlwiXSxbXCIjLCMjMC4jIyNcIixcIiMsIyMwJVwiLFwiIywjIzAuMDDCoMKkXCIsXCIjRTBcIl0sXCJTVE5cIixcIkRiXCIsXCJkb2JyYSBkZSBTw6NvIFRvbcOpIGUgUHLDrW5jaXBlXCIse1wiQVVEXCI6W1wiQVUkXCIsXCIkXCJdLFwiSlBZXCI6W1wiSlDCpVwiLFwiwqVcIl0sXCJQVEVcIjpbXCLigItcIl0sXCJST05cIjpbdSxcIkxcIl0sXCJTVE5cIjpbXCJEYlwiXSxcIlRIQlwiOltcIuC4v1wiXSxcIlRXRFwiOltcIk5UJFwiXSxcIlVTRFwiOltcIlVTJFwiLFwiJFwiXX0sXCJsdHJcIiwgcGx1cmFsXTtcbiJdfQ==