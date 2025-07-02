import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MenuItem, PrimeIcons } from 'primeng/api';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { MenubarModule } from 'primeng/menubar';

@Component({
  selector: 'app-header',
  imports: [
    MenubarModule,
    BadgeModule,
    AvatarModule,
    CommonModule,
    RouterModule,
  ],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit(): void {
    this.items = [
      {
        label: 'Dashboard',
        icon: 'pi pi-home',
        routerLink: '/',
      },
      {
        label: 'Projects',
        icon: PrimeIcons.PLUS,
        routerLink: '/projects',
      },
      {
        label: 'Reports',
        icon: 'pi  pi-chart-bar',
        routerLink: '/reports',
      },
      {
        label: 'Config',
        icon: 'pi pi-cog',
        routerLink: '/config',
      },
    ];
  }

  handleToggleDarkMode() {
    document.querySelector('html')?.classList.toggle('my-app-dark');
  }
}
