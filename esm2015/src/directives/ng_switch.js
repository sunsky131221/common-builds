/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Directive, Host, Input, TemplateRef, ViewContainerRef } from '@angular/core';
export class SwitchView {
    constructor(_viewContainerRef, _templateRef) {
        this._viewContainerRef = _viewContainerRef;
        this._templateRef = _templateRef;
        this._created = false;
    }
    create() {
        this._created = true;
        this._viewContainerRef.createEmbeddedView(this._templateRef);
    }
    destroy() {
        this._created = false;
        this._viewContainerRef.clear();
    }
    enforceState(created) {
        if (created && !this._created) {
            this.create();
        }
        else if (!created && this._created) {
            this.destroy();
        }
    }
}
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 *     <container-element [ngSwitch]="switch_expression">
 *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
 *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
 *       <ng-container *ngSwitchCase="match_expression_3">
 *         <!-- use a ng-container to group multiple root nodes -->
 *         <inner-element></inner-element>
 *         <inner-other-element></inner-other-element>
 *       </ng-container>
 *       <some-element *ngSwitchDefault>...</some-element>
 *     </container-element>
 * ```
 * @description
 *
 * Adds / removes DOM sub-trees when the nest match expressions matches the switch expression.
 *
 * `NgSwitch` stamps out nested views when their match expression value matches the value of the
 * switch expression.
 *
 * In other words:
 * - you define a container element (where you place the directive with a switch expression on the
 * `[ngSwitch]="..."` attribute)
 * - you define inner views inside the `NgSwitch` and place a `*ngSwitchCase` attribute on the view
 * root elements.
 *
 * Elements within `NgSwitch` but outside of a `NgSwitchCase` or `NgSwitchDefault` directives will
 * be preserved at the location.
 *
 * The `ngSwitchCase` directive informs the parent `NgSwitch` of which view to display when the
 * expression is evaluated.
 * When no matching expression is found on a `ngSwitchCase` view, the `ngSwitchDefault` view is
 * stamped out.
 *
 * @publicApi
 */
let NgSwitch = class NgSwitch {
    /**
     * @ngModule CommonModule
     *
     * @usageNotes
     * ```
     *     <container-element [ngSwitch]="switch_expression">
     *       <some-element *ngSwitchCase="match_expression_1">...</some-element>
     *       <some-element *ngSwitchCase="match_expression_2">...</some-element>
     *       <some-other-element *ngSwitchCase="match_expression_3">...</some-other-element>
     *       <ng-container *ngSwitchCase="match_expression_3">
     *         <!-- use a ng-container to group multiple root nodes -->
     *         <inner-element></inner-element>
     *         <inner-other-element></inner-other-element>
     *       </ng-container>
     *       <some-element *ngSwitchDefault>...</some-element>
     *     </container-element>
     * ```
     * @description
     *
     * Adds / removes DOM sub-trees when the nest match expressions matches the switch expression.
     *
     * `NgSwitch` stamps out nested views when their match expression value matches the value of the
     * switch expression.
     *
     * In other words:
     * - you define a container element (where you place the directive with a switch expression on the
     * `[ngSwitch]="..."` attribute)
     * - you define inner views inside the `NgSwitch` and place a `*ngSwitchCase` attribute on the view
     * root elements.
     *
     * Elements within `NgSwitch` but outside of a `NgSwitchCase` or `NgSwitchDefault` directives will
     * be preserved at the location.
     *
     * The `ngSwitchCase` directive informs the parent `NgSwitch` of which view to display when the
     * expression is evaluated.
     * When no matching expression is found on a `ngSwitchCase` view, the `ngSwitchDefault` view is
     * stamped out.
     *
     * @publicApi
     */
    constructor() {
        this._defaultUsed = false;
        this._caseCount = 0;
        this._lastCaseCheckIndex = 0;
        this._lastCasesMatched = false;
    }
    set ngSwitch(newValue) {
        this._ngSwitch = newValue;
        if (this._caseCount === 0) {
            this._updateDefaultCases(true);
        }
    }
    /** @internal */
    _addCase() { return this._caseCount++; }
    /** @internal */
    _addDefault(view) {
        if (!this._defaultViews) {
            this._defaultViews = [];
        }
        this._defaultViews.push(view);
    }
    /** @internal */
    _matchCase(value) {
        const matched = value == this._ngSwitch;
        this._lastCasesMatched = this._lastCasesMatched || matched;
        this._lastCaseCheckIndex++;
        if (this._lastCaseCheckIndex === this._caseCount) {
            this._updateDefaultCases(!this._lastCasesMatched);
            this._lastCaseCheckIndex = 0;
            this._lastCasesMatched = false;
        }
        return matched;
    }
    _updateDefaultCases(useDefault) {
        if (this._defaultViews && useDefault !== this._defaultUsed) {
            this._defaultUsed = useDefault;
            for (let i = 0; i < this._defaultViews.length; i++) {
                const defaultView = this._defaultViews[i];
                defaultView.enforceState(useDefault);
            }
        }
    }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object),
    tslib_1.__metadata("design:paramtypes", [Object])
], NgSwitch.prototype, "ngSwitch", null);
NgSwitch = tslib_1.__decorate([
    Directive({ selector: '[ngSwitch]' })
], NgSwitch);
export { NgSwitch };
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 * </container-element>
 *```
 * @description
 *
 * Creates a view that will be added/removed from the parent {@link NgSwitch} when the
 * given expression evaluate to respectively the same/different value as the switch
 * expression.
 *
 * Insert the sub-tree when the expression evaluates to the same value as the enclosing switch
 * expression.
 *
 * If multiple match expressions match the switch expression value, all of them are displayed.
 *
 * See {@link NgSwitch} for more details and example.
 *
 * @publicApi
 */
