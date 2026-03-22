import { Component, inject, Input, OnInit, OnDestroy } from '@angular/core';
import { NgIf } from '@angular/common';
import { Subscription } from 'rxjs';
import { OptionsService } from '../../core/options.service';

@Component({
  selector: 'app-sidebar-item',
  templateUrl: './sidebar-item.component.html',
  styleUrls: ['./sidebar-item.component.sass'],
  standalone: true,
  imports: [NgIf]
})
export class SidebarItemComponent implements OnInit, OnDestroy {
  @Input() title: string | (() => string) = '';
  @Input() icon: string = '';
  @Input() onClick: () => void = () => {};

  private options = inject(OptionsService);
  public themeTextColor: string = '#000000';
  private textSub?: Subscription;

  ngOnInit() {
    this.textSub = this.options.observe$('core/sidebar_text_color')
      .subscribe(color => {
        this.themeTextColor = color || '#74b18bff';
      });
  }

  get displayTitle(): string {
    return typeof this.title === 'function' ? this.title() : this.title;
  }

  ngOnDestroy() {
    this.textSub?.unsubscribe();
  }
}