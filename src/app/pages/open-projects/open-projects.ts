import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  effect,
} from '@angular/core';

import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { ToastModule } from 'primeng/toast';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';

import { DatabaseService } from '../../services';
import { ActionHistoryService } from '../../services/action-history.service';
import { Project } from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';
import { OpenConfirmDeleteComponent } from '../../components/open-confirm-delete/open-confirm-delete';
import { ProjectTableComponent } from './components';

/**
 * Projects management page component
 */
@Component({
  selector: 'app-open-projects',
  imports: [
    CardModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    ToastModule,
    IconFieldModule,
    InputIconModule,
    FormsModule,
    OpenLayoutComponent,
    OpenConfirmDeleteComponent,
    ProjectTableComponent,
    TranslateModule,
  ],
  providers: [MessageService],
  templateUrl: './open-projects.html',
  styleUrl: './open-projects.scss',
})
export class OpenProjects implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly historyService = inject(ActionHistoryService);
  private readonly translateService = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  constructor() {
    effect(() => {
      const change = this.historyService.dataChanged();
      if (change.timestamp > 0 && change.entityType === 'Project') {
        void this.loadProjects();
      }
    });
  }

  projects = signal<Project[]>([]);
  loading = signal(false);
  dialogVisible = signal(false);

  /** Delete confirmation dialog state */
  deleteDialogVisible = signal(false);
  projectToDelete = signal<Project | null>(null);

  /** Search term for filtering projects */
  searchTerm = signal('');

  /** Filtered open projects based on search term */
  filteredOpenProjects = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const openProjects = this.projects().filter((p) => !p.isClosed);
    if (!term) {
      return openProjects;
    }
    return openProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(term) ||
        project.description?.toLowerCase().includes(term),
    );
  });

  /** Filtered closed projects based on search term */
  filteredClosedProjects = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    const closedProjects = this.projects().filter((p) => p.isClosed);
    if (!term) {
      return closedProjects;
    }
    return closedProjects.filter(
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
        const existingProject = this.projects().find(
          (p) => p.id === this.projectForm.id,
        );
        const previousData = existingProject ? { ...existingProject } : null;

        await this.historyService.execute({
          entityType: 'Project',
          actionType: 'update',
          entityId: this.projectForm.id,
          description: this.translateService.instant(
            'history.actions.updateProject',
          ),
          previousData,
          newData: {
            name: this.projectForm.name,
            description: this.projectForm.description,
          },
          execute: async () => {
            await this.dbService.updateProject(
              this.projectForm.id,
              this.projectForm.name,
              this.projectForm.description,
            );
          },
          undo: async () => {
            if (previousData) {
              await this.dbService.updateProject(
                previousData.id,
                previousData.name,
                previousData.description ?? '',
              );
              await this.loadProjects();
            }
          },
        });
        this.showSuccess('toast.projectUpdated');
      } else {
        let createdId: string | null = null;
        await this.historyService.execute({
          entityType: 'Project',
          actionType: 'create',
          entityId: '',
          description: this.translateService.instant(
            'history.actions.createProject',
          ),
          previousData: null,
          newData: {
            name: this.projectForm.name,
            description: this.projectForm.description,
          },
          execute: async () => {
            const created = await this.dbService.createProject(
              this.projectForm.name,
              this.projectForm.description,
            );
            createdId = created.id;
          },
          undo: async () => {
            if (createdId) {
              await this.dbService.deleteProject(createdId);
              await this.loadProjects();
            }
          },
        });
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
      const existingProject = this.projects().find((p) => p.id === id);
      const previousData = existingProject ? { ...existingProject } : null;

      await this.historyService.execute({
        entityType: 'Project',
        actionType: 'delete',
        entityId: id,
        description: this.translateService.instant(
          'history.actions.deleteProject',
        ),
        previousData,
        newData: null,
        execute: async () => {
          await this.dbService.deleteProject(id);
        },
        undo: async () => {
          if (previousData) {
            await this.dbService.createProject(
              previousData.name,
              previousData.description ?? '',
            );
            await this.loadProjects();
          }
        },
      });
      this.showSuccess('toast.projectDeleted');
      await this.loadProjects();
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Closes a project (only if all tasks are completed)
   */
  async closeProject(project: Project): Promise<void> {
    try {
      const canClose = await this.dbService.canCloseProject(project.id);
      if (!canClose) {
        this.showError('toast.cannotCloseProject');
        return;
      }
      await this.dbService.closeProject(project.id);
      this.showSuccess('toast.projectClosed');
      await this.loadProjects();
    } catch {
      this.showError('toast.error');
    }
  }

  /**
   * Reopens a closed project
   */
  async reopenProject(project: Project): Promise<void> {
    try {
      await this.dbService.reopenProject(project.id);
      this.showSuccess('toast.projectReopened');
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