let NgSwitchCase = class NgSwitchCase {
    constructor(viewContainer, templateRef, ngSwitch) {
        this.ngSwitch = ngSwitch;
        ngSwitch._addCase();
        this._view = new SwitchView(viewContainer, templateRef);
    }
    ngDoCheck() { this._view.enforceState(this.ngSwitch._matchCase(this.ngSwitchCase)); }
};
tslib_1.__decorate([
    Input(),
    tslib_1.__metadata("design:type", Object)
], NgSwitchCase.prototype, "ngSwitchCase", void 0);
NgSwitchCase = tslib_1.__decorate([
    Directive({ selector: '[ngSwitchCase]' }),
    tslib_1.__param(2, Host()),
    tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
        NgSwitch])
], NgSwitchCase);
export { NgSwitchCase };
/**
 * @ngModule CommonModule
 * @usageNotes
 * ```
 * <container-element [ngSwitch]="switch_expression">
 *   <some-element *ngSwitchCase="match_expression_1">...</some-element>
 *   <some-other-element *ngSwitchDefault>...</some-other-element>
 * </container-element>
 * ```
 *
 * @description
 *
 * Creates a view that is added to the parent {@link NgSwitch} when no case expressions
 * match the switch expression.
 *
 * Insert the sub-tree when no case expressions evaluate to the same value as the enclosing switch
 * expression.
 *
 * See {@link NgSwitch} for more details and example.
 *
 * @publicApi
 */
