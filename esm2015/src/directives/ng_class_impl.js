/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { ElementRef, Injectable, IterableDiffers, KeyValueDiffers, Renderer2, ɵisListLikeIterable as isListLikeIterable, ɵstringify as stringify } from '@angular/core';
import { StylingDiffer } from './styling_differ';
/**
 * Used as a token for an injected service within the NgClass directive.
 *
 * NgClass behaves differenly whether or not VE is being used or not. If
 * present then the legacy ngClass diffing algorithm will be used as an
 * injected service. Otherwise the new diffing algorithm (which delegates
 * to the `[class]` binding) will be used. This toggle behavior is done so
 * via the ivy_switch mechanism.
 * @abstract
 */
export class NgClassImpl {
}
if (false) {
    /**
     * @abstract
     * @param {?} value
     * @return {?}
     */
    NgClassImpl.prototype.setClass = function (value) { };
    /**
     * @abstract
     * @param {?} value
     * @return {?}
     */
    NgClassImpl.prototype.setNgClass = function (value) { };
    /**
     * @abstract
     * @return {?}
     */
    NgClassImpl.prototype.applyChanges = function () { };
    /**
     * @abstract
     * @return {?}
     */
    NgClassImpl.prototype.getValue = function () { };
}
export class NgClassR2Impl {
    /**
     * @param {?} _iterableDiffers
     * @param {?} _keyValueDiffers
     * @param {?} _ngEl
     * @param {?} _renderer
     */
    constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
        this._iterableDiffers = _iterableDiffers;
        this._keyValueDiffers = _keyValueDiffers;
        this._ngEl = _ngEl;
        this._renderer = _renderer;
        this._initialClasses = [];
    }
    /**
     * @return {?}
     */
    getValue() { return null; }
    /**
     * @param {?} value
     * @return {?}
     */
    setClass(value) {
        this._removeClasses(this._initialClasses);
        this._initialClasses = typeof value === 'string' ? value.split(/\s+/) : [];
        this._applyClasses(this._initialClasses);
        this._applyClasses(this._rawClass);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setNgClass(value) {
        this._removeClasses(this._rawClass);
        this._applyClasses(this._initialClasses);
        this._iterableDiffer = null;
        this._keyValueDiffer = null;
        this._rawClass = typeof value === 'string' ? value.split(/\s+/) : value;
        if (this._rawClass) {
            if (isListLikeIterable(this._rawClass)) {
                this._iterableDiffer = this._iterableDiffers.find(this._rawClass).create();
            }
            else {
                this._keyValueDiffer = this._keyValueDiffers.find(this._rawClass).create();
            }
        }
    }
    /**
     * @return {?}
     */
    applyChanges() {
        if (this._iterableDiffer) {
            /** @type {?} */
            const iterableChanges = this._iterableDiffer.diff((/** @type {?} */ (this._rawClass)));
            if (iterableChanges) {
                this._applyIterableChanges(iterableChanges);
            }
        }
        else if (this._keyValueDiffer) {
            /** @type {?} */
            const keyValueChanges = this._keyValueDiffer.diff((/** @type {?} */ (this._rawClass)));
            if (keyValueChanges) {
                this._applyKeyValueChanges(keyValueChanges);
            }
        }
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyKeyValueChanges(changes) {
        changes.forEachAddedItem((record) => this._toggleClass(record.key, record.currentValue));
        changes.forEachChangedItem((record) => this._toggleClass(record.key, record.currentValue));
        changes.forEachRemovedItem((record) => {
            if (record.previousValue) {
                this._toggleClass(record.key, false);
            }
        });
    }
    /**
     * @private
     * @param {?} changes
     * @return {?}
     */
    _applyIterableChanges(changes) {
        changes.forEachAddedItem((record) => {
            if (typeof record.item === 'string') {
                this._toggleClass(record.item, true);
            }
            else {
                throw new Error(`NgClass can only toggle CSS classes expressed as strings, got ${stringify(record.item)}`);
            }
        });
        changes.forEachRemovedItem((record) => this._toggleClass(record.item, false));
    }
    /**
     * Applies a collection of CSS classes to the DOM element.
     *
     * For argument of type Set and Array CSS class names contained in those collections are always
     * added.
     * For argument of type Map CSS class name in the map's key is toggled based on the value (added
     * for truthy and removed for falsy).
     * @private
     * @param {?} rawClassVal
     * @return {?}
     */
    _applyClasses(rawClassVal) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((/** @type {?} */ (rawClassVal))).forEach((klass) => this._toggleClass(klass, true));
            }
            else {
                Object.keys(rawClassVal).forEach(klass => this._toggleClass(klass, !!rawClassVal[klass]));
            }
        }
    }
    /**
     * Removes a collection of CSS classes from the DOM element. This is mostly useful for cleanup
     * purposes.
     * @private
     * @param {?} rawClassVal
     * @return {?}
     */
    _removeClasses(rawClassVal) {
        if (rawClassVal) {
            if (Array.isArray(rawClassVal) || rawClassVal instanceof Set) {
                ((/** @type {?} */ (rawClassVal))).forEach((klass) => this._toggleClass(klass, false));
            }
            else {
                Object.keys(rawClassVal).forEach(klass => this._toggleClass(klass, false));
            }
        }
    }
    /**
     * @private
     * @param {?} klass
     * @param {?} enabled
     * @return {?}
     */
    _toggleClass(klass, enabled) {
        klass = klass.trim();
        if (klass) {
            klass.split(/\s+/g).forEach(klass => {
                if (enabled) {
                    this._renderer.addClass(this._ngEl.nativeElement, klass);
                }
                else {
                    this._renderer.removeClass(this._ngEl.nativeElement, klass);
                }
            });
        }
    }
}
NgClassR2Impl.decorators = [
    { type: Injectable }
];
/** @nocollapse */
NgClassR2Impl.ctorParameters = () => [
    { type: IterableDiffers },
    { type: KeyValueDiffers },
    { type: ElementRef },
    { type: Renderer2 }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._iterableDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._keyValueDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._initialClasses;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._rawClass;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._iterableDiffers;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._keyValueDiffers;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._ngEl;
    /**
     * @type {?}
     * @private
     */
    NgClassR2Impl.prototype._renderer;
}
export class NgClassR3Impl {
    constructor() {
        this._value = null;
        this._ngClassDiffer = new StylingDiffer('NgClass', 1 /* TrimProperties */ |
            2 /* AllowSubKeys */ |
            4 /* AllowStringValue */ | 16 /* ForceAsMap */);
        this._classStringDiffer = null;
    }
    /**
     * @return {?}
     */
    getValue() { return this._value; }
    /**
     * @param {?} value
     * @return {?}
     */
    setClass(value) {
        // early exit incase the binding gets emitted as an empty value which
        // means there is no reason to instantiate and diff the values...
        if (!value && !this._classStringDiffer)
            return;
        this._classStringDiffer = this._classStringDiffer ||
            new StylingDiffer('class', 4 /* AllowStringValue */ | 16 /* ForceAsMap */);
        this._classStringDiffer.setValue(value);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    setNgClass(value) {
        this._ngClassDiffer.setValue(value);
    }
    /**
     * @return {?}
     */
    applyChanges() {
        /** @type {?} */
        const classChanged = this._classStringDiffer ? this._classStringDiffer.hasValueChanged() : false;
        /** @type {?} */
        const ngClassChanged = this._ngClassDiffer.hasValueChanged();
        if (classChanged || ngClassChanged) {
            /** @type {?} */
            let value = this._ngClassDiffer.value;
            if (this._classStringDiffer) {
                /** @type {?} */
                let classValue = this._classStringDiffer.value;
                if (classValue) {
                    value = value ? Object.assign({}, classValue, value) : classValue;
                }
            }
            this._value = value;
        }
    }
}
NgClassR3Impl.decorators = [
    { type: Injectable }
];
if (false) {
    /**
     * @type {?}
     * @private
     */
    NgClassR3Impl.prototype._value;
    /**
     * @type {?}
     * @private
     */
    NgClassR3Impl.prototype._ngClassDiffer;
    /**
     * @type {?}
     * @private
     */
    NgClassR3Impl.prototype._classStringDiffer;
}
// the implementation for both NgStyleR2Impl and NgStyleR3Impl are
// not ivy_switch'd away, instead they are only hooked up into the
// DI via NgStyle's directive's provider property.
/** @type {?} */
export const NgClassImplProvider__PRE_R3__ = {
    provide: NgClassImpl,
    useClass: NgClassR2Impl
};
/** @type {?} */
export const NgClassImplProvider__POST_R3__ = {
    provide: NgClassImpl,
    useClass: NgClassR3Impl
};
/** @type {?} */
export const NgClassImplProvider = NgClassImplProvider__PRE_R3__;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmdfY2xhc3NfaW1wbC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvZGlyZWN0aXZlcy9uZ19jbGFzc19pbXBsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBT0EsT0FBTyxFQUFDLFVBQVUsRUFBRSxVQUFVLEVBQW1DLGVBQWUsRUFBbUMsZUFBZSxFQUFFLFNBQVMsRUFBRSxtQkFBbUIsSUFBSSxrQkFBa0IsRUFBRSxVQUFVLElBQUksU0FBUyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRXhPLE9BQU8sRUFBQyxhQUFhLEVBQXVCLE1BQU0sa0JBQWtCLENBQUM7Ozs7Ozs7Ozs7O0FBV3JFLE1BQU0sT0FBZ0IsV0FBVztDQUtoQzs7Ozs7OztJQUpDLHNEQUF1Qzs7Ozs7O0lBQ3ZDLHdEQUFxRjs7Ozs7SUFDckYscURBQThCOzs7OztJQUM5QixpREFBK0M7O0FBSWpELE1BQU0sT0FBTyxhQUFhOzs7Ozs7O0lBU3hCLFlBQ1ksZ0JBQWlDLEVBQVUsZ0JBQWlDLEVBQzVFLEtBQWlCLEVBQVUsU0FBb0I7UUFEL0MscUJBQWdCLEdBQWhCLGdCQUFnQixDQUFpQjtRQUFVLHFCQUFnQixHQUFoQixnQkFBZ0IsQ0FBaUI7UUFDNUUsVUFBSyxHQUFMLEtBQUssQ0FBWTtRQUFVLGNBQVMsR0FBVCxTQUFTLENBQVc7UUFObkQsb0JBQWUsR0FBYSxFQUFFLENBQUM7SUFNdUIsQ0FBQzs7OztJQUUvRCxRQUFRLEtBQUssT0FBTyxJQUFJLENBQUMsQ0FBQyxDQUFDOzs7OztJQUUzQixRQUFRLENBQUMsS0FBYTtRQUNwQixJQUFJLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUMxQyxJQUFJLENBQUMsZUFBZSxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxD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Ozs7O0lBRVQsK0JBQXFEOzs7OztJQUNyRCx1Q0FHc0Y7Ozs7O0lBQ3RGLDJDQUFnRjs7Ozs7O0FBdUNsRixNQUFNLE9BQU8sNkJBQTZCLEdBQUc7SUFDM0MsT0FBTyxFQUFFLFdBQVc7SUFDcEIsUUFBUSxFQUFFLGFBQWE7Q0FDeEI7O0FBRUQsTUFBTSxPQUFPLDhCQUE4QixHQUFHO0lBQzVDLE9BQU8sRUFBRSxXQUFXO0lBQ3BCLFFBQVEsRUFBRSxhQUFhO0NBQ3hCOztBQUVELE1BQU0sT0FBTyxtQkFBbUIsR0FBRyw2QkFBNkIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIEluYy4gQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5pbXBvcnQge0VsZW1lbnRSZWYsIEluamVjdGFibGUsIEl0ZXJhYmxlQ2hhbmdlcywgSXRlcmFibGVEaWZmZXIsIEl0ZXJhYmxlRGlmZmVycywgS2V5VmFsdWVDaGFuZ2VzLCBLZXlWYWx1ZURpZmZlciwgS2V5VmFsdWVEaWZmZXJzLCBSZW5kZXJlcjIsIMm1aXNMaXN0TGlrZUl0ZXJhYmxlIGFzIGlzTGlzdExpa2VJdGVyYWJsZSwgybVzdHJpbmdpZnkgYXMgc3RyaW5naWZ5fSBmcm9tICdAYW5ndWxhci9jb3JlJztcblxuaW1wb3J0IHtTdHlsaW5nRGlmZmVyLCBTdHlsaW5nRGlmZmVyT3B0aW9uc30gZnJvbSAnLi9zdHlsaW5nX2RpZmZlcic7XG5cbi8qKlxuICogVXNlZCBhcyBhIHRva2VuIGZvciBhbiBpbmplY3RlZCBzZXJ2aWNlIHdpdGhpbiB0aGUgTmdDbGFzcyBkaXJlY3RpdmUuXG4gKlxuICogTmdDbGFzcyBiZWhhdmVzIGRpZmZlcmVubHkgd2hldGhlciBvciBub3QgVkUgaXMgYmVpbmcgdXNlZCBvciBub3QuIElmXG4gKiBwcmVzZW50IHRoZW4gdGhlIGxlZ2FjeSBuZ0NsYXNzIGRpZmZpbmcgYWxnb3JpdGhtIHdpbGwgYmUgdXNlZCBhcyBhblxuICogaW5qZWN0ZWQgc2VydmljZS4gT3RoZXJ3aXNlIHRoZSBuZXcgZGlmZmluZyBhbGdvcml0aG0gKHdoaWNoIGRlbGVnYXRlc1xuICogdG8gdGhlIGBbY2xhc3NdYCBiaW5kaW5nKSB3aWxsIGJlIHVzZWQuIFRoaXMgdG9nZ2xlIGJlaGF2aW9yIGlzIGRvbmUgc29cbiAqIHZpYSB0aGUgaXZ5X3N3aXRjaCBtZWNoYW5pc20uXG4gKi9cbmV4cG9ydCBhYnN0cmFjdCBjbGFzcyBOZ0NsYXNzSW1wbCB7XG4gIGFic3RyYWN0IHNldENsYXNzKHZhbHVlOiBzdHJpbmcpOiB2b2lkO1xuICBhYnN0cmFjdCBzZXROZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSk6IHZvaWQ7XG4gIGFic3RyYWN0IGFwcGx5Q2hhbmdlcygpOiB2b2lkO1xuICBhYnN0cmFjdCBnZXRWYWx1ZSgpOiB7W2tleTogc3RyaW5nXTogYW55fXxudWxsO1xufVxuXG5ASW5qZWN0YWJsZSgpXG5leHBvcnQgY2xhc3MgTmdDbGFzc1IySW1wbCBpbXBsZW1lbnRzIE5nQ2xhc3NJbXBsIHtcbiAgLy8gVE9ETyhpc3N1ZS8yNDU3MSk6IHJlbW92ZSAnIScuXG4gIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyICE6IEl0ZXJhYmxlRGlmZmVyPHN0cmluZz58IG51bGw7XG4gIC8vIFRPRE8oaXNzdWUvMjQ1NzEpOiByZW1vdmUgJyEnLlxuICBwcml2YXRlIF9rZXlWYWx1ZURpZmZlciAhOiBLZXlWYWx1ZURpZmZlcjxzdHJpbmcsIGFueT58IG51bGw7XG4gIHByaXZhdGUgX2luaXRpYWxDbGFzc2VzOiBzdHJpbmdbXSA9IFtdO1xuICAvLyBUT0RPKGlzc3VlLzI0NTcxKTogcmVtb3ZlICchJy5cbiAgcHJpdmF0ZSBfcmF3Q2xhc3MgITogc3RyaW5nW10gfCBTZXQ8c3RyaW5nPnwge1trbGFzczogc3RyaW5nXTogYW55fTtcblxuICBjb25zdHJ1Y3RvcihcbiAgICAgIHByaXZhdGUgX2l0ZXJhYmxlRGlmZmVyczogSXRlcmFibGVEaWZmZXJzLCBwcml2YXRlIF9rZXlWYWx1ZURpZmZlcnM6IEtleVZhbHVlRGlmZmVycyxcbiAgICAgIHByaXZhdGUgX25nRWw6IEVsZW1lbnRSZWYsIHByaXZhdGUgX3JlbmRlcmVyOiBSZW5kZXJlcjIpIHt9XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiBudWxsOyB9XG5cbiAgc2V0Q2xhc3ModmFsdWU6IHN0cmluZykge1xuICAgIHRoaXMuX3JlbW92ZUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuICAgIHRoaXMuX2luaXRpYWxDbGFzc2VzID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnNwbGl0KC9cXHMrLykgOiBbXTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuICAgIHRoaXMuX2FwcGx5Q2xhc3Nlcyh0aGlzLl9yYXdDbGFzcyk7XG4gIH1cblxuICBzZXROZ0NsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9yZW1vdmVDbGFzc2VzKHRoaXMuX3Jhd0NsYXNzKTtcbiAgICB0aGlzLl9hcHBseUNsYXNzZXModGhpcy5faW5pdGlhbENsYXNzZXMpO1xuXG4gICAgdGhpcy5faXRlcmFibGVEaWZmZXIgPSBudWxsO1xuICAgIHRoaXMuX2tleVZhbHVlRGlmZmVyID0gbnVsbDtcblxuICAgIHRoaXMuX3Jhd0NsYXNzID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyA/IHZhbHVlLnNwbGl0KC9cXHMrLykgOiB2YWx1ZTtcblxuICAgIGlmICh0aGlzLl9yYXdDbGFzcykge1xuICAgICAgaWYgKGlzTGlzdExpa2VJdGVyYWJsZSh0aGlzLl9yYXdDbGFzcykpIHtcbiAgICAgICAgdGhpcy5faXRlcmFibGVEaWZmZXIgPSB0aGlzLl9pdGVyYWJsZURpZmZlcnMuZmluZCh0aGlzLl9yYXdDbGFzcykuY3JlYXRlKCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLl9rZXlWYWx1ZURpZmZlciA9IHRoaXMuX2tleVZhbHVlRGlmZmVycy5maW5kKHRoaXMuX3Jhd0NsYXNzKS5jcmVhdGUoKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBhcHBseUNoYW5nZXMoKSB7XG4gICAgaWYgKHRoaXMuX2l0ZXJhYmxlRGlmZmVyKSB7XG4gICAgICBjb25zdCBpdGVyYWJsZUNoYW5nZXMgPSB0aGlzLl9pdGVyYWJsZURpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzIGFzIHN0cmluZ1tdKTtcbiAgICAgIGlmIChpdGVyYWJsZUNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlJdGVyYWJsZUNoYW5nZXMoaXRlcmFibGVDaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHRoaXMuX2tleVZhbHVlRGlmZmVyKSB7XG4gICAgICBjb25zdCBrZXlWYWx1ZUNoYW5nZXMgPSB0aGlzLl9rZXlWYWx1ZURpZmZlci5kaWZmKHRoaXMuX3Jhd0NsYXNzIGFze1trOiBzdHJpbmddOiBhbnl9KTtcbiAgICAgIGlmIChrZXlWYWx1ZUNoYW5nZXMpIHtcbiAgICAgICAgdGhpcy5fYXBwbHlLZXlWYWx1ZUNoYW5nZXMoa2V5VmFsdWVDaGFuZ2VzKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBwcml2YXRlIF9hcHBseUtleVZhbHVlQ2hhbmdlcyhjaGFuZ2VzOiBLZXlWYWx1ZUNoYW5nZXM8c3RyaW5nLCBhbnk+KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIHJlY29yZC5jdXJyZW50VmFsdWUpKTtcbiAgICBjaGFuZ2VzLmZvckVhY2hDaGFuZ2VkSXRlbSgocmVjb3JkKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhyZWNvcmQua2V5LCByZWNvcmQuY3VycmVudFZhbHVlKSk7XG4gICAgY2hhbmdlcy5mb3JFYWNoUmVtb3ZlZEl0ZW0oKHJlY29yZCkgPT4ge1xuICAgICAgaWYgKHJlY29yZC5wcmV2aW91c1ZhbHVlKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5rZXksIGZhbHNlKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHByaXZhdGUgX2FwcGx5SXRlcmFibGVDaGFuZ2VzKGNoYW5nZXM6IEl0ZXJhYmxlQ2hhbmdlczxzdHJpbmc+KTogdm9pZCB7XG4gICAgY2hhbmdlcy5mb3JFYWNoQWRkZWRJdGVtKChyZWNvcmQpID0+IHtcbiAgICAgIGlmICh0eXBlb2YgcmVjb3JkLml0ZW0gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCB0cnVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgIGBOZ0NsYXNzIGNhbiBvbmx5IHRvZ2dsZSBDU1MgY2xhc3NlcyBleHByZXNzZWQgYXMgc3RyaW5ncywgZ290ICR7c3RyaW5naWZ5KHJlY29yZC5pdGVtKX1gKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIGNoYW5nZXMuZm9yRWFjaFJlbW92ZWRJdGVtKChyZWNvcmQpID0+IHRoaXMuX3RvZ2dsZUNsYXNzKHJlY29yZC5pdGVtLCBmYWxzZSkpO1xuICB9XG5cbiAgLyoqXG4gICAqIEFwcGxpZXMgYSBjb2xsZWN0aW9uIG9mIENTUyBjbGFzc2VzIHRvIHRoZSBET00gZWxlbWVudC5cbiAgICpcbiAgICogRm9yIGFyZ3VtZW50IG9mIHR5cGUgU2V0IGFuZCBBcnJheSBDU1MgY2xhc3MgbmFtZXMgY29udGFpbmVkIGluIHRob3NlIGNvbGxlY3Rpb25zIGFyZSBhbHdheXNcbiAgICogYWRkZWQuXG4gICAqIEZvciBhcmd1bWVudCBvZiB0eXBlIE1hcCBDU1MgY2xhc3MgbmFtZSBpbiB0aGUgbWFwJ3Mga2V5IGlzIHRvZ2dsZWQgYmFzZWQgb24gdGhlIHZhbHVlIChhZGRlZFxuICAgKiBmb3IgdHJ1dGh5IGFuZCByZW1vdmVkIGZvciBmYWxzeSkuXG4gICAqL1xuICBwcml2YXRlIF9hcHBseUNsYXNzZXMocmF3Q2xhc3NWYWw6IHN0cmluZ1tdfFNldDxzdHJpbmc+fHtba2xhc3M6IHN0cmluZ106IGFueX0pIHtcbiAgICBpZiAocmF3Q2xhc3NWYWwpIHtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KHJhd0NsYXNzVmFsKSB8fCByYXdDbGFzc1ZhbCBpbnN0YW5jZW9mIFNldCkge1xuICAgICAgICAoPGFueT5yYXdDbGFzc1ZhbCkuZm9yRWFjaCgoa2xhc3M6IHN0cmluZykgPT4gdGhpcy5fdG9nZ2xlQ2xhc3Moa2xhc3MsIHRydWUpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJhd0NsYXNzVmFsKS5mb3JFYWNoKGtsYXNzID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCAhIXJhd0NsYXNzVmFsW2tsYXNzXSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGEgY29sbGVjdGlvbiBvZiBDU1MgY2xhc3NlcyBmcm9tIHRoZSBET00gZWxlbWVudC4gVGhpcyBpcyBtb3N0bHkgdXNlZnVsIGZvciBjbGVhbnVwXG4gICAqIHB1cnBvc2VzLlxuICAgKi9cbiAgcHJpdmF0ZSBfcmVtb3ZlQ2xhc3NlcyhyYXdDbGFzc1ZhbDogc3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIGlmIChyYXdDbGFzc1ZhbCkge1xuICAgICAgaWYgKEFycmF5LmlzQXJyYXkocmF3Q2xhc3NWYWwpIHx8IHJhd0NsYXNzVmFsIGluc3RhbmNlb2YgU2V0KSB7XG4gICAgICAgICg8YW55PnJhd0NsYXNzVmFsKS5mb3JFYWNoKChrbGFzczogc3RyaW5nKSA9PiB0aGlzLl90b2dnbGVDbGFzcyhrbGFzcywgZmFsc2UpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIE9iamVjdC5rZXlzKHJhd0NsYXNzVmFsKS5mb3JFYWNoKGtsYXNzID0+IHRoaXMuX3RvZ2dsZUNsYXNzKGtsYXNzLCBmYWxzZSkpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHByaXZhdGUgX3RvZ2dsZUNsYXNzKGtsYXNzOiBzdHJpbmcsIGVuYWJsZWQ6IGJvb2xlYW4pOiB2b2lkIHtcbiAgICBrbGFzcyA9IGtsYXNzLnRyaW0oKTtcbiAgICBpZiAoa2xhc3MpIHtcbiAgICAgIGtsYXNzLnNwbGl0KC9cXHMrL2cpLmZvckVhY2goa2xhc3MgPT4ge1xuICAgICAgICBpZiAoZW5hYmxlZCkge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLmFkZENsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRoaXMuX3JlbmRlcmVyLnJlbW92ZUNsYXNzKHRoaXMuX25nRWwubmF0aXZlRWxlbWVudCwga2xhc3MpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbn1cblxuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5nQ2xhc3NSM0ltcGwgaW1wbGVtZW50cyBOZ0NsYXNzSW1wbCB7XG4gIHByaXZhdGUgX3ZhbHVlOiB7W2tleTogc3RyaW5nXTogYm9vbGVhbn18bnVsbCA9IG51bGw7XG4gIHByaXZhdGUgX25nQ2xhc3NEaWZmZXIgPSBuZXcgU3R5bGluZ0RpZmZlcjx7W2tleTogc3RyaW5nXTogYm9vbGVhbn18bnVsbD4oXG4gICAgICAnTmdDbGFzcycsIFN0eWxpbmdEaWZmZXJPcHRpb25zLlRyaW1Qcm9wZXJ0aWVzfFxuICAgICAgICAgICAgICAgICBTdHlsaW5nRGlmZmVyT3B0aW9ucy5BbGxvd1N1YktleXN8XG4gICAgICAgICAgICAgICAgIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWV8U3R5bGluZ0RpZmZlck9wdGlvbnMuRm9yY2VBc01hcCk7XG4gIHByaXZhdGUgX2NsYXNzU3RyaW5nRGlmZmVyOiBTdHlsaW5nRGlmZmVyPHtba2V5OiBzdHJpbmddOiBib29sZWFufT58bnVsbCA9IG51bGw7XG5cbiAgZ2V0VmFsdWUoKSB7IHJldHVybiB0aGlzLl92YWx1ZTsgfVxuXG4gIHNldENsYXNzKHZhbHVlOiBzdHJpbmcpIHtcbiAgICAvLyBlYXJseSBleGl0IGluY2FzZSB0aGUgYmluZGluZyBnZXRzIGVtaXR0ZWQgYXMgYW4gZW1wdHkgdmFsdWUgd2hpY2hcbiAgICAvLyBtZWFucyB0aGVyZSBpcyBubyByZWFzb24gdG8gaW5zdGFudGlhdGUgYW5kIGRpZmYgdGhlIHZhbHVlcy4uLlxuICAgIGlmICghdmFsdWUgJiYgIXRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyKSByZXR1cm47XG5cbiAgICB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlciA9IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyIHx8XG4gICAgICAgIG5ldyBTdHlsaW5nRGlmZmVyKCdjbGFzcycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFN0eWxpbmdEaWZmZXJPcHRpb25zLkFsbG93U3RyaW5nVmFsdWUgfCBTdHlsaW5nRGlmZmVyT3B0aW9ucy5Gb3JjZUFzTWFwKTtcbiAgICB0aGlzLl9jbGFzc1N0cmluZ0RpZmZlci5zZXRWYWx1ZSh2YWx1ZSk7XG4gIH1cblxuICBzZXROZ0NsYXNzKHZhbHVlOiBzdHJpbmd8c3RyaW5nW118U2V0PHN0cmluZz58e1trbGFzczogc3RyaW5nXTogYW55fSkge1xuICAgIHRoaXMuX25nQ2xhc3NEaWZmZXIuc2V0VmFsdWUodmFsdWUpO1xuICB9XG5cbiAgYXBwbHlDaGFuZ2VzKCkge1xuICAgIGNvbnN0IGNsYXNzQ2hhbmdlZCA9XG4gICAgICAgIHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyID8gdGhpcy5fY2xhc3NTdHJpbmdEaWZmZXIuaGFzVmFsdWVDaGFuZ2VkKCkgOiBmYWxzZTtcbiAgICBjb25zdCBuZ0NsYXNzQ2hhbmdlZCA9IHRoaXMuX25nQ2xhc3NEaWZmZXIuaGFzVmFsdWVDaGFuZ2VkKCk7XG4gICAgaWYgKGNsYXNzQ2hhbmdlZCB8fCBuZ0NsYXNzQ2hhbmdlZCkge1xuICAgICAgbGV0IHZhbHVlID0gdGhpcy5fbmdDbGFzc0RpZmZlci52YWx1ZTtcbiAgICAgIGlmICh0aGlzLl9jbGFzc1N0cmluZ0RpZmZlcikge1xuICAgICAgICBsZXQgY2xhc3NWYWx1ZSA9IHRoaXMuX2NsYXNzU3RyaW5nRGlmZmVyLnZhbHVlO1xuICAgICAgICBpZiAoY2xhc3NWYWx1ZSkge1xuICAgICAgICAgIHZhbHVlID0gdmFsdWUgPyB7Li4uY2xhc3NWYWx1ZSwgLi4udmFsdWV9IDogY2xhc3NWYWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdGhpcy5fdmFsdWUgPSB2YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuLy8gdGhlIGltcGxlbWVudGF0aW9uIGZvciBib3RoIE5nU3R5bGVSMkltcGwgYW5kIE5nU3R5bGVSM0ltcGwgYXJlXG4vLyBub3QgaXZ5X3N3aXRjaCdkIGF3YXksIGluc3RlYWQgdGhleSBhcmUgb25seSBob29rZWQgdXAgaW50byB0aGVcbi8vIERJIHZpYSBOZ1N0eWxlJ3MgZGlyZWN0aXZlJ3MgcHJvdmlkZXIgcHJvcGVydHkuXG5leHBvcnQgY29uc3QgTmdDbGFzc0ltcGxQcm92aWRlcl9fUFJFX1IzX18gPSB7XG4gIHByb3ZpZGU6IE5nQ2xhc3NJbXBsLFxuICB1c2VDbGFzczogTmdDbGFzc1IySW1wbFxufTtcblxuZXhwb3J0IGNvbnN0IE5nQ2xhc3NJbXBsUHJvdmlkZXJfX1BPU1RfUjNfXyA9IHtcbiAgcHJvdmlkZTogTmdDbGFzc0ltcGwsXG4gIHVzZUNsYXNzOiBOZ0NsYXNzUjNJbXBsXG59O1xuXG5leHBvcnQgY29uc3QgTmdDbGFzc0ltcGxQcm92aWRlciA9IE5nQ2xhc3NJbXBsUHJvdmlkZXJfX1BSRV9SM19fO1xuIl19