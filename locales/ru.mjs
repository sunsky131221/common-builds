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
    const i = Math.floor(Math.abs(n)), v = n.toString().replace(/^[^.]*\.?/, '').length;
    if (v === 0 && (i % 10 === 1 && !(i % 100 === 11)))
        return 1;
    if (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 2 && i % 10 <= 4) && !(i % 100 >= 12 && i % 100 <= 14)))
        return 3;
    if (v === 0 && i % 10 === 0 || (v === 0 && (i % 10 === Math.floor(i % 10) && (i % 10 >= 5 && i % 10 <= 9)) || v === 0 && (i % 100 === Math.floor(i % 100) && (i % 100 >= 11 && i % 100 <= 14))))
        return 4;
    return 5;
}
export default ["ru", [["AM", "PM"], u, u], u, [["вс", "пн", "вт", "ср", "чт", "пт", "сб"], u, ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]], [["В", "П", "В", "С", "Ч", "П", "С"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"], ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"], ["вс", "пн", "вт", "ср", "чт", "пт", "сб"]], [["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"], ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."], ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]], [["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"], ["янв.", "февр.", "март", "апр.", "май", "июнь", "июль", "авг.", "сент.", "окт.", "нояб.", "дек."], ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"]], [["до н.э.", "н.э."], ["до н. э.", "н. э."], ["до Рождества Христова", "от Рождества Христова"]], 1, [6, 0], ["dd.MM.y", "d MMM y 'г'.", "d MMMM y 'г'.", "EEEE, d MMMM y 'г'."], ["HH:mm", "HH:mm:ss", "HH:mm:ss z", "HH:mm:ss zzzz"], ["{1}, {0}", u, u, u], [",", " ", ";", "%", "+", "-", "E", "×", "‰", "∞", "не число", ":"], ["#,##0.###", "#,##0 %", "#,##0.00 ¤", "#E0"], "RUB", "₽", "российский рубль", { "GEL": [u, "ლ"], "RON": [u, "L"], "RUB": ["₽"], "RUR": ["р."], "THB": ["฿"], "TMT": ["ТМТ"], "TWD": ["NT$"], "UAH": ["₴"], "XXX": ["XXXX"] }, "ltr", plural];
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9wYWNrYWdlcy9jb21tb24vbG9jYWxlcy9ydS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCwwQ0FBMEM7QUFDMUMsTUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDO0FBRXBCLFNBQVMsTUFBTSxDQUFDLENBQVM7SUFDekIsTUFBTSxDQUFDLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxPQUFPLENBQUMsV0FBVyxFQUFFLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQztJQUVwRixJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUM5QyxPQUFPLENBQUMsQ0FBQztJQUNiLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1FBQy9HLE9BQU8sQ0FBQyxDQUFDO0lBQ2IsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxHQUFHLEtBQUssSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsSUFBSSxDQUFDLEdBQUcsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7UUFDM0wsT0FBTyxDQUFDLENBQUM7SUFDYixPQUFPLENBQUMsQ0FBQztBQUNULENBQUM7QUFFRCxlQUFlLENBQUMsSUFBSSxFQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxDQUFDLEVBQUMsQ0FBQyxFQUFDLENBQUMsYUFBYSxFQUFDLGFBQWEsRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksQ0FBQyxFQUFDLENBQUMsYUFBYSxFQUFDLGFBQWEsRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFNBQVMsRUFBQyxTQUFTLEVBQUMsU0FBUyxDQUFDLEVBQUMsQ0FBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLEVBQUMsSUFBSSxFQUFDLElBQUksRUFBQyxJQUFJLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsQ0FBQyxFQUFDLENBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLEtBQUssRUFBQyxNQUFNLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE9BQU8sRUFBQyxNQUFNLENBQUMsRUFBQyxDQUFDLFFBQVEsRUFBQyxTQUFTLEVBQUMsT0FBTyxFQUFDLFFBQVEsRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxTQUFTLEVBQUMsVUFBVSxFQUFDLFNBQVMsRUFBQyxRQUFRLEVBQUMsU0FBUyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLENBQUMsRUFBQyxDQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxLQUFLLEVBQUMsTUFBTSxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsT0FBTyxFQUFDLE1BQU0sRUFBQyxPQUFPLEVBQUMsTUFBTSxDQUFDLEVBQUMsQ0FBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLE1BQU0sRUFBQyxRQUFRLEVBQUMsS0FBSyxFQUFDLE1BQU0sRUFBQyxNQUFNLEVBQUMsUUFBUSxFQUFDLFVBQVUsRUFBQyxTQUFTLEVBQUMsUUFBUSxFQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLFNBQVMsRUFBQyxNQUFNLENBQUMsRUFBQyxDQUFDLFVBQVUsRUFBQyxPQUFPLENBQUMsRUFBQyxDQUFDLHVCQUF1QixFQUFDLHVCQUF1QixDQUFDLENBQUMsRUFBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQyxTQUFTLEVBQUMsY0FBYyxFQUFDLGVBQWUsRUFBQyxxQkFBcUIsQ0FBQyxFQUFDLENBQUMsT0FBTyxFQUFDLFVBQVUsRUFBQyxZQUFZLEVBQUMsZUFBZSxDQUFDLEVBQUMsQ0FBQyxVQUFVLEVBQUMsQ0FBQyxFQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsRUFBQyxDQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxHQUFHLEVBQUMsR0FBRyxFQUFDLEdBQUcsRUFBQyxVQUFVLEVBQUMsR0FBRyxDQUFDLEVBQUMsQ0FBQyxXQUFXLEVBQUMsU0FBUyxFQUFDLFlBQVksRUFBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsR0FBRyxFQUFDLGtCQUFrQixFQUFDLEVBQUMsS0FBSyxFQUFDLENBQUMsQ0FBQyxFQUFDLEdBQUcsQ0FBQyxFQUFDLEtBQUssRUFBQyxDQUFDLENBQUMsRUFBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxJQUFJLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxLQUFLLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxHQUFHLENBQUMsRUFBQyxLQUFLLEVBQUMsQ0FBQyxNQUFNLENBQUMsRUFBQyxFQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vLyBUSElTIENPREUgSVMgR0VORVJBVEVEIC0gRE8gTk9UIE1PRElGWS5cbmNvbnN0IHUgPSB1bmRlZmluZWQ7XG5cbmZ1bmN0aW9uIHBsdXJhbChuOiBudW1iZXIpOiBudW1iZXIge1xuY29uc3QgaSA9IE1hdGguZmxvb3IoTWF0aC5hYnMobikpLCB2ID0gbi50b1N0cmluZygpLnJlcGxhY2UoL15bXi5dKlxcLj8vLCAnJykubGVuZ3RoO1xuXG5pZiAodiA9PT0gMCAmJiAoaSAlIDEwID09PSAxICYmICEoaSAlIDEwMCA9PT0gMTEpKSlcbiAgICByZXR1cm4gMTtcbmlmICh2ID09PSAwICYmIChpICUgMTAgPT09IE1hdGguZmxvb3IoaSAlIDEwKSAmJiAoaSAlIDEwID49IDIgJiYgaSAlIDEwIDw9IDQpICYmICEoaSAlIDEwMCA+PSAxMiAmJiBpICUgMTAwIDw9IDE0KSkpXG4gICAgcmV0dXJuIDM7XG5pZiAodiA9PT0gMCAmJiBpICUgMTAgPT09IDAgfHwgKHYgPT09IDAgJiYgKGkgJSAxMCA9PT0gTWF0aC5mbG9vcihpICUgMTApICYmIChpICUgMTAgPj0gNSAmJiBpICUgMTAgPD0gOSkpIHx8IHYgPT09IDAgJiYgKGkgJSAxMDAgPT09IE1hdGguZmxvb3IoaSAlIDEwMCkgJiYgKGkgJSAxMDAgPj0gMTEgJiYgaSAlIDEwMCA8PSAxNCkpKSlcbiAgICByZXR1cm4gNDtcbnJldHVybiA1O1xufVxuXG5leHBvcnQgZGVmYXVsdCBbXCJydVwiLFtbXCJBTVwiLFwiUE1cIl0sdSx1XSx1LFtbXCLQstGBXCIsXCLQv9C9XCIsXCLQstGCXCIsXCLRgdGAXCIsXCLRh9GCXCIsXCLQv9GCXCIsXCLRgdCxXCJdLHUsW1wi0LLQvtGB0LrRgNC10YHQtdC90YzQtVwiLFwi0L/QvtC90LXQtNC10LvRjNC90LjQulwiLFwi0LLRgtC+0YDQvdC40LpcIixcItGB0YDQtdC00LBcIixcItGH0LXRgtCy0LXRgNCzXCIsXCLQv9GP0YLQvdC40YbQsFwiLFwi0YHRg9Cx0LHQvtGC0LBcIl0sW1wi0LLRgVwiLFwi0L/QvVwiLFwi0LLRglwiLFwi0YHRgFwiLFwi0YfRglwiLFwi0L/RglwiLFwi0YHQsVwiXV0sW1tcItCSXCIsXCLQn1wiLFwi0JJcIixcItChXCIsXCLQp1wiLFwi0J9cIixcItChXCJdLFtcItCy0YFcIixcItC/0L1cIixcItCy0YJcIixcItGB0YBcIixcItGH0YJcIixcItC/0YJcIixcItGB0LFcIl0sW1wi0LLQvtGB0LrRgNC10YHQtdC90YzQtVwiLFwi0L/QvtC90LXQtNC10LvRjNC90LjQulwiLFwi0LLRgtC+0YDQvdC40LpcIixcItGB0YDQtdC00LBcIixcItGH0LXRgtCy0LXRgNCzXCIsXCLQv9GP0YLQvdC40YbQsFwiLFwi0YHRg9Cx0LHQvtGC0LBcIl0sW1wi0LLRgVwiLFwi0L/QvVwiLFwi0LLRglwiLFwi0YHRgFwiLFwi0YfRglwiLFwi0L/RglwiLFwi0YHQsVwiXV0sW1tcItCvXCIsXCLQpFwiLFwi0JxcIixcItCQXCIsXCLQnFwiLFwi0JhcIixcItCYXCIsXCLQkFwiLFwi0KFcIixcItCeXCIsXCLQnVwiLFwi0JRcIl0sW1wi0Y/QvdCyLlwiLFwi0YTQtdCy0YAuXCIsXCLQvNCw0YAuXCIsXCLQsNC/0YAuXCIsXCLQvNCw0Y9cIixcItC40Y7QvS5cIixcItC40Y7Quy5cIixcItCw0LLQsy5cIixcItGB0LXQvdGCLlwiLFwi0L7QutGCLlwiLFwi0L3QvtGP0LEuXCIsXCLQtNC10LouXCJdLFtcItGP0L3QstCw0YDRj1wiLFwi0YTQtdCy0YDQsNC70Y9cIixcItC80LDRgNGC0LBcIixcItCw0L/RgNC10LvRj1wiLFwi0LzQsNGPXCIsXCLQuNGO0L3Rj1wiLFwi0LjRjtC70Y9cIixcItCw0LLQs9GD0YHRgtCwXCIsXCLRgdC10L3RgtGP0LHRgNGPXCIsXCLQvtC60YLRj9Cx0YDRj1wiLFwi0L3QvtGP0LHRgNGPXCIsXCLQtNC10LrQsNCx0YDRj1wiXV0sW1tcItCvXCIsXCLQpFwiLFwi0JxcIixcItCQXCIsXCLQnFwiLFwi0JhcIixcItCYXCIsXCLQkFwiLFwi0KFcIixcItCeXCIsXCLQnVwiLFwi0JRcIl0sW1wi0Y/QvdCyLlwiLFwi0YTQtdCy0YAuXCIsXCLQvNCw0YDRglwiLFwi0LDQv9GALlwiLFwi0LzQsNC5XCIsXCLQuNGO0L3RjFwiLFwi0LjRjtC70YxcIixcItCw0LLQsy5cIixcItGB0LXQvdGCLlwiLFwi0L7QutGCLlwiLFwi0L3QvtGP0LEuXCIsXCLQtNC10LouXCJdLFtcItGP0L3QstCw0YDRjFwiLFwi0YTQtdCy0YDQsNC70YxcIixcItC80LDRgNGCXCIsXCLQsNC/0YDQtdC70YxcIixcItC80LDQuVwiLFwi0LjRjtC90YxcIixcItC40Y7Qu9GMXCIsXCLQsNCy0LPRg9GB0YJcIixcItGB0LXQvdGC0Y/QsdGA0YxcIixcItC+0LrRgtGP0LHRgNGMXCIsXCLQvdC+0Y/QsdGA0YxcIixcItC00LXQutCw0LHRgNGMXCJdXSxbW1wi0LTQviDQvS7RjS5cIixcItC9LtGNLlwiXSxbXCLQtNC+INC9LiDRjS5cIixcItC9LiDRjS5cIl0sW1wi0LTQviDQoNC+0LbQtNC10YHRgtCy0LAg0KXRgNC40YHRgtC+0LLQsFwiLFwi0L7RgiDQoNC+0LbQtNC10YHRgtCy0LAg0KXRgNC40YHRgtC+0LLQsFwiXV0sMSxbNiwwXSxbXCJkZC5NTS55XCIsXCJkIE1NTSB5ICfQsycuXCIsXCJkIE1NTU0geSAn0LMnLlwiLFwiRUVFRSwgZCBNTU1NIHkgJ9CzJy5cIl0sW1wiSEg6bW1cIixcIkhIOm1tOnNzXCIsXCJISDptbTpzcyB6XCIsXCJISDptbTpzcyB6enp6XCJdLFtcInsxfSwgezB9XCIsdSx1LHVdLFtcIixcIixcIsKgXCIsXCI7XCIsXCIlXCIsXCIrXCIsXCItXCIsXCJFXCIsXCLDl1wiLFwi4oCwXCIsXCLiiJ5cIixcItC90LXCoNGH0LjRgdC70L5cIixcIjpcIl0sW1wiIywjIzAuIyMjXCIsXCIjLCMjMMKgJVwiLFwiIywjIzAuMDDCoMKkXCIsXCIjRTBcIl0sXCJSVUJcIixcIuKCvVwiLFwi0YDQvtGB0YHQuNC50YHQutC40Lkg0YDRg9Cx0LvRjFwiLHtcIkdFTFwiOlt1LFwi4YOaXCJdLFwiUk9OXCI6W3UsXCJMXCJdLFwiUlVCXCI6W1wi4oK9XCJdLFwiUlVSXCI6W1wi0YAuXCJdLFwiVEhCXCI6W1wi4Li/XCJdLFwiVE1UXCI6W1wi0KLQnNCiXCJdLFwiVFdEXCI6W1wiTlQkXCJdLFwiVUFIXCI6W1wi4oK0XCJdLFwiWFhYXCI6W1wiWFhYWFwiXX0sXCJsdHJcIiwgcGx1cmFsXTtcbiJdfQ==