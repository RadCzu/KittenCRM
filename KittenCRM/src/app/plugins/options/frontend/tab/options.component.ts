import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { OptionsService } from '../../../../core/options.service';
import { LanguageService } from '../../../../core/language.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.sass'
})
export class OptionsComponent implements OnInit, OnDestroy {
  private optionsService = inject(OptionsService);
  public lang = inject(LanguageService);

  public groupedOptions: Record<string, any[]> = {};
  public themeBgColor: string = '#74b18b';
  public themeTextColor: string = '#000000';
  
  // This holds the changes before they are committed
  public draftValues: Record<string, any> = {}; 
  
  private sub = new Subscription();

  ngOnInit() {
    // 1. ALWAYS populate the draft first. 
    // This ensures draftValues[path] exists before the HTML tries to read it.
    this.initDraft();
    
    // 2. Then group the options for the UI
    this.loadAndGroupOptions();

    // 3. Subscriptions
    this.sub.add(
      this.lang.subscribe(() => {
        console.log('Language changed, refreshing options UI');
        this.loadAndGroupOptions();
      })
    );

    // Theme subscriptions...
    this.sub.add(this.optionsService.observe$('core/sidebar_bg_color').subscribe(color => this.themeBgColor = color || '#74b18b'));
    this.sub.add(this.optionsService.observe$('core/sidebar_text_color').subscribe(color => this.themeTextColor = color || '#000000'));
  }
  loadAndGroupOptions() {
    const allOptions = this.optionsService.getSnapshot();
    this.groupedOptions = allOptions.reduce((acc, option) => {
      const ns = option.namespace;
      if (!acc[ns]) acc[ns] = [];
      acc[ns].push(option);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private initDraft() {
    // Fill the draft with current values from the service
    const allOptions = this.optionsService.getSnapshot();
    allOptions.forEach(opt => {
      this.draftValues[opt.fullPath] = opt.current_value;
    });
  }

  // Update ONLY the local draft
  onUpdate(fullPath: string, value: any) {
    this.draftValues[fullPath] = value;
    
    // Optional: Update local theme preview variables if the user edits them
    if (fullPath === 'core/sidebar_bg_color') this.themeBgColor = value;
    if (fullPath === 'core/sidebar_text_color') this.themeTextColor = value;
  }

  save() {

    window.alert(this.t("save_alert"))
    // 1. Commit draft to the service
    Object.keys(this.draftValues).forEach(path => {
      this.optionsService.update(path, this.draftValues[path]);
    });

    // 2. Sync to localStorage
    this.optionsService.syncToCache();
    
    console.log('Settings committed and saved.');
  }

  t(key: string, plugin: string = 'options'): string {
    return this.lang.t(key, plugin);
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}