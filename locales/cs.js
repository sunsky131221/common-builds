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
        define("@angular/common/locales/cs", ["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // THIS CODE IS GENERATED - DO NOT MODIFY.
    var u = undefined;
    function plural(n) {
        var i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
        if (i === 1 && v === 0)
            return 1;
        if (i === Math.floor(i) && (i >= 2 && i <= 4) && v === 0)
            return 3;
        if (!(v === 0))
            return 4;
        return 5;
    }
    exports.default = ["cs", [["dop.", "odp."], u, u], u, [["N", "P", "Ú", "S", "Č", "P", "S"], ["ne", "po", "út", "st", "čt", "pá", "so"], ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"], ["ne", "po", "út", "st", "čt", "pá", "so"]], u, [["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"], ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"]], [["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], ["led", "úno", "bře", "dub", "kvě", "čvn", "čvc", "srp", "zář", "říj", "lis", "pro"], ["leden", "únor", "březen", "duben", "květen", "červen", "červenec", "srpen", "září", "říjen", "listopad", "prosinec"]], [["př.n.l.", "n.l."], ["př. n. l.", "n. l."], ["před naším letopočtem", "našeho letopočtu"]], 1, [6, 0], ["dd.MM.yy", "d. M. y", "d. MMMM y", "EEEE d. MMMM y"], ["H:mm", "H:mm:ss", "H:mm:ss z", "H:mm:ss zzzz"], ["{1} {0}", u, u, u], [",", " ", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0 %", "#,##0.00 ¤", "#E0"], "CZK", "Kč", "česká koruna", { "AUD": ["AU$", "$"], "CSK": ["Kčs"], "CZK": ["Kč"], "ILS": [u, "₪"], "INR": [u, "₹"], "JPY": ["JP¥", "¥"], "RON": [u, "L"], "TWD": ["NT$"], "USD": ["US$", "$"], "VND": [u, "₫"], "XEU": ["ECU"], "XXX": [] }, "ltr", plural];
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9jcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7Ozs7Ozs7Ozs7OztJQUVILDBDQUEwQztJQUMxQyxJQUFNLENBQUMsR0FBRyxTQUFTLENBQUM7SUFFcEIsU0FBUyxNQUFNLENBQUMsQ0FBUztRQUN6QixJQUFNLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDO1FBRXBGLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNsQixPQUFPLENBQUMsQ0FBQztRQUNiLElBQUksQ0FBQyxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQztZQUNwRCxPQUFPLENBQUMsQ0FBQztRQUNiLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUM7WUFDVixPQUFPLENBQUMsQ0FBQztRQUNiLE9BQU8sQ0FBQyxDQUFDO0lBQ1QsQ0FBQztJQUVELGtCQUFlLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBQyxDQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsT0FBTyxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLFdBQVcsRUFBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsRUFBQyxDQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLE9BQU8sRUFBQyxRQUFRLEVBQUMsUUFBUSxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxVQUFVLEVBQUMsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsU0FBUyxFQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsV0FBVyxFQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsdUJBQXVCLEVBQUMsa0JBQWtCLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsV0FBVyxFQUFDLGdCQUFnQixDQUFDLEVBQUMsQ0FBQyxNQUFNLEVBQUMsU0FBUyxFQUFDLFdBQVcsRUFBQyxjQUFjLENBQUMsRUFBQyxDQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLFdBQVcsRUFBQyxTQUFTLEVBQUMsWUFBWSxFQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsY0FBYyxFQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxFQUFFLEVBQUMsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRlkuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbmNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgdiA9IG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLmxlbmd0aDtcblxuaWYgKGkgPT09IDEgJiYgdiA9PT0gMClcbiAgICByZXR1cm4gMTtcbmlmIChpID09PSBNYXRoLmZsb29yKGkpICYmIChpID49IDIgJiYgaSA8PSA0KSAmJiB2ID09PSAwKVxuICAgIHJldHVybiAzO1xuaWYgKCEodiA9PT0gMCkpXG4gICAgcmV0dXJuIDQ7XG5yZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1wiY3NcIixbW1wiZG9wLlwiLFwib2RwLlwiXSx1LHVdLHUsW1tcIk5cIixcIlBcIixcIsOaXCIsXCJTXCIsXCLEjFwiLFwiUFwiLFwiU1wiXSxbXCJuZVwiLFwicG9cIixcIsO6dFwiLFwic3RcIixcIsSNdFwiLFwicMOhXCIsXCJzb1wiXSxbXCJuZWTEm2xlXCIsXCJwb25kxJtsw61cIixcIsO6dGVyw71cIixcInN0xZllZGFcIixcIsSNdHZydGVrXCIsXCJww6F0ZWtcIixcInNvYm90YVwiXSxbXCJuZVwiLFwicG9cIixcIsO6dFwiLFwic3RcIixcIsSNdFwiLFwicMOhXCIsXCJzb1wiXV0sdSxbW1wiMVwiLFwiMlwiLFwiM1wiLFwiNFwiLFwiNVwiLFwiNlwiLFwiN1wiLFwiOFwiLFwiOVwiLFwiMTBcIixcIjExXCIsXCIxMlwiXSxbXCJsZWRcIixcIsO6bm9cIixcImLFmWVcIixcImR1YlwiLFwia3bEm1wiLFwixI12blwiLFwixI12Y1wiLFwic3JwXCIsXCJ6w6HFmVwiLFwixZnDrWpcIixcImxpc1wiLFwicHJvXCJdLFtcImxlZG5hXCIsXCLDum5vcmFcIixcImLFmWV6bmFcIixcImR1Ym5hXCIsXCJrdsSbdG5hXCIsXCLEjWVydm5hXCIsXCLEjWVydmVuY2VcIixcInNycG5hXCIsXCJ6w6HFmcOtXCIsXCLFmcOtam5hXCIsXCJsaXN0b3BhZHVcIixcInByb3NpbmNlXCJdXSxbW1wiMVwiLFwiMlwiLFwiM1wiLFwiNFwiLFwiNVwiLFwiNlwiLFwiN1wiLFwiOFwiLFwiOVwiLFwiMTBcIixcIjExXCIsXCIxMlwiXSxbXCJsZWRcIixcIsO6bm9cIixcImLFmWVcIixcImR1YlwiLFwia3bEm1wiLFwixI12blwiLFwixI12Y1wiLFwic3JwXCIsXCJ6w6HFmVwiLFwixZnDrWpcIixcImxpc1wiLFwicHJvXCJdLFtcImxlZGVuXCIsXCLDum5vclwiLFwiYsWZZXplblwiLFwiZHViZW5cIixcImt2xJt0ZW5cIixcIsSNZXJ2ZW5cIixcIsSNZXJ2ZW5lY1wiLFwic3JwZW5cIixcInrDocWZw61cIixcIsWZw61qZW5cIixcImxpc3RvcGFkXCIsXCJwcm9zaW5lY1wiXV0sW1tcInDFmS5uLmwuXCIsXCJuLmwuXCJdLFtcInDFmS4gbi4gbC5cIixcIm4uIGwuXCJdLFtcInDFmWVkIG5hxaHDrW0gbGV0b3BvxI10ZW1cIixcIm5hxaFlaG8gbGV0b3BvxI10dVwiXV0sMSxbNiwwXSxbXCJkZC5NTS55eVwiLFwiZC4gTS4geVwiLFwiZC4gTU1NTSB5XCIsXCJFRUVFIGQuIE1NTU0geVwiXSxbXCJIOm1tXCIsXCJIOm1tOnNzXCIsXCJIOm1tOnNzIHpcIixcIkg6bW06c3Mgenp6elwiXSxbXCJ7MX0gezB9XCIsdSx1LHVdLFtcIixcIixcIsKgXCIsXCI7XCIsXCIlXCIsXCIrXCIsXCItXCIsXCJFXCIsXCLDl1wiLFwi4oCwXCIsXCLiiJ5cIixcIk5hTlwiLFwiOlwiXSxbXCIjLCMjMC4jIyNcIixcIiMsIyMwwqAlXCIsXCIjLCMjMC4wMMKgwqRcIixcIiNFMFwiXSxcIkNaS1wiLFwiS8SNXCIsXCLEjWVza8OhIGtvcnVuYVwiLHtcIkFVRFwiOltcIkFVJFwiLFwiJFwiXSxcIkNTS1wiOltcIkvEjXNcIl0sXCJDWktcIjpbXCJLxI1cIl0sXCJJTFNcIjpbdSxcIuKCqlwiXSxcIklOUlwiOlt1LFwi4oK5XCJdLFwiSlBZXCI6W1wiSlDCpVwiLFwiwqVcIl0sXCJST05cIjpbdSxcIkxcIl0sXCJUV0RcIjpbXCJOVCRcIl0sXCJVU0RcIjpbXCJVUyRcIixcIiRcIl0sXCJWTkRcIjpbdSxcIuKCq1wiXSxcIlhFVVwiOltcIkVDVVwiXSxcIlhYWFwiOltdfSxcImx0clwiLCBwbHVyYWxdO1xuIl19