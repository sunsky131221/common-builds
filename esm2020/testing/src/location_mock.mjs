import { EventEmitter, Injectable } from '@angular/core';
import { normalizeQueryParams } from '../../src/location/util';
import * as i0 from "@angular/core";
/**
 * A spy for {@link Location} that allows tests to fire simulated location events.
 *
 * @publicApi
 */
export class SpyLocation {
    constructor() {
        this.urlChanges = [];
        this._history = [new LocationState('', '', null)];
        this._historyIndex = 0;
        /** @internal */
        this._subject = new EventEmitter();
        /** @internal */
        this._baseHref = '';
        /** @internal */
        this._platformStrategy = null;
        /** @internal */
        this._platformLocation = null;
        /** @internal */
        this._urlChangeListeners = [];
        /** @internal */
        this._urlChangeSubscription = null;
    }
    ngOnDestroy() {
        this._urlChangeSubscription?.unsubscribe();
        this._urlChangeListeners = [];
    }
    setInitialPath(url) {
        this._history[this._historyIndex].path = url;
    }
    setBaseHref(url) {
        this._baseHref = url;
    }
    path() {
        return this._history[this._historyIndex].path;
    }
    getState() {
        return this._history[this._historyIndex].state;
    }
    isCurrentPathEqualTo(path, query = '') {
        const givenPath = path.endsWith('/') ? path.substring(0, path.length - 1) : path;
        const currPath = this.path().endsWith('/') ? this.path().substring(0, this.path().length - 1) : this.path();
        return currPath == givenPath + (query.length > 0 ? ('?' + query) : '');
    }
    simulateUrlPop(pathname) {
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
    }
    simulateHashChange(pathname) {
        const path = this.prepareExternalUrl(pathname);
        this.pushHistory(path, '', null);
        this.urlChanges.push('hash: ' + pathname);
        // the browser will automatically fire popstate event before each `hashchange` event, so we need
        // to simulate it.
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'popstate' });
        this._subject.emit({ 'url': pathname, 'pop': true, 'type': 'hashchange' });
    }
    prepareExternalUrl(url) {
        if (url.length > 0 && !url.startsWith('/')) {
            url = '/' + url;
        }
        return this._baseHref + url;
    }
    go(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        this.pushHistory(path, query, state);
        const locationState = this._history[this._historyIndex - 1];
        if (locationState.path == path && locationState.query == query) {
            return;
        }
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push(url);
        this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
    }
    replaceState(path, query = '', state = null) {
        path = this.prepareExternalUrl(path);
        const history = this._history[this._historyIndex];
        if (history.path == path && history.query == query) {
            return;
        }
        history.path = path;
        history.query = query;
        history.state = state;
        const url = path + (query.length > 0 ? ('?' + query) : '');
        this.urlChanges.push('replace: ' + url);
        this._notifyUrlChangeListeners(path + normalizeQueryParams(query), state);
    }
    forward() {
        if (this._historyIndex < (this._history.length - 1)) {
            this._historyIndex++;
            this._subject.emit({ 'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate' });
        }
    }
    back() {
        if (this._historyIndex > 0) {
            this._historyIndex--;
            this._subject.emit({ 'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate' });
        }
    }
    historyGo(relativePosition = 0) {
        const nextPageIndex = this._historyIndex + relativePosition;
        if (nextPageIndex >= 0 && nextPageIndex < this._history.length) {
            this._historyIndex = nextPageIndex;
            this._subject.emit({ 'url': this.path(), 'state': this.getState(), 'pop': true, 'type': 'popstate' });
        }
    }
    onUrlChange(fn) {
        this._urlChangeListeners.push(fn);
        if (!this._urlChangeSubscription) {
            this._urlChangeSubscription = this.subscribe(v => {
                this._notifyUrlChangeListeners(v.url, v.state);
            });
        }
        return () => {
            const fnIndex = this._urlChangeListeners.indexOf(fn);
            this._urlChangeListeners.splice(fnIndex, 1);
            if (this._urlChangeListeners.length === 0) {
                this._urlChangeSubscription?.unsubscribe();
                this._urlChangeSubscription = null;
            }
        };
    }
    /** @internal */
    _notifyUrlChangeListeners(url = '', state) {
        this._urlChangeListeners.forEach(fn => fn(url, state));
    }
    subscribe(onNext, onThrow, onReturn) {
        return this._subject.subscribe({ next: onNext, error: onThrow, complete: onReturn });
    }
    normalize(url) {
        return null;
    }
    pushHistory(path, query, state) {
        if (this._historyIndex > 0) {
            this._history.splice(this._historyIndex + 1);
        }
        this._history.push(new LocationState(path, query, state));
        this._historyIndex = this._history.length - 1;
    }
}
SpyLocation.ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "14.0.0-next.13+7.sha-6444a02", ngImport: i0, type: SpyLocation, deps: [], target: i0.ɵɵFactoryTarget.Injectable });
SpyLocation.ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "14.0.0-next.13+7.sha-6444a02", ngImport: i0, type: SpyLocation });
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "14.0.0-next.13+7.sha-6444a02", ngImport: i0, type: SpyLocation, decorators: [{
            type: Injectable
        }] });
