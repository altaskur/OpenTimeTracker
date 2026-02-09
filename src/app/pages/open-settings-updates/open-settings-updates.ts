import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { BlockUIModule } from 'primeng/blockui';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { PanelModule } from 'primeng/panel';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateService } from '../../services/update.service';
import { UpdateCheckResult } from '../../../types/electron';
import { SafeMarkdownPipe } from '../../pipes/safe-markdown.pipe';

@Component({
  selector: 'app-open-settings-updates',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonModule,
    CardModule,
    ToggleSwitchModule,
    BlockUIModule,
    ProgressSpinnerModule,
    MessageModule,
    PanelModule,
    TranslateModule,
    SafeMarkdownPipe
  ],
  template: `
    <div class="p-4">
      <h2 class="mb-4">{{ 'settings.updates.title' | translate }}</h2>

      <div class="grid">
        <!-- Auto Check Setting -->
        <div class="col-12 mb-4">
          <p-card [header]="'settings.updates.settings' | translate">
            <div class="flex align-items-center justify-content-between">
              <label for="autoCheck" class="text-lg">{{ 'settings.updates.autoCheck' | translate }}</label>
              <p-toggleswitch 
                inputId="autoCheck" 
                [ngModel]="updateService.autoCheck()" 
                (ngModelChange)="updateService.toggleAutoCheck($event)">
              </p-toggleswitch>
            </div>
          </p-card>
        </div>

        <!-- Manual Check -->
        <div class="col-12">
          <p-card [header]="'settings.updates.checkForUpdates' | translate">
            <div class="flex flex-column gap-3">
              
              <div class="flex align-items-center gap-3">
                <p-button 
                  [label]="'settings.updates.checkNow' | translate" 
                  [loading]="updateService.checking()" 
                  (onClick)="checkNow()"
                  icon="pi pi-refresh">
                </p-button>

                <!-- Status Messages -->
                @if (lastCheckResult !== null && !lastCheckResult.updateAvailable) {
                  <div class="flex align-items-center gap-2 text-green-500">
                    <i class="pi pi-check-circle text-xl"></i>
                    <span class="font-bold">{{ 'settings.updates.upToDate' | translate }} ({{currentVersion}}).</span>
                  </div>
                }
              </div>

               <!-- Current Version Notes -->
               <div class="mt-3">
                 <p-panel [header]="('settings.updates.currentVersionNotes' | translate) + ' (' + currentVersion + ')'" [toggleable]="true" [collapsed]="true">
                    @if (currentReleaseNotes) {
                      <div class="markdown-content pl-3" [innerHTML]="currentReleaseNotes | safeMarkdown"></div>
                    } @else {
                      <p>{{ 'settings.updates.noReleaseNotes' | translate }}</p>
                    }
                 </p-panel>
               </div>

              <!-- Update Available Card -->
              @if (updateService.updateAvailable(); as update) {
                <div class="surface-card p-4 border-round border-1 surface-border mt-3">
                  <div class="flex align-items-center justify-content-between mb-3">
                    <div class="flex align-items-center gap-2">
                      <i class="pi pi-gift text-primary text-xl"></i>
                      <span class="text-xl font-bold text-primary">{{ 'settings.updates.newVersionAvailable' | translate }}: {{ update.version }}</span>
                    </div>
                    <p-button 
                      [label]="'settings.updates.download' | translate" 
                      icon="pi pi-external-link" 
                      severity="success"
                      (onClick)="updateService.openDownloadPage()">
                    </p-button>
                  </div>
                  
                  @if (update.releaseNotes) {
                    <div class="surface-ground p-3 border-round mt-2" style="max-height: 300px; overflow-y: auto;">
                      <h4 class="mt-0 mb-2">{{ 'settings.updates.releaseNotes' | translate }}</h4>
                      <div class="markdown-content pl-3" [innerHTML]="update.releaseNotes | safeMarkdown"></div>
                    </div>
                  }
                </div>
              }
            </div>
          </p-card>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
    }
    
    .markdown-content {
      :deep(h1), :deep(h2), :deep(h3), :deep(h4), :deep(h5), :deep(h6) {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
      }
      
      :deep(p) {
        margin: 0.5rem 0;
      }
      
      :deep(ul), :deep(ol) {
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
      }
      
      :deep(blockquote) {
        border-left: 4px solid var(--primary-color);
        margin: 0.5rem 0;
        padding-left: 1rem;
        color: var(--text-color-secondary);
      }
    }
  `]
})
export class OpenSettingsUpdatesComponent implements OnInit {
  updateService = inject(UpdateService);

  lastCheckResult: UpdateCheckResult | null = null;
  currentVersion = '...';
  currentReleaseNotes: string | null = null;

  async ngOnInit() {
    this.currentVersion = await window.electronAPI.getVersion();
    // Fetch release notes for current version
    const tag = this.currentVersion.startsWith('v') ? this.currentVersion : `v${this.currentVersion}`;
    const release = await this.updateService.getReleaseByTag(tag);
    if (release) {
      this.currentReleaseNotes = release.body;
    }
  }

  async checkNow() {
    this.lastCheckResult = null;
    const result = await this.updateService.checkForUpdates(true);
    this.lastCheckResult = result;
  }
}
