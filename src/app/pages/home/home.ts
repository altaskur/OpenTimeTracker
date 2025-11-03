import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [CommonModule, CardModule, ButtonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  constructor(private router: Router) {}

  goToDashboard() {
    this.router.navigate(['/dashboard']);
  }

  goToProjects() {
    this.router.navigate(['/projects']);
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
