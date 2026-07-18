import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

/**
 * A settings sub-section entry.
 */
export interface SettingsTab {
  /** Route to navigate to, matching a path in app.routes.ts */
  route: string;
  /** i18n key for the visible label */
  labelKey: string;
}

/**
 * Sub-tab navigation for the settings area.
 *
 * @remarks
 * The redesign presents Tags, Statuses, Day types and Updates as tabs of a
 * single settings view. Those remain four separate lazy routes; this strip is
 * mounted at the top of each so they can be switched in-app rather than only
 * through the Electron native menu.
 */
@Component({
  selector: 'app-open-settings-tabs',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './open-settings-tabs.html',
  styleUrl: './open-settings-tabs.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenSettingsTabsComponent {
  readonly tabs: readonly SettingsTab[] = [
    { route: '/settings/tags', labelKey: 'settings.nav.tags' },
    { route: '/settings/statuses', labelKey: 'settings.nav.statuses' },
    { route: '/settings/day-types', labelKey: 'settings.nav.dayTypes' },
    { route: '/settings/updates', labelKey: 'settings.nav.updates' },
  ];
}