class LocationState {
    constructor(path, query, state) {
        this.path = path;
        this.query = query;
        this.state = state;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9jYXRpb25fbW9jay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL2NvbW1vbi90ZXN0aW5nL3NyYy9sb2NhdGlvbl9tb2NrLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQVNBLE9BQU8sRUFBQyxZQUFZLEVBQUUsVUFBVSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBR3ZELE9BQU8sRUFBQyxvQkFBb0IsRUFBQyxNQUFNLHlCQUF5QixDQUFDOztBQUU3RDs7OztHQUlHO0FBRUgsTUFBTSxPQUFPLFdBQVc7SUFEeEI7UUFFRSxlQUFVLEdBQWEsRUFBRSxDQUFDO1FBQ2xCLGFBQVEsR0FBb0IsQ0FBQyxJQUFJLGFBQWEsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUM7UUFDOUQsa0JBQWEsR0FBVyxDQUFDLENBQUM7UUFDbEMsZ0JBQWdCO1FBQ2hCLGFBQVEsR0FBc0IsSUFBSSxZQUFZLEVBQUUsQ0FBQztRQUNqRCxnQkFBZ0I7UUFDaEIsY0FBUyxHQUFXLEVBQUUsQ0FBQztRQUN2QixnQkFBZ0I7UUFDaEIsc0JBQWlCLEdBQXFCLElBQUssQ0FBQztRQUM1QyxnQkFBZ0I7UUFDaEIsc0JBQWlCLEdBQXFCLElBQUssQ0FBQztRQUM1QyxnQkFBZ0I7UUFDaEIsd0JBQW1CLEdBQThDLEVBQUUsQ0FBQztRQUNwRSxnQkFBZ0I7UUFDaEIsMkJBQXNCLEdBQTBCLElBQUksQ0FBQztLQXdKdEQ7SUF0SkMsV0FBVztRQUNULElBQUksQ0FBQyxzQkFBc0IsRUFBRSxXQUFXLEVBQUUsQ0FBQztRQUMzQyxJQUFJLENBQUMsbUJBQW1CLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLENBQUM7SUFFRCxjQUFjLENBQUMsR0FBVztRQUN4QixJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDO0lBQy9DLENBQUM7SUFFRCxXQUFX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LENBQ0wsTUFBNEIsRUFBRSxPQUFxQyxFQUNuRSxRQUE0QjtRQUM5QixPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLEVBQUMsSUFBSSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUMsQ0FBQyxDQUFDO0lBQ3JGLENBQUM7SUFFRCxTQUFTLENBQUMsR0FBVztRQUNuQixPQUFPLElBQUssQ0FBQztJQUNmLENBQUM7SUFFTyxXQUFXLENBQUMsSUFBWSxFQUFFLEtBQWEsRUFBRSxLQUFVO1FBQ3pELElBQUksSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLEVBQUU7WUFDMUIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLGFBQWEsR0FBRyxDQUFDLENBQUMsQ0FBQztTQUM5QztRQUNELElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksYUFBYSxDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsS0FBSyxDQUFDLENBQUMsQ0FBQztRQUMxRCxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQztJQUNoRCxDQUFDOzttSEF0S1UsV0FBVzt1SEFBWCxXQUFXO3NHQUFYLFdBQVc7a0JBRHZCLFVBQVU7O0FBMEtYLE1BQU0sYUFBYTtJQUNqQixZQUFtQixJQUFZLEVBQVMsS0FBYSxFQUFTLEtBQVU7UUFBckQsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUFTLFVBQUssR0FBTCxLQUFLLENBQVE7UUFBUyxVQUFLLEdBQUwsS0FBSyxDQUFLO0lBQUcsQ0FBQztDQUM3RSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0xvY2F0aW9uLCBMb2NhdGlvblN0cmF0ZWd5LCBQbGF0Zm9ybUxvY2F0aW9ufSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXIsIEluamVjdGFibGV9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtTdWJzY3JpcHRpb25MaWtlfSBmcm9tICdyeGpzJztcblxuaW1wb3J0IHtub3JtYWxpemVRdWVyeVBhcmFtc30gZnJvbSAnLi4vLi4vc3JjL2xvY2F0aW9uL3V0aWwnO1xuXG4vKipcbiAqIEEgc3B5IGZvciB7QGxpbmsgTG9jYXRpb259IHRoYXQgYWxsb3dzIHRlc3RzIHRvIGZpcmUgc2ltdWxhdGVkIGxvY2F0aW9uIGV2ZW50cy5cbiAqXG4gKiBAcHVibGljQXBpXG4gKi9cbkBJbmplY3RhYmxlKClcbmV4cG9ydCBjbGFzcyBTcHlMb2NhdGlvbiBpbXBsZW1lbnRzIExvY2F0aW9uIHtcbiAgdXJsQ2hhbmdlczogc3RyaW5nW10gPSBbXTtcbiAgcHJpdmF0ZSBfaGlzdG9yeTogTG9jYXRpb25TdGF0ZVtdID0gW25ldyBMb2NhdGlvblN0YXRlKCcnLCAnJywgbnVsbCldO1xuICBwcml2YXRlIF9oaXN0b3J5SW5kZXg6IG51bWJlciA9IDA7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3N1YmplY3Q6IEV2ZW50RW1pdHRlcjxhbnk+ID0gbmV3IEV2ZW50RW1pdHRlcigpO1xuICAvKiogQGludGVybmFsICovXG4gIF9iYXNlSHJlZjogc3RyaW5nID0gJyc7XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3BsYXRmb3JtU3RyYXRlZ3k6IExvY2F0aW9uU3RyYXRlZ3kgPSBudWxsITtcbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfcGxhdGZvcm1Mb2NhdGlvbjogUGxhdGZvcm1Mb2NhdGlvbiA9IG51bGwhO1xuICAvKiogQGludGVybmFsICovXG4gIF91cmxDaGFuZ2VMaXN0ZW5lcnM6ICgodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKVtdID0gW107XG4gIC8qKiBAaW50ZXJuYWwgKi9cbiAgX3VybENoYW5nZVN1YnNjcmlwdGlvbjogU3Vic2NyaXB0aW9uTGlrZXxudWxsID0gbnVsbDtcblxuICBuZ09uRGVzdHJveSgpOiB2b2lkIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VTdWJzY3JpcHRpb24/LnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzID0gW107XG4gIH1cblxuICBzZXRJbml0aWFsUGF0aCh1cmw6IHN0cmluZykge1xuICAgIHRoaXMuX2hpc3RvcnlbdGhpcy5faGlzdG9yeUluZGV4XS5wYXRoID0gdXJsO1xuICB9XG5cbiAgc2V0QmFzZUhyZWYodXJsOiBzdHJpbmcpIHtcbiAgICB0aGlzLl9iYXNlSHJlZiA9IHVybDtcbiAgfVxuXG4gIHBhdGgoKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdLnBhdGg7XG4gIH1cblxuICBnZXRTdGF0ZSgpOiB1bmtub3duIHtcbiAgICByZXR1cm4gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdLnN0YXRlO1xuICB9XG5cbiAgaXNDdXJyZW50UGF0aEVxdWFsVG8ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycpOiBib29sZWFuIHtcbiAgICBjb25zdCBnaXZlblBhdGggPSBwYXRoLmVuZHNXaXRoKCcvJykgPyBwYXRoLnN1YnN0cmluZygwLCBwYXRoLmxlbmd0aCAtIDEpIDogcGF0aDtcbiAgICBjb25zdCBjdXJyUGF0aCA9XG4gICAgICAgIHRoaXMucGF0aCgpLmVuZHNXaXRoKCcvJykgPyB0aGlzLnBhdGgoKS5zdWJzdHJpbmcoMCwgdGhpcy5wYXRoKCkubGVuZ3RoIC0gMSkgOiB0aGlzLnBhdGgoKTtcblxuICAgIHJldHVybiBjdXJyUGF0aCA9PSBnaXZlblBhdGggKyAocXVlcnkubGVuZ3RoID4gMCA/ICgnPycgKyBxdWVyeSkgOiAnJyk7XG4gIH1cblxuICBzaW11bGF0ZVVybFBvcChwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgdGhpcy5fc3ViamVjdC5lbWl0KHsndXJsJzogcGF0aG5hbWUsICdwb3AnOiB0cnVlLCAndHlwZSc6ICdwb3BzdGF0ZSd9KTtcbiAgfVxuXG4gIHNpbXVsYXRlSGFzaENoYW5nZShwYXRobmFtZTogc3RyaW5nKSB7XG4gICAgY29uc3QgcGF0aCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGhuYW1lKTtcbiAgICB0aGlzLnB1c2hIaXN0b3J5KHBhdGgsICcnLCBudWxsKTtcblxuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKCdoYXNoOiAnICsgcGF0aG5hbWUpO1xuICAgIC8vIHRoZSBicm93c2VyIHdpbGwgYXV0b21hdGljYWxseSBmaXJlIHBvcHN0YXRlIGV2ZW50IGJlZm9yZSBlYWNoIGBoYXNoY2hhbmdlYCBldmVudCwgc28gd2UgbmVlZFxuICAgIC8vIHRvIHNpbXVsYXRlIGl0LlxuICAgIHRoaXMuX3N1YmplY3QuZW1pdCh7J3VybCc6IHBhdGhuYW1lLCAncG9wJzogdHJ1ZSwgJ3R5cGUnOiAncG9wc3RhdGUnfSk7XG4gICAgdGhpcy5fc3ViamVjdC5lbWl0KHsndXJsJzogcGF0aG5hbWUsICdwb3AnOiB0cnVlLCAndHlwZSc6ICdoYXNoY2hhbmdlJ30pO1xuICB9XG5cbiAgcHJlcGFyZUV4dGVybmFsVXJsKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICBpZiAodXJsLmxlbmd0aCA+IDAgJiYgIXVybC5zdGFydHNXaXRoKCcvJykpIHtcbiAgICAgIHVybCA9ICcvJyArIHVybDtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuX2Jhc2VIcmVmICsgdXJsO1xuICB9XG5cbiAgZ28ocGF0aDogc3RyaW5nLCBxdWVyeTogc3RyaW5nID0gJycsIHN0YXRlOiBhbnkgPSBudWxsKSB7XG4gICAgcGF0aCA9IHRoaXMucHJlcGFyZUV4dGVybmFsVXJsKHBhdGgpO1xuXG4gICAgdGhpcy5wdXNoSGlzdG9yeShwYXRoLCBxdWVyeSwgc3RhdGUpO1xuXG4gICAgY29uc3QgbG9jYXRpb25TdGF0ZSA9IHRoaXMuX2hpc3RvcnlbdGhpcy5faGlzdG9yeUluZGV4IC0gMV07XG4gICAgaWYgKGxvY2F0aW9uU3RhdGUucGF0aCA9PSBwYXRoICYmIGxvY2F0aW9uU3RhdGUucXVlcnkgPT0gcXVlcnkpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBjb25zdCB1cmwgPSBwYXRoICsgKHF1ZXJ5Lmxlbmd0aCA+IDAgPyAoJz8nICsgcXVlcnkpIDogJycpO1xuICAgIHRoaXMudXJsQ2hhbmdlcy5wdXNoKHVybCk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSksIHN0YXRlKTtcbiAgfVxuXG4gIHJlcGxhY2VTdGF0ZShwYXRoOiBzdHJpbmcsIHF1ZXJ5OiBzdHJpbmcgPSAnJywgc3RhdGU6IGFueSA9IG51bGwpIHtcbiAgICBwYXRoID0gdGhpcy5wcmVwYXJlRXh0ZXJuYWxVcmwocGF0aCk7XG5cbiAgICBjb25zdCBoaXN0b3J5ID0gdGhpcy5faGlzdG9yeVt0aGlzLl9oaXN0b3J5SW5kZXhdO1xuICAgIGlmIChoaXN0b3J5LnBhdGggPT0gcGF0aCAmJiBoaXN0b3J5LnF1ZXJ5ID09IHF1ZXJ5KSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaGlzdG9yeS5wYXRoID0gcGF0aDtcbiAgICBoaXN0b3J5LnF1ZXJ5ID0gcXVlcnk7XG4gICAgaGlzdG9yeS5zdGF0ZSA9IHN0YXRlO1xuXG4gICAgY29uc3QgdXJsID0gcGF0aCArIChxdWVyeS5sZW5ndGggPiAwID8gKCc/JyArIHF1ZXJ5KSA6ICcnKTtcbiAgICB0aGlzLnVybENoYW5nZXMucHVzaCgncmVwbGFjZTogJyArIHVybCk7XG4gICAgdGhpcy5fbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHBhdGggKyBub3JtYWxpemVRdWVyeVBhcmFtcyhxdWVyeSksIHN0YXRlKTtcbiAgfVxuXG4gIGZvcndhcmQoKSB7XG4gICAgaWYgKHRoaXMuX2hpc3RvcnlJbmRleCA8ICh0aGlzLl9oaXN0b3J5Lmxlbmd0aCAtIDEpKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5SW5kZXgrKztcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdChcbiAgICAgICAgICB7J3VybCc6IHRoaXMucGF0aCgpLCAnc3RhdGUnOiB0aGlzLmdldFN0YXRlKCksICdwb3AnOiB0cnVlLCAndHlwZSc6ICdwb3BzdGF0ZSd9KTtcbiAgICB9XG4gIH1cblxuICBiYWNrKCkge1xuICAgIGlmICh0aGlzLl9oaXN0b3J5SW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5SW5kZXgtLTtcbiAgICAgIHRoaXMuX3N1YmplY3QuZW1pdChcbiAgICAgICAgICB7J3VybCc6IHRoaXMucGF0aCgpLCAnc3RhdGUnOiB0aGlzLmdldFN0YXRlKCksICdwb3AnOiB0cnVlLCAndHlwZSc6ICdwb3BzdGF0ZSd9KTtcbiAgICB9XG4gIH1cblxuICBoaXN0b3J5R28ocmVsYXRpdmVQb3NpdGlvbjogbnVtYmVyID0gMCk6IHZvaWQge1xuICAgIGNvbnN0IG5leHRQYWdlSW5kZXggPSB0aGlzLl9oaXN0b3J5SW5kZXggKyByZWxhdGl2ZVBvc2l0aW9uO1xuICAgIGlmIChuZXh0UGFnZUluZGV4ID49IDAgJiYgbmV4dFBhZ2VJbmRleCA8IHRoaXMuX2hpc3RvcnkubGVuZ3RoKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5SW5kZXggPSBuZXh0UGFnZUluZGV4O1xuICAgICAgdGhpcy5fc3ViamVjdC5lbWl0KFxuICAgICAgICAgIHsndXJsJzogdGhpcy5wYXRoKCksICdzdGF0ZSc6IHRoaXMuZ2V0U3RhdGUoKSwgJ3BvcCc6IHRydWUsICd0eXBlJzogJ3BvcHN0YXRlJ30pO1xuICAgIH1cbiAgfVxuXG4gIG9uVXJsQ2hhbmdlKGZuOiAodXJsOiBzdHJpbmcsIHN0YXRlOiB1bmtub3duKSA9PiB2b2lkKTogVm9pZEZ1bmN0aW9uIHtcbiAgICB0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMucHVzaChmbik7XG5cbiAgICBpZiAoIXRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbikge1xuICAgICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uID0gdGhpcy5zdWJzY3JpYmUodiA9PiB7XG4gICAgICAgIHRoaXMuX25vdGlmeVVybENoYW5nZUxpc3RlbmVycyh2LnVybCwgdi5zdGF0ZSk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgY29uc3QgZm5JbmRleCA9IHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5pbmRleE9mKGZuKTtcbiAgICAgIHRoaXMuX3VybENoYW5nZUxpc3RlbmVycy5zcGxpY2UoZm5JbmRleCwgMSk7XG5cbiAgICAgIGlmICh0aGlzLl91cmxDaGFuZ2VMaXN0ZW5lcnMubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHRoaXMuX3VybENoYW5nZVN1YnNjcmlwdGlvbj8udW5zdWJzY3JpYmUoKTtcbiAgICAgICAgdGhpcy5fdXJsQ2hhbmdlU3Vic2NyaXB0aW9uID0gbnVsbDtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbiAgLyoqIEBpbnRlcm5hbCAqL1xuICBfbm90aWZ5VXJsQ2hhbmdlTGlzdGVuZXJzKHVybDogc3RyaW5nID0gJycsIHN0YXRlOiB1bmtub3duKSB7XG4gICAgdGhpcy5fdXJsQ2hhbmdlTGlzdGVuZXJzLmZvckVhY2goZm4gPT4gZm4odXJsLCBzdGF0ZSkpO1xuICB9XG5cbiAgc3Vic2NyaWJlKFxuICAgICAgb25OZXh0OiAodmFsdWU6IGFueSkgPT4gdm9pZCwgb25UaHJvdz86ICgoZXJyb3I6IGFueSkgPT4gdm9pZCl8bnVsbCxcbiAgICAgIG9uUmV0dXJuPzogKCgpID0+IHZvaWQpfG51bGwpOiBTdWJzY3JpcHRpb25MaWtlIHtcbiAgICByZXR1cm4gdGhpcy5fc3ViamVjdC5zdWJzY3JpYmUoe25leHQ6IG9uTmV4dCwgZXJyb3I6IG9uVGhyb3csIGNvbXBsZXRlOiBvblJldHVybn0pO1xuICB9XG5cbiAgbm9ybWFsaXplKHVybDogc3RyaW5nKTogc3RyaW5nIHtcbiAgICByZXR1cm4gbnVsbCE7XG4gIH1cblxuICBwcml2YXRlIHB1c2hIaXN0b3J5KHBhdGg6IHN0cmluZywgcXVlcnk6IHN0cmluZywgc3RhdGU6IGFueSkge1xuICAgIGlmICh0aGlzLl9oaXN0b3J5SW5kZXggPiAwKSB7XG4gICAgICB0aGlzLl9oaXN0b3J5LnNwbGljZSh0aGlzLl9oaXN0b3J5SW5kZXggKyAxKTtcbiAgICB9XG4gICAgdGhpcy5faGlzdG9yeS5wdXNoKG5ldyBMb2NhdGlvblN0YXRlKHBhdGgsIHF1ZXJ5LCBzdGF0ZSkpO1xuICAgIHRoaXMuX2hpc3RvcnlJbmRleCA9IHRoaXMuX2hpc3RvcnkubGVuZ3RoIC0gMTtcbiAgfVxufVxuXG5jbGFzcyBMb2NhdGlvblN0YXRlIHtcbiAgY29uc3RydWN0b3IocHVibGljIHBhdGg6IHN0cmluZywgcHVibGljIHF1ZXJ5OiBzdHJpbmcsIHB1YmxpYyBzdGF0ZTogYW55KSB7fVxufVxuIl19