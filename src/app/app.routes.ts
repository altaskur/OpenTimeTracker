import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/open-home/open-home').then((m) => m.OpenHome),
  },
  {
    path: 'calendar',
    loadComponent: () =>
      import('./pages/open-calendar-page/open-calendar-page').then(
        (m) => m.OpenCalendarPage,
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/open-projects/open-projects').then((m) => m.OpenProjects),
  },
  {
    path: 'tasks',
    loadComponent: () =>
      import('./pages/open-tasks/open-tasks').then((m) => m.OpenTasks),
  },
  {
    path: 'history',
    loadComponent: () =>
      import('./pages/open-history/open-history').then((m) => m.OpenHistory),
  },
  {
    path: 'settings/tags',
    loadComponent: () =>
      import('./pages/open-settings-tags/open-settings-tags').then(
        (m) => m.OpenSettingsTagsComponent,
      ),
  },
  {
    path: 'settings/day-types',
    loadComponent: () =>
      import('./pages/open-settings-day-types/open-settings-day-types').then(
        (m) => m.OpenSettingsDayTypesComponent,
      ),
  },
  {
    path: 'settings/statuses',
    loadComponent: () =>
      import('./pages/open-settings-statuses/open-settings-statuses').then(
        (m) => m.OpenSettingsStatusesComponent,
      ),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
