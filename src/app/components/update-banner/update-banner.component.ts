import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UpdateService } from '../../services/update.service';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-update-banner',
  standalone: true,
  imports: [CommonModule, MessageModule, ButtonModule, TranslateModule],
  template: `
    @if (updateService.updateAvailable(); as update) {
      <div class="update-banner surface-card p-3 border-round mb-3 flex align-items-center justify-content-between shadow-1">
        <div class="flex align-items-center gap-2">
          <i class="pi pi-gift text-primary text-xl"></i>
          <div>
            <span class="font-bold">New version available: {{ update.version }}</span>
            <div class="text-sm text-500">A new version of OpenTimeTracker is ready to download.</div>
          </div>
        </div>
        <div class="flex gap-2">
            <p-button label="View Details" icon="pi pi-arrow-right" size="small" (onClick)="viewDetails()"></p-button>
        </div>
      </div>
    }
  `,
  styles: [`
    .update-banner {
      border-left: 4px solid var(--primary-color);
    }
  `]
})
export class UpdateBannerComponent {
  updateService = inject(UpdateService);
  router = inject(Router);

  viewDetails() {
    this.router.navigate(['/settings/updates']);
  }
}
