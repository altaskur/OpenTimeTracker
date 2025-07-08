import { Component, signal, inject } from '@angular/core';
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
  private router = inject(Router);

  loading = signal(false);
  response = signal('');

  async testPing() {
    this.loading.set(true);
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.ping();
        this.response.set(result);
      } else {
        this.response.set('Electron API not available (web mode)');
      }
    } catch (error) {
      console.error('Error in ping:', error);
      this.response.set('Error performing ping');
    } finally {
      this.loading.set(false);
    }
  }

  goToExamples() {
    this.router.navigate(['/examples']);
  }

  toggleDarkMode() {
    const element = document.querySelector('html');
    element?.classList.toggle('my-app-dark');
  }
}
