import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ColorPickerModule } from 'primeng/colorpicker';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatabaseService } from '../../services/database/database.service';
import { TaskStatus } from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';

/**
 * Settings page for managing task statuses.
 */
@Component({
  selector: 'app-open-settings-statuses',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    ColorPickerModule,
    TooltipModule,
    TranslateModule,
    ToastModule,
    OpenLayoutComponent,
  ],
  providers: [MessageService],
  templateUrl: './open-settings-statuses.html',
  styleUrl: './open-settings-statuses.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenSettingsStatusesComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);

  readonly statuses = signal<TaskStatus[]>([]);
  readonly loading = signal(false);
  readonly newStatusName = signal('');
  readonly newStatusColor = signal('#475569');
  readonly editingId = signal<string | null>(null);
  readonly editingName = signal('');
  readonly editingColor = signal('');

  readonly canAdd = computed(() => this.newStatusName().trim().length > 0);

  ngOnInit(): void {
    void this.loadStatuses();
  }

  async loadStatuses(): Promise<void> {
    this.loading.set(true);
    try {
      const statuses = await this.db.getTaskStatuses();
      this.statuses.set(statuses);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Gets the display name for a status (translated if it's a default status key)
   */
  getStatusDisplayName(status: TaskStatus): string {
    if (status.name.startsWith('status.')) {
      return this.translate.instant(status.name);
    }
    return status.name;
  }

  async addStatus(): Promise<void> {
    const name = this.newStatusName().trim();
    if (!name) return;

    try {
      await this.db.createTaskStatus(name, this.newStatusColor());
      this.newStatusName.set('');
      this.newStatusColor.set('#475569');
      await this.loadStatuses();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Status created',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error creating status',
        life: 3000,
      });
    }
  }

  startEdit(status: TaskStatus): void {
    this.editingId.set(status.id);
    this.editingName.set(
      status.name.startsWith('status.')
        ? this.translate.instant(status.name)
        : status.name,
    );
    this.editingColor.set(status.color);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editingName.set('');
    this.editingColor.set('');
  }

  async saveEdit(status: TaskStatus): Promise<void> {
    const name = this.editingName().trim();
    if (!name) return;

    try {
      const finalName = status.isDefault ? status.name : name;
      await this.db.updateTaskStatus(status.id, finalName, this.editingColor());
      this.cancelEdit();
      await this.loadStatuses();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Status updated',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error updating status',
        life: 3000,
      });
    }
  }

  async deleteStatus(status: TaskStatus): Promise<void> {
    if (status.isDefault) {
      this.messageService.add({
        severity: 'warn',
        summary: '',
        detail: this.translate.instant('settings.statuses.cannotDeleteDefault'),
        life: 3000,
      });
      return;
    }

    try {
      await this.db.deleteTaskStatus(status.id);
      await this.loadStatuses();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Status deleted',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error deleting status',
        life: 3000,
      });
    }
  }
}
