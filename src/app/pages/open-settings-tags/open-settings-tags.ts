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
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DatabaseService } from '../../services/database/database.service';
import { Tag } from '../../../types/electron';
import { OpenLayoutComponent } from '../../components/open-layout/open-layout';

/**
 * Settings page for managing tags.
 */
@Component({
  selector: 'app-open-settings-tags',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    InputTextModule,
    TableModule,
    TooltipModule,
    TranslateModule,
    ToastModule,
    OpenLayoutComponent,
  ],
  providers: [MessageService],
  templateUrl: './open-settings-tags.html',
  styleUrl: './open-settings-tags.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenSettingsTagsComponent implements OnInit {
  private readonly db = inject(DatabaseService);
  private readonly messageService = inject(MessageService);

  readonly tags = signal<Tag[]>([]);
  readonly loading = signal(false);
  readonly newTagName = signal('');
  readonly editingId = signal<string | null>(null);
  readonly editingName = signal('');

  readonly canAdd = computed(() => this.newTagName().trim().length > 0);

  async ngOnInit(): Promise<void> {
    await this.loadTags();
  }

  async loadTags(): Promise<void> {
    this.loading.set(true);
    try {
      const tags = await this.db.getTags();
      this.tags.set(tags);
    } finally {
      this.loading.set(false);
    }
  }

  async addTag(): Promise<void> {
    const name = this.newTagName().trim();
    if (!name) return;

    try {
      await this.db.createTag(name);
      this.newTagName.set('');
      await this.loadTags();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Tag created',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error creating tag',
        life: 3000,
      });
    }
  }

  startEdit(tag: Tag): void {
    this.editingId.set(tag.id);
    this.editingName.set(tag.name);
  }

  cancelEdit(): void {
    this.editingId.set(null);
    this.editingName.set('');
  }

  async saveEdit(tag: Tag): Promise<void> {
    const name = this.editingName().trim();
    if (!name) return;

    try {
      await this.db.updateTag(tag.id, name);
      this.cancelEdit();
      await this.loadTags();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Tag updated',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error updating tag',
        life: 3000,
      });
    }
  }

  async deleteTag(tag: Tag): Promise<void> {
    try {
      await this.db.deleteTag(tag.id);
      await this.loadTags();
      this.messageService.add({
        severity: 'success',
        summary: '',
        detail: 'Tag deleted',
        life: 3000,
      });
    } catch {
      this.messageService.add({
        severity: 'error',
        summary: '',
        detail: 'Error deleting tag',
        life: 3000,
      });
    }
  }
}
