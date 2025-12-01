import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { DatePipe } from '@angular/common';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { DatabaseService } from '../../services';
import { Project } from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { OpenConfirmDeleteComponent } from '../../components/open-confirm-delete/open-confirm-delete';

/**
 * Projects management page component
 */
@Component({
  selector: 'app-open-projects',
  imports: [
    DatePipe,
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    TooltipModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    OpenLayoutComponent,
    OpenConfirmDeleteComponent,
    TranslateModule,
  ],
  providers: [MessageService],
  templateUrl: './open-projects.html',
  styleUrl: './open-projects.scss',
})
export class OpenProjects implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  projects = signal<Project[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);

  /** Delete confirmation dialog state */
  deleteDialogVisible = signal(false);
  projectToDelete = signal<Project | null>(null);

  /** Search term for filtering projects */
  searchTerm = signal('');

  /** Filtered projects based on search term */
  filteredProjects = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const allProjects = this.projects();
    if (!term) {
      return allProjects;
    }
    return allProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term),
    );
  });

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
        this.showSuccess('toast.projectUpdated');
      } else {
        await this.dbService.createProject(
          this.projectForm.name,
          this.projectForm.description,
        );
        this.showSuccess('toast.projectCreated');
      }
      this.dialogVisible.set(false);
      await this.loadProjects();
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Opens delete confirmation dialog
   */
  confirmDeleteProject(project: Project): void {
    this.projectToDelete.set(project);
    this.deleteDialogVisible.set(true);
  }

  /**
   * Handles delete confirmation
   */
  async onDeleteConfirmed(): Promise<void> {
    const project = this.projectToDelete();
    if (project) {
      await this.deleteProject(project.id);
    }
    this.deleteDialogVisible.set(false);
    this.projectToDelete.set(null);
  }

  /**
   * Handles delete cancellation
   */
  onDeleteCancelled(): void {
    this.deleteDialogVisible.set(false);
    this.projectToDelete.set(null);
  }

  /**
   * Deletes a project by id
   */
  private async deleteProject(id: string): Promise<void> {
    try {
      await this.dbService.deleteProject(id);
      this.showSuccess('toast.projectDeleted');
      await this.loadProjects();
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Shows a success toast message
   */
  private showSuccess(key: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('toast.success'),
      detail: this.translateService.instant(key),
    });
  }

  /**
   * Shows an error toast message
   */
  private showError(key: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translateService.instant('toast.error'),
      detail: this.translateService.instant(key),
    });
  }
}
