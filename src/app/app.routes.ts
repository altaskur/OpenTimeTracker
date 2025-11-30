import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/open-home/open-home').then((m) => m.OpenHome),
  },
  {
    path: 'remaining-time',
    loadComponent: () =>
      import('./pages/open-remaining-time/open-remaining-time').then(
        (m) => m.OpenRemainingTime,
      ),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./pages/open-projects/open-projects').then((m) => m.OpenProjects),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
