/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Injector, NgModuleFactory, OnChanges, OnDestroy, SimpleChanges, Type, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * Instantiates a single {@link Component} type and inserts its Host View into current View.
 * `NgComponentOutlet` provides a declarative approach for dynamic component creation.
 *
 * `NgComponentOutlet` requires a component type, if a falsy value is set the view will clear and
 * any existing component will get destroyed.
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
 * section of the component, if exists.
 *
 * * `ngComponentOutletNgModuleFactory`: Optional module factory to allow dynamically loading other
 * module, then load a component from that module.
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
 * Customized ngModuleFactory
 * ```
 * <ng-container *ngComponentOutlet="componentTypeExpression;
 *                                   ngModuleFactory: moduleFactory;">
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
export declare class NgComponentOutlet implements OnChanges, OnDestroy {
    private _viewContainerRef;
    ngComponentOutlet: Type<any>;
    ngComponentOutletInjector: Injector;
    ngComponentOutletContent: any[][];
    ngComponentOutletNgModuleFactory: NgModuleFactory<any>;
    private _componentRef;
    private _moduleRef;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    ngOnDestroy(): void;
    static ngDirectiveDef: i0.ɵDirectiveDefWithMeta<NgComponentOutlet, "[ngComponentOutlet]", never, { 'ngComponentOutlet': "ngComponentOutlet", 'ngComponentOutletInjector': "ngComponentOutletInjector", 'ngComponentOutletContent': "ngComponentOutletContent", 'ngComponentOutletNgModuleFactory': "ngComponentOutletNgModuleFactory" }, {}, never>;
}
