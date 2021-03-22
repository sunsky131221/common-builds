/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { OnChanges, SimpleChanges, TemplateRef, ViewContainerRef } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 *
 * @description
 *
 * Inserts an embedded view from a prepared `TemplateRef`.
 *
 * You can attach a context object to the `EmbeddedViewRef` by setting `[ngTemplateOutletContext]`.
 * `[ngTemplateOutletContext]` should be an object, the object's keys will be available for binding
 * by the local template `let` declarations.
 *
 * @usageNotes
 * ```
 * <ng-container *ngTemplateOutlet="templateRefExp; context: contextExp"></ng-container>
 * ```
 *
 * Using the key `$implicit` in the context object will set its value as default.
 *
 * ### Example
 *
 * {@example common/ngTemplateOutlet/ts/module.ts region='NgTemplateOutlet'}
 *
 * @publicApi
 */
export declare class NgTemplateOutlet implements OnChanges {
    private _viewContainerRef;
    private _viewRef;
    /**
     * A context object to attach to the {@link EmbeddedViewRef}. This should be an
     * object, the object's keys will be available for binding by the local template `let`
     * declarations.
     * Using the key `$implicit` in the context object will set its value as default.
     */
    ngTemplateOutletContext: Object | null;
    /**
     * A string defining the template reference and optionally the context object for the template.
     */
    ngTemplateOutlet: TemplateRef<any> | null;
    constructor(_viewContainerRef: ViewContainerRef);
    ngOnChanges(changes: SimpleChanges): void;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgTemplateOutlet, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgTemplateOutlet, "[ngTemplateOutlet]", never, { "ngTemplateOutletContext": "ngTemplateOutletContext"; "ngTemplateOutlet": "ngTemplateOutlet"; }, {}, never>;
}
