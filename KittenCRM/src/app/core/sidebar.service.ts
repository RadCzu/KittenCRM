import { Injectable } from '@angular/core';

export interface SidebarItem {
  title: string | (() => string);
  icon: string;
  onClick: () => void;
}

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private items: SidebarItem[] = [];

  addItem(item: SidebarItem) {
    this.items.push(item);
  }

  getItems(): SidebarItem[] {
    return this.items;
  }

}