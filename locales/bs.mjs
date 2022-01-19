/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;
function plural(val) {
    const n = val, i = Math.floor(Math.abs(val)), v = val.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(val.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
    if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
        return 1;
    if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)) || f % 10 === Math.floor(f % 10) && (f % 10 >= 2 && f % 10 <= 4) && !(f % 100 >= 12 && f % 100 <= 14))
        return 3;
    return 5;
}
export default ["bs", [["prijepodne", "popodne"], ["AM", "PM"], ["prijepodne", "popodne"]], u, [["N", "P", "U", "S", "Č", "P", "S"], ["ned", "pon", "uto", "sri", "čet", "pet", "sub"], ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"], ["ned", "pon", "uto", "sri", "čet", "pet", "sub"]], [["n", "p", "u", "s", "č", "p", "s"], ["ned", "pon", "uto", "sri", "čet", "pet", "sub"], ["nedjelja", "ponedjeljak", "utorak", "srijeda", "četvrtak", "petak", "subota"], ["ned", "pon", "uto", "sri", "čet", "pet", "sub"]], [["j", "f", "m", "a", "m", "j", "j", "a", "s", "o", "n", "d"], ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"], ["januar", "februar", "mart", "april", "maj", "juni", "juli", "august", "septembar", "oktobar", "novembar", "decembar"]], u, [["p.n.e.", "n.e."], ["p. n. e.", "n. e."], ["prije nove ere", "nove ere"]], 1, [6, 0], ["d. M. y.", "d. MMM y.", "d. MMMM y.", "EEEE, d. MMMM y."], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1} {0}", u, "{1} 'u' {0}", u], [",", ".", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0 %", "#,##0.00 ¤", "#E0"], "BAM", "KM", "Bosanskohercegovačka konvertibilna marka", { "AUD": [u, "$"], "BAM": ["KM"], "BRL": [u, "R$"], "CAD": [u, "$"], "CNY": [u, "¥"], "GBP": [u, "£"], "HKD": [u, "$"], "HRK": ["kn"], "ILS": [u, "₪"], "MXN": [u, "$"], "NZD": [u, "$"], "PHP": [u, "₱"], "RSD": ["din."], "THB": ["฿"], "TWD": ["NT$"], "USD": [u, "$"], "XCD": [u, "$"], "XPF": [] }, "ltr", plural];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9icy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCwwQ0FBMEM7QUFDMUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBRXBCLFNBQVMsTUFBTSxDQUFDLEdBQVc7SUFDM0IsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRSxDQUFDLE9BQU8sQ0FBQyxXQUFXLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBRWpLLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQ25GLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUM7UUFDck4sT0FBTyxDQUFDLENBQUM7SUFDYixPQUFPLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxlQUFlLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxZQUFZLEVBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxZQUFZLEVBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsYUFBYSxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxRQUFRLENBQUMsRUFBQyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsYUFBYSxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLE9BQU8sRUFBQyxRQUFRLENBQUMsRUFBQyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsUUFBUSxFQUFDLFNBQVMsRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLFFBQVEsRUFBQyxXQUFXLEVBQUMsU0FBUyxFQUFDLFVBQVUsRUFBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsUUFBUSxFQUFDLE1BQU0sQ0FBQyxFQUFDLENBQUMsVUFBVSxFQUFDLE9BQU8sQ0FBQyxFQUFDLENBQUMsZ0JBQWdCLEVBQUMsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsV0FBVyxFQUFDLFlBQVksRUFBQyxrQkFBa0IsQ0FBQyxFQUFDLENBQUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxZQUFZLEVBQUMsZUFBZSxDQUFDLEVBQUMsQ0FBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLGFBQWEsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxXQUFXLEVBQUMsU0FBUyxFQUFDLFlBQVksRUFBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLDBDQUEwQyxFQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLE1BQU0sQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLEVBQUUsRUFBQyxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWS5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbCh2YWw6IG51bWJlcik6IG51bWJlciB7XG5jb25zdCBuID0gdmFsLCBpID0gTWF0aC5mbG9vcihNYXRoLmFicyh2YWwpKSwgdiA9IHZhbC50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoLCBmID0gcGFyc2VJbnQodmFsLnRvU3RyaW5nKCkucmVwbGFjZSgvXlteLl0qXFwuPy8sICcnKSwgMTApIHx8IDA7XG5cbmlmICh2ID09PSAwICYmIChpICUgMTAgPT09IDEgJiYgIShpICUgMTAwID09PSAxMSkpIHx8IGYgJSAxMCA9PT0gMSAmJiAhKGYgJSAxMDAgPT09IDExKSlcbiAgICByZXR1cm4gMTtcbmlmICh2ID09PSAwICYmIChpICUgMTAgPT09IE1hdGguZmxvb3IoaSAlIDEwKSAmJiAoaSAlIDEwID49IDIgJiYgaSAlIDEwIDw9IDQpICYmICEoaSAlIDEwMCA+PSAxMiAmJiBpICUgMTAwIDw9IDE0KSkgfHwgZiAlIDEwID09PSBNYXRoLmZsb29yKGYgJSAxMCkgJiYgKGYgJSAxMCA+PSAyICYmIGYgJSAxMCA8PSA0KSAmJiAhKGYgJSAxMDAgPj0gMTIgJiYgZiAlIDEwMCA8PSAxNCkpXG4gICAgcmV0dXJuIDM7XG5yZXR1cm4gNTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgW1wiYnNcIixbW1wicHJpamVwb2RuZVwiLFwicG9wb2RuZVwiXSxbXCJBTVwiLFwiUE1cIl0sW1wicHJpamVwb2RuZVwiLFwicG9wb2RuZVwiXV0sdSxbW1wiTlwiLFwiUFwiLFwiVVwiLFwiU1wiLFwixIxcIixcIlBcIixcIlNcIl0sW1wibmVkXCIsXCJwb25cIixcInV0b1wiLFwic3JpXCIsXCLEjWV0XCIsXCJwZXRcIixcInN1YlwiXSxbXCJuZWRqZWxqYVwiLFwicG9uZWRqZWxqYWtcIixcInV0b3Jha1wiLFwic3JpamVkYVwiLFwixI1ldHZydGFrXCIsXCJwZXRha1wiLFwic3Vib3RhXCJdLFtcIm5lZFwiLFwicG9uXCIsXCJ1dG9cIixcInNyaVwiLFwixI1ldFwiLFwicGV0XCIsXCJzdWJcIl1dLFtbXCJuXCIsXCJwXCIsXCJ1XCIsXCJzXCIsXCLEjVwiLFwicFwiLFwic1wiXSxbXCJuZWRcIixcInBvblwiLFwidXRvXCIsXCJzcmlcIixcIsSNZXRcIixcInBldFwiLFwic3ViXCJdLFtcIm5lZGplbGphXCIsXCJwb25lZGplbGpha1wiLFwidXRvcmFrXCIsXCJzcmlqZWRhXCIsXCLEjWV0dnJ0YWtcIixcInBldGFrXCIsXCJzdWJvdGFcIl0sW1wibmVkXCIsXCJwb25cIixcInV0b1wiLFwic3JpXCIsXCLEjWV0XCIsXCJwZXRcIixcInN1YlwiXV0sW1tcImpcIixcImZcIixcIm1cIixcImFcIixcIm1cIixcImpcIixcImpcIixcImFcIixcInNcIixcIm9cIixcIm5cIixcImRcIl0sW1wiamFuXCIsXCJmZWJcIixcIm1hclwiLFwiYXByXCIsXCJtYWpcIixcImp1blwiLFwianVsXCIsXCJhdWdcIixcInNlcFwiLFwib2t0XCIsXCJub3ZcIixcImRlY1wiXSxbXCJqYW51YXJcIixcImZlYnJ1YXJcIixcIm1hcnRcIixcImFwcmlsXCIsXCJtYWpcIixcImp1bmlcIixcImp1bGlcIixcImF1Z3VzdFwiLFwic2VwdGVtYmFyXCIsXCJva3RvYmFyXCIsXCJub3ZlbWJhclwiLFwiZGVjZW1iYXJcIl1dLHUsW1tcInAubi5lLlwiLFwibi5lLlwiXSxbXCJwLiBuLiBlLlwiLFwibi4gZS5cIl0sW1wicHJpamUgbm92ZSBlcmVcIixcIm5vdmUgZXJlXCJdXSwxLFs2LDBdLFtcImQuIE0uIHkuXCIsXCJkLiBNTU0geS5cIixcImQuIE1NTU0geS5cIixcIkVFRUUsIGQuIE1NTU0geS5cIl0sW1wiSEg6bW1cIixcIkhIOm1tOnNzXCIsXCJISDptbTpzcyB6XCIsXCJISDptbTpzcyB6enp6XCJdLFtcInsxfSB7MH1cIix1LFwiezF9ICd1JyB7MH1cIix1XSxbXCIsXCIsXCIuXCIsXCI7XCIsXCIlXCIsXCIrXCIsXCItXCIsXCJFXCIsXCLDl1wiLFwi4oCwXCIsXCLiiJ5cIixcIk5hTlwiLFwiOlwiXSxbXCIjLCMjMC4jIyNcIixcIiMsIyMwwqAlXCIsXCIjLCMjMC4wMMKgwqRcIixcIiNFMFwiXSxcIkJBTVwiLFwiS01cIixcIkJvc2Fuc2tvaGVyY2Vnb3ZhxI1rYSBrb252ZXJ0aWJpbG5hIG1hcmthXCIse1wiQVVEXCI6W3UsXCIkXCJdLFwiQkFNXCI6W1wiS01cIl0sXCJCUkxcIjpbdSxcIlIkXCJdLFwiQ0FEXCI6W3UsXCIkXCJdLFwiQ05ZXCI6W3UsXCLCpVwiXSxcIkdCUFwiOlt1LFwiwqNcIl0sXCJIS0RcIjpbdSxcIiRcIl0sXCJIUktcIjpbXCJrblwiXSxcIklMU1wiOlt1LFwi4oKqXCJdLFwiTVhOXCI6W3UsXCIkXCJdLFwiTlpEXCI6W3UsXCIkXCJdLFwiUEhQXCI6W3UsXCLigrFcIl0sXCJSU0RcIjpbXCJkaW4uXCJdLFwiVEhCXCI6W1wi4Li/XCJdLFwiVFdEXCI6W1wiTlQkXCJdLFwiVVNEXCI6W3UsXCIkXCJdLFwiWENEXCI6W3UsXCIkXCJdLFwiWFBGXCI6W119LFwibHRyXCIsIHBsdXJhbF07XG4iXX0=