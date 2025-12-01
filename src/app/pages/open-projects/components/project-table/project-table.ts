import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

import { Project } from '../../../../../types/electron';

/**
 * Reusable project table component for displaying projects
 */
@Component({
  selector: 'app-project-table',
  imports: [
    DatePipe,
    TableModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    TranslateModule,
  ],
  templateUrl: './project-table.html',
  styleUrl: './project-table.scss',
})
export class ProjectTableComponent {
  /** Projects to display in the table */
  projects = input.required<Project[]>();

  /** Loading state */
  loading = input<boolean>(false);

  /** Empty message translation key */
  emptyMessage = input<string>('projects.empty');

  /** Whether to show closed projects (with reopen button) */
  showClosed = input<boolean>(false);

  /** Event emitted when edit button is clicked */
  editProject = output<Project>();

  /** Event emitted when delete button is clicked */
  deleteProject = output<Project>();

  /** Event emitted when close button is clicked */
  closeProject = output<Project>();

  /** Event emitted when reopen button is clicked */
  reopenProject = output<Project>();

  onEdit(project: Project): void {
    this.editProject.emit(project);
  }

  onDelete(project: Project): void {
    this.deleteProject.emit(project);
  }

  onClose(project: Project): void {
    this.closeProject.emit(project);
  }

  onReopen(project: Project): void {
    this.reopenProject.emit(project);
  }
}
