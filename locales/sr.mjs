/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// THIS CODE IS GENERATED - DO NOT MODIFY.
const u = undefined;
function plural(n) {
    const i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length, f = parseInt(n.toString().replace(/^[^.]*\.?/, ''), 10) || 0;
    if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)) || f % 10 === 1 && !(f % 100 === 11))
        return 1;
    if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)) || f % 10 === Math.floor(f % 10) && (f % 10 >= 2 && f % 10 <= 4) && !(f % 100 >= 12 && f % 100 <= 14))
        return 3;
    return 5;
}
export default ["sr", [["a", "p"], ["пре подне", "по подне"], u], [["пре подне", "по подне"], u, u], [["н", "п", "у", "с", "ч", "п", "с"], ["нед", "пон", "уто", "сре", "чет", "пет", "суб"], ["недеља", "понедељак", "уторак", "среда", "четвртак", "петак", "субота"], ["не", "по", "ут", "ср", "че", "пе", "су"]], u, [["ј", "ф", "м", "а", "м", "ј", "ј", "а", "с", "о", "н", "д"], ["јан", "феб", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "нов", "дец"], ["јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"]], u, [["п.н.е.", "н.е."], ["п. н. е.", "н. е."], ["пре нове ере", "нове ере"]], 1, [6, 0], ["d.M.yy.", "dd.MM.y.", "dd. MMMM y.", "EEEE, dd. MMMM y."], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1} {0}", u, u, u], [",", ".", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0%", "#,##0.00 ¤", "#E0"], "RSD", "RSD", "Српски динар", { "AUD": [u, "$"], "BAM": ["КМ", "KM"], "GEL": [u, "ლ"], "KRW": [u, "₩"], "NZD": [u, "$"], "TWD": ["NT$"], "USD": ["US$", "$"], "VND": [u, "₫"] }, "ltr", plural];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9zci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCwwQ0FBMEM7QUFDMUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7SUFDekIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVsSixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxLQUFLLEVBQUUsQ0FBQztRQUNuRixPQUFPLENBQUMsQ0FBQztJQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsS0FBSyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxJQUFJLENBQUMsR0FBRyxHQUFHLElBQUksRUFBRSxDQUFDO1FBQ3JOLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsT0FBTyxDQUFDLENBQUM7QUFDVCxDQUFDO0FBRUQsZUFBZSxDQUFDLElBQUksRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsV0FBVyxFQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUMsVUFBVSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsUUFBUSxFQUFDLFdBQVcsRUFBQyxRQUFRLEVBQUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLFdBQVcsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxjQUFjLEVBQUMsVUFBVSxDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLGFBQWEsRUFBQyxtQkFBbUIsQ0FBQyxFQUFDLENBQUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxZQUFZLEVBQUMsZUFBZSxDQUFDLEVBQUMsQ0FBQyxTQUFTLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxXQUFXLEVBQUMsUUFBUSxFQUFDLFlBQVksRUFBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLGNBQWMsRUFBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWS5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuY29uc3QgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpLCB2ID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoLCBmID0gcGFyc2VJbnQobi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJyksIDEwKSB8fCAwO1xuXG5pZiAodiA9PT0gMCAmJiAoaSAlIDEwID09PSAxICYmICEoaSAlIDEwMCA9PT0gMTEpKSB8fCBmICUgMTAgPT09IDEgJiYgIShmICUgMTAwID09PSAxMSkpXG4gICAgcmV0dXJuIDE7XG5pZiAodiA9PT0gMCAmJiAoaSAlIDEwID09PSBNYXRoLmZsb29yKGkgJSAxMCkgJiYgKGkgJSAxMCA+PSAyICYmIGkgJSAxMCA8PSA0KSAmJiAhKGkgJSAxMDAgPj0gMTIgJiYgaSAlIDEwMCA8PSAxNCkpIHx8IGYgJSAxMCA9PT0gTWF0aC5mbG9vcihmICUgMTApICYmIChmICUgMTAgPj0gMiAmJiBmICUgMTAgPD0gNCkgJiYgIShmICUgMTAwID49IDEyICYmIGYgJSAxMDAgPD0gMTQpKVxuICAgIHJldHVybiAzO1xucmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcInNyXCIsW1tcImFcIixcInBcIl0sW1wi0L/RgNC1INC/0L7QtNC90LVcIixcItC/0L4g0L/QvtC00L3QtVwiXSx1XSxbW1wi0L/RgNC1INC/0L7QtNC90LVcIixcItC/0L4g0L/QvtC00L3QtVwiXSx1LHVdLFtbXCLQvVwiLFwi0L9cIixcItGDXCIsXCLRgVwiLFwi0YdcIixcItC/XCIsXCLRgVwiXSxbXCLQvdC10LRcIixcItC/0L7QvVwiLFwi0YPRgtC+XCIsXCLRgdGA0LVcIixcItGH0LXRglwiLFwi0L/QtdGCXCIsXCLRgdGD0LFcIl0sW1wi0L3QtdC00LXRmdCwXCIsXCLQv9C+0L3QtdC00LXRmdCw0LpcIixcItGD0YLQvtGA0LDQulwiLFwi0YHRgNC10LTQsFwiLFwi0YfQtdGC0LLRgNGC0LDQulwiLFwi0L/QtdGC0LDQulwiLFwi0YHRg9Cx0L7RgtCwXCJdLFtcItC90LVcIixcItC/0L5cIixcItGD0YJcIixcItGB0YBcIixcItGH0LVcIixcItC/0LVcIixcItGB0YNcIl1dLHUsW1tcItGYXCIsXCLRhFwiLFwi0LxcIixcItCwXCIsXCLQvFwiLFwi0ZhcIixcItGYXCIsXCLQsFwiLFwi0YFcIixcItC+XCIsXCLQvVwiLFwi0LRcIl0sW1wi0ZjQsNC9XCIsXCLRhNC10LFcIixcItC80LDRgFwiLFwi0LDQv9GAXCIsXCLQvNCw0ZhcIixcItGY0YPQvVwiLFwi0ZjRg9C7XCIsXCLQsNCy0LNcIixcItGB0LXQv1wiLFwi0L7QutGCXCIsXCLQvdC+0LJcIixcItC00LXRhlwiXSxbXCLRmNCw0L3Rg9Cw0YBcIixcItGE0LXQsdGA0YPQsNGAXCIsXCLQvNCw0YDRglwiLFwi0LDQv9GA0LjQu1wiLFwi0LzQsNGYXCIsXCLRmNGD0L1cIixcItGY0YPQu1wiLFwi0LDQstCz0YPRgdGCXCIsXCLRgdC10L/RgtC10LzQsdCw0YBcIixcItC+0LrRgtC+0LHQsNGAXCIsXCLQvdC+0LLQtdC80LHQsNGAXCIsXCLQtNC10YbQtdC80LHQsNGAXCJdXSx1LFtbXCLQvy7QvS7QtS5cIixcItC9LtC1LlwiXSxbXCLQvy4g0L0uINC1LlwiLFwi0L0uINC1LlwiXSxbXCLQv9GA0LUg0L3QvtCy0LUg0LXRgNC1XCIsXCLQvdC+0LLQtSDQtdGA0LVcIl1dLDEsWzYsMF0sW1wiZC5NLnl5LlwiLFwiZGQuTU0ueS5cIixcImRkLiBNTU1NIHkuXCIsXCJFRUVFLCBkZC4gTU1NTSB5LlwiXSxbXCJISDptbVwiLFwiSEg6bW06c3NcIixcIkhIOm1tOnNzIHpcIixcIkhIOm1tOnNzIHp6enpcIl0sW1wiezF9IHswfVwiLHUsdSx1XSxbXCIsXCIsXCIuXCIsXCI7XCIsXCIlXCIsXCIrXCIsXCItXCIsXCJFXCIsXCLDl1wiLFwi4oCwXCIsXCLiiJ5cIixcIk5hTlwiLFwiOlwiXSxbXCIjLCMjMC4jIyNcIixcIiMsIyMwJVwiLFwiIywjIzAuMDDCoMKkXCIsXCIjRTBcIl0sXCJSU0RcIixcIlJTRFwiLFwi0KHRgNC/0YHQutC4INC00LjQvdCw0YBcIix7XCJBVURcIjpbdSxcIiRcIl0sXCJCQU1cIjpbXCLQmtCcXCIsXCJLTVwiXSxcIkdFTFwiOlt1LFwi4YOaXCJdLFwiS1JXXCI6W3UsXCLigqlcIl0sXCJOWkRcIjpbdSxcIiRcIl0sXCJUV0RcIjpbXCJOVCRcIl0sXCJVU0RcIjpbXCJVUyRcIixcIiRcIl0sXCJWTkRcIjpbdSxcIuKCq1wiXX0sXCJsdHJcIiwgcGx1cmFsXTtcbiJdfQ==