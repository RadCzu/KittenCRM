import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

export interface OptionDefinition {
  name: string;
  default_value: any;
  type: 'text' | 'number' | 'boolean' | 'color' | 'select';
  label: string;
  meta?: any;
}

@Injectable({ providedIn: 'root' })
export class OptionsService {
  private registry = new Map<string, OptionDefinition & { namespace: string }>();
  private activeValues: Record<string, any> = {};
  private readonly STORAGE_KEY = 'kitten_crm_user_prefs';

  // 1. The Megaphone: Broadcasts the "path" of the option that changed
  private _changes$ = new Subject<string>();

  registerOptions(defs: OptionDefinition[], namespace: string) {
    defs.forEach(def => {
      const fullPath = `${namespace}/${def.name}`;
      this.registry.set(fullPath, { ...def, namespace });
      
      // Load value: Cache > Default
      this.activeValues[fullPath] = this.getValueFromCache(fullPath) ?? def.default_value;
    });
    // Trigger a global refresh for anyone listening to '*'
    this._changes$.next('*');
  }

  /**
   * Returns an Observable for a specific key.
   * It emits the current value immediately upon subscription.
   */
  observe$(fullPath: string): Observable<any> {
    return this._changes$.asObservable().pipe(
      // Only react if the specific key changed OR if a bulk registration happened (*)
      filter(key => key === fullPath || key === '*'),
      // startWith ensures the component gets the current value the moment it subscribes
      startWith(fullPath),
      map(() => this.get(fullPath))
    );
  }

  get(fullPath: string): any {
    return this.activeValues[fullPath];
  }

  update(fullPath: string, value: any) {
    if (this.registry.has(fullPath)) {
      this.activeValues[fullPath] = value;
      this.syncToCache();
      // 2. Notify subscribers that this specific key has a new value
      this._changes$.next(fullPath);
    } else {
      console.error(`Attempted to update non-existent option: ${fullPath}`);
    }
  }

  public syncToCache() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.activeValues));
  }

  public getValueFromCache(fullPath: string): any {
    const cached = localStorage.getItem(this.STORAGE_KEY);
    if (!cached) return null;
    try {
      return JSON.parse(cached)[fullPath];
    } catch {
      return null;
    }
  }

  getSnapshot() {
    return Array.from(this.registry.entries()).map(([fullPath, def]) => ({
      ...def,
      fullPath,
      current_value: this.activeValues[fullPath]
    }));
  }
}