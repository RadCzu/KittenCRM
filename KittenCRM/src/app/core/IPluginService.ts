import { Route } from '@angular/router';

export abstract class IPluginService {
  public abstract name: string;
  abstract register(): void | Promise<void>;
  
  routes?: Route[]; 
}