import { Routes } from '@angular/router';
import { MainAreaComponent } from './layout/main-area/main-area.component';

export const routes: Routes = [
  { 
    path: '**', 
    component: MainAreaComponent, 
  },
];
