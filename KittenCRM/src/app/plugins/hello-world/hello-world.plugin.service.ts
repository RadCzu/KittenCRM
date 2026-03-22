import { Injectable } from '@angular/core';
import { SidebarService } from '../../core/sidebar.service';
import { LanguageService } from '../../core/language.service';
import { HttpClient } from '@angular/common/http';
import { IPluginService } from '../../core/IPluginService';
import { Route, Router } from '@angular/router';
import { HelloWorldComponent } from './frontend/tab/hello-world.component';
import { firstValueFrom } from 'rxjs';
import { OptionDefinition, OptionsService } from '../../core/options.service';

/**
 * HelloWorldPluginService handles the lifecycle, localization, 
 * and configuration registration for the Hello World plugin.
 */
@Injectable({ providedIn: 'root' })
export class HelloWorldPluginService extends IPluginService {
  
  /** Unique identifier for this plugin */
  override name: string = "hello-world";

  /** Fallback language configuration if external files are missing */
  private defaultJson: Record<string, any> = { title: 'Hello world' };

  constructor(
    private sidebar: SidebarService,
    private lang: LanguageService,
    private optionsService: OptionsService,
    private http: HttpClient,
    private router: Router,
  ) {
    super();
  }

  /**
   * Performs plugin setup: registers localization, loads configuration options,
   * and registers the plugin in the sidebar.
   */
  override async register(): Promise<void> {
    console.log(`${this.name} Plugin Service initializing...`);

    await this.initLang();
  
    // Listen for language changes to update localized strings dynamically
    this.lang.subscribe(async () => {
      console.log(`Language changed detected in ${this.name} Plugin!`);
      await this.initLang();
    });

    await this.initMe();

    // Register UI entry point in the main sidebar
    this.sidebar.addItem({
      title: () => this.lang.t('title', `${this.name}`),
      icon: `assets/plugins/${this.name}/icon.svg`,
      onClick: () => this.openMyTab()
    });
  }

  /**
   * Fetches localization JSON from the plugin's asset folder.
   * Attempts to load current language file, then defaults.
   */
  private async initLang(): Promise<void> {
    const currentLang = this.lang.getLanguage();
    let json: Record<string, any> = {};

    try {
      const langJson = await this.http
        .get<Record<string, any>>(`/assets/plugins/${this.name}/lang/${currentLang}.json`)
        .toPromise();
      json = langJson ?? {};
    } catch {
      json = {};
    }

    if (!json || Object.keys(json).length === 0) {
      try {
        const defaultJson = await this.http
          .get<Record<string, any>>(`/assets/plugins/${this.name}/lang/default.json`)
          .toPromise();
        json = defaultJson ?? {};
      } catch {
        console.warn(`${this.name} plugin language file not found, using empty default`);
        json = this.defaultJson;
      }
    }

    this.lang.registerPlugin(`${this.name}`, json, currentLang);
  }

  /**
   * Loads plugin-specific configuration from options.json and registers 
   * them with the core OptionsService.
   */
  private async initMe(): Promise<void> {
    try {
      const pluginOptions = await firstValueFrom(
        this.http.get<OptionDefinition[]>(`assets/plugins/${this.name}/options.json`)
      );
      
      this.optionsService.registerOptions(pluginOptions, this.name);
    } catch (e) {
      console.log(`No options file found for plugin: ${this.name}`);
    }
  }

  /** Navigates the router to this plugin's view */
  private openMyTab(): void {
    this.router.navigate(['', this.name]);
  }

  /** Defines the Angular route for this plugin's components */
  override routes: Route[] = [
    { 
      path: '', 
      component: HelloWorldComponent 
    },
  ];
}