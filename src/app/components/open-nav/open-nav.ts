import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { filter, map, startWith } from 'rxjs/operators';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

/**
 * A navigation entry rendered as a pill in the header tab group.
 */
export interface OpenNavTab {
  /** Route to navigate to, matching a path in app.routes.ts */
  route: string;
  /** i18n key for the visible label */
  labelKey: string;
  /** Only mark active on an exact URL match (needed for the '' home route) */
  exact: boolean;
}

/**
 * Application header: wordmark, primary tab navigation, and shortcuts to
 * History and Settings.
 *
 * @remarks
 * Until now the app could only be navigated through the Electron native menu
 * (see `electron/src/services/menu/menu-manager.ts`), which drives the same
 * routes over the `navigate-to` IPC channel. This component does not replace
 * that menu — both remain available and must stay pointed at the same routes.
 */
@Component({
  selector: 'app-open-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, TooltipModule, TranslateModule],
  templateUrl: './open-nav.html',
  styleUrl: './open-nav.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpenNavComponent {
  private readonly router = inject(Router);

  readonly tabs: readonly OpenNavTab[] = [
    { route: '/', labelKey: 'menu.home', exact: true },
    { route: '/calendar', labelKey: 'menu.calendar', exact: false },
    { route: '/tasks', labelKey: 'menu.tasks', exact: false },
    { route: '/projects', labelKey: 'menu.projects', exact: false },
  ];

  /** Settings is a group of routes; the tags page is its entry point. */
  readonly settingsRoute = '/settings/tags';
  readonly historyRoute = '/history';

  /**
   * Settings covers several sibling routes, so routerLinkActive on the entry
   * point alone would go dark on /settings/statuses and friends.
   */
  readonly settingsActive = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
      startWith(this.router.url),
      map((url) => url.startsWith('/settings')),
    ),
    { initialValue: this.router.url.startsWith('/settings') },
  );
}
