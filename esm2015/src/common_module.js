/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { NgModule } from '@angular/core';
import { COMMON_DIRECTIVES } from './directives/index';
import { DEPRECATED_PLURAL_FN, NgLocaleLocalization, NgLocalization, getPluralCase } from './i18n/localization';
import { COMMON_DEPRECATED_I18N_PIPES } from './pipes/deprecated/index';
import { COMMON_PIPES } from './pipes/index';
// Note: This does not contain the location providers,
// as they need some platform specific implementations to work.
/**
 * Exports all the basic Angular directives and pipes,
 * such as `NgIf`, `NgForOf`, `DecimalPipe`, and so on.
 * Re-exported by `BrowserModule`, which is included automatically in the root
 * `AppModule` when you create a new app with the CLI `new` command.
 *
 * * The `providers` options configure the NgModule's injector to provide
 * localization dependencies to members.
 * * The `exports` options make the declared directives and pipes available for import
 * by other NgModules.
 *
 */
let CommonModule = class CommonModule {
};
CommonModule = tslib_1.__decorate([
    NgModule({
        declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
        exports: [COMMON_DIRECTIVES, COMMON_PIPES],
        providers: [
            { provide: NgLocalization, useClass: NgLocaleLocalization },
        ],
    })
], CommonModule);
export { CommonModule };
/**
 * A module that contains the deprecated i18n pipes.
 *
 * @deprecated from v5
 */
