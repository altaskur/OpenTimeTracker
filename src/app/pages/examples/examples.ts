import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { Router } from '@angular/router';

interface Example {
  id: number;
  message: string;
  created_at: string;
}

@Component({
  selector: 'app-examples',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TableModule,
  ],
  templateUrl: './examples.html',
  styleUrl: './examples.scss',
})
export class Examples implements OnInit {
  private router = inject(Router);

  examples = signal<Example[]>([]);
  loading = signal(false);
  adding = signal(false);
  newMessage = '';

  async ngOnInit() {
    await this.loadExamples();
  }

  async loadExamples() {
    this.loading.set(true);
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        const result = await window.electronAPI.getExamples();
        this.examples.set(result);
      } else {
        console.warn('Electron API not available');
      }
    } catch (error) {
      console.error('Error loading examples:', error);
    } finally {
      this.loading.set(false);
    }
  }

  async addExample() {
    if (!this.newMessage.trim()) return;

    this.adding.set(true);
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.addExample(this.newMessage);
        this.newMessage = '';
        await this.loadExamples();
      } else {
        console.warn('Electron API not available');
      }
    } catch (error) {
      console.error('Error adding example:', error);
    } finally {
      this.adding.set(false);
    }
  }

  goHome() {
    this.router.navigate(['/']);
  }
}
