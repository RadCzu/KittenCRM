import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs'; // Important for cleanup
import { SidebarService } from '../../core/sidebar.service';
import { OptionsService } from '../../core/options.service';
import { SidebarItemComponent } from '../sidebar-item/sidebar-item.component';

@Component({
  selector: 'app-main-sidebar',
  standalone: true,
  imports: [SidebarItemComponent],
  templateUrl: './main-sidebar.component.html',
  styleUrl: './main-sidebar.component.sass'
})
export class MainSidebarComponent implements OnInit, OnDestroy {
  public sidebar = inject(SidebarService);
  private options = inject(OptionsService);

  public sidebarBgColor: string = '#74b18bff'; 
  
  private colorSub?: Subscription;

  ngOnInit() {
    this.colorSub = this.options.observe$('core/sidebar_bg_color')
      .subscribe(color => {
        // This runs once on init (thanks to startWith) 
        // and then only when the color actually changes.
        this.sidebarBgColor = color || '#74b18bff';
        console.log('Sidebar color synchronized:', this.sidebarBgColor);
      });
  }

  ngOnDestroy() {
    this.colorSub?.unsubscribe();
  }
}