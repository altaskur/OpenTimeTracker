import { Component, inject } from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CardModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private readonly router = inject(Router);

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToProjects(): void {
    this.router.navigate(['/projects']);
  }

  toggleDarkMode(): void {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
