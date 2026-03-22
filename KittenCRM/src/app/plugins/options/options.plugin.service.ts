import { Injectable } from '@angular/core';
import { SidebarService } from '../../core/sidebar.service';
import { LanguageService } from '../../core/language.service';
import { HttpClient } from '@angular/common/http';
import { IPluginService } from '../../core/IPluginService';
import { Route, Router } from '@angular/router';
import { OptionsComponent } from './frontend/tab/options.component';
import { firstValueFrom } from 'rxjs';
import { OptionDefinition, OptionsService } from '../../core/options.service';

@Injectable({ providedIn: 'root' })
export class OptionsPluginService extends IPluginService {
  
  override name: string = "options";

  private defaultJson: Record<string, any> = { title: 'Options' };

  constructor(
    private sidebar: SidebarService,
    private lang: LanguageService,
    private optionsService: OptionsService,
    private http: HttpClient,
    private router: Router,
  ) {
    super();
  }

  /** Must be called explicitly after Angular sets up providers */
  override async register(): Promise<void> {
    
    console.log('OptionsPluginService initializing...');

    await this.initLang(); // Initial load
  
    this.lang.subscribe(async () => {
      console.log("Language changed detected in Options Plugin!");
      await this.initLang();
    });

    await this.initOptions();

    this.sidebar.addItem({
      title: () => this.lang.t('title', 'options'),
      icon: 'assets/plugins/options/options.svg',
      onClick: () => this.openOptionsTab()
    });
  }

  private async initLang(): Promise<void> {
    const currentLang = this.lang.getLanguage();
    let json: Record<string, any> = {};

    try {
      const langJson = await this.http
        .get<Record<string, any>>(`/assets/plugins/options/lang/${currentLang}.json`)
        .toPromise();
      json = langJson ?? {};
    } catch {
      json = {};
    }

    if (!json || Object.keys(json).length === 0) {
      try {
        const defaultJson = await this.http
          .get<Record<string, any>>(`/assets/plugins/options/lang/default.json`)
          .toPromise();
        json = defaultJson ?? {};
      } catch {
        console.warn('Options plugin language file not found, using empty default');
        json = this.defaultJson;
      }
    }

    this.lang.registerPlugin('options', json, currentLang);
  }

  private async initOptions(): Promise<void> {
    try {
      // Look for assets/plugins/options/options.json
      const pluginOptions = await firstValueFrom(
        this.http.get<OptionDefinition[]>(`assets/plugins/${this.name}/options.json`)
      );
      
      // Hand them to the central memory service
      // This is the "Load to memory once" part
      this.optionsService.registerOptions(pluginOptions, this.name);
    } catch (e) {
      console.log(`No options file found for plugin: ${this.name}`);
    }
  }

  private openOptionsTab(): void {
    console.log('Options tab clicked! Moving to the plugin route...');
    this.router.navigate(['', this.name]);
  }

  override routes: Route[] = [
    { 
      path: '', 
      component: OptionsComponent 
    },
    {
      path: 'test',
      // For now, let's just reuse the same component to see if the URL changes
      // Later, you can create a specific TestComponent
      component: OptionsComponent 
    }
  ];
}