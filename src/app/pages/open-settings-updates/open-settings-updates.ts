import {
  Component,
  inject,
  OnInit,
  NgZone,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { MessageModule } from 'primeng/message';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateService } from '../../services/update.service';
import { UpdateCheckResult } from '../../../types/electron';
import { UpdateDialogComponent } from '../../components/update-dialog/update-dialog.component';

@Component({
  selector: 'app-open-settings-updates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ToggleSwitchModule,
    MessageModule,
    TranslateModule,
    UpdateDialogComponent,
  ],
  template: `
    <div class="p-4">
      <h2 class="mb-4">{{ 'settings.updates.title' | translate }}</h2>

      <div class="grid">
        <!-- Main Updates Card -->
        <div class="col-12">
          <p-card>
            <ng-template pTemplate="header">
              <div class="p-3 pb-0">
                <h3 class="m-0">
                  {{ 'settings.updates.checkForUpdates' | translate }}
                </h3>
              </div>
            </ng-template>

            <div class="flex flex-column gap-4">
              <!-- Current Version -->
              <div class="flex align-items-center justify-content-between">
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-info-circle text-lg"></i>
                  <span class="font-semibold"
                    >{{ 'settings.updates.currentVersion' | translate }}:</span
                  >
                  <span>{{ currentVersion }}</span>
                </div>
                <p-button
                  [label]="'settings.updates.viewReleaseNotes' | translate"
                  icon="pi pi-file-edit"
                  severity="secondary"
                  size="small"
                  [outlined]="true"
                  (onClick)="showCurrentVersionNotes()"
                ></p-button>
              </div>

              <!-- Auto Check Toggle -->
              <div
                class="flex align-items-center justify-content-between surface-ground p-3 border-round"
              >
                <div class="flex align-items-center gap-2">
                  <i class="pi pi-sync"></i>
                  <label for="autoCheck" class="font-semibold">{{
                    'settings.updates.autoCheck' | translate
                  }}</label>
                </div>
                <p-toggleswitch
                  inputId="autoCheck"
                  [ngModel]="updateService.autoCheck()"
                  (ngModelChange)="updateService.toggleAutoCheck($event)"
                >
                </p-toggleswitch>
              </div>

              <!-- Check for Updates Button and Status -->
              <div class="flex flex-column gap-3">
                <div class="flex align-items-center gap-3">
                  <p-button
                    [label]="'settings.updates.checkNow' | translate"
                    [loading]="updateService.checking()"
                    (onClick)="checkNow()"
                    icon="pi pi-refresh"
                  >
                  </p-button>

                  <!-- Status Message (Up to Date) -->
                  @if (
                    lastCheckResult !== null && !lastCheckResult.updateAvailable
                  ) {
                    <div class="flex align-items-center gap-2 text-green-500">
                      <i class="pi pi-check-circle text-xl"></i>
                      <span class="font-bold">{{
                        'settings.updates.upToDate' | translate
                      }}</span>
                    </div>
                  }
                </div>

                <!-- Update Available Notification -->
                @if (updateService.updateAvailable(); as update) {
                  <p-message
                    severity="success"
                    [text]="
                      ('settings.updates.newVersionAvailable' | translate) +
                      ': ' +
                      update.version
                    "
                  >
                    <ng-template pTemplate="icon">
                      <i class="pi pi-gift text-2xl"></i>
                    </ng-template>
                  </p-message>

                  <div class="flex gap-2">
                    <p-button
                      [label]="'settings.updates.viewDetails' | translate"
                      icon="pi pi-eye"
                      severity="info"
                      (onClick)="showUpdateDialog()"
                    >
                    </p-button>
                  </div>
                }
              </div>

              <!-- GitHub Link -->
              <div
                class="flex align-items-center gap-2 pt-2 border-top-1 surface-border"
              >
                <i class="pi pi-github"></i>
                <button
                  type="button"
                  (click)="openGitHubReleases($event)"
                  class="p-0 border-none bg-transparent text-primary cursor-pointer"
                  style="text-decoration: underline;"
                >
                  {{ 'settings.updates.viewReleasesOnGitHub' | translate }}
                </button>
              </div>

              <!-- Last Checked -->
              @if (updateService.lastChecked(); as lastChecked) {
                <div
                  class="flex align-items-center gap-2 text-sm text-color-secondary"
                >
                  <i class="pi pi-clock"></i>
                  <span
                    >{{ 'settings.updates.lastChecked' | translate }}:
                    {{ lastChecked | date: 'medium' }}</span
                  >
                </div>
              }
            </div>
          </p-card>
        </div>
      </div>
    </div>

    <!-- Update Dialog -->
    <app-update-dialog
      [(visible)]="dialogVisible"
      [updateInfo]="updateService.updateAvailable()"
      [currentVersion]="currentVersion"
      [releaseDate]="updateReleaseDate"
      (download)="handleDownload()"
    >
    </app-update-dialog>

    <!-- Current Version Dialog -->
    <app-update-dialog
      [(visible)]="currentVersionDialogVisible"
      [updateInfo]="{
        version: currentVersion,
        releaseNotes: currentVersionReleaseNotes,
        updateAvailable: false,
        url: '',
      }"
      [currentVersion]="currentVersion"
      [releaseDate]="null"
      [isCurrentVersion]="true"
    >
    </app-update-dialog>
  `,
  styles: [
    `
      :host {
        display: block;
        height: 100%;
      }
    `,
  ],
})
export class OpenSettingsUpdatesComponent implements OnInit {
  updateService = inject(UpdateService);
  private readonly ngZone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);

  lastCheckResult: UpdateCheckResult | null = null;
  currentVersion = '...';
  dialogVisible = false;
  updateReleaseDate: Date | null = null;
  currentVersionDialogVisible = false;
  currentVersionReleaseNotes: string | null = null;

  ngOnInit() {
    if (globalThis.window?.electronAPI) {
      // Use promise chain to ensure we handle the zone correctly from the start
      globalThis.window.electronAPI.getVersion().then((version) => {
        this.ngZone.run(() => {
          this.currentVersion = version;
          // Fetch notes after getting version
          this.fetchCurrentVersionNotes();
        });
      });
    }
  }

  async checkNow() {
    this.lastCheckResult = null;
    const result = await this.updateService.checkForUpdates(true);

    this.ngZone.run(async () => {
      this.lastCheckResult = result;
      // If update is available, show the dialog
      if (result?.updateAvailable) {
        await this.fetchUpdateReleaseDate(result.version);
        this.showUpdateDialog();
      }
    });
  }

  showUpdateDialog() {
    const update = this.updateService.updateAvailable();
    if (update) {
      this.fetchUpdateReleaseDate(update.version);
      this.dialogVisible = true;
    }
  }

  async fetchUpdateReleaseDate(version: string) {
    const tag = version.startsWith('v') ? version : `v${version}`;
    const release = await this.updateService.getReleaseByTag(tag);
    if (release && 'published_at' in release) {
      this.ngZone.run(() => {
        this.updateReleaseDate = new Date(release.published_at);
      });
    }
  }

  handleDownload() {
    this.updateService.openDownloadPage();
  }

  openGitHubReleases(event: Event) {
    event.preventDefault();
    const repoUrl = 'https://github.com/altaskur/OpenTimeTracker/releases';
    if (globalThis.window?.electronAPI) {
      globalThis.window.electronAPI.openExternal(repoUrl);
    } else {
      window.open(repoUrl, '_blank', 'noopener');
    }
  }

  async fetchCurrentVersionNotes() {
    const tag = this.currentVersion.startsWith('v')
      ? this.currentVersion
      : `v${this.currentVersion}`;
    const release = await this.updateService.getReleaseByTag(tag);
    if (release) {
      this.ngZone.run(() => {
        this.currentVersionReleaseNotes = release.body;
        this.cdr.detectChanges();
      });
    }
  }

  showCurrentVersionNotes() {
    // Use setTimeout to ensure we are in a clean cycle and force update
    setTimeout(() => {
      this.ngZone.run(() => {
        this.currentVersionDialogVisible = true;
        this.cdr.detectChanges();
      });
    }, 0);

    // Ensure we have the notes, if not fetch them again
    if (!this.currentVersionReleaseNotes) {
      this.fetchCurrentVersionNotes();
    }
  }
}
