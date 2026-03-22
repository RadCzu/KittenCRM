import { ApplicationConfig, APP_INITIALIZER } from '@angular/core'; // Added APP_INITIALIZER
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // You likely need this for your plugin JSONs
import { routes } from './app.routes';
import { PluginLoaderService } from '../app/core/plugin.loader.service'

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(), // Ensure this is here so your services can fetch files
    {
      provide: APP_INITIALIZER,
      useFactory: (loader: PluginLoaderService) => () => loader.loadPlugins(),
      deps: [PluginLoaderService],
      multi: true
    }
  ]
};