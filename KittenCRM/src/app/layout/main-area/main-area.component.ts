import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router } from "@angular/router";

@Component({
  selector: 'app-main-area',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './main-area.component.html',
  styleUrl: './main-area.component.sass'
})
export class MainAreaComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit() {
    console.log('--- MainAreaComponent initialized ---');
    console.log('Current URL at init:', this.router.url);
    console.log('Active Router Config:', this.router.config);
  }
}