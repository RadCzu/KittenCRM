import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { LanguageService } from '../../../../core/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { OptionsService } from '../../../../core/options.service';
import { HelloWorldPluginService } from '../../hello-world.plugin.service';

/**
 * HelloWorldComponent represents the primary UI view for the Hello World plugin.
 * It provides a localized interface and integrates with the global options system.
 */
@Component({
  selector: 'app-hello-world',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hello-world.component.html',
  styleUrl: './hello-world.component.sass'
})
export class HelloWorldComponent implements OnInit, OnDestroy {
  /** The plugin service associated with this component */
  private myService = inject(HelloWorldPluginService);
  
  /** Service for managing plugin-specific configuration settings */
  private options = inject(OptionsService);
  
  /** Service providing translation/localization functionality */
  public lang = inject(LanguageService);
  
  /** Subscription tracker to prevent memory leaks */
  private sub = new Subscription();

  /** Lifecycle hook for component initialization */
  ngOnInit() {
  }

  /**
   * Helper function to fetch localized strings using the plugin's name.
   * * @param key - The translation key to look up.
   * @param plugin - The name of the plugin (defaults to current plugin).
   * @returns The localized string.
   */
  t(key: string, plugin: string = this.myService.name): string {
    return this.lang.t(key, plugin);
  }

  /** Lifecycle hook for cleanup to prevent memory leaks */
  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}