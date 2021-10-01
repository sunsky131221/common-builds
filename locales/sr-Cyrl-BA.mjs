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
export default ["sr-Cyrl-BA", [["a", "p"], ["прије подне", "по подне"], u], [["а", "p"], ["прије подне", "по подне"], u], [["н", "п", "у", "с", "ч", "п", "с"], ["нед", "пон", "ут", "ср", "чет", "пет", "суб"], ["недјеља", "понедељак", "уторак", "сриједа", "четвртак", "петак", "субота"], ["не", "по", "ут", "ср", "че", "пе", "су"]], u, [["ј", "ф", "м", "а", "м", "ј", "ј", "а", "с", "о", "н", "д"], ["јан", "феб", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "нов", "дец"], ["јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"]], u, [["п.н.е.", "н.е."], ["п. н. е.", "н. е."], ["прије нове ере", "нове ере"]], 1, [6, 0], ["d.M.yy.", "dd.MM.y.", "dd. MMMM y.", "EEEE, dd. MMMM y."], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1} {0}", u, u, u], [",", ".", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", ":"], ["#,##0.###", "#,##0%", "#,##0.00 ¤", "#E0"], "BAM", "КМ", "Босанско-херцеговачка конвертибилна марка", { "AUD": [u, "$"], "BAM": ["КМ", "KM"], "GEL": [u, "ლ"], "KRW": [u, "₩"], "NZD": [u, "$"], "TWD": ["NT$"], "USD": ["US$", "$"], "VND": [u, "₫"] }, "ltr", plural];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3ItQ3lybC1CQS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9sb2NhbGVzL3NyLUN5cmwtQkEudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsMENBQTBDO0FBQzFDLE1BQU0sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUVwQixTQUFTLE1BQU0sQ0FBQyxDQUFTO0lBQ3pCLE1BQU0sQ0FBQyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQyxNQUFNLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7SUFFbEosSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUM7UUFDbkYsT0FBTyxDQUFDLENBQUM7SUFDYixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLEdBQUcsSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQztRQUNyTixPQUFPLENBQUMsQ0FBQztJQUNiLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELGVBQWUsQ0FBQyxZQUFZLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLGFBQWEsRUFBQyxVQUFVLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsYUFBYSxFQUFDLFVBQVUsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssQ0FBQyxFQUFDLENBQUMsU0FBUyxFQUFDLFdBQVcsRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLFVBQVUsRUFBQyxPQUFPLEVBQUMsUUFBUSxDQUFDLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsUUFBUSxFQUFDLFdBQVcsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxRQUFRLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxnQkFBZ0IsRUFBQyxVQUFVLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLFNBQVMsRUFBQyxVQUFVLEVBQUMsYUFBYSxFQUFDLG1CQUFtQixDQUFDLEVBQUMsQ0FBQyxPQUFPLEVBQUMsVUFBVSxFQUFDLFlBQVksRUFBQyxlQUFlLENBQUMsRUFBQyxDQUFDLFNBQVMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLFdBQVcsRUFBQyxRQUFRLEVBQUMsWUFBWSxFQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxJQUFJLEVBQUMsMkNBQTJDLEVBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsR0FBRyxDQUFDLEVBQUMsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRlkuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbmNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgdiA9IG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLmxlbmd0aCwgZiA9IHBhcnNlSW50KG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/LywgJycpLCAxMCkgfHwgMDtcblxuaWYgKHYgPT09IDAgJiYgKGkgJSAxMCA9PT0gMSAmJiAhKGkgJSAxMDAgPT09IDExKSkgfHwgZiAlIDEwID09PSAxICYmICEoZiAlIDEwMCA9PT0gMTEpKVxuICAgIHJldHVybiAxO1xuaWYgKHYgPT09IDAgJiYgKGkgJSAxMCA9PT0gTWF0aC5mbG9vcihpICUgMTApICYmIChpICUgMTAgPj0gMiAmJiBpICUgMTAgPD0gNCkgJiYgIShpICUgMTAwID49IDEyICYmIGkgJSAxMDAgPD0gMTQpKSB8fCBmICUgMTAgPT09IE1hdGguZmxvb3IoZiAlIDEwKSAmJiAoZiAlIDEwID49IDIgJiYgZiAlIDEwIDw9IDQpICYmICEoZiAlIDEwMCA+PSAxMiAmJiBmICUgMTAwIDw9IDE0KSlcbiAgICByZXR1cm4gMztcbnJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXCJzci1DeXJsLUJBXCIsW1tcImFcIixcInBcIl0sW1wi0L/RgNC40ZjQtSDQv9C+0LTQvdC1XCIsXCLQv9C+INC/0L7QtNC90LVcIl0sdV0sW1tcItCwXCIsXCJwXCJdLFtcItC/0YDQuNGY0LUg0L/QvtC00L3QtVwiLFwi0L/QviDQv9C+0LTQvdC1XCJdLHVdLFtbXCLQvVwiLFwi0L9cIixcItGDXCIsXCLRgVwiLFwi0YdcIixcItC/XCIsXCLRgVwiXSxbXCLQvdC10LRcIixcItC/0L7QvVwiLFwi0YPRglwiLFwi0YHRgFwiLFwi0YfQtdGCXCIsXCLQv9C10YJcIixcItGB0YPQsVwiXSxbXCLQvdC10LTRmNC10ZnQsFwiLFwi0L/QvtC90LXQtNC10ZnQsNC6XCIsXCLRg9GC0L7RgNCw0LpcIixcItGB0YDQuNGY0LXQtNCwXCIsXCLRh9C10YLQstGA0YLQsNC6XCIsXCLQv9C10YLQsNC6XCIsXCLRgdGD0LHQvtGC0LBcIl0sW1wi0L3QtVwiLFwi0L/QvlwiLFwi0YPRglwiLFwi0YHRgFwiLFwi0YfQtVwiLFwi0L/QtVwiLFwi0YHRg1wiXV0sdSxbW1wi0ZhcIixcItGEXCIsXCLQvFwiLFwi0LBcIixcItC8XCIsXCLRmFwiLFwi0ZhcIixcItCwXCIsXCLRgVwiLFwi0L5cIixcItC9XCIsXCLQtFwiXSxbXCLRmNCw0L1cIixcItGE0LXQsVwiLFwi0LzQsNGAXCIsXCLQsNC/0YBcIixcItC80LDRmFwiLFwi0ZjRg9C9XCIsXCLRmNGD0LtcIixcItCw0LLQs1wiLFwi0YHQtdC/XCIsXCLQvtC60YJcIixcItC90L7QslwiLFwi0LTQtdGGXCJdLFtcItGY0LDQvdGD0LDRgFwiLFwi0YTQtdCx0YDRg9Cw0YBcIixcItC80LDRgNGCXCIsXCLQsNC/0YDQuNC7XCIsXCLQvNCw0ZhcIixcItGY0YPQvVwiLFwi0ZjRg9C7XCIsXCLQsNCy0LPRg9GB0YJcIixcItGB0LXQv9GC0LXQvNCx0LDRgFwiLFwi0L7QutGC0L7QsdCw0YBcIixcItC90L7QstC10LzQsdCw0YBcIixcItC00LXRhtC10LzQsdCw0YBcIl1dLHUsW1tcItC/LtC9LtC1LlwiLFwi0L0u0LUuXCJdLFtcItC/LiDQvS4g0LUuXCIsXCLQvS4g0LUuXCJdLFtcItC/0YDQuNGY0LUg0L3QvtCy0LUg0LXRgNC1XCIsXCLQvdC+0LLQtSDQtdGA0LVcIl1dLDEsWzYsMF0sW1wiZC5NLnl5LlwiLFwiZGQuTU0ueS5cIixcImRkLiBNTU1NIHkuXCIsXCJFRUVFLCBkZC4gTU1NTSB5LlwiXSxbXCJISDptbVwiLFwiSEg6bW06c3NcIixcIkhIOm1tOnNzIHpcIixcIkhIOm1tOnNzIHp6enpcIl0sW1wiezF9IHswfVwiLHUsdSx1XSxbXCIsXCIsXCIuXCIsXCI7XCIsXCIlXCIsXCIrXCIsXCItXCIsXCJFXCIsXCLDl1wiLFwi4oCwXCIsXCLiiJ5cIixcIk5hTlwiLFwiOlwiXSxbXCIjLCMjMC4jIyNcIixcIiMsIyMwJVwiLFwiIywjIzAuMDDCoMKkXCIsXCIjRTBcIl0sXCJCQU1cIixcItCa0JxcIixcItCR0L7RgdCw0L3RgdC60L4t0YXQtdGA0YbQtdCz0L7QstCw0YfQutCwINC60L7QvdCy0LXRgNGC0LjQsdC40LvQvdCwINC80LDRgNC60LBcIix7XCJBVURcIjpbdSxcIiRcIl0sXCJCQU1cIjpbXCLQmtCcXCIsXCJLTVwiXSxcIkdFTFwiOlt1LFwi4YOaXCJdLFwiS1JXXCI6W3UsXCLigqlcIl0sXCJOWkRcIjpbdSxcIiRcIl0sXCJUV0RcIjpbXCJOVCRcIl0sXCJVU0RcIjpbXCJVUyRcIixcIiRcIl0sXCJWTkRcIjpbdSxcIuKCq1wiXX0sXCJsdHJcIiwgcGx1cmFsXTtcbiJdfQ==