let NgSwitchDefault = class NgSwitchDefault {
    constructor(viewContainer, templateRef, ngSwitch) {
        ngSwitch._addDefault(new SwitchView(viewContainer, templateRef));
    }
};
NgSwitchDefault = tslib_1.__decorate([
    Directive({ selector: '[ngSwitchDefault]' }),
    tslib_1.__param(2, Host()),
    tslib_1.__metadata("design:paramtypes", [ViewContainerRef, TemplateRef,
        NgSwitch])
], NgSwitchDefault);
export { NgSwitchDefault };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfc3dpdGNoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vcGFja2FnZXMvY29tbW9uL3NyYy9kaXJlY3RpdmVzL25nX3N3aXRjaC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFNBQVMsRUFBVyxJQUFJLEVBQUUsS0FBSyxFQUFFLFdBQVcsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUU3RixNQUFNLE9BQU8sVUFBVTtJQUdyQixZQUNZLGlCQUFtQyxFQUFVLFlBQWlDO1FBQTlFLHNCQUFpQixHQUFqQixpQkFBaUIsQ0FBa0I7UUFBVSxpQkFBWSxHQUFaLFlBQVksQ0FBcUI7UUFIbEYsYUFBUSxHQUFHLEtBQUssQ0FBQztJQUdvRSxDQUFDO0lBRTlGLE1BQU07UUFDSixJQUFJLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztRQUNyQixJQUFJLENBQUMsaUJBQWlCLENBQUMsa0JBQWtCLENBQUMsSUFBSSxDQUFDLFlBQVksQ0FBQyxDQUFDO0lBQy9ELENBQUM7SUFFRCxPQUFPO1FBQ0wsSUFBSSxDQUFDLFFBQVEsR0FBRyxLQUFLLENBQUM7UUFDdEIsSUFBSSxDQUFDLGlCQUFpQixDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFFRCxZQUFZLENBQUMsT0FBZ0I7UUFDM0IsSUFBSSxPQUFPLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQzdCLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztTQUNmO2FBQU0sSUFBSSxDQUFDLE9BQU8sSUFBSSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3BDLElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztTQUNoQjtJQUNILENBQUM7Q0FDRjtBQUVEOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0F1Q0c7QUFFSCxJQUFhLFFBQVEsR0FBckIsTUFBYSxRQUFRO0lB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O0FBVkM7SUFEQyxLQUFLLEVBQUU7O2tEQUNVO0FBSlAsWUFBWTtJQUR4QixTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsZ0JBQWdCLEVBQUMsQ0FBQztJQVNqQyxtQkFBQSxJQUFJLEVBQUUsQ0FBQTs2Q0FEUSxnQkFBZ0IsRUFBZSxXQUFXO1FBQy9CLFFBQVE7R0FSM0IsWUFBWSxDQWN4QjtTQWRZLFlBQVk7QUFnQnpCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FxQkc7QUFFSCxJQUFhLGVBQWUsR0FBNUIsTUFBYSxlQUFlO0lBQzFCLFlBQ0ksYUFBK0IsRUFBRSxXQUFnQyxFQUN6RCxRQUFrQjtRQUM1QixRQUFRLENBQUMsV0FBVyxDQUFDLElBQUksVUFBVSxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQyxDQUFDO0lBQ25FLENBQUM7Q0FDRixDQUFBO0FBTlksZUFBZTtJQUQzQixTQUFTLENBQUMsRUFBQyxRQUFRLEVBQUUsbUJBQW1CLEVBQUMsQ0FBQztJQUlwQyxtQkFBQSxJQUFJLEVBQUUsQ0FBQTs2Q0FEUSxnQkFBZ0IsRUFBZSxXQUFXO1FBQ3ZDLFFBQVE7R0FIbkIsZUFBZSxDQU0zQjtTQU5ZLGVBQWUiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBEb0NoZWNrLCBIb3N0LCBJbnB1dCwgVGVtcGxhdGVSZWYsIFZpZXdDb250YWluZXJSZWZ9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5leHBvcnQgY2xhc3MgU3dpdGNoVmlldyB7XG4gIHByaXZhdGUgX2NyZWF0ZWQgPSBmYWxzZTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX3ZpZXdDb250YWluZXJSZWY6IFZpZXdDb250YWluZXJSZWYsIHByaXZhdGUgX3RlbXBsYXRlUmVmOiBUZW1wbGF0ZVJlZjxPYmplY3Q+KSB7fVxuXG4gIGNyZWF0ZSgpOiB2b2lkIHtcbiAgICB0aGlzLl9jcmVhdGVkID0gdHJ1ZTtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUVtYmVkZGVkVmlldyh0aGlzLl90ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBkZXN0cm95KCk6IHZvaWQge1xuICAgIHRoaXMuX2NyZWF0ZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92aWV3Q29udGFpbmVyUmVmLmNsZWFyKCk7XG4gIH1cblxuICBlbmZvcmNlU3RhdGUoY3JlYXRlZDogYm9vbGVhbikge1xuICAgIGlmIChjcmVhdGVkICYmICF0aGlzLl9jcmVhdGVkKSB7XG4gICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgIH0gZWxzZSBpZiAoIWNyZWF0ZWQgJiYgdGhpcy5fY3JlYXRlZCkge1xuICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKiBgYGBcbiAqICAgICA8Y29udGFpbmVyLWVsZW1lbnQgW25nU3dpdGNoXT1cInN3aXRjaF9leHByZXNzaW9uXCI+XG4gKiAgICAgICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoQ2FzZT1cIm1hdGNoX2V4cHJlc3Npb25fMlwiPi4uLjwvc29tZS1lbGVtZW50PlxuICogICAgICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hDYXNlPVwibWF0Y2hfZXhwcmVzc2lvbl8zXCI+Li4uPC9zb21lLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8bmctY29udGFpbmVyICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzNcIj5cbiAqICAgICAgICAgPCEtLSB1c2UgYSBuZy1jb250YWluZXIgdG8gZ3JvdXAgbXVsdGlwbGUgcm9vdCBub2RlcyAtLT5cbiAqICAgICAgICAgPGlubmVyLWVsZW1lbnQ+PC9pbm5lci1lbGVtZW50PlxuICogICAgICAgICA8aW5uZXItb3RoZXItZWxlbWVudD48L2lubmVyLW90aGVyLWVsZW1lbnQ+XG4gKiAgICAgICA8L25nLWNvbnRhaW5lcj5cbiAqICAgICAgIDxzb21lLWVsZW1lbnQgKm5nU3dpdGNoRGVmYXVsdD4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgICA8L2NvbnRhaW5lci1lbGVtZW50PlxuICogYGBgXG4gKiBAZGVzY3JpcHRpb25cbiAqXG4gKiBBZGRzIC8gcmVtb3ZlcyBET00gc3ViLXRyZWVzIHdoZW4gdGhlIG5lc3QgbWF0Y2ggZXhwcmVzc2lvbnMgbWF0Y2hlcyB0aGUgc3dpdGNoIGV4cHJlc3Npb24uXG4gKlxuICogYE5nU3dpdGNoYCBzdGFtcHMgb3V0IG5lc3RlZCB2aWV3cyB3aGVuIHRoZWlyIG1hdGNoIGV4cHJlc3Npb24gdmFsdWUgbWF0Y2hlcyB0aGUgdmFsdWUgb2YgdGhlXG4gKiBzd2l0Y2ggZXhwcmVzc2lvbi5cbiAqXG4gKiBJbiBvdGhlciB3b3JkczpcbiAqIC0geW91IGRlZmluZSBhIGNvbnRhaW5lciBlbGVtZW50ICh3aGVyZSB5b3UgcGxhY2UgdGhlIGRpcmVjdGl2ZSB3aXRoIGEgc3dpdGNoIGV4cHJlc3Npb24gb24gdGhlXG4gKiBgW25nU3dpdGNoXT1cIi4uLlwiYCBhdHRyaWJ1dGUpXG4gKiAtIHlvdSBkZWZpbmUgaW5uZXIgdmlld3MgaW5zaWRlIHRoZSBgTmdTd2l0Y2hgIGFuZCBwbGFjZSBhIGAqbmdTd2l0Y2hDYXNlYCBhdHRyaWJ1dGUgb24gdGhlIHZpZXdcbiAqIHJvb3QgZWxlbWVudHMuXG4gKlxuICogRWxlbWVudHMgd2l0aGluIGBOZ1N3aXRjaGAgYnV0IG91dHNpZGUgb2YgYSBgTmdTd2l0Y2hDYXNlYCBvciBgTmdTd2l0Y2hEZWZhdWx0YCBkaXJlY3RpdmVzIHdpbGxcbiAqIGJlIHByZXNlcnZlZCBhdCB0aGUgbG9jYXRpb24uXG4gKlxuICogVGhlIGBuZ1N3aXRjaENhc2VgIGRpcmVjdGl2ZSBpbmZvcm1zIHRoZSBwYXJlbnQgYE5nU3dpdGNoYCBvZiB3aGljaCB2aWV3IHRvIGRpc3BsYXkgd2hlbiB0aGVcbiAqIGV4cHJlc3Npb24gaXMgZXZhbHVhdGVkLlxuICogV2hlbiBubyBtYXRjaGluZyBleHByZXNzaW9uIGlzIGZvdW5kIG9uIGEgYG5nU3dpdGNoQ2FzZWAgdmlldywgdGhlIGBuZ1N3aXRjaERlZmF1bHRgIHZpZXcgaXNcbiAqIHN0YW1wZWQgb3V0LlxuICpcbiAqIEBwdWJsaWNBcGlcbiAqL1xuQERpcmVjdGl2ZSh7c2VsZWN0b3I6ICdbbmdTd2l0Y2hdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2gge1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfZGVmYXVsdFZpZXdzICE6IFN3aXRjaFZpZXdbXTtcbiAgcHJpdmF0ZSBfZGVmYXVsdFVzZWQgPSBmYWxzZTtcbiAgcHJpdmF0ZSBfY2FzZUNvdW50ID0gMDtcbiAgcHJpdmF0ZSBfbGFzdENhc2VDaGVja0luZGV4ID0gMDtcbiAgcHJpdmF0ZSBfbGFzdENhc2VzTWF0Y2hlZCA9IGZhbHNlO1xuICBwcml2YXRlIF9uZ1N3aXRjaDogYW55O1xuXG4gIEBJbnB1dCgpXG4gIHNldCBuZ1N3aXRjaChuZXdWYWx1ZTogYW55KSB7XG4gICAgdGhpcy5fbmdTd2l0Y2ggPSBuZXdWYWx1ZTtcbiAgICBpZiAodGhpcy5fY2FzZUNvdW50ID09PSAwKSB7XG4gICAgICB0aGlzLl91cGRhdGVEZWZhdWx0Q2FzZXModHJ1ZSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfYWRkQ2FzZSgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fY2FzZUNvdW50Kys7IH1cblxuICAvKiogQGludGVybmFsICovXG4gIF9hZGREZWZhdWx0KHZpZXc6IFN3aXRjaFZpZXcpIHtcbiAgICBpZiAoIXRoaXMuX2RlZmF1bHRWaWV3cykge1xuICAgICAgdGhpcy5fZGVmYXVsdFZpZXdzID0gW107XG4gICAgfVxuICAgIHRoaXMuX2RlZmF1bHRWaWV3cy5wdXNoKHZpZXcpO1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbWF0Y2hDYXNlKHZhbHVlOiBhbnkpOiBib29sZWFuIHtcbiAgICBjb25zdCBtYXRjaGVkID0gdmFsdWUgPT0gdGhpcy5fbmdTd2l0Y2g7XG4gICAgdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCA9IHRoaXMuX2xhc3RDYXNlc01hdGNoZWQgfHwgbWF0Y2hlZDtcbiAgICB0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXgrKztcbiAgICBpZiAodGhpcy5fbGFzdENhc2VDaGVja0luZGV4ID09PSB0aGlzLl9jYXNlQ291bnQpIHtcbiAgICAgIHRoaXMuX3VwZGF0ZURlZmF1bHRDYXNlcyghdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCk7XG4gICAgICB0aGlzLl9sYXN0Q2FzZUNoZWNrSW5kZXggPSAwO1xuICAgICAgdGhpcy5fbGFzdENhc2VzTWF0Y2hlZCA9IGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gbWF0Y2hlZDtcbiAgfVxuXG4gIHByaXZhdGUgX3VwZGF0ZURlZmF1bHRDYXNlcyh1c2VEZWZhdWx0OiBib29sZWFuKSB7XG4gICAgaWYgKHRoaXMuX2RlZmF1bHRWaWV3cyAmJiB1c2VEZWZhdWx0ICE9PSB0aGlzLl9kZWZhdWx0VXNlZCkge1xuICAgICAgdGhpcy5fZGVmYXVsdFVzZWQgPSB1c2VEZWZhdWx0O1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLl9kZWZhdWx0Vmlld3MubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZGVmYXVsdFZpZXcgPSB0aGlzLl9kZWZhdWx0Vmlld3NbaV07XG4gICAgICAgIGRlZmF1bHRWaWV3LmVuZm9yY2VTdGF0ZSh1c2VEZWZhdWx0KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxuLyoqXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqIDwvY29udGFpbmVyLWVsZW1lbnQ+XG4gKmBgYFxuICogQGRlc2NyaXB0aW9uXG4gKlxuICogQ3JlYXRlcyBhIHZpZXcgdGhhdCB3aWxsIGJlIGFkZGVkL3JlbW92ZWQgZnJvbSB0aGUgcGFyZW50IHtAbGluayBOZ1N3aXRjaH0gd2hlbiB0aGVcbiAqIGdpdmVuIGV4cHJlc3Npb24gZXZhbHVhdGUgdG8gcmVzcGVjdGl2ZWx5IHRoZSBzYW1lL2RpZmZlcmVudCB2YWx1ZSBhcyB0aGUgc3dpdGNoXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIEluc2VydCB0aGUgc3ViLXRyZWUgd2hlbiB0aGUgZXhwcmVzc2lvbiBldmFsdWF0ZXMgdG8gdGhlIHNhbWUgdmFsdWUgYXMgdGhlIGVuY2xvc2luZyBzd2l0Y2hcbiAqIGV4cHJlc3Npb24uXG4gKlxuICogSWYgbXVsdGlwbGUgbWF0Y2ggZXhwcmVzc2lvbnMgbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uIHZhbHVlLCBhbGwgb2YgdGhlbSBhcmUgZGlzcGxheWVkLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaENhc2VdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hDYXNlIGltcGxlbWVudHMgRG9DaGVjayB7XG4gIHByaXZhdGUgX3ZpZXc6IFN3aXRjaFZpZXc7XG5cbiAgQElucHV0KClcbiAgbmdTd2l0Y2hDYXNlOiBhbnk7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgcHJpdmF0ZSBuZ1N3aXRjaDogTmdTd2l0Y2gpIHtcbiAgICBuZ1N3aXRjaC5fYWRkQ2FzZSgpO1xuICAgIHRoaXMuX3ZpZXcgPSBuZXcgU3dpdGNoVmlldyh2aWV3Q29udGFpbmVyLCB0ZW1wbGF0ZVJlZik7XG4gIH1cblxuICBuZ0RvQ2hlY2soKSB7IHRoaXMuX3ZpZXcuZW5mb3JjZVN0YXRlKHRoaXMubmdTd2l0Y2guX21hdGNoQ2FzZSh0aGlzLm5nU3dpdGNoQ2FzZSkpOyB9XG59XG5cbi8qKlxuICogQG5nTW9kdWxlIENvbW1vbk1vZHVsZVxuICogQHVzYWdlTm90ZXNcbiAqIGBgYFxuICogPGNvbnRhaW5lci1lbGVtZW50IFtuZ1N3aXRjaF09XCJzd2l0Y2hfZXhwcmVzc2lvblwiPlxuICogICA8c29tZS1lbGVtZW50ICpuZ1N3aXRjaENhc2U9XCJtYXRjaF9leHByZXNzaW9uXzFcIj4uLi48L3NvbWUtZWxlbWVudD5cbiAqICAgPHNvbWUtb3RoZXItZWxlbWVudCAqbmdTd2l0Y2hEZWZhdWx0Pi4uLjwvc29tZS1vdGhlci1lbGVtZW50PlxuICogPC9jb250YWluZXItZWxlbWVudD5cbiAqIGBgYFxuICpcbiAqIEBkZXNjcmlwdGlvblxuICpcbiAqIENyZWF0ZXMgYSB2aWV3IHRoYXQgaXMgYWRkZWQgdG8gdGhlIHBhcmVudCB7QGxpbmsgTmdTd2l0Y2h9IHdoZW4gbm8gY2FzZSBleHByZXNzaW9uc1xuICogbWF0Y2ggdGhlIHN3aXRjaCBleHByZXNzaW9uLlxuICpcbiAqIEluc2VydCB0aGUgc3ViLXRyZWUgd2hlbiBubyBjYXNlIGV4cHJlc3Npb25zIGV2YWx1YXRlIHRvIHRoZSBzYW1lIHZhbHVlIGFzIHRoZSBlbmNsb3Npbmcgc3dpdGNoXG4gKiBleHByZXNzaW9uLlxuICpcbiAqIFNlZSB7QGxpbmsgTmdTd2l0Y2h9IGZvciBtb3JlIGRldGFpbHMgYW5kIGV4YW1wbGUuXG4gKlxuICogQHB1YmxpY0FwaVxuICovXG5ARGlyZWN0aXZlKHtzZWxlY3RvcjogJ1tuZ1N3aXRjaERlZmF1bHRdJ30pXG5leHBvcnQgY2xhc3MgTmdTd2l0Y2hEZWZhdWx0IHtcbiAgY29uc3RydWN0b3IoXG4gICAgICB2aWV3Q29udGFpbmVyOiBWaWV3Q29udGFpbmVyUmVmLCB0ZW1wbGF0ZVJlZjogVGVtcGxhdGVSZWY8T2JqZWN0PixcbiAgICAgIEBIb3N0KCkgbmdTd2l0Y2g6IE5nU3dpdGNoKSB7XG4gICAgbmdTd2l0Y2guX2FkZERlZmF1bHQobmV3IFN3aXRjaFZpZXcodmlld0NvbnRhaW5lciwgdGVtcGxhdGVSZWYpKTtcbiAgfVxufVxuIl19