let DeprecatedI18NPipesModule = class DeprecatedI18NPipesModule {
};
DeprecatedI18NPipesModule = tslib_1.__decorate([
    NgModule({
        declarations: [COMMON_DEPRECATED_I18N_PIPES],
        exports: [COMMON_DEPRECATED_I18N_PIPES],
        providers: [{ provide: DEPRECATED_PLURAL_FN, useValue: getPluralCase }],
    })
], DeprecatedI18NPipesModule);
export { DeprecatedI18NPipesModule };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tbW9uX21vZHVsZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvY29tbW9uX21vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsaUJBQWlCLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUNyRCxPQUFPLEVBQUMsb0JBQW9CLEVBQUUsb0JBQW9CLEVBQUUsY0FBYyxFQUFFLGFBQWEsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQzlHLE9BQU8sRUFBQyw0QkFBNEIsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ3RFLE9BQU8sRUFBQyxZQUFZLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFHM0Msc0RBQXNEO0FBQ3RELCtEQUErRDtBQUMvRDs7Ozs7Ozs7Ozs7R0FXRztBQVFILElBQWEsWUFBWSxHQUF6QjtDQUNDLENBQUE7QUFEWSxZQUFZO0lBUHhCLFFBQVEsQ0FBQztRQUNSLFlBQVksRUFBRSxDQUFDLGlCQUFpQixFQUFFLFlBQVksQ0FBQztRQUMvQyxPQUFPLEVBQUUsQ0FBQyxpQkFBaUIsRUFBRSxZQUFZLENBQUM7UUFDMUMsU0FBUyxFQUFFO1lBQ1QsRUFBQyxPQUFPLEVBQUUsY0FBYyxFQUFFLFFBQVEsRUFBRSxvQkFBb0IsRUFBQztTQUMxRDtLQUNGLENBQUM7R0FDVyxZQUFZLENBQ3hCO1NBRFksWUFBWTtBQUd6Qjs7OztHQUlHO0FBTUgsSUFBYSx5QkFBeUIsR0FBdEM7Q0FDQyxDQUFBO0FBRFkseUJBQXlCO0lBTHJDLFFBQVEsQ0FBQztRQUNSLFlBQVksRUFBRSxDQUFDLDRCQUE0QixDQUFDO1FBQzVDLE9BQU8sRUFBRSxDQUFDLDRCQUE0QixDQUFDO1FBQ3ZDLFNBQVMsRUFBRSxDQUFDLEVBQUMsT0FBTyxFQUFFLG9CQUFvQixFQUFFLFFBQVEsRUFBRSxhQUFhLEVBQUMsQ0FBQztLQUN0RSxDQUFDO0dBQ1cseUJBQXlCLENBQ3JDO1NBRFkseUJBQXlCIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge05nTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7Q09NTU9OX0RJUkVDVElWRVN9IGZyb20gJy4vZGlyZWN0aXZlcy9pbmRleCc7XG5pbXBvcnQge0RFUFJFQ0FURURfUExVUkFMX0ZOLCBOZ0xvY2FsZUxvY2FsaXphdGlvbiwgTmdMb2NhbGl6YXRpb24sIGdldFBsdXJhbENhc2V9IGZyb20gJy4vaTE4bi9sb2NhbGl6YXRpb24nO1xuaW1wb3J0IHtDT01NT05fREVQUkVDQVRFRF9JMThOX1BJUEVTfSBmcm9tICcuL3BpcGVzL2RlcHJlY2F0ZWQvaW5kZXgnO1xuaW1wb3J0IHtDT01NT05fUElQRVN9IGZyb20gJy4vcGlwZXMvaW5kZXgnO1xuXG5cbi8vIE5vdGU6IFRoaXMgZG9lcyBub3QgY29udGFpbiB0aGUgbG9jYXRpb24gcHJvdmlkZXJzLFxuLy8gYXMgdGhleSBuZWVkIHNvbWUgcGxhdGZvcm0gc3BlY2lmaWMgaW1wbGVtZW50YXRpb25zIHRvIHdvcmsuXG4vKipcbiAqIEV4cG9ydHMgYWxsIHRoZSBiYXNpYyBBbmd1bGFyIGRpcmVjdGl2ZXMgYW5kIHBpcGVzLFxuICogc3VjaCBhcyBgTmdJZmAsIGBOZ0Zvck9mYCwgYERlY2ltYWxQaXBlYCwgYW5kIHNvIG9uLlxuICogUmUtZXhwb3J0ZWQgYnkgYEJyb3dzZXJNb2R1bGVgLCB3aGljaCBpcyBpbmNsdWRlZCBhdXRvbWF0aWNhbGx5IGluIHRoZSByb290XG4gKiBgQXBwTW9kdWxlYCB3aGVuIHlvdSBjcmVhdGUgYSBuZXcgYXBwIHdpdGggdGhlIENMSSBgbmV3YCBjb21tYW5kLlxuICpcbiAqICogVGhlIGBwcm92aWRlcnNgIG9wdGlvbnMgY29uZmlndXJlIHRoZSBOZ01vZHVsZSdzIGluamVjdG9yIHRvIHByb3ZpZGVcbiAqIGxvY2FsaXphdGlvbiBkZXBlbmRlbmNpZXMgdG8gbWVtYmVycy5cbiAqICogVGhlIGBleHBvcnRzYCBvcHRpb25zIG1ha2UgdGhlIGRlY2xhcmVkIGRpcmVjdGl2ZXMgYW5kIHBpcGVzIGF2YWlsYWJsZSBmb3IgaW1wb3J0XG4gKiBieSBvdGhlciBOZ01vZHVsZXMuXG4gKlxuICovXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtDT01NT05fRElSRUNUSVZFUywgQ09NTU9OX1BJUEVTXSxcbiAgZXhwb3J0czogW0NPTU1PTl9ESVJFQ1RJVkVTLCBDT01NT05fUElQRVNdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTmdMb2NhbGl6YXRpb24sIHVzZUNsYXNzOiBOZ0xvY2FsZUxvY2FsaXphdGlvbn0sXG4gIF0sXG59KVxuZXhwb3J0IGNsYXNzIENvbW1vbk1vZHVsZSB7XG59XG5cbi8qKlxuICogQSBtb2R1bGUgdGhhdCBjb250YWlucyB0aGUgZGVwcmVjYXRlZCBpMThuIHBpcGVzLlxuICpcbiAqIEBkZXByZWNhdGVkIGZyb20gdjVcbiAqL1xuQE5nTW9kdWxlKHtcbiAgZGVjbGFyYXRpb25zOiBbQ09NTU9OX0RFUFJFQ0FURURfSTE4Tl9QSVBFU10sXG4gIGV4cG9ydHM6IFtDT01NT05fREVQUkVDQVRFRF9JMThOX1BJUEVTXSxcbiAgcHJvdmlkZXJzOiBbe3Byb3ZpZGU6IERFUFJFQ0FURURfUExVUkFMX0ZOLCB1c2VWYWx1ZTogZ2V0UGx1cmFsQ2FzZX1dLFxufSlcbmV4cG9ydCBjbGFzcyBEZXByZWNhdGVkSTE4TlBpcGVzTW9kdWxlIHtcbn1cbiJdfQ==