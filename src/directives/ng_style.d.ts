/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { DoCheck, ElementRef, KeyValueDiffers, Renderer2 } from '@angular/core';
import * as i0 from "@angular/core";
/**
 * @ngModule CommonModule
 *
 * @usageNotes
 *
 * Set the font of the containing element to the result of an expression.
 *
 * ```
 * <some-element [ngStyle]="{'font-style': styleExp}">...</some-element>
 * ```
 *
 * Set the width of the containing element to a pixel value returned by an expression.
 *
 * ```
 * <some-element [ngStyle]="{'max-width.px': widthExp}">...</some-element>
 * ```
 *
 * Set a collection of style values using an expression that returns key-value pairs.
 *
 * ```
 * <some-element [ngStyle]="objExp">...</some-element>
 * ```
 *
 * @description
 *
 * An attribute directive that updates styles for the containing HTML element.
 * Sets one or more style properties, specified as colon-separated key-value pairs.
 * The key is a style name, with an optional `.<unit>` suffix
 * (such as 'top.px', 'font-style.em').
 * The value is an expression to be evaluated.
 * The resulting non-null value, expressed in the given unit,
 * is assigned to the given style property.
 * If the result of evaluation is null, the corresponding style is removed.
 *
 * @publicApi
 */
export declare class NgStyle implements DoCheck {
    private _ngEl;
    private _differs;
    private _renderer;
    private _ngStyle;
    private _differ;
    constructor(_ngEl: ElementRef, _differs: KeyValueDiffers, _renderer: Renderer2);
    set ngStyle(values: {
        [klass: string]: any;
    } | null);
    ngDoCheck(): void;
    private _setStyle;
    private _applyChanges;
    static ɵfac: i0.ɵɵFactoryDeclaration<NgStyle, never>;
    static ɵdir: i0.ɵɵDirectiveDeclaration<NgStyle, "[ngStyle]", never, { "ngStyle": "ngStyle"; }, {}, never>;
}
