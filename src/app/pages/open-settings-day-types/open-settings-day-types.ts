import {
  Component,
  OnInit,
  inject,
  signal,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatabaseService } from '../../services/database/database.service';
import { DayType } from '../../../types/electron';
import { OpenDayTypesDialogComponent } from '../../components/open-day-types-dialog/open-day-types-dialog';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';

/**
 * Settings page for managing day types.
 */
@Component({
  selector: 'app-open-settings-day-types',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ToastModule,
    OpenDayTypesDialogComponent,
    OpenLayoutComponent,
  ],
  providers: [MessageService],
  templateUrl: './open-settings-day-types.html',
  styleUrl: './open-settings-day-types.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenSettingsDayTypesComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly messageService = inject(MessageService);

  readonly dayTypes = signal<DayType[]>([]);
  readonly loading = signal(false);
  readonly showDialog = signal(true);

  async ngOnInit(): Promise<void> {
    await this.loadDayTypes();
  }

  async loadDayTypes(): Promise<void> {
    this.loading.set(true);
    try {
      const dayTypes = await this.db.getDayTypes();
      this.dayTypes.set(dayTypes);
    } finally {
      this.loading.set(false);
    }
  }

  async onDayTypeCreated(data: {
    name: string;
    color: string;
    defaultMinutes: number;
  }): Promise<void> {
    try {
      await this.db.createDayType(data.name, data.color, data.defaultMinutes);
      await this.loadDayTypes();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Day type created',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error creating day type',
        life: 3000,
      });
    }
  }

  async onDayTypeUpdated(data: {
    id: string;
    name: string;
    color: string;
    defaultMinutes: number;
  }): Promise<void> {
    try {
      await this.db.updateDayType(data.id, {
        name: data.name,
        color: data.color,
        defaultMinutes: data.defaultMinutes,
      });
      await this.loadDayTypes();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Day type updated',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error updating day type',
        life: 3000,
      });
    }
  }

  async onDayTypeDeleted(id: string): Promise<void> {
    try {
      await this.db.deleteDayType(id);
      await this.loadDayTypes();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Day type deleted',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error deleting day type',
        life: 3000,
      });
    }
  }

  onDialogClosed(): void {
    this.showDialog.set(true);
  }
}
