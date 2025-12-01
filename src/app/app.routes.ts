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
    path: '**',
    redirectTo: '',
  },
];
