import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
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
  iconSelected = signal(PrimeIcons.MOON);

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
    const html = document.querySelector('html');
    html?.classList.toggle('my-app-dark');

    if (html?.classList.contains('my-app-dark')) {
      this.iconSelected.set(PrimeIcons.SUN);
      return;
    }

    this.iconSelected.set(PrimeIcons.MOON);
  }
}
