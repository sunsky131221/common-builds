/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { createNgModuleRef, Directive, Injector, Input, NgModuleFactory, NgModuleRef, Type, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Instantiates a {@link Component} type and inserts its Host View into the current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will be destroyed.
 *
 * @usageNotes
 *
 * ### Fine tune control
 *
 * You can control the component creation process by using the following optional attributes:
 *
 * * `ngComponentOutletInjector`: Optional custom {@link Injector} that will be used as parent for
 * the Component. Defaults to the injector of the current view container.
 *
 * * `ngComponentOutletContent`: Optional list of projectable nodes to insert into the content
 * section of the component, if it exists.
 *
 * * `ngComponentOutletNgModule`: Optional NgModule class reference to allow loading another
 * module dynamically, then loading a component from that module.
 *
 * * `ngComponentOutletNgModuleFactory`: Deprecated config option that allows providing optional
 * NgModule factory to allow loading another module dynamically, then loading a component from that
 * module. Use `ngComponentOutletNgModule` instead.
 *
 * ### Syntax
 *
 * Simple
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression"></ng-container>
 * ```
 *
 * Customized injector/content
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   injector: injectorExpression;
 *                                   content: contentNodesExpression;">
 * </ng-container>
 * ```
 *
 * Customized NgModule reference
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModule: ngModuleClass;">
 * </ng-container>
 * ```
 *
 * ### A simple example
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='SimpleExample'}
 *
 * A more complete example with additional options:
 *
 * {@example common/ngComponentOutlet/ts/module.ts region='CompleteExample'}
 *
 * @publicApi
 * @ngModule CommonModule
 */
export class NgComponentOutlet {
    constructor(_viewContainerRef) {
        this._viewContainerRef = _viewContainerRef;
        this.ngComponentOutlet = null;
    }
    /** @nodoc */
    ngOnChanges(changes) {
        const { _viewContainerRef: viewContainerRef, ngComponentOutletNgModule: ngModule, ngComponentOutletNgModuleFactory: ngModuleFactory, } = this;
        viewContainerRef.clear();
        this._componentRef = undefined;
        if (this.ngComponentOutlet) {
            const injector = this.ngComponentOutletInjector || viewContainerRef.parentInjector;
            if (changes['ngComponentOutletNgModule'] || changes['ngComponentOutletNgModuleFactory']) {
                if (this._moduleRef)
                    this._moduleRef.destroy();
                if (ngModule) {
                    this._moduleRef = createNgModuleRef(ngModule, getParentInjector(injector));
                }
                else if (ngModuleFactory) {
                    this._moduleRef = ngModuleFactory.create(getParentInjector(injector));
                }
                else {
                    this._moduleRef = undefined;
                }
            }
            this._componentRef = viewContainerRef.createComponent(this.ngComponentOutlet, {
                index: viewContainerRef.length,
                injector,
                ngModuleRef: this._moduleRef,
                projectableNodes: this.ngComponentOutletContent,
            });
        }
    }
    /** @nodoc */
    ngOnDestroy() {
        if (this._moduleRef)
            this._moduleRef.destroy();
    }
}
NgComponentOutlet.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.1.0-next.2+sha-c1bb8bf", ngImport: i0, type: NgComponentOutlet, deps: [{ token: i0.ViewContainerRef }], target: i0.ɵɵFactoryTarget.Directive });
NgComponentOutlet.ɵdir = i0.ɵɵngDeclareDirective({ minVersion: "14.0.0", version: "14.1.0-next.2+sha-c1bb8bf", type: NgComponentOutlet, isStandalone: true, selector: "[ngComponentOutlet]", inputs: { ngComponentOutlet: "ngComponentOutlet", ngComponentOutletInjector: "ngComponentOutletInjector", ngComponentOutletContent: "ngComponentOutletContent", ngComponentOutletNgModule: "ngComponentOutletNgModule", ngComponentOutletNgModuleFactory: "ngComponentOutletNgModuleFactory" }, usesOnChanges: true, ngImport: i0 });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.1.0-next.2+sha-c1bb8bf", ngImport: i0, type: NgComponentOutlet, decorators: [{
            type: Directive,
            args: [{
                    selector: '[ngComponentOutlet]',
                    standalone: true,
                }]
        }], ctorParameters: function () { return [{ type: i0.ViewContainerRef }]; }, propDecorators: { ngComponentOutlet: [{
                type: Input
            }], ngComponentOutletInjector: [{
                type: Input
            }], ngComponentOutletContent: [{
                type: Input
            }], ngComponentOutletNgModule: [{
                type: Input
            }], ngComponentOutletNgModuleFactory: [{
                type: Input
            }] } });
// Helper function that returns an Injector instance of a parent NgModule.
function getParentInjector(injector) {
    const parentNgModule = injector.get(NgModuleRef);
    return parentNgModule.injector;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY29tcG9uZW50X291dGxldC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jb21wb25lbnRfb3V0bGV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7Ozs7R0FNRztBQUVILE9BQU8sRUFBZSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUF1QyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUMsTUFBTSxlQUFlLENBQUM7O0FBR3JMOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBMERHO0FBS0gsTUFBTSxPQUFPLGlCQUFpQjtJQWU1QixZQUFvQixpQkFBbUM7UUFBbkMsc0JBQWlCLEdBQWpCLGlCQUFpQixDQUFrQjtRQWQ5QyxzQkFBaUIsR0FBbUIsSUFBSSxDQUFDO0lBY1EsQ0FBQztJQUUzRCxhQUFhO0lBQ2IsV0FBVyxDQUFDLE9BQXNCO1FBQ2hDLE1BQU0sRUFDSixpQkFBaUIsRUFBRSxnQkFBZ0IsRUFDbkMseUJBQXlCLEVBQUUsUUFBUSxFQUNuQyxnQ0FBZ0MsRUFBRSxlQUFlLEdBQ2xELEdBQUcsSUFBSSxDQUFDO1FBQ1QsZ0JBQWdCLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDekIsSUFBSSxDQUFDLGFBQWEsR0FBRyxTQUFTLENBQUM7UUFFL0IsSUFBSSxJQUFJLENBQUMsaUJBQWlCLEVBQUU7WUFDMUIsTUFBTSxRQUFRLEdBQUcsSUFBSSxDQUFDLHlCQUF5QixJQUFJLGdCQUFnQixDQUFDLGNBQWMsQ0FBQztZQUVuRixJQUFJLE9BQU8sQ0FBQywyQkFBMkIsQ0FBQyxJQUFJLE9BQU8sQ0FBQyxrQ0FBa0MsQ0FBQyxFQUFFO2dCQUN2RixJQUFJLElBQUksQ0FBQyxVQUFVO29CQUFFLElBQUksQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBRS9DLElBQUksUUFBUSxFQUFFO29CQUNaLElBQUksQ0FBQyxVQUFVLEdBQUcsaUJBQWlCLENBQUMsUUFBUSxFQUFFLGlCQUFpQixDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUM7aUJBQzVFO3FCQUFNLElBQUksZUFBZSxFQUFFO29CQUMxQixJQUFJLENBQUMsVUFBVSxHQUFHLGVBQWUsQ0FBQyxNQUFNLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztpQkFDdkU7cUJBQU07b0JBQ0wsSUFBSSxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7aUJBQzdCO2FBQ0Y7WUFFRCxJQUFJLENBQUMsYUFBYSxHQUFHLGdCQUFnQixDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7Z0JBQzVFLEtBQUssRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNO2dCQUM5QixRQUFRO2dCQUNSLFdBQVcsRUFBRSxJQUFJLENBQUMsVUFBVTtnQkFDNUIsZ0JBQWdCLEVBQUUsSUFBSSxDQUFDLHdCQUF3QjthQUNoRCxDQUFDLENBQUM7U0FDSjtJQUNILENBQUM7SUFFRCxhQUFhO0lBQ2IsV0FBVztRQUNULElBQUksSUFBSSxDQUFDLFVBQVU7WUFBRSxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQ2pELENBQUM7O3lIQXREVSxpQkFBaUI7NkdBQWpCLGlCQUFpQjtzR0FBakIsaUJBQWlCO2tCQUo3QixTQUFTO21CQUFDO29CQUNULFFBQVEsRUFBRSxxQkFBcUI7b0JBQy9CLFVBQVUsRUFBRSxJQUFJO2lCQUNqQjt1R0FFVSxpQkFBaUI7c0JBQXpCLEtBQUs7Z0JBRUcseUJBQXlCO3NCQUFqQyxLQUFLO2dCQUNHLHdCQUF3QjtzQkFBaEMsS0FBSztnQkFFRyx5QkFBeUI7c0JBQWpDLEtBQUs7Z0JBSUcsZ0NBQWdDO3NCQUF4QyxLQUFLOztBQStDUiwwRUFBMEU7QUFDMUUsU0FBUyxpQkFBaUIsQ0FBQyxRQUFrQjtJQUMzQyxNQUFNLGNBQWMsR0FBRyxRQUFRLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDO0lBQ2pELE9BQU8sY0FBYyxDQUFDLFFBQVEsQ0FBQztBQUNqQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Q29tcG9uZW50UmVmLCBjcmVhdGVOZ01vZHVsZVJlZiwgRGlyZWN0aXZlLCBJbmplY3RvciwgSW5wdXQsIE5nTW9kdWxlRmFjdG9yeSwgTmdNb2R1bGVSZWYsIE9uQ2hhbmdlcywgT25EZXN0cm95LCBTaW1wbGVDaGFuZ2VzLCBUeXBlLCBWaWV3Q29udGFpbmVyUmVmfSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuXG4vKipcbiAqIEluc3RhbnRpYXRlcyBhIHtAbGluayBDb21wb25lbnR9IHR5cGUgYW5kIGluc2VydHMgaXRzIEhvc3QgVmlldyBpbnRvIHRoZSBjdXJyZW50IFZpZXcuXG4gKiBgTmdDb21wb25lbnRPdXRsZXRgIHByb3ZpZGVzIGEgZGVjbGFyYXRpdmUgYXBwcm9hY2ggZm9yIGR5bmFtaWMgY29tcG9uZW50IGNyZWF0aW9uLlxuICpcbiAqIGBOZ0NvbXBvbmVudE91dGxldGAgcmVxdWlyZXMgYSBjb21wb25lbnQgdHlwZSwgaWYgYSBmYWxzeSB2YWx1ZSBpcyBzZXQgdGhlIHZpZXcgd2lsbCBjbGVhciBhbmRcbiAqIGFueSBleGlzdGluZyBjb21wb25lbnQgd2lsbCBiZSBkZXN0cm95ZWQuXG4gKlxuICogQHVzYWdlTm90ZXNcbiAqXG4gKiAjIyMgRmluZSB0dW5lIGNvbnRyb2xcbiAqXG4gKiBZb3UgY2FuIGNvbnRyb2wgdGhlIGNvbXBvbmVudCBjcmVhdGlvbiBwcm9jZXNzIGJ5IHVzaW5nIHRoZSBmb2xsb3dpbmcgb3B0aW9uYWwgYXR0cmlidXRlczpcbiAqXG4gKiAqIGBuZ0NvbXBvbmVudE91dGxldEluamVjdG9yYDogT3B0aW9uYWwgY3VzdG9tIHtAbGluayBJbmplY3Rvcn0gdGhhdCB3aWxsIGJlIHVzZWQgYXMgcGFyZW50IGZvclxuICogdGhlIENvbXBvbmVudC4gRGVmYXVsdHMgdG8gdGhlIGluamVjdG9yIG9mIHRoZSBjdXJyZW50IHZpZXcgY29udGFpbmVyLlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0Q29udGVudGA6IE9wdGlvbmFsIGxpc3Qgb2YgcHJvamVjdGFibGUgbm9kZXMgdG8gaW5zZXJ0IGludG8gdGhlIGNvbnRlbnRcbiAqIHNlY3Rpb24gb2YgdGhlIGNvbXBvbmVudCwgaWYgaXQgZXhpc3RzLlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVgOiBPcHRpb25hbCBOZ01vZHVsZSBjbGFzcyByZWZlcmVuY2UgdG8gYWxsb3cgbG9hZGluZyBhbm90aGVyXG4gKiBtb2R1bGUgZHluYW1pY2FsbHksIHRoZW4gbG9hZGluZyBhIGNvbXBvbmVudCBmcm9tIHRoYXQgbW9kdWxlLlxuICpcbiAqICogYG5nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGVGYWN0b3J5YDogRGVwcmVjYXRlZCBjb25maWcgb3B0aW9uIHRoYXQgYWxsb3dzIHByb3ZpZGluZyBvcHRpb25hbFxuICogTmdNb2R1bGUgZmFjdG9yeSB0byBhbGxvdyBsb2FkaW5nIGFub3RoZXIgbW9kdWxlIGR5bmFtaWNhbGx5LCB0aGVuIGxvYWRpbmcgYSBjb21wb25lbnQgZnJvbSB0aGF0XG4gKiBtb2R1bGUuIFVzZSBgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZWAgaW5zdGVhZC5cbiAqXG4gKiAjIyMgU3ludGF4XG4gKlxuICogU2ltcGxlXG4gKiBgYGBcbiAqIDxuZy1jb250YWluZXIgKm5nQ29tcG9uZW50T3V0bGV0PVwiY29tcG9uZW50VHlwZUV4cHJlc3Npb25cIj48L25nLWNvbnRhaW5lcj5cbiAqIGBgYFxuICpcbiAqIEN1c3RvbWl6ZWQgaW5qZWN0b3IvY29udGVudFxuICogYGBgXG4gKiA8bmctY29udGFpbmVyICpuZ0NvbXBvbmVudE91dGxldD1cImNvbXBvbmVudFR5cGVFeHByZXNzaW9uO1xuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluamVjdG9yOiBpbmplY3RvckV4cHJlc3Npb247XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29udGVudDogY29udGVudE5vZGVzRXhwcmVzc2lvbjtcIj5cbiAqIDwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogQ3VzdG9taXplZCBOZ01vZHVsZSByZWZlcmVuY2VcbiAqIGBgYFxuICogPG5nLWNvbnRhaW5lciAqbmdDb21wb25lbnRPdXRsZXQ9XCJjb21wb25lbnRUeXBlRXhwcmVzc2lvbjtcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZ01vZHVsZTogbmdNb2R1bGVDbGFzcztcIj5cbiAqIDwvbmctY29udGFpbmVyPlxuICogYGBgXG4gKlxuICogIyMjIEEgc2ltcGxlIGV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL25nQ29tcG9uZW50T3V0bGV0L3RzL21vZHVsZS50cyByZWdpb249J1NpbXBsZUV4YW1wbGUnfVxuICpcbiAqIEEgbW9yZSBjb21wbGV0ZSBleGFtcGxlIHdpdGggYWRkaXRpb25hbCBvcHRpb25zOlxuICpcbiAqIHtAZXhhbXBsZSBjb21tb24vbmdDb21wb25lbnRPdXRsZXQvdHMvbW9kdWxlLnRzIHJlZ2lvbj0nQ29tcGxldGVFeGFtcGxlJ31cbiAqXG4gKiBAcHVibGljQXBpXG4gKiBAbmdNb2R1bGUgQ29tbW9uTW9kdWxlXG4gKi9cbkBEaXJlY3RpdmUoe1xuICBzZWxlY3RvcjogJ1tuZ0NvbXBvbmVudE91dGxldF0nLFxuICBzdGFuZGFsb25lOiB0cnVlLFxufSlcbmV4cG9ydCBjbGFzcyBOZ0NvbXBvbmVudE91dGxldCBpbXBsZW1lbnRzIE9uQ2hhbmdlcywgT25EZXN0cm95IHtcbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXQ6IFR5cGU8YW55PnxudWxsID0gbnVsbDtcblxuICBASW5wdXQoKSBuZ0NvbXBvbmVudE91dGxldEluamVjdG9yPzogSW5qZWN0b3I7XG4gIEBJbnB1dCgpIG5nQ29tcG9uZW50T3V0bGV0Q29udGVudD86IGFueVtdW107XG5cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZT86IFR5cGU8YW55PjtcbiAgLyoqXG4gICAqIEBkZXByZWNhdGVkIFRoaXMgaW5wdXQgaXMgZGVwcmVjYXRlZCwgdXNlIGBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlYCBpbnN0ZWFkLlxuICAgKi9cbiAgQElucHV0KCkgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZUZhY3Rvcnk/OiBOZ01vZHVsZUZhY3Rvcnk8YW55PjtcblxuICBwcml2YXRlIF9jb21wb25lbnRSZWY6IENvbXBvbmVudFJlZjxhbnk+fHVuZGVmaW5lZDtcbiAgcHJpdmF0ZSBfbW9kdWxlUmVmOiBOZ01vZHVsZVJlZjxhbnk+fHVuZGVmaW5lZDtcblxuICBjb25zdHJ1Y3Rvcihwcml2YXRlIF92aWV3Q29udGFpbmVyUmVmOiBWaWV3Q29udGFpbmVyUmVmKSB7fVxuXG4gIC8qKiBAbm9kb2MgKi9cbiAgbmdPbkNoYW5nZXMoY2hhbmdlczogU2ltcGxlQ2hhbmdlcykge1xuICAgIGNvbnN0IHtcbiAgICAgIF92aWV3Q29udGFpbmVyUmVmOiB2aWV3Q29udGFpbmVyUmVmLFxuICAgICAgbmdDb21wb25lbnRPdXRsZXROZ01vZHVsZTogbmdNb2R1bGUsXG4gICAgICBuZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeTogbmdNb2R1bGVGYWN0b3J5LFxuICAgIH0gPSB0aGlzO1xuICAgIHZpZXdDb250YWluZXJSZWYuY2xlYXIoKTtcbiAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB1bmRlZmluZWQ7XG5cbiAgICBpZiAodGhpcy5uZ0NvbXBvbmVudE91dGxldCkge1xuICAgICAgY29uc3QgaW5qZWN0b3IgPSB0aGlzLm5nQ29tcG9uZW50T3V0bGV0SW5qZWN0b3IgfHwgdmlld0NvbnRhaW5lclJlZi5wYXJlbnRJbmplY3RvcjtcblxuICAgICAgaWYgKGNoYW5nZXNbJ25nQ29tcG9uZW50T3V0bGV0TmdNb2R1bGUnXSB8fCBjaGFuZ2VzWyduZ0NvbXBvbmVudE91dGxldE5nTW9kdWxlRmFjdG9yeSddKSB7XG4gICAgICAgIGlmICh0aGlzLl9tb2R1bGVSZWYpIHRoaXMuX21vZHVsZVJlZi5kZXN0cm95KCk7XG5cbiAgICAgICAgaWYgKG5nTW9kdWxlKSB7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gY3JlYXRlTmdNb2R1bGVSZWYobmdNb2R1bGUsIGdldFBhcmVudEluamVjdG9yKGluamVjdG9yKSk7XG4gICAgICAgIH0gZWxzZSBpZiAobmdNb2R1bGVGYWN0b3J5KSB7XG4gICAgICAgICAgdGhpcy5fbW9kdWxlUmVmID0gbmdNb2R1bGVGYWN0b3J5LmNyZWF0ZShnZXRQYXJlbnRJbmplY3RvcihpbmplY3RvcikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX21vZHVsZVJlZiA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICB0aGlzLl9jb21wb25lbnRSZWYgPSB2aWV3Q29udGFpbmVyUmVmLmNyZWF0ZUNvbXBvbmVudCh0aGlzLm5nQ29tcG9uZW50T3V0bGV0LCB7XG4gICAgICAgIGluZGV4OiB2aWV3Q29udGFpbmVyUmVmLmxlbmd0aCxcbiAgICAgICAgaW5qZWN0b3IsXG4gICAgICAgIG5nTW9kdWxlUmVmOiB0aGlzLl9tb2R1bGVSZWYsXG4gICAgICAgIHByb2plY3RhYmxlTm9kZXM6IHRoaXMubmdDb21wb25lbnRPdXRsZXRDb250ZW50LFxuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgLyoqIEBub2RvYyAqL1xuICBuZ09uRGVzdHJveSgpIHtcbiAgICBpZiAodGhpcy5fbW9kdWxlUmVmKSB0aGlzLl9tb2R1bGVSZWYuZGVzdHJveSgpO1xuICB9XG59XG5cbi8vIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gSW5qZWN0b3IgaW5zdGFuY2Ugb2YgYSBwYXJlbnQgTmdNb2R1bGUuXG5mdW5jdGlvbiBnZXRQYXJlbnRJbmplY3RvcihpbmplY3RvcjogSW5qZWN0b3IpOiBJbmplY3RvciB7XG4gIGNvbnN0IHBhcmVudE5nTW9kdWxlID0gaW5qZWN0b3IuZ2V0KE5nTW9kdWxlUmVmKTtcbiAgcmV0dXJuIHBhcmVudE5nTW9kdWxlLmluamVjdG9yO1xufVxuIl19