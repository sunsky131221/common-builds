/**
 * @fileoverview added by tsickle
 * Generated from: packages/common/src/common.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * @module
 * @description
 * Entry point for all public APIs of the common package.
 */
export { ɵNgClassImpl, ɵNgClassR2Impl, ɵNgStyleR2Impl, ɵDomAdapter, ɵgetDOM, ɵsetRootDomAdapter, ɵBrowserPlatformLocation } from './private_export';
export { HashLocationStrategy, Location, APP_BASE_HREF, LocationStrategy, PathLocationStrategy, LOCATION_INITIALIZED, PlatformLocation } from './location/index';
export { formatDate } from './i18n/format_date';
export { formatCurrency, formatNumber, formatPercent } from './i18n/format_number';
export { NgLocaleLocalization, NgLocalization } from './i18n/localization';
export { registerLocaleData } from './i18n/locale_data';
export { Plural, NumberFormatStyle, FormStyle, TranslationWidth, FormatWidth, NumberSymbol, WeekDay, getNumberOfCurrencyDigits, getCurrencySymbol, getLocaleDayPeriods, getLocaleDayNames, getLocaleMonthNames, getLocaleId, getLocaleEraNames, getLocaleWeekEndRange, getLocaleFirstDayOfWeek, getLocaleDateFormat, getLocaleDateTimeFormat, getLocaleExtraDayPeriodRules, getLocaleExtraDayPeriods, getLocalePluralCase, getLocaleTimeFormat, getLocaleNumberSymbol, getLocaleNumberFormat, getLocaleCurrencyName, getLocaleCurrencySymbol, getLocaleDirection } from './i18n/locale_data_api';
export { parseCookieValue as ɵparseCookieValue } from './cookie';
export { CommonModule } from './common_module';
export { NgClass, NgForOf, NgForOfContext, NgIf, NgIfContext, NgPlural, NgPluralCase, NgStyle, NgSwitch, NgSwitchCase, NgSwitchDefault, NgTemplateOutlet, NgComponentOutlet } from './directives/index';
export { DOCUMENT } from './dom_tokens';
export { AsyncPipe, DatePipe, I18nPluralPipe, I18nSelectPipe, JsonPipe, LowerCasePipe, CurrencyPipe, DecimalPipe, PercentPipe, SlicePipe, UpperCasePipe, TitleCasePipe, KeyValuePipe } from './pipes/index';
export { PLATFORM_BROWSER_ID as ɵPLATFORM_BROWSER_ID, PLATFORM_SERVER_ID as ɵPLATFORM_SERVER_ID, PLATFORM_WORKER_APP_ID as ɵPLATFORM_WORKER_APP_ID, PLATFORM_WORKER_UI_ID as ɵPLATFORM_WORKER_UI_ID, isPlatformBrowser, isPlatformServer, isPlatformWorkerApp, isPlatformWorkerUi } from './platform_id';
export { VERSION } from './version';
export { ViewportScroller, NullViewportScroller as ɵNullViewportScroller } from './viewport_scroller';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9jb21tb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFhQSxpSUFBYyxrQkFBa0IsQ0FBQztBQUNqQyw4SUFBYyxrQkFBa0IsQ0FBQztBQUNqQyxPQUFPLEVBQUMsVUFBVSxFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDOUMsT0FBTyxFQUFDLGNBQWMsRUFBRSxZQUFZLEVBQUUsYUFBYSxFQUFDLE1BQU0sc0JBQXNCLENBQUM7QUFDakYsT0FBTyxFQUFDLG9CQUFvQixFQUFFLGNBQWMsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3pFLE9BQU8sRUFBQyxrQkFBa0IsRUFBQyxNQUFNLG9CQUFvQixDQUFDO0FBQ3RELE9BQU8sRUFBQyxNQUFNLEVBQUUsaUJBQWlCLEVBQUUsU0FBUyxFQUFRLGdCQUFnQixFQUFFLFdBQVcsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLHlCQUF5QixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLGlCQUFpQixFQUFFLG1CQUFtQixFQUFFLFdBQVcsRUFBRSxpQkFBaUIsRUFBRSxxQkFBcUIsRUFBRSx1QkFBdUIsRUFBRSxtQkFBbUIsRUFBRSx1QkFBdUIsRUFBRSw0QkFBNEIsRUFBRSx3QkFBd0IsRUFBRSxtQkFBbUIsRUFBRSxtQkFBbUIsRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSxxQkFBcUIsRUFBRSx1QkFBdUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBQ3JrQixPQUFPLEVBQUMsZ0JBQWdCLElBQUksaUJBQWlCLEVBQUMsTUFBTSxVQUFVLENBQUM7QUFDL0QsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxZQUFZLEVBQUUsZUFBZSxFQUFFLGdCQUFnQixFQUFFLGlCQUFpQixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDdE0sT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGNBQWMsQ0FBQztBQUN0QyxPQUFPLEVBQUMsU0FBUyxFQUFFLFFBQVEsRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsU0FBUyxFQUFFLGFBQWEsRUFBRSxhQUFhLEVBQUUsWUFBWSxFQUFXLE1BQU0sZUFBZSxDQUFDO0FBQ3BOLE9BQU8sRUFBQyxtQkFBbUIsSUFBSSxvQkFBb0IsRUFBRSxrQkFBa0IsSUFBSSxtQkFBbUIsRUFBRSxzQkFBc0IsSUFBSSx1QkFBdUIsRUFBRSxxQkFBcUIsSUFBSSxzQkFBc0IsRUFBRSxpQkFBaUIsRUFBRSxnQkFBZ0IsRUFBRSxtQkFBbUIsRUFBRSxrQkFBa0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2UyxPQUFPLEVBQUMsT0FBTyxFQUFDLE1BQU0sV0FBVyxDQUFDO0FBQ2xDLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxvQkFBb0IsSUFBSSxxQkFBcUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG4vKipcbiAqIEBtb2R1bGVcbiAqIEBkZXNjcmlwdGlvblxuICogRW50cnkgcG9pbnQgZm9yIGFsbCBwdWJsaWMgQVBJcyBvZiB0aGUgY29tbW9uIHBhY2thZ2UuXG4gKi9cbmV4cG9ydCAqIGZyb20gJy4vcHJpdmF0ZV9leHBvcnQnO1xuZXhwb3J0ICogZnJvbSAnLi9sb2NhdGlvbi9pbmRleCc7XG5leHBvcnQge2Zvcm1hdERhdGV9IGZyb20gJy4vaTE4bi9mb3JtYXRfZGF0ZSc7XG5leHBvcnQge2Zvcm1hdEN1cnJlbmN5LCBmb3JtYXROdW1iZXIsIGZvcm1hdFBlcmNlbnR9IGZyb20gJy4vaTE4bi9mb3JtYXRfbnVtYmVyJztcbmV4cG9ydCB7TmdMb2NhbGVMb2NhbGl6YXRpb24sIE5nTG9jYWxpemF0aW9ufSBmcm9tICcuL2kxOG4vbG9jYWxpemF0aW9uJztcbmV4cG9ydCB7cmVnaXN0ZXJMb2NhbGVEYXRhfSBmcm9tICcuL2kxOG4vbG9jYWxlX2RhdGEnO1xuZXhwb3J0IHtQbHVyYWwsIE51bWJlckZvcm1hdFN0eWxlLCBGb3JtU3R5bGUsIFRpbWUsIFRyYW5zbGF0aW9uV2lkdGgsIEZvcm1hdFdpZHRoLCBOdW1iZXJTeW1ib2wsIFdlZWtEYXksIGdldE51bWJlck9mQ3VycmVuY3lEaWdpdHMsIGdldEN1cnJlbmN5U3ltYm9sLCBnZXRMb2NhbGVEYXlQZXJpb2RzLCBnZXRMb2NhbGVEYXlOYW1lcywgZ2V0TG9jYWxlTW9udGhOYW1lcywgZ2V0TG9jYWxlSWQsIGdldExvY2FsZUVyYU5hbWVzLCBnZXRMb2NhbGVXZWVrRW5kUmFuZ2UsIGdldExvY2FsZUZpcnN0RGF5T2ZXZWVrLCBnZXRMb2NhbGVEYXRlRm9ybWF0LCBnZXRMb2NhbGVEYXRlVGltZUZvcm1hdCwgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RSdWxlcywgZ2V0TG9jYWxlRXh0cmFEYXlQZXJpb2RzLCBnZXRMb2NhbGVQbHVyYWxDYXNlLCBnZXRMb2NhbGVUaW1lRm9ybWF0LCBnZXRMb2NhbGVOdW1iZXJTeW1ib2wsIGdldExvY2FsZU51bWJlckZvcm1hdCwgZ2V0TG9jYWxlQ3VycmVuY3lOYW1lLCBnZXRMb2NhbGVDdXJyZW5jeVN5bWJvbCwgZ2V0TG9jYWxlRGlyZWN0aW9ufSBmcm9tICcuL2kxOG4vbG9jYWxlX2RhdGFfYXBpJztcbmV4cG9ydCB7cGFyc2VDb29raWVWYWx1ZSBhcyDJtXBhcnNlQ29va2llVmFsdWV9IGZyb20gJy4vY29va2llJztcbmV4cG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICcuL2NvbW1vbl9tb2R1bGUnO1xuZXhwb3J0IHtOZ0NsYXNzLCBOZ0Zvck9mLCBOZ0Zvck9mQ29udGV4dCwgTmdJZiwgTmdJZkNvbnRleHQsIE5nUGx1cmFsLCBOZ1BsdXJhbENhc2UsIE5nU3R5bGUsIE5nU3dpdGNoLCBOZ1N3aXRjaENhc2UsIE5nU3dpdGNoRGVmYXVsdCwgTmdUZW1wbGF0ZU91dGxldCwgTmdDb21wb25lbnRPdXRsZXR9IGZyb20gJy4vZGlyZWN0aXZlcy9pbmRleCc7XG5leHBvcnQge0RPQ1VNRU5UfSBmcm9tICcuL2RvbV90b2tlbnMnO1xuZXhwb3J0IHtBc3luY1BpcGUsIERhdGVQaXBlLCBJMThuUGx1cmFsUGlwZSwgSTE4blNlbGVjdFBpcGUsIEpzb25QaXBlLCBMb3dlckNhc2VQaXBlLCBDdXJyZW5jeVBpcGUsIERlY2ltYWxQaXBlLCBQZXJjZW50UGlwZSwgU2xpY2VQaXBlLCBVcHBlckNhc2VQaXBlLCBUaXRsZUNhc2VQaXBlLCBLZXlWYWx1ZVBpcGUsIEtleVZhbHVlfSBmcm9tICcuL3BpcGVzL2luZGV4JztcbmV4cG9ydCB7UExBVEZPUk1fQlJPV1NFUl9JRCBhcyDJtVBMQVRGT1JNX0JST1dTRVJfSUQsIFBMQVRGT1JNX1NFUlZFUl9JRCBhcyDJtVBMQVRGT1JNX1NFUlZFUl9JRCwgUExBVEZPUk1fV09SS0VSX0FQUF9JRCBhcyDJtVBMQVRGT1JNX1dPUktFUl9BUFBfSUQsIFBMQVRGT1JNX1dPUktFUl9VSV9JRCBhcyDJtVBMQVRGT1JNX1dPUktFUl9VSV9JRCwgaXNQbGF0Zm9ybUJyb3dzZXIsIGlzUGxhdGZvcm1TZXJ2ZXIsIGlzUGxhdGZvcm1Xb3JrZXJBcHAsIGlzUGxhdGZvcm1Xb3JrZXJVaX0gZnJvbSAnLi9wbGF0Zm9ybV9pZCc7XG5leHBvcnQge1ZFUlNJT059IGZyb20gJy4vdmVyc2lvbic7XG5leHBvcnQge1ZpZXdwb3J0U2Nyb2xsZXIsIE51bGxWaWV3cG9ydFNjcm9sbGVyIGFzIMm1TnVsbFZpZXdwb3J0U2Nyb2xsZXJ9IGZyb20gJy4vdmlld3BvcnRfc2Nyb2xsZXInO1xuIl19