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
    const i = Math.floor(Math.abs(n)), t = parseInt(n.toString().replace(/^[^.]*\.?|0+$/g, ''), 10) || 0;
    if (n === 1 || !(t === 0) && (i === 0 || i === 1))
        return 1;
    return 5;
}
export default ["da", [["a", "p"], ["AM", "PM"], u], [["AM", "PM"], u, u], [["S", "M", "T", "O", "T", "F", "L"], ["søn.", "man.", "tir.", "ons.", "tor.", "fre.", "lør."], ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"], ["sø", "ma", "ti", "on", "to", "fr", "lø"]], [["S", "M", "T", "O", "T", "F", "L"], ["søn", "man", "tir", "ons", "tor", "fre", "lør"], ["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"], ["sø", "ma", "ti", "on", "to", "fr", "lø"]], [["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"], ["jan.", "feb.", "mar.", "apr.", "maj", "jun.", "jul.", "aug.", "sep.", "okt.", "nov.", "dec."], ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"]], u, [["fKr", "eKr"], ["f.Kr.", "e.Kr."], u], 1, [6, 0], ["dd.MM.y", "d. MMM y", "d. MMMM y", "EEEE 'den' d. MMMM y"], ["HH.mm", "HH.mm.ss", "HH.mm.ss z", "HH.mm.ss zzzz"], ["{1} {0}", u, "{1} 'kl'. {0}", u], [",", ".", ";", "%", "+", "-", "E", "×", "‰", "∞", "NaN", "."], ["#,##0.###", "#,##0 %", "#,##0.00 ¤", "#E0"], "DKK", "kr.", "dansk krone", { "AUD": ["AU$", "$"], "DKK": ["kr."], "ISK": [u, "kr."], "JPY": ["JP¥", "¥"], "NOK": [u, "kr."], "RON": [u, "L"], "SEK": [u, "kr."], "THB": ["฿"], "TWD": ["NT$"], "USD": ["US$", "$"] }, "ltr", plural];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGEuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9kYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCwwQ0FBMEM7QUFDMUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7SUFDekIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLFFBQVEsQ0FBQyxDQUFDLENBQUMsUUFBUSxFQUFFLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUVyRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUM3QyxPQUFPLENBQUMsQ0FBQztJQUNiLE9BQU8sQ0FBQyxDQUFDO0FBQ1QsQ0FBQztBQUVELGVBQWUsQ0FBQyxJQUFJLEVBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLElBQUksRUFBQyxJQUFJLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLENBQUMsRUFBQyxDQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxLQUFLLENBQUMsRUFBQyxDQUFDLFFBQVEsRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLFFBQVEsQ0FBQyxFQUFDLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLE9BQU8sRUFBQyxPQUFPLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLFdBQVcsRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxLQUFLLEVBQUMsS0FBSyxDQUFDLEVBQUMsQ0FBQyxPQUFPLEVBQUMsT0FBTyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsU0FBUyxFQUFDLFVBQVUsRUFBQyxXQUFXLEVBQUMsc0JBQXNCLENBQUMsRUFBQyxDQUFDLE9BQU8sRUFBQyxVQUFVLEVBQUMsWUFBWSxFQUFDLGVBQWUsQ0FBQyxFQUFDLENBQUMsU0FBUyxFQUFDLENBQUMsRUFBQyxlQUFlLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsS0FBSyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsV0FBVyxFQUFDLFNBQVMsRUFBQyxZQUFZLEVBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFDLEtBQUssRUFBQyxhQUFhLEVBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEtBQUssQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLEtBQUssRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxDQUFDLEVBQUMsS0FBSyxDQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLEVBQUMsR0FBRyxDQUFDLEVBQUMsRUFBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuLy8gVEhJUyBDT0RFIElTIEdFTkVSQVRFRCAtIERPIE5PVCBNT0RJRlkuXG5jb25zdCB1ID0gdW5kZWZpbmVkO1xuXG5mdW5jdGlvbiBwbHVyYWwobjogbnVtYmVyKTogbnVtYmVyIHtcbmNvbnN0IGkgPSBNYXRoLmZsb29yKE1hdGguYWJzKG4pKSwgdCA9IHBhcnNlSW50KG4udG9TdHJpbmcoKS5yZXBsYWNlKC9eW14uXSpcXC4/fDArJC9nLCAnJyksIDEwKSB8fCAwO1xuXG5pZiAobiA9PT0gMSB8fCAhKHQgPT09IDApICYmIChpID09PSAwIHx8IGkgPT09IDEpKVxuICAgIHJldHVybiAxO1xucmV0dXJuIDU7XG59XG5cbmV4cG9ydCBkZWZhdWx0IFtcImRhXCIsW1tcImFcIixcInBcIl0sW1wiQU1cIixcIlBNXCJdLHVdLFtbXCJBTVwiLFwiUE1cIl0sdSx1XSxbW1wiU1wiLFwiTVwiLFwiVFwiLFwiT1wiLFwiVFwiLFwiRlwiLFwiTFwiXSxbXCJzw7huLlwiLFwibWFuLlwiLFwidGlyLlwiLFwib25zLlwiLFwidG9yLlwiLFwiZnJlLlwiLFwibMO4ci5cIl0sW1wic8O4bmRhZ1wiLFwibWFuZGFnXCIsXCJ0aXJzZGFnXCIsXCJvbnNkYWdcIixcInRvcnNkYWdcIixcImZyZWRhZ1wiLFwibMO4cmRhZ1wiXSxbXCJzw7hcIixcIm1hXCIsXCJ0aVwiLFwib25cIixcInRvXCIsXCJmclwiLFwibMO4XCJdXSxbW1wiU1wiLFwiTVwiLFwiVFwiLFwiT1wiLFwiVFwiLFwiRlwiLFwiTFwiXSxbXCJzw7huXCIsXCJtYW5cIixcInRpclwiLFwib25zXCIsXCJ0b3JcIixcImZyZVwiLFwibMO4clwiXSxbXCJzw7huZGFnXCIsXCJtYW5kYWdcIixcInRpcnNkYWdcIixcIm9uc2RhZ1wiLFwidG9yc2RhZ1wiLFwiZnJlZGFnXCIsXCJsw7hyZGFnXCJdLFtcInPDuFwiLFwibWFcIixcInRpXCIsXCJvblwiLFwidG9cIixcImZyXCIsXCJsw7hcIl1dLFtbXCJKXCIsXCJGXCIsXCJNXCIsXCJBXCIsXCJNXCIsXCJKXCIsXCJKXCIsXCJBXCIsXCJTXCIsXCJPXCIsXCJOXCIsXCJEXCJdLFtcImphbi5cIixcImZlYi5cIixcIm1hci5cIixcImFwci5cIixcIm1halwiLFwianVuLlwiLFwianVsLlwiLFwiYXVnLlwiLFwic2VwLlwiLFwib2t0LlwiLFwibm92LlwiLFwiZGVjLlwiXSxbXCJqYW51YXJcIixcImZlYnJ1YXJcIixcIm1hcnRzXCIsXCJhcHJpbFwiLFwibWFqXCIsXCJqdW5pXCIsXCJqdWxpXCIsXCJhdWd1c3RcIixcInNlcHRlbWJlclwiLFwib2t0b2JlclwiLFwibm92ZW1iZXJcIixcImRlY2VtYmVyXCJdXSx1LFtbXCJmS3JcIixcImVLclwiXSxbXCJmLktyLlwiLFwiZS5Lci5cIl0sdV0sMSxbNiwwXSxbXCJkZC5NTS55XCIsXCJkLiBNTU0geVwiLFwiZC4gTU1NTSB5XCIsXCJFRUVFICdkZW4nIGQuIE1NTU0geVwiXSxbXCJISC5tbVwiLFwiSEgubW0uc3NcIixcIkhILm1tLnNzIHpcIixcIkhILm1tLnNzIHp6enpcIl0sW1wiezF9IHswfVwiLHUsXCJ7MX0gJ2tsJy4gezB9XCIsdV0sW1wiLFwiLFwiLlwiLFwiO1wiLFwiJVwiLFwiK1wiLFwiLVwiLFwiRVwiLFwiw5dcIixcIuKAsFwiLFwi4oieXCIsXCJOYU5cIixcIi5cIl0sW1wiIywjIzAuIyMjXCIsXCIjLCMjMMKgJVwiLFwiIywjIzAuMDDCoMKkXCIsXCIjRTBcIl0sXCJES0tcIixcImtyLlwiLFwiZGFuc2sga3JvbmVcIix7XCJBVURcIjpbXCJBVSRcIixcIiRcIl0sXCJES0tcIjpbXCJrci5cIl0sXCJJU0tcIjpbdSxcImtyLlwiXSxcIkpQWVwiOltcIkpQwqVcIixcIsKlXCJdLFwiTk9LXCI6W3UsXCJrci5cIl0sXCJST05cIjpbdSxcIkxcIl0sXCJTRUtcIjpbdSxcImtyLlwiXSxcIlRIQlwiOltcIuC4v1wiXSxcIlRXRFwiOltcIk5UJFwiXSxcIlVTRFwiOltcIlVTJFwiLFwiJFwiXX0sXCJsdHJcIiwgcGx1cmFsXTtcbiJdfQ==