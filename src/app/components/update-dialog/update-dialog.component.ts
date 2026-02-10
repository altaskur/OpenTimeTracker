import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateCheckResult } from '../../../types/electron';
import { SafeMarkdownPipe } from '../../pipes/safe-markdown.pipe';

@Component({
  selector: 'app-update-dialog',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TranslateModule,
    SafeMarkdownPipe,
  ],
  template: `
    <p-dialog
      [(visible)]="visible"
      [modal]="true"
      [dismissableMask]="true"
      [closable]="true"
      [style]="{ width: '600px', maxWidth: '90vw' }"
      (onHide)="onClose()"
      [header]="
        (isCurrentVersion
          ? 'settings.updates.releaseNotes'
          : 'settings.updates.updateAvailable'
        ) | translate
      "
    >
      @if (updateInfo) {
        <div class="flex flex-column gap-3">
          <!-- Version Information -->
          @if (!isCurrentVersion) {
            <div class="flex align-items-center gap-2">
              <i class="pi pi-gift text-primary text-2xl"></i>
              <div>
                <div class="text-xl font-bold">
                  {{ 'settings.updates.newVersion' | translate }}:
                  {{ updateInfo.version }}
                </div>
                <div class="text-sm text-color-secondary">
                  {{ 'settings.updates.currentVersion' | translate }}:
                  {{ currentVersion }}
                </div>
              </div>
            </div>
          } @else {
            <div class="flex align-items-center gap-2">
              <i class="pi pi-info-circle text-primary text-2xl"></i>
              <div class="text-xl font-bold">
                {{ updateInfo.version }}
              </div>
            </div>
          }

          <!-- Release Date (if available from GitHub API) -->
          @if (releaseDate) {
            <div
              class="flex align-items-center gap-2 text-sm text-color-secondary"
            >
              <i class="pi pi-calendar"></i>
              <span
                >{{ 'settings.updates.releaseDate' | translate }}:
                {{ releaseDate | date: 'medium' }}</span
              >
            </div>
          }

          <!-- Release Notes -->
          @if (updateInfo.releaseNotes) {
            <div
              class="surface-ground p-3 border-round"
              style="max-height: 400px; overflow-y: auto;"
            >
              <h4 class="mt-0 mb-2">
                {{ 'settings.updates.whatIsNew' | translate }}
              </h4>
              <div
                class="markdown-content"
                [innerHTML]="updateInfo.releaseNotes | safeMarkdown"
                (click)="handleLinkClick($event)"
                (keydown.enter)="handleLinkClick($event)"
                tabindex="0"
                role="button"
              ></div>
            </div>
          }
        </div>

        <!-- Dialog Footer -->
        <ng-template pTemplate="footer">
          <div class="flex justify-content-end gap-2">
            @if (!isCurrentVersion) {
              <p-button
                [label]="'settings.updates.later' | translate"
                severity="secondary"
                (onClick)="onClose()"
              >
              </p-button>
              <p-button
                [label]="'settings.updates.download' | translate"
                icon="pi pi-download"
                severity="success"
                (onClick)="onDownload()"
              >
              </p-button>
            } @else {
              <p-button
                [label]="'common.close' | translate"
                severity="secondary"
                (onClick)="onClose()"
              >
              </p-button>
            }
          </div>
        </ng-template>
      }
    </p-dialog>
  `,
  styles: [
    `
      .markdown-content {
        :deep(h1),
        :deep(h2),
        :deep(h3),
        :deep(h4),
        :deep(h5),
        :deep(h6) {
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        :deep(p) {
          margin: 0.5rem 0;
        }

        :deep(ul),
        :deep(ol) {
          margin: 0.5rem 0;
          padding-left: 2rem;
        }

        :deep(li) {
          margin: 0.25rem 0;
        }

        :deep(code) {
          background: var(--surface-100);
          padding: 0.125rem 0.25rem;
          border-radius: 4px;
          font-size: 0.9em;
        }

        :deep(pre) {
          background: var(--surface-100);
          padding: 1rem;
          border-radius: 8px;
          overflow-x: auto;
        }

        :deep(a) {
          color: var(--primary-color);
          text-decoration: underline;
          cursor: pointer;
        }

        :deep(blockquote) {
          border-left: 4px solid var(--primary-color);
          margin: 0.5rem 0;
          padding-left: 1rem;
          color: var(--text-color-secondary);
        }
      }
    `,
  ],
})
export class UpdateDialogComponent {
  @Input() visible = false;
  @Input() updateInfo: UpdateCheckResult | null = null;
  @Input() currentVersion = '';
  @Input() releaseDate: Date | null = null;
  @Input() isCurrentVersion = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() download = new EventEmitter<void>();

  onClose() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  onDownload() {
    this.download.emit();
    this.onClose();
  }

  handleLinkClick(event: Event) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');

    if (anchor && anchor.href) {
      event.preventDefault();
      if (globalThis.window?.electronAPI) {
        globalThis.window.electronAPI.openExternal(anchor.href);
      } else {
        window.open(anchor.href, '_blank');
      }
    }
  }
}
