import { Component, OnInit, inject, signal } from '@angular/core';

import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DatabaseService } from '../../services/database.service';
import { Project } from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';

/**
 * Projects management page component
 */
@Component({
  selector: 'app-open-projects',
  imports: [
    CardModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    OpenLayoutComponent,
    TranslateModule,
  ],
  templateUrl: './open-projects.html',
})
export class OpenProjects implements OnInit {
  private readonly dbService = inject(DatabaseService);
  private readonly translateService = inject(TranslateService);

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
  }

  async deleteProject(id: string): Promise<void> {
    const confirmMessage = this.translateService.instant(
      'dialogs.deleteProject',
    );
    if (confirm(confirmMessage)) {
      await this.dbService.deleteProject(id);
      await this.loadProjects();
    }
  }
}
