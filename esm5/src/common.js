/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export * from './location/index';
export { formatDate } from './i18n/format_date';
export { formatCurrency, formatNumber, formatPercent } from './i18n/format_number';
export { NgLocaleLocalization, NgLocalization } from './i18n/localization';
export { registerLocaleData } from './i18n/locale_data';
export { Plural, NumberFormatStyle, FormStyle, TranslationWidth, FormatWidth, NumberSymbol, WeekDay, getNumberOfCurrencyDigits, getCurrencySymbol, getLocaleDayPeriods, getLocaleDayNames, getLocaleMonthNames, getLocaleId, getLocaleEraNames, getLocaleWeekEndRange, getLocaleFirstDayOfWeek, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocalePluralCase, getLocaleTimeFormat, getLocaleNumberSymbol, getLocaleNumberFormat, getLocaleCurrencyName, getLocaleCurrencySymbol } from './i18n/locale_data_api';
export { parseCookieValue as ɵparseCookieValue } from './cookie';
export { CommonModule, DeprecatedI18NPipesModule } from './common_module';
export { NgClass, NgForOf, NgForOfContext, NgIf, NgIfContext, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NgComponentOutlet } from './directives/index';
export { DOCUMENT } from './dom_tokens';
export { AsyncPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, JsonPipe, LowerCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe, UpperCasePipe, TitleCasePipe } from './pipes/index';
export { DeprecatedDatePipe, DeprecatedCurrencyPipe, DeprecatedDecimalPipe, DeprecatedPercentPipe } from './pipes/deprecated/index';
export { PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID, PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID, PLATFORM_WORKER_APP_ID as ɵPLATFORM_WORKER_APP_ID, PLATFORM_WORKER_UI_ID as ɵPLATFORM_WORKER_UI_ID, isPlatformBrowser, isPlatformServer, isPlatformWorkerApp, isPlatformWorkerUi } from './platform_id';
export { VERSION } from './version';
export { ViewportScroller, NullViewportScroller as ɵNullViewportScroller } from './viewport_scroller';

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7OztBQWFBLGNBQWMsa0JBQWtCLENBQUM7QUFDakMsT0FBTyxFQUFDLFVBQVUsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQzlDLE9BQU8sRUFBQyxjQUFjLEVBQUUsWUFBWSxFQUFFLGFBQWEsRUFBQyxNQUFNLHNCQUFzQixDQUFDO0FBQ2pGLE9BQU8sRUFBQyxvQkFBb0IsRUFBRSxjQUFjLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUN6RSxPQUFPLEVBQUMsa0JBQWtCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUN0RCxPQUFPLEVBQUMsTUFBTSxFQUFFLGlCQUFpQixFQUFFLFNBQVMsRUFBUSxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSx5QkFBeUIsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxpQkFBaUIsRUFBRSxtQkFBbUIsRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUscUJBQXFCLEVBQUUsdUJBQXVCLEVBQUUsbUJBQW1CLEVBQUUsdUJBQXVCLEVBQUUsNEJBQTRCLEVBQUUsd0JBQXdCLEVBQUUsbUJBQW1CLEVBQUUsbUJBQW1CLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUscUJBQXFCLEVBQUUsdUJBQXVCLEVBQUMsTUFBTSx3QkFBd0IsQ0FBQztBQUNqakIsT0FBTyxFQUFDLGdCQUFnQixJQUFJLGlCQUFpQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQy9ELE9BQU8sRUFBQyxZQUFZLEVBQUUseUJBQXlCLEVBQUMsTUFBTSxpQkFBaUIsQ0FBQztBQUN4RSxPQUFPLEVBQUMsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsSUFBSSxFQUFFLFdBQVcsRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLE9BQU8sRUFBRSxRQUFRLEVBQUUsWUFBWSxFQUFFLGVBQWUsRUFBRSxnQkFBZ0IsRUFBRSxpQkFBaUIsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RNLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxjQUFjLENBQUM7QUFDdEMsT0FBTyxFQUFDLFNBQVMsRUFBRSxRQUFRLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsYUFBYSxFQUFFLFlBQVksRUFBRSxXQUFXLEVBQUUsV0FBVyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVMLE9BQU8sRUFBQyxrQkFBa0IsRUFBRSxzQkFBc0IsRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2xJLE9BQU8sRUFBQyxtQkFBbUIsSUFBSSxvQkFBb0IsRUFBRSxrQkFBa0IsSUFBSSxtQkFBbUIsRUFBRSxzQkFBc0IsSUFBSSx1QkFBdUIsRUFBRSxxQkFBcUIsSUFBSSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2UyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogRW50cnkgcG9pbnQgZm9yIGFsbCBwdWJsaWMgQVBJcyBvZiB0aGUgY29tbW9uIHBhY2thZ2UuXG4gKi9cbmV4cG9ydCAqIGZyb20gJy4vbG9jYXRpb24vaW5kZXgnO1xuZXhwb3J0IHtmb3JtYXREYXRlfSBmcm9tICcuL2kxOG4vZm9ybWF0X2RhdGUnO1xuZXhwb3J0IHtmb3JtYXRDdXJyZW5jeSwgZm9ybWF0TnVtYmVyLCBmb3JtYXRQZXJjZW50fSBmcm9tICcuL2kxOG4vZm9ybWF0X251bWJlcic7XG5leHBvcnQge05nTG9jYWxlTG9jYWxpemF0aW9uLCBOZ0xvY2FsaXphdGlvbn0gZnJvbSAnLi9pMThuL2xvY2FsaXphdGlvbic7XG5leHBvcnQge3JlZ2lzdGVyTG9jYWxlRGF0YX0gZnJvbSAnLi9pMThuL2xvY2FsZV9kYXRhJztcbmV4cG9ydCB7UGx1cmFsLCBOdW1iZXJGb3JtYXRTdHlsZSwgRm9ybVN0eWxlLCBUaW1lLCBUcmFuc2xhdGlvbldpZHRoLCBGb3JtYXRXaWR0aCwgTnVtYmVyU3ltYm9sLCBXZWVrRGF5LCBnZXROdW1iZXJPZkN1cnJlbmN5RGlnaXRzLCBnZXRDdXJyZW5jeVN5bWJvbCwgZ2V0TG9jYWxlRGF5UGVyaW9kcywgZ2V0TG9jYWxlRGF5TmFtZXMsIGdldExvY2FsZU1vbnRoTmFtZXMsIGdldExvY2FsZUlkLCBnZXRMb2NhbGVFcmFOYW1lcywgZ2V0TG9jYWxlV2Vla0VuZFJhbmdlLCBnZXRMb2NhbGVGaXJzdERheU9mV2VlaywgZ2V0TG9jYWxlRGF0ZUZvcm1hdCwgZ2V0TG9jYWxlRGF0ZVRpbWVGb3JtYXQsIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kUnVsZXMsIGdldExvY2FsZUV4dHJhRGF5UGVyaW9kcywgZ2V0TG9jYWxlUGx1cmFsQ2FzZSwgZ2V0TG9jYWxlVGltZUZvcm1hdCwgZ2V0TG9jYWxlTnVtYmVyU3ltYm9sLCBnZXRMb2NhbGVOdW1iZXJGb3JtYXQsIGdldExvY2FsZUN1cnJlbmN5TmFtZSwgZ2V0TG9jYWxlQ3VycmVuY3lTeW1ib2x9IGZyb20gJy4vaTE4bi9sb2NhbGVfZGF0YV9hcGknO1xuZXhwb3J0IHtwYXJzZUNvb2tpZVZhbHVlIGFzIMm1cGFyc2VDb29raWVWYWx1ZX0gZnJvbSAnLi9jb29raWUnO1xuZXhwb3J0IHtDb21tb25Nb2R1bGUsIERlcHJlY2F0ZWRJMThOUGlwZXNNb2R1bGV9IGZyb20gJy4vY29tbW9uX21vZHVsZSc7XG5leHBvcnQge05nQ2xhc3MsIE5nRm9yT2YsIE5nRm9yT2ZDb250ZXh0LCBOZ0lmLCBOZ0lmQ29udGV4dCwgTmdQbHVyYWwsIE5nUGx1cmFsQ2FzZSwgTmdTdHlsZSwgTmdTd2l0Y2gsIE5nU3dpdGNoQ2FzZSwgTmdTd2l0Y2hEZWZhdWx0LCBOZ1RlbXBsYXRlT3V0bGV0LCBOZ0NvbXBvbmVudE91dGxldH0gZnJvbSAnLi9kaXJlY3RpdmVzL2luZGV4JztcbmV4cG9ydCB7RE9DVU1FTlR9IGZyb20gJy4vZG9tX3Rva2Vucyc7XG5leHBvcnQge0FzeW5jUGlwZSwgRGF0ZVBpcGUsIEkxOG5QbHVyYWxQaXBlLCBJMThuU2VsZWN0UGlwZSwgSnNvblBpcGUsIExvd2VyQ2FzZVBpcGUsIEN1cnJlbmN5UGlwZSwgRGVjaW1hbFBpcGUsIFBlcmNlbnRQaXBlLCBTbGljZVBpcGUsIFVwcGVyQ2FzZVBpcGUsIFRpdGxlQ2FzZVBpcGV9IGZyb20gJy4vcGlwZXMvaW5kZXgnO1xuZXhwb3J0IHtEZXByZWNhdGVkRGF0ZVBpcGUsIERlcHJlY2F0ZWRDdXJyZW5jeVBpcGUsIERlcHJlY2F0ZWREZWNpbWFsUGlwZSwgRGVwcmVjYXRlZFBlcmNlbnRQaXBlfSBmcm9tICcuL3BpcGVzL2RlcHJlY2F0ZWQvaW5kZXgnO1xuZXhwb3J0IHtQTEFURk9STV9CUk9XU0VSX0lEIGFzIMm1UExBVEZPUk1fQlJPV1NFUl9JRCwgUExBVEZPUk1fU0VSVkVSX0lEIGFzIMm1UExBVEZPUk1fU0VSVkVSX0lELCBQTEFURk9STV9XT1JLRVJfQVBQX0lEIGFzIMm1UExBVEZPUk1fV09SS0VSX0FQUF9JRCwgUExBVEZPUk1fV09SS0VSX1VJX0lEIGFzIMm1UExBVEZPUk1fV09SS0VSX1VJX0lELCBpc1BsYXRmb3JtQnJvd3NlciwgaXNQbGF0Zm9ybVNlcnZlciwgaXNQbGF0Zm9ybVdvcmtlckFwcCwgaXNQbGF0Zm9ybVdvcmtlclVpfSBmcm9tICcuL3BsYXRmb3JtX2lkJztcbmV4cG9ydCB7VkVSU0lPTn0gZnJvbSAnLi92ZXJzaW9uJztcbmV4cG9ydCB7Vmlld3BvcnRTY3JvbGxlciwgTnVsbFZpZXdwb3J0U2Nyb2xsZXIgYXMgybVOdWxsVmlld3BvcnRTY3JvbGxlcn0gZnJvbSAnLi92aWV3cG9ydF9zY3JvbGxlcic7XG4iXX0=