import { Component, OnInit, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { DatabaseService } from '../../services/database.service';
import { Project } from '../../../types/electron';

@Component({
  selector: 'app-projects',
  imports: [
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss',
})
export class Projects implements OnInit {
  private readonly dbService = inject(DatabaseService);

  projects = signal<Project[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);

  projectForm = {
    id: '',
    name: '',
    description: '',
  };

  ngOnInit(): void {
    void this.loadProjects();
  }

  async loadProjects(): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.dbService.getProjects();
      this.projects.set(data);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      this.loading.set(false);
    }
  }

  openNewDialog(): void {
    this.projectForm = { id: '', name: '', description: '' };
    this.dialogVisible.set(true);
  }

  openEditDialog(project: Project): void {
    this.projectForm = {
      id: project.id,
      name: project.name,
      description: project.description ?? '',
    };
    this.dialogVisible.set(true);
  }

  async saveProject(): Promise<void> {
    try {
      if (this.projectForm.id) {
        await this.dbService.updateProject(
          this.projectForm.id,
          this.projectForm.name,
          this.projectForm.description,
        );
      } else {
        await this.dbService.createProject(
          this.projectForm.name,
          this.projectForm.description,
        );
      }
      this.dialogVisible.set(false);
      await this.loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  }

  async deleteProject(id: string): Promise<void> {
    if (confirm('¿Está seguro de eliminar este proyecto?')) {
      try {
        await this.dbService.deleteProject(id);
        await this.loadProjects();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }
}
