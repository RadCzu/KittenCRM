import { Injectable, inject, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Added
import { firstValueFrom } from 'rxjs'; // Added
import { PLUGIN_REGISTRY } from '../generated/plugins.gen';
import { OptionsService, OptionDefinition } from './options.service'; // Added OptionsService
import { LanguageService } from './language.service';

@Injectable({ providedIn: 'root' })
export class PluginLoaderService {
  private injector = inject(Injector);
  private router = inject(Router);
  private http = inject(HttpClient);
  private optionsService = inject(OptionsService);
  private lang = inject(LanguageService)

  async loadPlugins() {
    // 1. Load Core Options FIRST
    try {
      const coreOptions = await firstValueFrom(
        this.http.get<OptionDefinition[]>('assets/core-options.json')
      );
      this.optionsService.registerOptions(coreOptions, 'core');
    } catch (e) {
      console.error('Failed to load core options:', e);
    }

    this.initCoreLang();

    this.optionsService.observe$('core/system_language').subscribe(async (newLang) => {
      console.log(newLang)
      if (newLang && newLang !== this.lang.getLanguage()) {
        this.lang.setLanguage(newLang);
        await this.initCoreLang();
      }
    });

    const dynamicRoutes = [];

    // 2. Load Plugins
    for (const plugin of PLUGIN_REGISTRY) {
      const serviceInstance = this.injector.get(plugin.service);

      // We call register() - inside here, the plugin will call 
      // this.optionsService.registerOptions(pluginOptions, this.name)
      if (typeof serviceInstance.register === 'function') {
        await serviceInstance.register();
      }

      if (serviceInstance.routes) {
        dynamicRoutes.push({
          path: serviceInstance.name,
          loadComponent: () => import('../layout/main-area/main-area.component').then(m => m.MainAreaComponent),
          children: serviceInstance.routes 
        });
      }
    }

    // 3. Update Router Config
    this.router.resetConfig([
      ...dynamicRoutes,
      ...this.router.config 
    ]);

    // 4. THE REFRESH FIX
    if (window.location.pathname !== '/') {
      await this.router.navigateByUrl(window.location.pathname);
    }
  }

  getPluginService(name: string) {
    const entry = PLUGIN_REGISTRY.find(p => p.name === name);
    return entry ? this.injector.get(entry.service) : null;
  }

  private async initCoreLang() {
    const currentLang = this.lang.getLanguage();
    try {
      const coreJson = await firstValueFrom(
        this.http.get<Record<string, any>>(`assets/lang/${currentLang}.json`)
      );
      this.lang.registerPlugin('core', coreJson);
    } catch (e) {
      console.error(`Failed to load core language: ${currentLang}`, e);
    }
  }
}