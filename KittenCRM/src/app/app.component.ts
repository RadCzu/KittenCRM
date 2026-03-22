import { Component } from '@angular/core';
import { RouterOutlet, ɵEmptyOutletComponent } from '@angular/router';
import { MainSidebarComponent } from './layout/main-sidebar/main-sidebar.component';
import { MainAreaComponent } from './layout/main-area/main-area.component';
import { PluginLoaderService } from './core/plugin.loader.service';


@Component({
   selector: 'app-root',
   standalone: true,
   imports: [
    RouterOutlet,
    ɵEmptyOutletComponent,
    MainAreaComponent,
    MainSidebarComponent
   ],
   templateUrl: './app.component.html',
   styleUrl: './app.component.sass'
})
export class AppComponent {
  constructor(private pluginLoader: PluginLoaderService) {}

  async ngOnInit() {
    await this.pluginLoader.loadPlugins();
  }
}