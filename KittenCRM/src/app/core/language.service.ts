import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private currentLanguage = 'pl';
  // Structure: { [pluginName]: { [langCode]: { ...translations } } }
  private translations: Record<string, Record<string, any>> = {};
  private subscribers: Set<() => void> = new Set();

  /**
   * Updates the state and notifies UI components to re-render
   */
  setLanguage(lang: string) {
    if (this.currentLanguage === lang) return;
    this.currentLanguage = lang;
    this.notify();
  }

  /**
   * Orchestrates a language change: Updates state, fetches core assets, and notifies.
   */
  async changeLanguage(newLang: string, http: HttpClient) {
    // Set the language first so 't' knows which bucket to look in
    this.currentLanguage = newLang;

    try {
      const coreJson = await firstValueFrom(
        http.get<Record<string, any>>(`assets/lang/${newLang}.json`)
      );
      // Explicitly register this JSON for the newLang
      this.registerPlugin('core', coreJson, newLang);
    } catch (e) {
      console.error(`Could not load core language file for ${newLang}`, e);
    }

    this.notify();
  }

  getLanguage() { return this.currentLanguage; }

  subscribe(cb: () => void) {
    this.subscribers.add(cb);
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  /**
   * Registers translations for a specific plugin and specific language.
   * If 'lang' is not provided, it defaults to currentLanguage.
   */
  registerPlugin(pluginName: string, json: Record<string, any>, lang?: string) {
    const targetLang = lang || this.currentLanguage;

    // CIRCUIT BREAKER: If this specific plugin already has data for this language,
    // However, check if the JSON is actually different first!
    const currentData = this.translations[pluginName]?.[targetLang];
    if (currentData && JSON.stringify(currentData) === JSON.stringify(json)) {
      return; // Already registered, do nothing
    }

    if (!this.translations[pluginName]) {
      this.translations[pluginName] = {};
    }

    // We store the data in the specific language bucket provided.
    // This prevents "English" data being saved under a "Polish" key during boot.
    this.translations[pluginName][targetLang] = {
      ...(this.translations[pluginName][targetLang] || {}),
      ...json
    };

    console.log(`[LanguageService] Registered ${pluginName} for ${targetLang}`);
    this.notify();
  }

  /**
   * Translation function
   */
  t(key: string, pluginName: string): string {
    const langBucket = this.translations[pluginName]?.[this.currentLanguage];

    if (!langBucket) {
      // Fallback: Try to find ANY language for this plugin if current is missing
      const fallbackBucket = Object.values(this.translations[pluginName] || {})[0];
      if (!fallbackBucket) return `MISSING BUCKET: ${pluginName}`;
      return this.resolveKey(key, fallbackBucket);
    }

    return this.resolveKey(key, langBucket);
  }

  private resolveKey(key: string, bucket: any): string {
    const value = key.split('.').reduce((obj, segment) => obj?.[segment], bucket);
    return typeof value === 'string' ? value : `MISSING: ${key}`;
  }
}