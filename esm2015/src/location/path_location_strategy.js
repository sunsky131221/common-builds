/**
 * @license
 * Copyright Google Inc. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { Inject, Injectable, Optional } from '@angular/core';
import { Location } from './location';
import { APP_BASE_HREF, LocationStrategy } from './location_strategy';
import { PlatformLocation } from './platform_location';
/**
 * @description
 * A {@link LocationStrategy} used to configure the {@link Location} service to
 * represent its state in the
 * [path](https://en.wikipedia.org/wiki/Uniform_Resource_Locator#Syntax) of the
 * browser's URL.
 *
 * If you're using `PathLocationStrategy`, you must provide a {@link APP_BASE_HREF}
 * or add a base element to the document. This URL prefix that will be preserved
 * when generating and recognizing URLs.
 *
 * For instance, if you provide an `APP_BASE_HREF` of `'/my/app'` and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * Similarly, if you add `<base href='/my/app'/>` to the document and call
 * `location.go('/foo')`, the browser's URL will become
 * `example.com/my/app/foo`.
 *
 * @usageNotes
 *
 * ### Example
 *
 * {@example common/location/ts/path_location_component.ts region='LocationComponent'}
 *
 *
 */
let PathLocationStrategy = class PathLocationStrategy extends LocationStrategy {
    constructor(_platformLocation, href) {
        super();
        this._platformLocation = _platformLocation;
        if (href == null) {
            href = this._platformLocation.getBaseHrefFromDOM();
        }
        if (href == null) {
            throw new Error(`No base href set. Please provide a value for the APP_BASE_HREF token or add a base element to the document.`);
        }
        this._baseHref = href;
    }
    onPopState(fn) {
        this._platformLocation.onPopState(fn);
        this._platformLocation.onHashChange(fn);
    }
    getBaseHref() { return this._baseHref; }
    prepareExternalUrl(internal) {
        return Location.joinWithSlash(this._baseHref, internal);
    }
    path(includeHash = false) {
        const pathname = this._platformLocation.pathname +
            Location.normalizeQueryParams(this._platformLocation.search);
        const hash = this._platformLocation.hash;
        return hash && includeHash ? `${pathname}${hash}` : pathname;
    }
    pushState(state, title, url, queryParams) {
        const externalUrl = this.prepareExternalUrl(url + Location.normalizeQueryParams(queryParams));
        this._platformLocation.pushState(state, title, externalUrl);
    }
    replaceState(state, title, url, queryParams) {
        const externalUrl = this.prepareExternalUrl(url + Location.normalizeQueryParams(queryParams));
        this._platformLocation.replaceState(state, title, externalUrl);
    }
    forward() { this._platformLocation.forward(); }
    back() { this._platformLocation.back(); }
};
PathLocationStrategy = tslib_1.__decorate([
    Injectable(),
    tslib_1.__param(1, Optional()), tslib_1.__param(1, Inject(APP_BASE_HREF)),
    tslib_1.__metadata("design:paramtypes", [PlatformLocation, String])
], PathLocationStrategy);
export { PathLocationStrategy };

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGF0aF9sb2NhdGlvbl9zdHJhdGVneS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi9zcmMvbG9jYXRpb24vcGF0aF9sb2NhdGlvbl9zdHJhdGVneS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsUUFBUSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRzNELE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxZQUFZLENBQUM7QUFDcEMsT0FBTyxFQUFDLGFBQWEsRUFBRSxnQkFBZ0IsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3BFLE9BQU8sRUFBeUIsZ0JBQWdCLEVBQUMsTUFBTSxxQkFBcUIsQ0FBQztBQUk3RTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0EwQkc7QUFFSCxJQUFhLG9CQUFvQixHQUFqQyxNQUFhLG9CQUFxQixTQUFRLGdCQUFnQjtJQUd4RCxZQUNZLGlCQUFtQyxFQUNSLElBQWE7UUFDbEQsS0FBSyxFQUFFLENBQUM7UUFGRSxzQkFBaUIsR0FBakIsaUJBQWlCLENBQWtCO1FBSTdDLElBQUksSUFBSSxJQUFJLElBQUksRUFBRTtZQUNoQixJQUFJLEdBQUcsSUFBSSxDQUFDLGlCQUFpQixDQUFDLGtCQUFrQixFQUFFLENBQUM7U0FDcEQ7UUFFRCxJQUFJLElBQUksSUFBSSxJQUFJLEVBQUU7WUFDaEIsTUFBTSxJQUFJLEtBQUssQ0FDWCw2R0FBNkcsQ0FBQyxDQUFDO1NBQ3BIO1FBRUQsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUM7SUFDeEIsQ0FBQztJQUVELFVBQVUsQ0FBQyxFQUEwQjtRQUNuQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsVUFBVSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ3RDLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDMUMsQ0FBQztJQUVELFdBQVcsS0FBYSxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDO0lBRWhELGtCQUFrQixDQUFDLFFBQWdCO1FBQ2pDLE9BQU8sUUFBUSxDQUFDLGFBQWEsQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQzFELENBQUM7SUFFRCxJQUFJLENBQUMsY0FBdUIsS0FBSztRQUMvQixNQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsaUJBQWlCLENBQUMsUUFBUTtZQUM1QyxRQUFRLENBQUMsb0JBQW9CLENBQUMsSUFBSSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ2pFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLENBQUM7UUFDekMsT0FBTyxJQUFJLElBQUksV0FBVyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDO0lBQy9ELENBQUM7SUFFRCxTQUFTLENBQUMsS0FBVSxFQUFFLEtBQWEsRUFBRSxHQUFXLEVBQUUsV0FBbUI7UUFDbkUsTUFBTSxXQUFXLEdBQUcsSUFBSSxDQUFDLGtCQUFrQixDQUFDLEdBQUcsR0FBRyxRQUFRLENBQUMsb0JBQW9CLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztRQUM5RixJQUFJLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxLQUFLLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFDOUQsQ0FBQztJQUVELFlBQVksQ0FBQyxLQUFVLEVBQUUsS0FBYSxFQUFFLEdBQVcsRUFBRSxXQUFtQjtRQUN0RSxNQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsa0JBQWtCLENBQUMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxvQkFBb0IsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO1FBQzlGLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxZQUFZLENBQUMsS0FBSyxFQUFFLEtBQUssRUFBRSxXQUFXLENBQUMsQ0FBQztJQUNqRSxDQUFDO0lBRUQsT0FBTyxLQUFXLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFFckQsSUFBSSxLQUFXLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLENBQUM7Q0FDaEQsQ0FBQTtBQW5EWSxvQkFBb0I7SUFEaEMsVUFBVSxFQUFFO0lBTU4sbUJBQUEsUUFBUSxFQUFFLENBQUEsRUFBRSxtQkFBQSxNQUFNLENBQUMsYUFBYSxDQUFDLENBQUE7NkNBRFAsZ0JBQWdCO0dBSnBDLG9CQUFvQixDQW1EaEM7U0FuRFksb0JBQW9CIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBJbmMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0luamVjdCwgSW5qZWN0YWJsZSwgT3B0aW9uYWx9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbmltcG9ydCB7TG9jYXRpb259IGZyb20gJy4vbG9jYXRpb24nO1xuaW1wb3J0IHtBUFBfQkFTRV9IUkVGLCBMb2NhdGlvblN0cmF0ZWd5fSBmcm9tICcuL2xvY2F0aW9uX3N0cmF0ZWd5JztcbmltcG9ydCB7TG9jYXRpb25DaGFuZ2VMaXN0ZW5lciwgUGxhdGZvcm1Mb2NhdGlvbn0gZnJvbSAnLi9wbGF0Zm9ybV9sb2NhdGlvbic7XG5cblxuXG4vKipcbiAqIEBkZXNjcmlwdGlvblxuICogQSB7QGxpbmsgTG9jYXRpb25TdHJhdGVneX0gdXNlZCB0byBjb25maWd1cmUgdGhlIHtAbGluayBMb2NhdGlvbn0gc2VydmljZSB0b1xuICogcmVwcmVzZW50IGl0cyBzdGF0ZSBpbiB0aGVcbiAqIFtwYXRoXShodHRwczovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9Vbmlmb3JtX1Jlc291cmNlX0xvY2F0b3IjU3ludGF4KSBvZiB0aGVcbiAqIGJyb3dzZXIncyBVUkwuXG4gKlxuICogSWYgeW91J3JlIHVzaW5nIGBQYXRoTG9jYXRpb25TdHJhdGVneWAsIHlvdSBtdXN0IHByb3ZpZGUgYSB7QGxpbmsgQVBQX0JBU0VfSFJFRn1cbiAqIG9yIGFkZCBhIGJhc2UgZWxlbWVudCB0byB0aGUgZG9jdW1lbnQuIFRoaXMgVVJMIHByZWZpeCB0aGF0IHdpbGwgYmUgcHJlc2VydmVkXG4gKiB3aGVuIGdlbmVyYXRpbmcgYW5kIHJlY29nbml6aW5nIFVSTHMuXG4gKlxuICogRm9yIGluc3RhbmNlLCBpZiB5b3UgcHJvdmlkZSBhbiBgQVBQX0JBU0VfSFJFRmAgb2YgYCcvbXkvYXBwJ2AgYW5kIGNhbGxcbiAqIGBsb2NhdGlvbi5nbygnL2ZvbycpYCwgdGhlIGJyb3dzZXIncyBVUkwgd2lsbCBiZWNvbWVcbiAqIGBleGFtcGxlLmNvbS9teS9hcHAvZm9vYC5cbiAqXG4gKiBTaW1pbGFybHksIGlmIHlvdSBhZGQgYDxiYXNlIGhyZWY9Jy9teS9hcHAnLz5gIHRvIHRoZSBkb2N1bWVudCBhbmQgY2FsbFxuICogYGxvY2F0aW9uLmdvKCcvZm9vJylgLCB0aGUgYnJvd3NlcidzIFVSTCB3aWxsIGJlY29tZVxuICogYGV4YW1wbGUuY29tL215L2FwcC9mb29gLlxuICpcbiAqIEB1c2FnZU5vdGVzXG4gKlxuICogIyMjIEV4YW1wbGVcbiAqXG4gKiB7QGV4YW1wbGUgY29tbW9uL2xvY2F0aW9uL3RzL3BhdGhfbG9jYXRpb25fY29tcG9uZW50LnRzIHJlZ2lvbj0nTG9jYXRpb25Db21wb25lbnQnfVxuICpcbiAqXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBQYXRoTG9jYXRpb25TdHJhdGVneSBleHRlbmRzIExvY2F0aW9uU3RyYXRlZ3kge1xuICBwcml2YXRlIF9iYXNlSHJlZjogc3RyaW5nO1xuXG4gIGNvbnN0cnVjdG9yKFxuICAgICAgcHJpdmF0ZSBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbixcbiAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoQVBQX0JBU0VfSFJFRikgaHJlZj86IHN0cmluZykge1xuICAgIHN1cGVyKCk7XG5cbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICBocmVmID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5nZXRCYXNlSHJlZkZyb21ET00oKTtcbiAgICB9XG5cbiAgICBpZiAoaHJlZiA9PSBudWxsKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYE5vIGJhc2UgaHJlZiBzZXQuIFBsZWFzZSBwcm92aWRlIGEgdmFsdWUgZm9yIHRoZSBBUFBfQkFTRV9IUkVGIHRva2VuIG9yIGFkZCBhIGJhc2UgZWxlbWVudCB0byB0aGUgZG9jdW1lbnQuYCk7XG4gICAgfVxuXG4gICAgdGhpcy5fYmFzZUhyZWYgPSBocmVmO1xuICB9XG5cbiAgb25Qb3BTdGF0ZShmbjogTG9jYXRpb25DaGFuZ2VMaXN0ZW5lcik6IHZvaWQge1xuICAgIHRoaXMuX3BsYXRmb3JtTG9jYXRpb24ub25Qb3BTdGF0ZShmbik7XG4gICAgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5vbkhhc2hDaGFuZ2UoZm4pO1xuICB9XG5cbiAgZ2V0QmFzZUhyZWYoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX2Jhc2VIcmVmOyB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKGludGVybmFsOiBzdHJpbmcpOiBzdHJpbmcge1xuICAgIHJldHVybiBMb2NhdGlvbi5qb2luV2l0aFNsYXNoKHRoaXMuX2Jhc2VIcmVmLCBpbnRlcm5hbCk7XG4gIH1cblxuICBwYXRoKGluY2x1ZGVIYXNoOiBib29sZWFuID0gZmFsc2UpOiBzdHJpbmcge1xuICAgIGNvbnN0IHBhdGhuYW1lID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5wYXRobmFtZSArXG4gICAgICAgIExvY2F0aW9uLm5vcm1hbGl6ZVF1ZXJ5UGFyYW1zKHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uc2VhcmNoKTtcbiAgICBjb25zdCBoYXNoID0gdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5oYXNoO1xuICAgIHJldHVybiBoYXNoICYmIGluY2x1ZGVIYXNoID8gYCR7cGF0aG5hbWV9JHtoYXNofWAgOiBwYXRobmFtZTtcbiAgfVxuXG4gIHB1c2hTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIGNvbnN0IGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnB1c2hTdGF0ZShzdGF0ZSwgdGl0bGUsIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShzdGF0ZTogYW55LCB0aXRsZTogc3RyaW5nLCB1cmw6IHN0cmluZywgcXVlcnlQYXJhbXM6IHN0cmluZykge1xuICAgIGNvbnN0IGV4dGVybmFsVXJsID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwodXJsICsgTG9jYXRpb24ubm9ybWFsaXplUXVlcnlQYXJhbXMocXVlcnlQYXJhbXMpKTtcbiAgICB0aGlzLl9wbGF0Zm9ybUxvY2F0aW9uLnJlcGxhY2VTdGF0ZShzdGF0ZSwgdGl0bGUsIGV4dGVybmFsVXJsKTtcbiAgfVxuXG4gIGZvcndhcmQoKTogdm9pZCB7IHRoaXMuX3BsYXRmb3JtTG9jYXRpb24uZm9yd2FyZCgpOyB9XG5cbiAgYmFjaygpOiB2b2lkIHsgdGhpcy5fcGxhdGZvcm1Mb2NhdGlvbi5iYWNrKCk7IH1cbn1cbiJdfQ==